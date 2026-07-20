#!/usr/bin/env bash
# ============================================================================
# build_wheelhouse.sh — run this on a BUILD box, then copy ./wheelhouse to the
# target and use install_from_wheelhouse.sh there.
#
# THE ONE RULE THAT MATTERS: the build box must match the TARGET in
#   (1) OS + libc, (2) CPU arch, (3) Python minor version.
# gssapi (and uvicorn's optional uvloop/httptools/watchfiles) ship COMPILED
# wheels; a mismatch means they silently won't install on the target and pip
# will try to build from source — which is exactly what you can't do offline.
#
# THIS TARGET (from its existing wheel tags):
#   • CPython 3.11            (cp311)
#   • x86_64                  (…_x86_64)
#   • glibc >= 2.17           (manylinux_2_17 / manylinux2014 — same standard)
#   • plus pure-python wheels (py3) which fit any of the above.
#
# So build against Python 3.11 on x86_64. The manylinux_2_17 baseline is old
# (CentOS 7-era glibc), so any modern x86_64 Linux build box produces compatible
# wheels — pip downloads the manylinux build, not one tied to your box's glibc.
#
# Best practice: build inside a 3.11 container, e.g.
#   docker run --rm -it -v "$PWD":/w -w /w python:3.11-slim-bookworm bash
#   apt-get update && apt-get install -y libkrb5-dev krb5-user gcc
#   ./build_wheelhouse.sh
# The python tag MUST be 3.11 to match cp311 on the target.
# ============================================================================
set -euo pipefail

# Guard: refuse to build with the wrong interpreter, since cp311 wheels are
# required and a cp312/cp310 gssapi wheel will not install on the target.
_PYMM="$(python3 -c 'import sys;print("%d.%d"%sys.version_info[:2])')"
if [ "$_PYMM" != "3.11" ]; then
  echo "!! This target needs cp311 wheels, but the build Python is $_PYMM." >&2
  echo "!! Re-run under Python 3.11 (e.g. the python:3.11-slim-bookworm image)." >&2
  echo "!! Override only if you know what you're doing: set ALLOW_PY_MISMATCH=1." >&2
  [ "${ALLOW_PY_MISMATCH:-0}" = "1" ] || exit 1
fi

REQ="${1:-requirements.airgap.txt}"
OUT="${2:-wheelhouse}"

echo ">> Python: $(python3 --version)"
echo ">> Platform: $(python3 -c 'import platform;print(platform.platform(), platform.machine())')"
echo ">> Building wheelhouse from '$REQ' into '$OUT/'"

mkdir -p "$OUT"

# 1) Download every wheel in the transitive dependency tree.
#    Two modes:
#
#    DEFAULT (native): resolve for THIS interpreter/platform. Correct when the
#    build box IS Python 3.11 / x86_64 / manylinux (the guard above enforced it).
#
#    PINNED (set PIN_PLATFORM=1): force the target's tags explicitly, so you can
#    build even on a non-3.11 box. This requires pinned versions for every
#    package with a compiled wheel and disables source fallback entirely; if a
#    needed wheel isn't published for these tags, pip fails loudly. Use only if
#    you cannot get a 3.11 build environment.
#
#    --only-binary=:all: forces real wheels (fails loudly instead of grabbing an
#    sdist you can't build offline).
if [ "${PIN_PLATFORM:-0}" = "1" ]; then
  echo ">> PINNED download for cp311 / manylinux_2_17_x86_64"
  python3 -m pip download \
    --only-binary=:all: \
    --python-version 3.11 \
    --implementation cp \
    --abi cp311 \
    --platform manylinux_2_17_x86_64 \
    --platform manylinux2014_x86_64 \
    -r "$REQ" \
    -d "$OUT"
else
  python3 -m pip download \
    --only-binary=:all: \
    -r "$REQ" \
    -d "$OUT"
fi

# 2) Freeze the exact versions resolved, so the target install is reproducible.
python3 -m pip install --quiet pip-tools 2>/dev/null || true
# Simpler, dependency-free freeze: list what landed in the wheelhouse.
( cd "$OUT" && ls -1 *.whl | sed 's/-[0-9].*//' | sort -u ) > "$OUT/PACKAGES.txt"
ls -1 "$OUT"/*.whl > "$OUT/WHEELS.txt"

echo ">> Done. $(ls -1 "$OUT"/*.whl | wc -l) wheels in $OUT/"
echo ">> Copy the whole '$OUT/' directory to the target, next to install_from_wheelhouse.sh"
echo
echo "NOTE: if --only-binary fails because some PURE-python dep only ships an"
echo "sdist (rare), re-run WITHOUT --only-binary=:all: for that one package —"
echo "pure-python sdists build anywhere and don't need a compiler on the target."

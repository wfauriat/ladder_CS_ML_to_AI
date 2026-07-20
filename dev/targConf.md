from openai import OpenAI
from openai._types import Omit
import httpx
import truststore
import ssl

from httpx_gssapi import HTTPSPNEGOAuth as KerberosAuth

MODEL = "mistral-small-2506"


client = OpenAI(
	base_url="@url/mistrall-small-2506/v1",
	api_key="EMPTY",
	http_client=httpx.Client(
		verify=truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT),
		auth=KerberosAuth(),
	),
	default_headers={"Autorization": Omit()},
)

reponse = client.chat.completion.create(
	model=MODEL,
	messages=messages
	)
messages.append(response.choices[0].message)

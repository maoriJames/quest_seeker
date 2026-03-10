import { SignatureV4 } from '@aws-sdk/signature-v4'
import { HttpRequest } from '@aws-sdk/protocol-http'
import { Sha256 } from '@aws-crypto/sha256-js'
import { defaultProvider } from '@aws-sdk/credential-provider-node'

export async function signedAppSyncFetch<T extends Record<string, unknown>>(
  query: string,
  variables?: T,
) {
  const endpoint = new URL(process.env.AMPLIFY_DATA_ENDPOINT!)

  const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: process.env.AWS_REGION || 'us-east-1',
    service: 'appsync',
    sha256: Sha256,
  })

  const request = new HttpRequest({
    method: 'POST',
    hostname: endpoint.hostname,
    path: endpoint.pathname,
    body: JSON.stringify({ query, variables: variables ?? {} }),
    headers: {
      'Content-Type': 'application/json',
      host: endpoint.hostname,
    },
  })

  const signedRequest = await signer.sign(request)

  return fetch(endpoint.toString(), {
    method: signedRequest.method,
    headers: signedRequest.headers as Record<string, string>,
    body: signedRequest.body,
  })
}

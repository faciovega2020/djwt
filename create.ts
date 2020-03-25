import { convertBase64ToBase64url } from "./base64/base64url.ts"
import { convertUint8ArrayToBase64 } from "./base64/base64.ts"
import { hmac } from "https://denopkg.com/chiefbiiko/hmac/mod.ts"

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonObject | JsonArray
type JsonObject = { [member: string]: JsonValue }
type JsonArray = JsonValue[]

interface Claims {
  iss?: string
  sub?: string
  aud?: string[] | string
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  [key: string]: JsonValue | undefined
}

interface Jose {
  alg: string
  crit?: string[]
  [key: string]: JsonValue | undefined
}

function convertToBase64url(
  input: string | Uint8Array,
  encoding = "utf8"
): string {
  return convertBase64ToBase64url(
    typeof input === "object"
      ? convertUint8ArrayToBase64(input)
      : convertUint8ArrayToBase64(
          encoding === "hex"
            ? convertHexToUint8Array(input)
            : new TextEncoder().encode(input)
        )
  )
}

function convertHexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(hex)) {
    const match = hex.match(/.{2}/g)
    if (match) return Uint8Array.from(match.map(el => parseInt(el, 16)))
  }
  throw new TypeError("Invalid hex string.")
}

function makeJwsSigningInput(header: Jose, payload: Claims | string): string {
  return `${convertToBase64url(JSON.stringify(header))}.${convertToBase64url(
    JSON.stringify(payload)
  )}`
}

function makeSignature(
  alg: string,
  key: string | Uint8Array,
  msg: string | Uint8Array
): string {
  if (alg === "none") return ""
  else if (alg === "HS256")
    return convertToBase64url(hmac("sha256", key, msg, "utf8", "hex"), "hex")
  else if (alg === "HS512")
    return convertToBase64url(hmac("sha512", key, msg, "utf8", "hex"), "hex")
  else throw RangeError("no matching algorithm")
}

function makeJwt(header: Jose, payload: Claims | string, key = ""): string {
  try {
    const signingInput = makeJwsSigningInput(header, payload)
    return `${signingInput}.${makeSignature(header.alg, key, signingInput)}`
  } catch (err) {
    err.message = `Failed to create a JWT: ${err.message}`
    throw err
  }
}

/*
 * Helper function: setExpiration()
 * returns the number of milliseconds since January 1, 1970, 00:00:00 UTC
 */
function setExpiration(exp: number | Date): number {
  return (exp instanceof Date ? exp : new Date(exp)).getTime()
}

export default makeJwt
export { setExpiration, Claims, Jose }

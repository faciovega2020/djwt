import makeJwt, {
  setExpiration,
} from "https://cdn.jsdelivr.net/gh/timonson/djwt/master@v0.2.0/create.ts"
import validateJwt from "https://cdn.jsdelivr.net/gh/timonson/djwt/master@v0.2.0/validate.ts"
// import makeJwt, { setExpiration } from "../create.ts"
// import validateJwt from "../validate.ts"

const claims = {
  iss: "joe",
  jti: "123456789abc",
  exp: setExpiration(new Date().getTime() + 1000),
  // exp: setExpiration(new Date().getTime() - 1000), // Invalid JWT: the jwt is expired
}

const headerObject = {
  alg: "HS512",
  crit: ["dummy"],
  dummy: 100,
}

const critHandlers = {
  dummy(value: any) {
    console.log(`dummy works: ${value}`)
    return value * 2
  },
}

const key = "abcdef"
try {
  const jwt = makeJwt(headerObject, claims, key)
  const validatedJwt = validateJwt(jwt, key, true, critHandlers)
  console.log("JWT:", jwt)
  console.log("JWT is valid!")
} catch (err) {
  console.log(err)
}
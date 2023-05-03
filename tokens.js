require('dotenv').config()
const got = require('got')

// https://stackoverflow.com/a/69058154/1413302
const isTokenExpired = (token) => (Date.now() >= JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).exp * 1000)

/**
 * Use the privately stored refresh token to generate a new access token for
 * your RERUM-connected application. There is no way to authenticate this 
 * process, so protect your refresh token and replace it if it is exposed. 
 */
async function generateNewAccessToken() {
    try {
        const { tokenObject } = await got.post(process.env.RERUM_ACCESS_TOKEN_URL, {
            timeout: 10000,
            json: { REFRESH_TOKEN: process.env.REFRESH_TOKEN }
        }).json()

        process.env.ACCESS_TOKEN = tokenObject.access_token
    }
    catch (err) { console.error("Token not updated: ", err) }

    console.warn("Access Token expired. Consider updating your .env files")
}

/**
 * This will conduct a simple check against the expiry date in your token.
 * This does not validate your access token, so you may still be rejected by 
 * your RERUM instance as unauthorized.
 */
if (isTokenExpired(process.env.ACCESS_TOKEN)) { generateNewAccessToken() }

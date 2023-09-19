const jwt = require("jsonwebtoken")
const fs = require("fs")

const verifyUser = async (req, res, next) => {
    try {
        let authHeader, token,publicKey;
        authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.send({ status: 0, response: "Token not provided" })
        }
        if (authHeader && authHeader.startsWith("Bearer")) {
            token = authHeader.split(" ")[1]
            publicKey = fs.readFileSync("./config/publicKey.key")
            jwt.verify(token, publicKey, (err, payload) => {
                if (err) {
                    return res.send({ status: 0, response: err })
                }
                req.userInfo = payload.user
                next()
            })
        }
    } catch (error) {
        return res.send({ status: 0, response: error })
    }
}


module.exports = { verifyUser }
const jwt = require("jsonwebtoken")
const fs = require("fs")

const verifyUser = async (req, res, next) => {
    try {
        let authHeader, token,publicKey,getPayload;
        authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.send({ status: 0, response: "Token not provided" })
        }
        if (authHeader && authHeader.startsWith("Bearer")) {
            token = authHeader.split(" ")[1]
            publicKey = fs.readFileSync("./config/privateKey.key")
           
            getPayload = jwt.verify(token, publicKey,{algorithms:["RS256"]})
            req.userInfo = getPayload
            next()
        }
    } catch (error) {
        return res.send({ status: 0, response: error })
    }
}


module.exports = { verifyUser }
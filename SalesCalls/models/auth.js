const jwt = require("jsonwebtoken")

const verifyUser = async (req, res, next) => {
    try {
        let authHeader, token;
        authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.send({ status: 1, response: "Token not provided" })
        }
        if (authHeader && authHeader.startsWith("Bearer")) {
            token = authHeader.split(" ")[1]
            jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
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
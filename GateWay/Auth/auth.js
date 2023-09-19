const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
    try {
        let authHead, token;
        if (authHead && authHead.startsWith("Bearer")) {
            token = authHead.split(" ")[1];
            jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
                if (err) {
                    return res.send({ status: 0, response: err })
                }
                req.userInfo = payload.user
                next()
            })
        }
    } catch (error) {
        return res.send({ status: 0, response: error.message })
    }
}

module.exports = { verifyToken }
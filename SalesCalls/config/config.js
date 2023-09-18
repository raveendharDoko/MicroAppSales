require('dotenv').config()

let serverConnections = {
    MONGODB : process.env.MONGO_URL,
    PORT :  process.env.PORT
}

module.exports = {serverConnections}
const express = require('express');
const mongoose = require('mongoose')
const userRouter = require('./routes/user.js');
const helmet = require("helmet")
const bodyParser = require('body-parser');
const cors = require("cors")
const { serverConnections } = require('./config/config.js');
require("dotenv").config()

mongoose.connect(serverConnections.MONGODB)
    .then(console.log("Mongo connected"))
    .catch(err => console.log(err))


const app = express()

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: [
            "Origin",
            "X-Requested-with",
            "Content-Type",
            "Accept",
            "Authorization",
        ],
    })

);
app.use(express.json())
app.use(bodyParser.json())
// let payload = 2 + "dfghnj"
// let hash = HmacSHA256(payload, "jaawdfwfweguiwegv").toString()
// console.log(hash);
app.use(helmet({
    xDownloadOptions: false,
    originAgentCluster: false,
    xDnsPrefetchControl: false,
    xXssProtection: false,
}))



app.use("/user", userRouter)

let port = serverConnections.PORT

app.listen(port, () => {
    console.log(`Server started on ${port}`);
});
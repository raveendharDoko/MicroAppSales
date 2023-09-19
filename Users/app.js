const express = require('express');
const mongoose = require('mongoose')
const userRouter = require('./routes/user.js');
const helmet = require("helmet")
const bodyParser = require('body-parser');
const { serverConnections } = require('./config/config.js');
require("dotenv").config()

mongoose.connect(serverConnections.MONGODB)
    .then(console.log("Mongo connected"))
    .catch(err => console.log(err))


const app = express()

app.use(express.json())
app.use(bodyParser.json())

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
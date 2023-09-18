const express = require('express');
const mongoose = require('mongoose');
const salesCallRouter = require('./routes/salesCall');
const helmet = require("helmet")
const bodyParser = require('body-parser');
const { serverConnections } = require('../Users/config/config');
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

app.use("/",salesCallRouter)

let port = serverConnections.PORT
app.listen(port, () => {
    console.log(`Server started on ${port}`);
});
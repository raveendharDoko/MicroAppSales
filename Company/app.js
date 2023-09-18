const express = require('express');
const mongoose = require('mongoose');
const companyRouter = require('./routes/company');
const helmet = require("helmet");
const { serverConnections } = require('./config/config');
const bodyParser = require('body-parser');
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

app.use("/",companyRouter)

let port = serverConnections.PORT
app.listen(port, () => {
    console.log(`Server started on ${port}`);
});
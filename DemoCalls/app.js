const express = require('express');
const mongoose = require('mongoose');
const demoCallRouter = require('./routes/demo');
const helmet = require("helmet");
const { serverConnections } = require('./config/config');
const bodyParser = require('body-parser');
const cors = require("cors")
require("dotenv").config()

mongoose.connect(serverConnections.MONGODB,{ useNewUrlParser: true, useUnifiedTopology: true})
    .then(console.log("Mongo connected"))
    .catch(err => console.log(err))


const app = express()

app.options("*", cors());

 

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

app.use(helmet({
    xDownloadOptions: false,
    originAgentCluster: false,
    xDnsPrefetchControl: false,
    xXssProtection: false,
}))

app.use("/demoCalls",demoCallRouter)


let port = serverConnections.PORT

app.listen(port, () => {
    console.log(`Server started on ${port}`);
});
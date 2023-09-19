const express = require('express');
const httpProxy = require('http-proxy');
// const { verifyToken } = require('./Auth/auth');
const cors = require("cors")
require("dotenv").config()
const app = express();

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

const userService = httpProxy.createProxyServer({ target: 'http://localhost:2000' });
const companyService = httpProxy.createProxyServer({ target: 'http://localhost:3000' });
const salesCallService = httpProxy.createProxyServer({ target: 'http://localhost:4000' });
const demoCallService = httpProxy.createProxyServer({ target: 'http://localhost:5000' });

app.all('/user*', (req, res) => {
    userService.web(req, res);
});

// app.use(verifyToken)
app.all('/company*', (req, res) => {
    companyService.web(req, res);
});

app.all('/salesCalls*', (req, res) => {
    salesCallService.web(req, res);
});

app.all('/demoCalls*', (req, res) => {
    demoCallService.web(req, res);
});

app.listen(process.env.PORT, () => {
    console.log(`Gateway is running on port ${process.env.PORT}`);
});
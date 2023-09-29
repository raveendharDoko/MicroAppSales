const express = require('express');
const httpProxy = require('http-proxy');
// const { verifyToken } = require('./Auth/auth');
const cors = require("cors")
require("dotenv").config()
const app = express();

app.options("*", cors());

app.use(cors({
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
const companyService = httpProxy.createProxyServer({ target: 'http://localhost:3010' });
const salesCallService = httpProxy.createProxyServer({ target: 'http://localhost:4000' });
const demoCallService = httpProxy.createProxyServer({ target: 'http://localhost:5000' });
const afterSalesService = httpProxy.createProxyServer({ target: 'http://localhost:6000' });



app.all('/user*', (req, res) => {
  try {
    userService.web(req, res, (err) => {
      return res.send({ status: 0, response: err })
    });
  } catch (error) {
    return res.send({ status: 0, response: error.message })
  }
});

// app.use(verifyToken)
app.all('/company*', (req, res) => {
  try {
    companyService.web(req, res, (err) => {
      return res.send({ status: 0, response: err })
    });
  } catch (error) {
    return res.send({ status: 0, response: error.message })
  }
});


app.all('/salesCalls*', (req, res) => {
  try {
    salesCallService.web(req, res, (err) => {
      return res.send({ status: 0, response: err })
    });
  } catch (error) {
    return res.send({ status: 0, response: error.message })
  }
});


app.all('/demoCalls*', (req, res) => {
  try {
    demoCallService.web(req, res, (err) => {
      return res.send({ status: 0, response: err })
    });
  } catch (error) {
    return res.send({ status: 0, response: error.message })
  }
});


app.all('/afterSales*', (req, res) => {
  try {
    afterSalesService.web(req, res, (err) => {
      return res.send({ status: 0, response: err })
    });
  } catch (error) {
    return res.send({ status: 0, response: error.message })
  }
});


app.listen(process.env.PORT, () => {
  console.log(`Gateway is running on port ${process.env.PORT}`);
});
const express = require('express');
const httpProxy = require('http-proxy');
const app = express();
const port = 9000;

const userService = httpProxy.createProxyServer({ target: 'http://localhost:2000' });
const companyService = httpProxy.createProxyServer({ target: 'http://localhost:3000' });
const salesCallService = httpProxy.createProxyServer({ target: 'http://localhost:4000' });
const demoCallService = httpProxy.createProxyServer({ target: 'http://localhost:5000' });

app.all('/*', (req, res) => {
    userService.web(req, res);
});

app.all('/*', (req, res) => {
    companyService.web(req, res);
});

app.all('/*', (req, res) => {
    salesCallService.web(req, res);
});

app.all('/*', (req, res) => {
    demoCallService.web(req, res);
});

app.listen(port, () => {
    console.log(`Gateway is running on port ${port}`);
});
const express = require("express");
const { verifyUser } = require("../models/auth");
const { authManager } = require("../models/common");
const validate = require("../validation/validate")();
const afterSalesControllers = require("../controllers/afterSales")();
const afterSalesRouter = express.Router();

afterSalesRouter.use(verifyUser);

afterSalesRouter.post(
  "/assignConvertedCompanies",
  authManager(),
  afterSalesControllers.assignConvertedCompanies
);
afterSalesRouter.get(
  "/getManagerConvertedCompanies",
  authManager(),
  afterSalesControllers.getManagerConvertedCompanies
);
afterSalesRouter.get(
  "/getYourConvertedCompanies",
  afterSalesControllers.getYourConvertedCompanies
);
afterSalesRouter.post(
  "/updateConvertedCompaniesReport",
  afterSalesControllers.updateConvertedCompaniesReport
);
afterSalesRouter.post("/getById", afterSalesControllers.getById);

afterSalesRouter.post("/filterByDate",afterSalesControllers.filterByDate)

module.exports = afterSalesRouter;

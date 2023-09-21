const express = require("express")
const { verifyUser } = require("../models/auth")
const { authManager } = require("../models/common")
const companyControllers = require("../controllers/company")()
const validate = require("../validation/validate")()

const companyRouter = express.Router()

companyRouter.use(verifyUser)

companyRouter.post("/addCompany", authManager(), validate.addCompany, companyControllers.addCompany)
companyRouter.get("/getAllCompany", authManager(), companyControllers.getAllCompany)
companyRouter.get("/unAssignedCompanies",authManager(),companyControllers.getUnAssignedCompanies)
companyRouter.post("/deleteCompany",authManager(),validate.deleteCompany,companyControllers.deleteCompany)
companyRouter.post("/editCompany",authManager(),validate.editCompany,companyControllers.editCompany)

module.exports = companyRouter

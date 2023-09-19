const express = require("express")
const { verifyUser } = require("../models/auth")
const companyControllers = require("../controllers/company")()
const validate = require("../validation/validate")()

const companyRouter = express.Router()

// companyRouter.use(verifyUser)

companyRouter.post("/addCompany",validate.addCompany,companyControllers.addCompany)
companyRouter.get("/getAllCompany", companyControllers.getAllCompany)

module.exports = companyRouter

const express = require("express")
const { verifyUser } = require("../models/auth")
const salesCallController = require("../controllers/salesCallController")()
const validate = require("../validation/validate")()

const salesCallRouter = express.Router()

salesCallRouter.use(verifyUser)
salesCallRouter.post("/assignCall", validate.assignCall, salesCallController.assignSaleCalls)
salesCallRouter.get("/allAssignedCall", salesCallController.getAllCalls) // assign companies with contact to each employees
salesCallRouter.get("/getUserCalls", salesCallController.yourCallList)
salesCallRouter.post("/updateReport", validate.updateReport, salesCallController.updateReport) // updating the detailed report of each attended calls in a stretch of followups
salesCallRouter.post("/changeStatus", validate.changeStatus, salesCallController.updateStatus)  // updating the status of call attempt
salesCallRouter.post("/getCallById",salesCallController.getCallById)

module.exports = salesCallRouter
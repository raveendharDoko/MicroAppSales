const express = require('express')
const { verifyUser } = require('../models/auth')
const demoController = require('../controllers/demo')()
const validate = require('../validation/validate')()

const demoCallRouter = express.Router()

demoCallRouter.use(verifyUser)

demoCallRouter.post("/assignDemo",validate.assignDemo, demoController.assignDemo)
demoCallRouter.post("/updateReport",validate.updateReport, demoController.updateReport) // updating the status of demo
demoCallRouter.get("/assignedDemos",demoController.getAllCalls)
demoCallRouter.get("/getMyDemo", demoController.getMyDemo)
demoCallRouter.post("/updateStatus",validate.changeStatus, demoController.updateStatus)


module.exports = demoCallRouter
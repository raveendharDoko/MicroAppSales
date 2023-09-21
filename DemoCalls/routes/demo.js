const express = require('express')
const { verifyUser } = require('../models/auth')
const { authManager } = require('../models/common')
const demoController = require('../controllers/demo')()
const validate = require('../validation/validate')()

const demoCallRouter = express.Router()

demoCallRouter.use(verifyUser)

demoCallRouter.post("/assignDemo",validate.assignDemo, demoController.assignDemo)
demoCallRouter.post("/updateReport",validate.updateReport, demoController.updateReport) // updating the status of demo
demoCallRouter.get("/assignedDemos",demoController.getAllCalls)
demoCallRouter.get("/getMyDemo", demoController.getMyDemo)
demoCallRouter.get("/managerDemo",authManager(),demoController.getManagerDemo)
demoCallRouter.post("/getDemoById",validate.getById,demoController.getDemoById)


module.exports = demoCallRouter
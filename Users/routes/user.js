const express = require("express")
const userControllers = require("../controllers/userControllers")()
const { verifyUser } = require("../models/auth")
const { authManager, authSuperAdmin } = require("../models/common")
const validate = require("../validation/validate.js")()

const userRouter = express.Router()


userRouter.post("/register", validate.register, userControllers.employeeRegister)
userRouter.post("/login", validate.login, userControllers.login)

userRouter.use(verifyUser)

userRouter.post("/createPower",authSuperAdmin(), validate.createPower, userControllers.createPowers) // create Admin and manager by superAdmin 
userRouter.get("/getYourEmployees",authManager(), userControllers.getYourEmployees)
userRouter.post("/createNetwork", authManager(), validate.createNetwork, userControllers.createRelationship) // adding team members by manager
userRouter.get("/getAllAdmin",authSuperAdmin(), userControllers.getAllAdmins)
userRouter.get("/getAllManager",authSuperAdmin(), userControllers.getAllManagers)
userRouter.get("/getAllEmployees", userControllers.getAllEmployees)
userRouter.get("/unAssignedEmployee",authManager(),userControllers.unAssignedEmployee)


module.exports = userRouter


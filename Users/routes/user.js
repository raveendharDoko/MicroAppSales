const express = require("express")
const userControllers = require("../controllers/userControllers")()
const { verifyUser } = require("../models/auth")
const { authManager, authSuperAdmin } = require("../models/common")
const validate = require("../validation/validate.js")()

const userRouter = express.Router()

userRouter.post("/register", validate.register, userControllers.register)
userRouter.post("/login", validate.login, userControllers.login)

userRouter.use(verifyUser)

userRouter.get("/getUnAssignedEmployee", authManager(), userControllers.unAssignedEmployee)
userRouter.post("/assignEmployee", authManager(), validate.createNetwork, userControllers.createRelationship) // adding team members by manager
userRouter.post("/getYourEmployee", userControllers.getYourEmployees)
userRouter.post("/unAssignEmployee", authManager(), validate.removeFromNetwork, userControllers.removeFromNetwork)

module.exports = userRouter


// userRouter.post("/createPower",authSuperAdmin(), validate.createPower, userControllers.createPowers) // create Admin and manager by superAdmin 
// userRouter.get("/getAllAdmin",authSuperAdmin(), userControllers.getAllAdmins)
// userRouter.get("/getAllManager",authSuperAdmin(), userControllers.getAllManagers)
// userRouter.get("/getAllEmployees", userControllers.getAllEmployees)
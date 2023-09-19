const express = require("express")
const userControllers = require("../controllers/userControllers")()
const { verifyUser } = require("../models/auth")
const validate = require("../validation/validate.js")()

const userRouter = express.Router()


userRouter.post("/register", validate.register, userControllers.employeeRegister)
userRouter.post("/login", validate.login, userControllers.login)

userRouter.use(verifyUser)

userRouter.post("/createPower", validate.createPower, userControllers.createPowers) // create Admin and manager by superAdmin 
userRouter.post("/getYourEmployees",userControllers.getYourEmployees)
userRouter.post("/createNetwork", validate.createNetwork, userControllers.createRelationship) // adding team members by manager

userRouter.get("/getAllAdmin", userControllers.getAllAdmins)
userRouter.get("/getAllManager", userControllers.getAllManagers)
userRouter.get("/getAllEmployees", userControllers.getAllEmployees)


module.exports = userRouter


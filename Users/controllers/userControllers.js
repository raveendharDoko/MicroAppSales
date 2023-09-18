const User = require("../schema/user.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const db = require("../models/mongodb.js")

module.exports = function () {

   let userControllers = {};

    userControllers.createPowers = async (req, res) => {
        try {
            let createPower = req.body, hashPass;
            createPower = createPower.data[0]
            if (req.userInfo.userRole !== 4) {
                return res.send({ status: 1, response: "You're not allowded to perform the task" })
            }
            hashPass = await bcrypt.hash(createPower.password, 10)
            createPower.password = hashPass
            await db.insertSingleDocument("users", createPower)
            return res.send({ status: 1, response: "Role created" })

        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }



    userControllers.employeeRegister = async (req, res) => {
        try {
            let employeeRegister = req.body, hashPass;
            employeeRegister = employeeRegister.data[0]
            const checkExist = await db.findSingleDocument("users", { email: employeeRegister.email })
            if (checkExist) {
                return res.send({ status: 1, response: "Employee with emailId already exist" })
            }
            hashPass = await bcrypt.hash(employeeRegister.password, 10)
            employeeRegister.password = hashPass
            await db.insertSingleDocument("users", employeeRegister)
            return res.send({ status: 1, response: "Registered successfully" })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }



    userControllers.login = async (req, res) => {
        try {
            let userLogin = req.body, matchPass, token, checkExist;
            userLogin = userLogin.data[0]
            checkExist = await db.findSingleDocument("users", { email: userLogin.email })
            if (!checkExist) {
                return res.send({ status: 1, response: "User need to register first in order to login" })
            }
            matchPass = await bcrypt.compare(userLogin.password, checkExist.password)
            if (matchPass === false) {
                return res.send({ status: 1, response: "Password doesn't match" })
            }
            token = jwt.sign({ user: { userId: checkExist._id, userRole: checkExist.role, username: checkExist.username } }, process.env.JWT_SECRET, { expiresIn: "2h" })
            return res.send({ status: 1, response: "Logged successfully", data: token })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }



    userControllers.createRelationship = async (req, res) => {
        try {
            let addToTeam = req.body, getUser;
            addToTeam = addToTeam.data[0]
            getUser = await db.findSingleDocument("users", { _id: addToTeam.employeeId })

            if (req.userInfo.userRole !== 2) {
                return res.send({ status: 1, response: "You're not an manager" })
            }
            if (getUser.role !== 1) {
                return res.send({ status: 1, response: "You can't assign" })
            }
            if (getUser.managedBy !== null) {
                return res.send({ status: 1, response: `Manager already assigned to ${getUser._id}` })
            }
            await db.updateOneDocument("users", { _id: getUser._id }, { managedBy: req.userInfo.userId })
            return res.send({ status: 1, response: "Manager assigned" })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }



    userControllers.getAllEmployees = async (req, res) => {
        try {
            let getAllEmployees = await db.findDocuments("users", { role: 1 })
            if (req.userInfo.userRole === 1) {
                return res.send({ status: 1, reponse: "Not authorized" })
            }
            if (getAllEmployees.length === 0) {
                return res.send({ status: 1, data: getAllEmployees })
            }
            return res.send({ status: 1, data: getAllEmployees })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }



    userControllers.getAllAdmins = async (req, res) => {
        try {
            let getAllAdmins = await db.findDocuments("users", { role: 3 })
            if (req.userInfo.userRole !== 4) {
                return res.send({ status: 1, reponse: "Not authorized" })
            }
            if (getAllAdmins.length === 0) {
                return res.send({ status: 1, data: getAllAdmins })
            }
            return res.send({ status: 1, data: getAllAdmins })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }



    userControllers.getAllManagers = async (req, res) => {
        try {
            let getAllManagers = await db.findDocuments("users", { role: 2 })
            if (req.userInfo.userRole !== 4) {
                return res.send({ status: 1, reponse: "Not authorized" })
            }
            if (getAllManagers.length === 0) {
                return res.send({ status: 1, data: getAllManagers })
            }
            return res.send({ status: 1, data: getAllManagers })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    return userControllers

}


const { default: mongoose } = require("mongoose");
const SalesCalls = require("../schema/salesCall.js");
const db = require("../models/mongodb.js")

module.exports = function () {

    let salesControllers = {};

    salesControllers.assignSaleCalls = async (req, res) => {
        try {
            let assignCall = req.body, checkIfAssigned;
            assignCall = assignCall.data[0]
            if (req.userInfo.userRole !== 2) {
                return res.send({ status: 0, response: "You're not an manager" })
            }
            checkIfAssigned = await db.findSingleDocument("salesCall", { companyId: assignCall.companyId })
            if (checkIfAssigned) {
                return res.send({ status: 0, response: `This company already assigned to ${checkIfAssigned.assignedTo} ` })
            }
            assignCall.assignedBy = req.userInfo.userId
            await db.insertSingleDocument("salesCall", assignCall)
            return res.send({ status: 1, response: "Call assigned" })

        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }


    salesControllers.yourCallList = async (req, res) => {
        try {
            let id = new mongoose.Types.ObjectId(req.userInfo.userId)
            let getCompany = await SalesCalls.aggregate([
                { $match: { "assignedTo": id } },
                {
                    $lookup: {
                        from: "companies",
                        localField: "companyId",
                        foreignField: "_id",
                        as: "getCompany",
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "assignedBy",
                        foreignField: "_id",
                        as: "getManager",
                    },
                },
                { $project: { _id: 1, companyId: 1, status: 1, assignedDate: 1, "getCompany.companyName": 1, "getManager.username": 1, "getManager._id": 1 } }
            ])

            if (getCompany.length === 0) {
                return res.send({ status: 1, data: JSON.stringify(getCompany) })
            }
            let info = getCompany.map((call) => {
                let obj = {}
                obj.callId = call._id
                obj.assignedId = call.getManager[0]._id
                obj.companyName = call.getCompany[0].companyName
                obj.assignedOn = call.assignedDate
                obj.status = call.status
                obj.assignedBy = call.getManager[0].username
                return obj
            })
            return res.send({ status: 1, data: JSON.stringify(info) })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }


    salesControllers.updateReport = async (req, res) => {
        try {
            let updateReport = req.body, getCall;

            updateReport = updateReport.data[0]
            getCall = await SalesCalls.findById({ _id: updateReport.callId })
            if (getCall.assignedTo = req.userInfo.userId)
                if (!getCall) {
                    return res.send({ status: 0, response: "No sales call found" })
                }
            await db.updateOneDocument("salesCall", { _id: getCall._id }, { $push: { remarks: [{ data: updateReport.report }] } })
            return res.send({ status: 1, response: "Report updated" })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }


    salesControllers.getAllCalls = async (req, res) => {
        try {
            let getAssignedCalls, info;
            let id = new mongoose.Types.ObjectId(req.userInfo.userId)
            getAssignedCalls = await SalesCalls.aggregate([
                { $match: { "assignedBy": id } },
                {
                    $lookup: {
                        from: "companies",
                        localField: "companyId",
                        foreignField: "_id",
                        as: "getCompany",
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "assignedTo",
                        foreignField: "_id",
                        as: "getUser",
                    },
                },
                { $project: { remarks: 1, status: 1, assignedDate: 1, "getCompany.companyName": 1, "getUser.username": 1 } }
            ])
            if (getAssignedCalls.length === 0) {
                return res.send({ status: 1, data: JSON.stringify(getAssignedCalls) })
            }
            info = getAssignedCalls.map((call) => {
                let obj = {}
                obj.callId = call._id
                obj.companyId = call.companyId
                obj.assignedOn = call.assignedDate
                obj.status = call.status
                obj.companyName = call.getCompany[0].companyName
                obj.employeeName = call.getUser[0].username
                obj.remarks = call.remarks
                return obj
            })


            return res.send({ status: 1, data: JSON.stringify(info) })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    // status 1 = In progress
    // status 2 = Call not answered
    // status 3 = Call attended and customer is busy
    // status 4 = Call attended and informed to call in a schedule
    // status 5 = Call attended and conveienced for demo
    // status 6 = Call attended and customer not showing interest

    salesControllers.updateStatus = async (req, res) => {
        try {
            let updateStatus = req.body, getCall;
            updateStatus = updateStatus.data[0]
            getCall = await db.findSingleDocument("salesCall", { _id: updateStatus.id })
            if (!getCall) {
                return res.send({ status: 0, response: "No calls found" })
            }
            await db.updateOneDocument("salesCall", { _id: updateStatus.id }, { status: updateStatus.status })
            return res.send({ status: 1, response: "Status updated" })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    salesControllers.getCallById = async (req, res) => {
        try {
            let callId = req.body, getCall, id;
            callId = callId.data[0]
            id = new mongoose.Types.ObjectId(callId.id)
            getCall = await SalesCalls.aggregate([
                { $match: { _id: id } },
                {
                    $lookup: {
                        from: "companies",
                        localField: "companyId",
                        foreignField: "_id",
                        as: "getCompany",
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "assignedBy",
                        foreignField: "_id",
                        as: "getManager",
                    },
                },
                { $project: { companyId: 1, assignedTo: 1, assignedBy: 1, remarks: 1, status: 1, assignedDate: 1, "getCompany.companyName": 1, "getManager.username": 1 } }
            ])
            if (!getCall) {
                return res.send({ status: 0, response: "No calls found" })
            }
            info = getCall.map((call) => {
                let obj = {}
                obj.callId = call._id
                obj.companyId = call.companyId
                obj.assignedOn = call.assignedDate
                obj.assignedTo = call.assignedTo
                obj.assignedBy = call.assignedBy
                obj.status = call.status
                obj.companyName = call.getCompany[0].companyName
                obj.assignedByName = call.getManager[0].username
                obj.remarks = call.remarks
                return obj
            })
            return res.send({ status: 1, data: JSON.stringify(info) })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    return salesControllers
}


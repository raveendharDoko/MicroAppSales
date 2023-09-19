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
                { $project: { _id: 1, companyId: 1, status: 1, assignedDate: 1, "getCompany.companyId": 1, "getCompany.contact": 1 } }
            ])

            if (getCompany.length === 0) {
                return res.send({ status: 0, data: JSON.stringify(getCompany) })
            }
            let info = getCompany.map((call) => {
                let obj = {}
                obj.callId = call._id
                obj.companyId = call.companyId
                obj.assignedOn = call.assignedDate
                obj.status = call.status
                obj.companyNumber = call.getCompany[0].contact
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
            await db.updateOneDocument("salesCall",{ _id: getCall._id }, { $push: { remarks: [{ data: updateReport.report }] } })
            return res.send({ status: 1, response: "Report updated" })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }


    salesControllers.getAllCalls = async (req, res) => {
        try {
            let getAssignedCalls;

            getAssignedCalls = await db.findDocuments("salesCall",{ assignedBy: req.userInfo.userId })
            
            if (getAssignedCalls.length === 0) {
                return res.send({ status: 0, data: JSON.stringify(getAssignedCalls) })
            }
            return res.send({ status: 1, data: JSON.stringify(getAssignedCalls) })
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
            getCall = await db.findSingleDocument("salesCall",{ _id: updateStatus.id })
            if (!getCall) {
                return res.send({ status: 0, response: "No calls found" })
            }
            await db.updateOneDocument("salesCall",{ _id: updateStatus.id }, { status: updateStatus.status })
            return res.send({ status: 1, response: "Status updated" })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    return salesControllers
}


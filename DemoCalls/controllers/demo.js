const db = require("../models/mongodb.js")
const Demo = require("../schema/demo.js");
const mongoose = require("mongoose")
module.exports = function () {
    let demoController = {}

    demoController.assignDemo = async (req, res) => {
        try {
            let assignDemo = req.body
            assignDemo = assignDemo.data[0]
            checkIfAssigned = await db.findSingleDocument("demo", { callId: assignDemo.callId })
            if (checkIfAssigned) {
                return res.send({ status: 0, response: `This demo is already assigned to ${checkIfAssigned.assignedTo} ` })
            }
            assignDemo.assignedBy = req.userInfo.userId
            await db.insertSingleDocument("demo", assignDemo)
            return res.send({ status: 1, response: "Call assigned" })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }


    demoController.updateReport = async (req, res) => {
        try {
            let updateReport = req.body, getCall;
            updateReport = updateReport.data[0]
            getCall = await db.findSingleDocument("demo", { _id: updateReport.callId })
            if (getCall.assignedTo = req.userInfo.userId)
                if (!getCall) {
                    return res.send({ status: 0, response: "No sales call found" })
                }
            await db.updateOneDocument("demo", { _id: getCall._id }, { $push: { remarks: [{ data: updateReport.report }] } })
            return res.send({ status: 1, response: "Report updated" })

        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }



    demoController.getMyDemo = async (req, res) => {
        try {
            // let ListOfDemos = await db.findDocuments("demo",{assignedTo:req.userInfo.userId})
            let id, getAssignedCalls, info;
            id = new mongoose.Types.ObjectId(req.userInfo.userId)
            getAssignedCalls = await Demo.aggregate([
                { $match: { "assignedTo": id } },
                {
                    $lookup: {
                        from: "salescalls",
                        localField: "callId",
                        foreignField: "_id",
                        as: "getCall",
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "assignedBy",
                        foreignField: "_id",
                        as: "getAssigner",
                    },
                },
                {
                    $lookup: {
                        from: "companies",
                        localField: "getCall.companyId",
                        foreignField: "_id",
                        as: "company",
                    },
                },
                { $project: { assignedBy: 1, status: 1, remarks: 1, "company.companyName": 1, "getAssigner.username": 1 } },

            ])
            if (getAssignedCalls.length === 0) {
                return res.send({ status: 1, data: JSON.stringify(getAssignedCalls) })
            }
            info = getAssignedCalls.map((call) => {
                let obj = {}
                obj.callId = call._id
                obj.companyName = call.company[0].companyName
                obj.status = call.status
                obj.employeeName = call.getAssigner[0].username
                obj.remarks = call.remarks
                return obj
            })

            return res.send({ status: 1, data: JSON.stringify(info) })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }


    // status 1 = In progress
    // status 2 = Demo completed and waiting for customer response
    // status 3 = Demo completed and customer need one more demo 
    // status 4 = Demo completed and customer likes to move forward
    // status 5 = Demo completed and customer not moving forward


    demoController.updateStatus = async (req, res) => {
        try {
            let updateStatus = req.body, getDemo;
            updateStatus = updateStatus.data[0]
            getDemo = await db.findSingleDocument("demo", { _id: updateStatus.id })

            if (!getDemo) {
                return res.send({ status: 0, response: "No demo found" })
            }
            await db.updateOneDocument("demo", { _id: getDemo._id }, { status: updateStatus.status })

            return res.send({ status: 1, response: "Status updated" })

        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    demoController.getAllCalls = async (req, res) => {
        try {
            let getAssignedCalls, info;
            let id = new mongoose.Types.ObjectId(req.userInfo.userId)
            getAssignedCalls = await Demo.aggregate([
                { $match: { "assignedBy": id } },
                {
                    $lookup: {
                        from: "salescalls",
                        localField: "callId",
                        foreignField: "_id",
                        as: "getCall",
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
                {
                    $lookup: {
                        from: "companies",
                        localField: "getCall.companyId",
                        foreignField: "_id",
                        as: "company",
                    },
                },
                { $project: { assignedTo: 1, status: 1, remarks: 1, "company.companyName": 1, "getUser.username": 1 } },

            ])
            if (getAssignedCalls.length === 0) {
                return res.send({ status: 1, data: JSON.stringify(getAssignedCalls) })
            }
            info = getAssignedCalls.map((call) => {
                let obj = {}
                obj.callId = call._id
                obj.companyName = call.company[0].companyName
                obj.status = call.status
                obj.employeeName = call.getUser[0].username
                obj.remarks = call.remarks
                return obj
            })

            return res.send({ status: 1, data: JSON.stringify(info) })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    demoController.getDemoById = async(req,res)=>{
        try {
            let callId = req.body,getDemo;
            callId = callId.data[0]
            getDemo = await db.findSingleDocument("demo",{_id:callId.id})
            if(!getDemo){
                return res.send({ status: 0, response: "No calls found" })
            }
            return res.send({status:1, data:JSON.stringify(getDemo)})
        } catch (error) {
            
        }
    }

    return demoController
}

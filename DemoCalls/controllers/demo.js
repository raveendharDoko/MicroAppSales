const DemoCall = require("../schema/demo.js")
const db = require("../models/mongodb.js")

module.exports = function () {
    let demoController = {}

    demoController.assignDemo = async (req, res) => {
        try {
            let assignDemo = req.body
            assignDemo = assignDemo.data[0]
            checkIfAssigned = await db.findSingleDocument("demo", { callId: assignDemo.callId })
            if (checkIfAssigned) {
                return res.send({ status: 1, response: `This demo is already assigned to ${checkIfAssigned.assignedTo} ` })
            }
            assignDemo.assignedBy = req.userInfo.userId
            await db.insertSingleDocument("demo",assignDemo )
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
                    return res.send({ status: 1, response: "No sales call found" })
                }
            await db.updateOneDocument("demo", { _id: getCall._id }, { $push: { remarks: [{ data: updateReport.report }] } })
            return res.send({ status: 1, response: "Report updated" })

        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }



    demoController.getAllDemo = async (req, res) => {
        try {
            let ListOfDemos = await db.findDocuments("demo")
            if (ListOfDemos.length === 0) {
                return res.send({ status: 1, data: ListOfDemos })
            }
            return res.send({ status: 1, data: ListOfDemos })
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
                return res.send({ status: 1, response: "No demo found" })
            }
            await db.updateOneDocument("demo", { _id: getDemo._id }, { status: updateStatus.status })

            return res.send({ status: 1, response: "Status updated" })

        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    return demoController
}

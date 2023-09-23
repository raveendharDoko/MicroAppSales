const { default: mongoose } = require("mongoose")
const db = require("../models/mongodb.js")
module.exports = function () {
    let afterSalesControllers = {}


    afterSalesControllers.assignConvertedCompanies = async (req, res) => {
        try {
            let assignCompanies = req.body;
            assignCompanies = assignCompanies.data[0]
            await assignCompanies.companyId.forEach(async (call) => {
                assignCompanies.assignedBy = req.userInfo.userId
                assignCompanies.companyId = call
                await db.insertSingleDocument("afterSales", assignCompanies)
                postData = { id: call, status: 5 }
                await fetch("http:/localhost:9000/company/assignStatus", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": req.headers.authorization
                    },
                    body: JSON.stringify(postData)
                })
            })
            return res.send({ status: 1, response: "Companies assigned" })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    afterSalesControllers.getManagerConvertedCompanies = async (req, res) => {
        try {
            let GetManagerConvertedCompanies;
            GetManagerConvertedCompanies = await db.findDocuments("afterSales", { assignedBy: req.userInfo.userId })
            if (GetManagerConvertedCompanies.length === 0) {
                return res.send({ status: 0, data: JSON.stringify(GetManagerConvertedCompanies) })
            }
            return res.send({ status: 1, data: JSON.stringify(GetManagerConvertedCompanies) })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    afterSalesControllers.getYourConvertedCompanies = async (req, res) => {
        try {
            let GetYourConvertedCompanies;
            GetYourConvertedCompanies = await db.findDocuments("afterSales", { assignedTo: req.userInfo.userId })
            if (GetYourConvertedCompanies.length === 0) {
                return res.send({ status: 0, data: JSON.stringify(GetYourConvertedCompanies) })
            }
            return res.send({ status: 1, data: JSON.stringify(GetYourConvertedCompanies) })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    afterSalesControllers.updateConvertedCompaniesReport = async (req, res) => {
        try {
            let UpdateConvertedCompaniesReport = req.body, getConvertedCompany, userId;
            UpdateConvertedCompaniesReport = UpdateConvertedCompaniesReport.data[0]
            getConvertedCompany = await db.findSingleDocument("afterSales", { _id: UpdateConvertedCompaniesReport.id })
            if (!getConvertedCompany) {
                return res.send({ status: 0, response: "No sales call found" })
            }
            userId = new mongoose.Types.ObjectId(req.userInfo.userId)
            if (getConvertedCompany.assignedTo === userId) {
                return res.send({ status: 0, response: "You can't perform this task" })
            }
            await db.updateOneDocument("afterSales",
                { _id: getConvertedCompany._id },
                {
                    $push: { remarks: [{ remark: UpdateConvertedCompaniesReport.remark, contactPerson: UpdateConvertedCompaniesReport.contactPerson, currentVolume: UpdateConvertedCompaniesReport.currentVolume, promisedVolume: UpdateConvertedCompaniesReport.promisedVolume }] },
                    status: UpdateConvertedCompaniesReport.status
                })
            return res.send({ status: 1, response: "Report updated" })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    return afterSalesControllers
}


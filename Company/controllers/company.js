const { default: mongoose } = require("mongoose")
const db = require("../models/mongodb.js")
const Company = require("../schema/company.js")
module.exports = function () {
    let companyControllers = {}

    companyControllers.addCompany = async (req, res) => {
        try {
            let addCompany = req.body, checkIfExist;
            addCompany = addCompany.data[0]

            checkIfExist = await db.findSingleDocument("company", { companyName: addCompany.companyName })
            if (!checkIfExist) {
                await db.insertSingleDocument("company", addCompany)
                return res.send({ status: 1, response: "Company created" })
            }
            if (checkIfExist.status !== 0) {
                return res.send({ status: 0, response: "Comapny with same name already exist" })
            }
            await db.insertSingleDocument("company", addCompany)
            return res.send({ status: 1, response: "Company created" })

        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }


    companyControllers.getAllCompany = async (req, res) => {
        try {
            let ListOfCompanies = await db.findDocuments("company")
            if (ListOfCompanies.length === 0) {
                return res.send({ status: 1, data: JSON.stringify(ListOfCompanies) })
            }
            return res.send({ status: 1, data: JSON.stringify(ListOfCompanies) })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    companyControllers.getUnAssignedCompanies = async (req, res) => {
        try {
            let ListOfCompanies;
            ListOfCompanies = await db.findDocuments("company", { status: 1 });
            if (ListOfCompanies.length === 0) {
                return res.send({ status: 1, data: JSON.stringify(ListOfCompanies) })
            }
            return res.send({ status: 1, data: JSON.stringify(ListOfCompanies) })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    companyControllers.deleteCompany = async (req, res) => {
        try {
            let getCompany = req.body, checkIfExist;
            getCompany = getCompany.data[0]
            checkIfExist = await db.findSingleDocument("company", { _id: getCompany.id })
            if (!checkIfExist) {
                return res.send({ status: 0, response: "No company found" })
            }
            if (checkIfExist.status !== 1) {
                return res.send({ status: 0, response: "Can't perform the task" })
            }
            await db.updateOneDocument("company", { _id: getCompany.id }, { status: 0 })
            return res.send({ status: 1, response: "Company deleted!" })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    companyControllers.editCompany = async (req, res) => {
        try {
            let getCompany = req.body, checkIfExist;
            getCompany = getCompany.data[0]
            checkIfExist = await db.findSingleDocument("company", { _id: getCompany.id })
            if (!checkIfExist) {
                return res.send({ status: 0, response: "No company found" })
            }
            if (checkIfExist.status !== 1) {
                return res.send({ status: 0, response: "Can't perform the task" })
            }
            await db.updateOneDocument("company", { _id: getCompany.id }, getCompany)
            return res.send({ status: 1, response: "Company updated!" })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    companyControllers.assignStatus = async (req, res) => {
        try {
            let body = req.body;
            await db.updateDocument("company", { _id: body.id }, { status: body.status })
            return res.send("Updated")
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    companyControllers.getConvertedCompanies = async (req, res) => {
        try {
            let getConvertedCompanies;
            getConvertedCompanies = await db.findDocuments("company", { status: 3 })
            if (getConvertedCompanies.length === 0) {
                return res.send({ status: 1, data: JSON.stringify(getConvertedCompanies) })
            }
            return res.send({ status: 1, data: JSON.stringify(getConvertedCompanies) })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }


    companyControllers.getMergedReport = async (req, res) => {
        try {
            let getReports = req.body, getInfo, id, info, getCompany;
            getReports = getReports.data[0];
            getCompany = await db.findSingleDocument("company", { _id: getReports.id })
            if (!getCompany) {
                return res.send({ status: 0, response: "No company found" })
            }
            if (getCompany.status === 1) {
                return res.send({ status: 1, response: "No reports found" })
            }
            if (getCompany.status === 2) {
                id = new mongoose.Types.ObjectId(getReports.id)
                getInfo = await Company.aggregate([
                    { $match: { _id: id } },
                    {
                        $lookup: {
                            from: "salescalls",
                            localField: "_id",
                            foreignField: "companyId",
                            as: "getSales",
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "getSales.assignedTo",
                            foreignField: "_id",
                            as: "getSalesUser",
                        }
                    },
                    { $project: { companyName: 1, contactPerson: 1, address: 1, city: 1, state: 1, status: 1, "getSalesUser.username": 1, "getSales.remarks": 1, "getSales.status": 1 } },
                ])

                if (getInfo.length === 0) {
                    return res.send({ status: 1, data: JSON.stringify(getInfo) })
                }
                info = getInfo.map((call) => {
                    let obj = {}
                    obj.companyName = call.companyName
                    obj.contactPerson = call.contactPerson
                    obj.address = call.address
                    obj.city = call.city
                    obj.state = call.state
                    obj.status = call.status
                    obj.getSalesUser = call.getSalesUser[0].username
                    obj.getSalesRemarks = call.getSales[0].remarks
                    obj.getSalesStatus = call.getSales[0].status
                    return obj
                })
                return res.send({ stauts: 1, data: JSON.stringify(info) })
            }

            if (getCompany.status === 3 || getCompany.status === 4) {
                id = new mongoose.Types.ObjectId(getReports.id)
                getInfo = await Company.aggregate([
                    { $match: { _id: id } },
                    {
                        $lookup: {
                            from: "salescalls",
                            localField: "_id",
                            foreignField: "companyId",
                            as: "getSales",
                        }
                    },
                    {
                        $lookup: {
                            from: "democalls",
                            localField: "getSales._id",
                            foreignField: "callId",
                            as: "getDemo",
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "getSales.assignedTo",
                            foreignField: "_id",
                            as: "getSalesUser",
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "getDemo.assignedTo",
                            foreignField: "_id",
                            as: "getDemoUser",
                        }
                    },
                    { $project: { companyName: 1, contactPerson: 1, address: 1, city: 1, state: 1, status: 1, "getSalesUser.username": 1, "getSales.remarks": 1, "getSales.status": 1, "getDemoUser.username": 1, "getDemo.remarks": 1, "getDemo.status": 1, "getAfterSalesUser.username": 1 } },
                ])

                if (getInfo.length === 0) {
                    return res.send({ status: 1, data: JSON.stringify(getInfo) })
                }
                info = getInfo.map((call) => {
                    let obj = {}
                    obj.companyName = call.companyName
                    obj.contactPerson = call.contactPerson
                    obj.address = call.address
                    obj.city = call.city
                    obj.state = call.state
                    obj.status = call.status
                    obj.getSalesUser = call.getSalesUser[0].username
                    obj.getSalesRemarks = call.getSales[0].remarks
                    obj.getSalesStatus = call.getSales[0].status
                    if (call.getDemoUser.length === 0) {
                        return obj
                    }
                    obj.getDemoUser = call.getDemoUser[0].username
                    obj.getDemoRemarks = call.getDemo[0].remarks
                    obj.getDemoStatus = call.getDemo[0].status
                    return obj
                })
                return res.send({ stauts: 1, data: JSON.stringify(info) })
            }
            if (getCompany.status === 5) {
                id = new mongoose.Types.ObjectId(getReports.id)
                getInfo = await Company.aggregate([
                    { $match: { _id: id } },
                    {
                        $lookup: {
                            from: "salescalls",
                            localField: "_id",
                            foreignField: "companyId",
                            as: "getSales",
                        }
                    },
                    {
                        $lookup: {
                            from: "democalls",
                            localField: "getSales._id",
                            foreignField: "callId",
                            as: "getDemo",
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "getSales.assignedTo",
                            foreignField: "_id",
                            as: "getSalesUser",
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "getDemo.assignedTo",
                            foreignField: "_id",
                            as: "getDemoUser",
                        }
                    },
                    {
                        $lookup: {
                            from: "aftersales",
                            localField: "_id",
                            foreignField: "companyId",
                            as: "getAfterSales",
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "getAfterSales.assignedTo",
                            foreignField: "_id",
                            as: "getAfterSalesUser",
                        }
                    },
                    { $project: { companyName: 1, contactPerson: 1, address: 1, city: 1, state: 1, status: 1, "getSalesUser.username": 1, "getSales.remarks": 1, "getSales.status": 1, "getDemoUser.username": 1, "getDemo.remarks": 1, "getDemo.status": 1, "getAfterSalesUser.username": 1, "getAfterSales.remarks": 1, "getAfterSales.status": 1 } },
                ])

                if (getInfo.length === 0) {
                    return res.send({ status: 1, data: JSON.stringify(getInfo) })
                }
                info = getInfo.map((call) => {
                    let obj = {}
                    obj.companyName = call.companyName
                    obj.contactPerson = call.contactPerson
                    obj.address = call.address
                    obj.city = call.city
                    obj.state = call.state
                    obj.status = call.status
                    obj.getSalesUser = call.getSalesUser[0].username
                    obj.getSalesRemarks = call.getSales[0].remarks
                    obj.getSalesStatus = call.getSales[0].status
                    obj.getDemoUser = call.getDemoUser[0].username
                    obj.getDemoRemarks = call.getDemo[0].remarks
                    obj.getDemoStatus = call.getDemo[0].status
                    obj.getAfterSalesUser = call.getAfterSalesUser[0].username
                    obj.getAfterSalesRemarks = call.getAfterSales[0].remarks
                    obj.getAfterSalesStatus = call.getAfterSales[0].status
                    return obj
                })
                return res.send({ stauts: 1, data: JSON.stringify(info) })
            }
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    return companyControllers
}


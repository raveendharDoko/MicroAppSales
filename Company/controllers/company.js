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
            let  ListOfCompanies;
            ListOfCompanies = await db.findDocuments("company",{status:1});
            if (ListOfCompanies.length === 0) {
                return res.send({ status: 1, data: JSON.stringify(ListOfCompanies) })
            }
            // unAssigned = await Company.aggregate([
            //     {
            //         $lookup: {
            //             from: "salescalls",
            //             localField: "_id",
            //             foreignField: "companyId",
            //             as: "getCompany",
            //         },
            //     },
            // ])
            // if (unAssigned.length === 0) {
            //     return res.send({ status: 1, data: JSON.stringify(unAssigned) })
            // }
            // unAssigned = unAssigned.filter((company) => company.getCompany.length === 0)

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
            await db.updateOneDocument("company", { _id: getCompany.id }, { companyName: getCompany.companyName, contact: getCompany.contact })
            return res.send({ status: 1, response: "Company updated!" })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    companyControllers.assignStatus = async (req, res) => {
        try {
            let body = req.body;
            await db.updateDocument("company", { _id: body.id }, { status: 2 })
            return res.send("Updated")
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    return companyControllers
}

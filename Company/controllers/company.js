const db = require("../models/mongodb.js")

module.exports = function () {
    let companyControllers = {}


    companyControllers.addCompany = async (req, res) => {
        try {
            let addCompany = req.body,checkIfExist;
            addCompany = addCompany.data[0]
            
            checkIfExist = await db.findSingleDocument("company",{companyName:addCompany.companyName})
            if(checkIfExist){
                return res.send({status:1, response:"Comapny with same name already exist"})
            }
            if (req.userInfo.userRole !== 2) {
                return res.send({ status: 0, response: "You're not an manager" })
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
                return res.send({ status: 1, data: ListOfCompanies })
            }
            return res.send({ status: 1, data: ListOfCompanies })
        } catch (error) {
            return res.send({ status: 0, response: error.message })
        }
    }

    return companyControllers
}

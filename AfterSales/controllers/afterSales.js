const { default: mongoose } = require("mongoose");
const db = require("../models/mongodb.js");
const AfterSales = require("../schema/afterSales.js");
module.exports = function () {
  let afterSalesControllers = {};

  afterSalesControllers.assignConvertedCompanies = async (req, res) => {
    try {
      let assignCompanies = req.body;
      assignCompanies = assignCompanies.data[0];
      await assignCompanies.companyId.forEach(async (call) => {
        assignCompanies.assignedBy = req.userInfo.userId;
        assignCompanies.companyId = call;
        await db.insertSingleDocument("afterSales", assignCompanies);
        postData = { id: call, status: 5 };
        await fetch("http:/localhost:9000/company/assignStatus", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: req.headers.authorization,
          },
          body: JSON.stringify(postData),
        });
      });
      return res.send({ status: 1, response: "Companies assigned" });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  afterSalesControllers.getManagerConvertedCompanies = async (req, res) => {
    try {
      let GetYourConvertedCompanies, id;
      id = new mongoose.Types.ObjectId(req.userInfo.userId);
      GetYourConvertedCompanies = await AfterSales.aggregate([
        { $match: { assignedBy: id } },
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
            as: "getAssignUser",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "assignedBy",
            foreignField: "_id",
            as: "getAssignedByUser",
          },
        },
      ]);

      if (GetYourConvertedCompanies.length === 0) {
        return res.send({
          status: 0,
          data: JSON.stringify(GetYourConvertedCompanies),
        });
      }
      return res.send({
        status: 1,
        data: JSON.stringify(GetYourConvertedCompanies),
      });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  afterSalesControllers.getYourConvertedCompanies = async (req, res) => {
    try {
      let GetYourConvertedCompanies, id;
      id = new mongoose.Types.ObjectId(req.userInfo.userId);
      GetYourConvertedCompanies = await AfterSales.aggregate([
        { $match: { assignedTo: id } },
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
            as: "getAssignUser",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "assignedBy",
            foreignField: "_id",
            as: "getAssignedByUser",
          },
        },
      ]);

      if (GetYourConvertedCompanies.length === 0) {
        return res.send({
          status: 0,
          data: JSON.stringify(GetYourConvertedCompanies),
        });
      }
      return res.send({
        status: 1,
        data: JSON.stringify(GetYourConvertedCompanies),
      });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  afterSalesControllers.getById = async (req, res) => {
    try {
      let getId = req.body,
        getData,id;
      getId = getId.data[0];
      id =  new mongoose.Types.ObjectId(getId.id)
      getData = await AfterSales.aggregate(
        [
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
              localField: "assignedTo",
              foreignField: "_id",
              as: "getAssignedTo",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "assignedBy",
              foreignField: "_id",
              as: "getAssignedBy",
            },
          },
          {
            $project: {
              _id: 1,
              remarks: 1,
              status: 1,
              createdAt:1,
              "getCompany.companyName": 1,
              "getCompany.status": 1,
              "getCompany.companyMobileNumber": 1,
              "getAssignedTo.username": 1,
              "getAssignedBy.username":1
            },
          },
        ]
        );
      if (getData.length === 0) {
        return res.send({ status: 1, response: "No sales call found" });
      }
      return res.send({ status: 1, data:JSON.stringify(getData) });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  afterSalesControllers.updateConvertedCompaniesReport = async (req, res) => {
    try {
      let UpdateConvertedCompaniesReport = req.body,
        getConvertedCompany,
        userId;
      UpdateConvertedCompaniesReport = UpdateConvertedCompaniesReport.data[0];
      getConvertedCompany = await db.findSingleDocument("afterSales", {
        _id: UpdateConvertedCompaniesReport.id,
      });
      if (!getConvertedCompany) {
        return res.send({ status: 0, response: "No sales call found" });
      }
      userId = new mongoose.Types.ObjectId(req.userInfo.userId);
      if (getConvertedCompany.assignedTo === userId) {
        return res.send({ status: 0, response: "You can't perform this task" });
      }
      await db.updateOneDocument(
        "afterSales",
        { _id: getConvertedCompany._id },
        {
          $push: {
            remarks: [
              {
                remark: UpdateConvertedCompaniesReport.remark,
                contactPerson: UpdateConvertedCompaniesReport.contactPerson,
                currentVolume: UpdateConvertedCompaniesReport.currentVolume,
                promisedVolume: UpdateConvertedCompaniesReport.promisedVolume,
              },
            ],
          },
          status: UpdateConvertedCompaniesReport.status,
        }
      );
      return res.send({ status: 1, response: "Report updated" });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  afterSalesControllers.filterByDate = async (req, res) => {
    try {
      let date = req.body,
        getData,
        startDate,
        endDate;
      startDate = new Date(date.startDate);
      endDate = new Date(date.endDate);
      getData = await AfterSales.aggregate([
        { $unwind: "$remarks" },
        {
          $match: { "remarks.createdAt": { $gte: startDate, $lte: endDate } },
        },
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
            as: "getAssignedTo",
          },
        },
        {
          $project: {
            _id: 1,
            remarks: 1,
            assignedDate: 1,
            status: 1,
            "getCompany.companyName": 1,
            "getCompany.status": 1,
            "getCompany.companyMobileNumber": 1,
            "getAssignedTo.username": 1,
          },
        },
      ]);

      if (getData.length === 0) {
        return res.send({
          status: 1,
          response: "From afterSales",
          data: JSON.stringify(getData),
        });
      }

      return res.send({ status: 1, data: getData });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  return afterSalesControllers;
};

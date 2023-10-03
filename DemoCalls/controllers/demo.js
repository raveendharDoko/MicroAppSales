const salesCallController =
  require("../../SalesCalls/controllers/salesCallController.js")();
const db = require("../models/mongodb.js");
const Demo = require("../schema/demo.js");
const mongoose = require("mongoose");
module.exports = function () {
  let demoController = {};

  demoController.assignDemo = async (req, res) => {
    try {
      let assignDemo = req.body,
        checkIfAssigned;
      assignDemo = assignDemo.data[0];
      checkIfAssigned = await db.findSingleDocument("demo", {
        callId: assignDemo.callId,
      });
      if (checkIfAssigned) {
        return res.send({
          status: 0,
          response: `This demo is already assigned to ${checkIfAssigned.assignedTo} `,
        });
      }
      assignDemo.assignedBy = req.userInfo.userId;
      await db.insertSingleDocument("demo", assignDemo);
      return res.send({ status: 1, response: "Call assigned" });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  demoController.updateReport = async (req, res) => {
    try {
      let updateReport = req.body,
        getCall;
      updateReport = updateReport.data[0];
      getCall = await db.findSingleDocument("demo", {
        _id: updateReport.callId,
      });
      if ((getCall.assignedTo = req.userInfo.userId))
        if (!getCall) {
          return res.send({ status: 0, response: "No sales call found" });
        }
      await db.updateOneDocument(
        "demo",
        { _id: getCall._id },
        {
          $push: {
            remarks: [
              {
                data: updateReport.remark,
                contactPerson: updateReport.contactPerson,
                position: updateReport.position,
              },
            ],
          },
          status: updateReport.status,
        }
      );
      if (updateReport.status !== 2) {
        const updateStatusSales = {
          callId: getCall.callId,
          status: updateReport.status === 1 ? 1 : 4,
        };

        await fetch("http:/localhost:9000/salesCalls/updateStatus", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: req.headers.authorization,
          },
          body: JSON.stringify(updateStatusSales),
        });
        const getCompany = await Demo.aggregate([
          {
            $lookup: {
              from: "salescalls",
              localField: "callId",
              foreignField: "_id",
              as: "getCall",
            },
          },
          { $match: { "getCall._id": getCall.callId } },
          { $unwind: "$getCall" },
          { $project: { "getCall.companyId": 1 } },
        ]);
        const updateStatusCompany = {
          id: getCompany[0].getCall.companyId,
          status: updateReport.status === 1 ? 3 : 4,
        };

        await fetch("http:/localhost:9000/company/assignStatus", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: req.headers.authorization,
          },
          body: JSON.stringify(updateStatusCompany),
        });

        return res.send({ status: 1, response: "Report updated" });
      }
      return res.send({ status: 1, response: "Report updated" });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  demoController.getMyDemo = async (req, res) => {
    try {
      let id, getAssignedCalls, info;
      id = new mongoose.Types.ObjectId(req.userInfo.userId);
      getAssignedCalls = await Demo.aggregate([
        { $match: { assignedTo: id } },
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
        {
          $project: {
            assignedBy: 1,
            status: 1,
            remarks: 1,
            "company.companyName": 1,
            "getAssigner.username": 1,
          },
        },
      ]);
      if (getAssignedCalls.length === 0) {
        return res.send({ status: 1, data: JSON.stringify(getAssignedCalls) });
      }
      info = getAssignedCalls.map((call) => {
        let obj = {};
        obj.callId = call._id;
        obj.companyName = call.company[0].companyName;
        obj.status = call.status;
        obj.employeeName = call.getAssigner[0].username;
        obj.remarks = call.remarks;
        return obj;
      });

      return res.send({ status: 1, data: JSON.stringify(info) });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  demoController.assignedDemos = async (req, res) => {
    try {
      let getAssignedCalls, info;
      let id = new mongoose.Types.ObjectId(req.userInfo.userId);
      getAssignedCalls = await Demo.aggregate([
        { $match: { assignedBy: id } },
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
        {
          $project: {
            assignedTo: 1,
            status: 1,
            remarks: 1,
            "company.companyName": 1,
            "getUser.username": 1,
          },
        },
      ]);
      if (getAssignedCalls.length === 0) {
        return res.send({ status: 1, data: JSON.stringify(getAssignedCalls) });
      }
      info = getAssignedCalls.map((call) => {
        let obj = {};
        obj.callId = call._id;
        obj.companyName = call.company[0].companyName;
        obj.status = call.status;
        obj.employeeName = call.getUser[0].username;
        obj.remarks = call.remarks;
        return obj;
      });

      return res.send({ status: 1, data: JSON.stringify(info) });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  demoController.getDemoById = async (req, res) => {
    try {
      let demoId = req.body,
        getDemo,
        id,
        info;
      demoId = demoId.data[0];
      id = new mongoose.Types.ObjectId(demoId.id);
      getDemo = await Demo.aggregate([
        { $match: { _id: id } },
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
        {
          $project: {
            companyId: 1,
            assignedTo: 1,
            assignedBy: 1,
            remarks: 1,
            status: 1,
            assignedDate: 1,
            "company.companyName": 1,
            "getUser.username": 1,
          },
        },
      ]);
      if (!getDemo) {
        return res.send({ status: 0, response: "No calls found" });
      }
      info = getDemo.map((call) => {
        let obj = {};
        obj.callId = call._id;
        obj.companyId = call.companyId;
        obj.assignedOn = call.assignedDate;
        obj.assignedTo = call.assignedTo;
        obj.assignedBy = call.assignedBy;
        obj.status = call.status;
        obj.companyName = call.company[0].companyName;
        obj.assignedByName = call.getUser[0].username;
        obj.remarks = call.remarks;
        return obj;
      });
      return res.send({ status: 1, data: JSON.stringify(info) });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  demoController.getManagerDemo = async (req, res) => {
    try {
      let id, getDemo, info;
      id = new mongoose.Types.ObjectId(req.userInfo.userId);
      getDemo = await Demo.aggregate([
        {
          $lookup: {
            from: "salescalls",
            localField: "callId",
            foreignField: "_id",
            as: "getCall",
          },
        },
        { $match: { "getCall.assignedBy": id } },
        {
          $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "getDemoUser",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "assignedBy",
            foreignField: "_id",
            as: "getSalesUser",
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
        {
          $project: {
            callId: 1,
            assignedTo: 1,
            assignedBy: 1,
            remarks: 1,
            status: 1,
            createdAt: 1,
            "getDemoUser.username": 1,
            "getSalesUser.username": 1,
            "company.companyName": 1,
          },
        },
      ]);
      if (getDemo.length === 0) {
        return res.send({ status: 1, data: JSON.stringify(getDemo) });
      }
      info = getDemo.map((call) => {
        let obj = {};
        obj.callId = call._id;
        obj.salesCallId = call.callId;
        obj.assignedOn = call.createdAt;
        obj.assignedTo = call.assignedTo;
        obj.assignedBy = call.assignedBy;
        obj.status = call.status;
        obj.companyName = call.company[0].companyName;
        obj.salesCallAssignedTo = call.getSalesUser[0].username;
        obj.demoForwardedTo = call.getDemoUser[0].username;
        obj.remarks = call.remarks;
        return obj;
      });

      return res.send({ status: 1, data: JSON.stringify(info) });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  demoController.filterByDate = async (req, res) => {
    try {
      let date = req.body,
        getDemoAssigns,
        getDemoReports,
        getAssignAlign,
        getReportAlign,
        startDate,
        endDate;
      startDate = new Date(date.startDate);
      endDate = new Date(date.endDate);
      getDemoAssigns = await Demo.aggregate([
        { $unwind: "$scheduledAt" },
        {
          $match: {
            scheduledAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $lookup: {
            from: "salescalls",
            localField: "callId",
            foreignField: "_id",
            as: "getSales",
          },
        },
        {
          $lookup: {
            from: "companies",
            localField: "getSales.companyId",
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
            scheduledAt: 1,
            status: 1,
            "getCompany.companyName": 1,
            "getCompany.status": 1,
            "getCompany.companyMobileNumber": 1,
            "getAssignedTo.username": 1,
            "getAssignedBy.username": 1,
          },
        },
      ]);

      getDemoReports = await Demo.aggregate([
        { $unwind: "$remarks" },
        {
          $match: {
            "remarks.enteredDate": { $gte: startDate, $lte: endDate },
          },
        },
        {
          $lookup: {
            from: "salescalls",
            localField: "callId",
            foreignField: "_id",
            as: "getSales",
          },
        },
        {
          $lookup: {
            from: "companies",
            localField: "getSales.companyId",
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
            scheduledAt: 1,
            status: 1,
            "getCompany.companyName": 1,
            "getCompany.status": 1,
            "getCompany.companyMobileNumber": 1,
            "getAssignedTo.username": 1,
            "getAssignedBy.username": 1,
          },
        },
      ]);

      if (getDemoReports.length === 0 && getDemoAssigns.length === 0) {
        return res.send({ status: 1, data: [] });
      }
      getReportAlign = getDemoReports.map((call) => {
        let obj = {};
        obj._id = call._id;
        obj.assignedOn = call.scheduledAt;
        obj.assignedTo = call.getAssignedTo[0]
          ? call.getAssignedTo[0].username
          : null;
        obj.assignedBy = call.getAssignedBy[0]
          ? call.getAssignedBy[0].username
          : null;
        obj.status = call.status;
        obj.companyName = call.getCompany[0]
          ? call.getCompany[0].companyName
          : null;
        obj.remarks = call.remarks;
        return obj;
      });
      getAssignAlign = getDemoAssigns.map((call) => {
        let obj = {};
        obj._id = call._id;
        obj.assignedOn = call.scheduledAt;
        obj.assignedTo = call.getAssignedTo[0]
          ? call.getAssignedTo[0].username
          : null;
        obj.assignedBy = call.getAssignedBy[0]
          ? call.getAssignedBy[0].username
          : null;
        obj.status = call.status;
        obj.companyName = call.getCompany[0]
          ? call.getCompany[0].companyName
          : null;
        obj.remarks = call.remarks;
        return obj;
      });
      return res.send({
        status: 1,
        response: "from demo calls",
        getDemoAssign: getAssignAlign,
        getDemoReport: getReportAlign,
      });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  return demoController;
};

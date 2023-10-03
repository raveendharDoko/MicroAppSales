const { default: mongoose } = require("mongoose");
const SalesCalls = require("../schema/salesCall.js");
const db = require("../models/mongodb.js");

module.exports = function () {
  let salesControllers = {};

  salesControllers.assignSaleCalls = async (req, res) => {
    try {
      let assignCall = req.body,
        postData,
        getUsername,
        checkLimitReach;
      assignCall = assignCall.data[0];
      checkLimitReach = await db.findDocuments("salesCall", {
        assignedTo: assignCall.assignedTo,
        assignedDate: assignCall.assignedDate,
      });
      let id = new mongoose.Types.ObjectId(assignCall.assignedTo);
      getUsername = await SalesCalls.aggregate([
        { $match: { assignedTo: id } },
        {
          $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "getUser",
          },
        },
      ]);
      if (checkLimitReach.length >= 5) {
        return res.send({
          status: 0,
          response: `Sales call limit already reached for ${getUsername[0].getUser[0].username} on requested date`,
        });
      }
      await assignCall.companyId.forEach(async (call) => {
        assignCall.assignedBy = req.userInfo.userId;
        assignCall.companyId = call;
        db.insertSingleDocument("salesCall", assignCall);
        postData = { id: call, status: 2 };
        await fetch("http:/localhost:9000/company/assignStatus", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: req.headers.authorization,
          },
          body: JSON.stringify(postData),
        });
      });
      return res.send({ status: 1, response: "Call assigned" });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  salesControllers.yourCallList = async (req, res) => {
    try {
      let id = new mongoose.Types.ObjectId(req.userInfo.userId);
      let getCompany = await SalesCalls.aggregate([
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
            localField: "assignedBy",
            foreignField: "_id",
            as: "getManager",
          },
        },
        {
          $project: {
            _id: 1,
            companyId: 1,
            status: 1,
            assignedDate: 1,
            "getCompany.companyName": 1,
            "getManager.username": 1,
            "getManager._id": 1,
          },
        },
      ]);

      if (getCompany.length === 0) {
        return res.send({ status: 1, data: JSON.stringify(getCompany) });
      }
      let info = getCompany.map((call) => {
        let obj = {};
        obj.callId = call._id;
        obj.assignedId = call.getManager[0]._id;
        obj.companyName = call.getCompany[0].companyName;
        obj.assignedOn = call.assignedDate;
        obj.status = call.status;
        obj.assignedBy = call.getManager[0].username;
        return obj;
      });
      return res.send({ status: 1, data: JSON.stringify(info) });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  salesControllers.updateReport = async (req, res) => {
    try {
      let updateReport = req.body,
        getCall,
        id;
      updateReport = updateReport.data[0];
      getCall = await SalesCalls.findById({ _id: updateReport.callId });
      if (!getCall) {
        return res.send({ status: 0, response: "No sales call found" });
      }
      id = getCall.assignedTo.toString();

      if (id !== req.userInfo.userId) {
        return res.send({ status: 0, response: "Un authorized" });
      }
      await db.updateOneDocument(
        "salesCall",
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
      if (updateReport.status === 1 || updateReport.status === 4) {
        const updateStatusCompany = {
          id: getCall.companyId,
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
      }
      return res.send({ status: 1, response: "Report updated" });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  salesControllers.updateStatus = async (req, res) => {
    try {
      const body = req.body;
      await db.updateOneDocument(
        "salesCall",
        { _id: body.callId },
        { status: body.status }
      );
      return res.send("Report updated");
    } catch (error) {
      return res.send(error.message);
    }
  };

  salesControllers.getAllCalls = async (req, res) => {
    try {
      let getAssignedCalls, info;
      let id = new mongoose.Types.ObjectId(req.userInfo.userId);
      getAssignedCalls = await SalesCalls.aggregate([
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
            as: "getUser",
          },
        },
        {
          $project: {
            remarks: 1,
            status: 1,
            assignedDate: 1,
            "getCompany.companyName": 1,
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
        obj.companyId = call.companyId;
        obj.assignedOn = call.assignedDate;
        obj.status = call.status;
        obj.companyName = call.getCompany[0].companyName;
        obj.employeeName = call.getUser[0].username;
        obj.remarks = call.remarks;
        return obj;
      });

      return res.send({ status: 1, data: JSON.stringify(info) });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  salesControllers.getCallById = async (req, res) => {
    try {
      let callId = req.body,
        getCall,
        id;
      callId = callId.data[0];
      id = new mongoose.Types.ObjectId(callId.id);
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
        {
          $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "getUser",
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
            "getCompany.companyName": 1,
            "getManager.username": 1,
            "getUser.username": 1,
          },
        },
      ]);
      if (!getCall) {
        return res.send({ status: 0, response: "No calls found" });
      }
      info = getCall.map((call) => {
        let obj = {};
        obj.callId = call._id;
        obj.companyId = call.companyId;
        obj.assignedOn = call.assignedDate;
        obj.assignedTo = call.assignedTo;
        obj.assignedBy = call.assignedBy;
        obj.status = call.status;
        obj.companyName = call.getCompany[0].companyName;
        obj.assignedByName = call.getManager[0].username;
        obj.assignedToName = call.getUser[0].username;
        obj.remarks = call.remarks;
        return obj;
      });
      return res.send({ status: 1, data: JSON.stringify(info) });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  salesControllers.filterByDate = async (req, res) => {
    try {
      let date = req.body,
        payloadDate,
        getDemoInfo,
        getDemoReports,
        getSalesInfos,
        getSalesAssigns,
        getSalesReports,
        getAfterSalesInfo,
        getAfterSalesReports,
        getData,
        startDate,
        endDate;
      date = date.data[0];
      startDate = new Date(date.startDate);
      endDate = new Date(date.endDate);
      payloadDate = {
        startDate: startDate,
        endDate: endDate,
      };
      getDemoInfo = await fetch("http:/localhost:9000/demoCalls/filterByDate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers.authorization,
        },
        body: JSON.stringify(payloadDate),
      });
      getAfterSalesInfo = await fetch(
        "http:/localhost:9000/afterSales/filterByDate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: req.headers.authorization,
          },
          body: JSON.stringify(payloadDate),
        }
      );
      getDemoReports = await getDemoInfo.json();
      getAfterSalesReports = await getAfterSalesInfo.json();
      getSalesAssigns = await SalesCalls.aggregate([
        { $unwind: "$assignedDate" },
        {
          $match: { assignedDate: { $gte: startDate, $lte: endDate } },
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
            assignedDate: 1,
            status: 1,
            "getCompany.companyName": 1,
            "getCompany.status": 1,
            "getCompany.companyMobileNumber": 1,
            "getAssignedTo.username": 1,
            "getAssignedBy.username": 1,
          },
        },
      ]);
      getSalesReports = await SalesCalls.aggregate([
        { $unwind: "$remarks" },
        {
          $match: { "remarks.enteredDate": { $gte: startDate, $lte: endDate } },
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

      if (getSalesReports.length === 0) {
        return res.send({ status: 1, data: JSON.stringify(getData) });
      }
      getSalesInfos = {
        status: 1,
        response: "from sales calls",
        data: [
          { getSalesReport: getSalesReports },
          { getSalesAssign: getSalesAssigns },
        ],
      };
      return res.send({
        status: 1,
        getSalesInfo: getSalesInfos,
        getDemoReport: getDemoReports,
        getAfterSalesReport: getAfterSalesReports,
      });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  salesControllers.getAllSalesWithCompany = async (req, res) => {
    try {
      let getAllSalesWithCompany,info;
      getAllSalesWithCompany = await SalesCalls.aggregate([
        {
          $lookup: {
            from: "companies",
            localField: "companyId",
            foreignField: "_id",
            as: "getCompany",
          },
        },
        {$project:{_id:1,companyId:1,"getCompany.companyName":1}}
      ]);
      if (getAllSalesWithCompany.length === 0) {
        return res.send({
          status: 1,
          data: JSON.stringify(getAllSalesWithCompany),
        });
      }
      info = getAllSalesWithCompany.map((call) => {
        let obj = {};
        obj.callId = call._id;
        obj.companyId = call.companyId;
        obj.companyName = call.getCompany[0].companyName;
        return obj;
      });
      return res.send({ status: 1, data: JSON.stringify(info) });
    } catch (error) {
      return res.send({ status: 0, response: error.message });
    }
  };

  return salesControllers;
};

// salesControllers.getMergedReport = async (req, res) => {
//     try {
//         let getReports = req.body, getInfo, id, info;
//         getReports = getReports.data[0];
//         id = new mongoose.Types.ObjectId(getReports.id)
//         getInfo = await SalesCalls.aggregate([
//             { $match: { _id: id } },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "assignedTo",
//                     foreignField: "_id",
//                     as: "getSalesUser",
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "democalls",
//                     localField: "_id",
//                     foreignField: "callId",
//                     as: "getDemo",
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "getDemo.assignedTo",
//                     foreignField: "_id",
//                     as: "getDemoUser",
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "companies",
//                     localField: "companyId",
//                     foreignField: "_id",
//                     as: "getCompany",
//                 },
//             },
//             { $project: { assignedDate: 1, status: 1, remarks: 1, "getSalesUser.username": 1, "getDemoUser.username": 1, "getDemo._id": 1, "getDemo.assignedTo": 1, "getDemo.assignedBy": 1, "getDemo.remarks": 1, "getDemo.status": 1, "getCompany.companyName": 1 } },
//         ])

//         if (getInfo.length === 0) {
//             return res.send({ status: 1, data: JSON.stringify(getInfo) })
//         }
//         info = getInfo.map((call) => {
//             let obj = {}
//             obj.callId = call.getDemo[0]._id
//             obj.assignedTo = call.getDemo[0].assignedTo
//             obj.assignedBy = call.getDemo[0].assignedBy
//             obj.companyName = call.getCompany[0].companyName
//             obj.assignedToName = call.getDemoUser[0].username
//             obj.assignedByName = call.getSalesUser[0].username
//             obj.SalesAssignedOn = call.assignedDate
//             obj.SalesStatus = call.status
//             obj.SalesRemarks = call.remarks
//             obj.status = call.getDemo[0].status
//             obj.remarks = call.getDemo[0].remarks
//             return obj
//         })
//         return res.send({ stauts: 1, response:info })
//     } catch (error) {
//         return res.send({ status: 0, response: error.message })
//     }
// }

const { check, validationResult } = require("express-validator");

module.exports = function () {
    let data = { status: 0, response: "Invalid Request" },
        validator = {};

    validator.assignCall = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.companyId").notEmpty().withMessage("CompanyId is required field"),
        check("data.*.assignedTo").notEmpty().withMessage("assignedTo is required field"),

        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;
                return res.send(data);
            }
            return next();
        },
    ];


    validator.updateReport = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.callId").notEmpty().withMessage("callId is required field"),
        check("data.*.remark").notEmpty().withMessage("Remark is required field"),
        check("data.*.status").notEmpty().withMessage("Status is required field"),

        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;
                return res.send(data);
            }
            return next();
        },
    ];

    validator.getById = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.id").notEmpty().withMessage("Id is required field"),
        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;
                return res.send(data);
            }
            return next();
        },
    ];

    return validator

}
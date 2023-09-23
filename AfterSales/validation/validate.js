const { check, validationResult } = require("express-validator");

module.exports = function () {
    let data = { status: 0, response: "Invalid Request" },
        validator = {};

    validator.addCompany = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.companyName").notEmpty().withMessage("companyName is required field"),
        check("data.*.contactPersonMobileNumber").notEmpty().withMessage("Contact is required field"),
      
        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;
                return res.send(data);
            }
            return next();
        },
    ];

    validator.deleteCompany = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.id").notEmpty().withMessage("companyId is required field"),
      
        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;
                return res.send(data);
            }
            return next();
        },
    ];

    validator.editCompany = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.id").notEmpty().withMessage("companyId is required field"),
      
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
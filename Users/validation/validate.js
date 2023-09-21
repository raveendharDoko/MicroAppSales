const { check, validationResult } = require("express-validator");

module.exports = function () {
    let data = { status: 0, response: "Invalid Request" },
        validator = {};

    validator.register = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.username").notEmpty().withMessage("Username is required field"),
        check("data.*.password").notEmpty().withMessage("Password is required field"),
        check("data.*.email").notEmpty().withMessage("Email is required field"),
        check("data.*.email").isEmail().withMessage("Email is Invalid"),

        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;
                return res.send(data);
            }
            return next();
        },
    ];


    validator.login = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.password").notEmpty().withMessage("Password is required field"),
        check("data.*.email").notEmpty().withMessage("Email is required field"),
        check("data.*.email").isEmail().withMessage("Email is Invalid"),

        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;
                return res.send(data);
            }
            return next();
        },
    ];

    validator.createNetwork = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.employeeId").notEmpty().withMessage("EmployeeId is required field"),

        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;
                return res.send(data);
            }
            return next();
        },
    ];

    validator.createPower = [
        check("data").notEmpty().withMessage("Data cannot be empty"),
        check("data.*.username").notEmpty().withMessage("Username is required field"),
        check("data.*.password").notEmpty().withMessage("Password is required field"),
        check("data.*.email").notEmpty().withMessage("Email is required field"),
        check("data.*.role").notEmpty().withMessage("Role is required field"),
        check("data.*.email").isEmail().withMessage("Email is Invalid"),

        (req, res, next) => {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                data.response = errors[0].msg;
                return res.send(data);
            }
            return next();
        },
    ];

    validator.removeFromNetwork = [
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
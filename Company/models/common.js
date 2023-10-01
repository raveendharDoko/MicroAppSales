const Company = require("../schema/company")
const mongoose = require("mongoose")
const authManager = ()=>{
    return (req, res, next) => {
        const roleCheck = req.userInfo.role;
        if (roleCheck === 3) {
          next();
        } else {
          res.send({status:0,response:'Permission Denied'});
        }
      };
}

const validateDocument = (document) => {
  
  const Model = mongoose.model("company");
  const newDocument = new Model(document);
  return newDocument.validateSync();
};

module.exports = {authManager,validateDocument}
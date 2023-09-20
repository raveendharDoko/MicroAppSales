const authManager = ()=>{
    return (req, res, next) => {
        const roleCheck = req.userInfo.userRole;
        if (roleCheck === 2) {
          next();
        } else {
          res.send({status:0,response:'Permission Denied'});
        }
      };
}

module.exports = {authManager}
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

module.exports = {authManager}
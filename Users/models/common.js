const authManager = ()=>{
    return (req, res, next) => {
        const roleCheck = req.userInfo.userRole;
        if (roleCheck === 2) {
          next();
        } else {
          res.send('Permission Denied');
        }
      };
}

const authSuperAdmin = ()=>{
    return (req, res, next) => {
        const roleCheck = req.userInfo.userRole;
        if (roleCheck === 4) {
          next();
        } else {
          res.send('Permission Denied');
        }
      };
}

module.exports = {authSuperAdmin,authManager}
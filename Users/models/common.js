const authManager = () => {
    return (req, res, next) => {
        const roleCheck = req.userInfo.role;
        if (roleCheck === 2) {
            next();
        } else {
            res.send({ status: 0, response: 'Permission Denied' });
        }
    };
}

const authSuperAdmin = () => {
    return (req, res, next) => {
        const roleCheck = req.userInfo.role;
        if (roleCheck === 4) {
            next();
        } else {
            res.send({ status: 0, response: 'Permission Denied' });
        }
    };
}

module.exports = { authSuperAdmin, authManager }
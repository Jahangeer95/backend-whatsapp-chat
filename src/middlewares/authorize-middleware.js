const { USER_ROLE_OBJ } = require("../config");

const checkRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ message: `Requires ${role} access` });
  }
  next();
};

const checkRoleAdmin = (req, res, next) => {
  if (req.user?.role !== USER_ROLE_OBJ.admin) {
    return res.status(403).json({ message: `Requires Admin access` });
  }
  next();
};

module.exports = { checkRoleAdmin };

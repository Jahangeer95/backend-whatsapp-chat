const { USER_ROLE_OBJ } = require("../config");

const checkAllowedRoles = (roleArray) => (req, res, next) => {
  if (!roleArray.includes(req.user?.role)) {
    return res
      .status(403)
      .json({
        message: `Only ${roleArray.join(" | ")} can perform this action`,
      });
  }
  next();
};

const checkRoleAdmin = (req, res, next) => {
  if (req.user?.role !== USER_ROLE_OBJ.admin) {
    return res.status(403).json({ message: `Requires Admin access` });
  }
  next();
};

const checkRoleAdminAndManager = (req, res, next) => {
  if (![USER_ROLE_OBJ.admin, USER_ROLE_OBJ.manager].includes(req.user.role)) {
    return res.status(403).json({ message: `Requires Admin/Manager access` });
  }
  next();
};

module.exports = {
  checkRoleAdmin,
  checkRoleAdminAndManager,
  checkAllowedRoles,
};

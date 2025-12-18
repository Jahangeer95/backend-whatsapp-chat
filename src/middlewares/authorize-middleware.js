const {
  USER_ROLE_OBJ,
  ROLE_BASED_PERMISSIONS,
  API_CATEGORY_OBJ,
  HTTP_METHODS_OBJ,
  CAN_GET_USERS,
  CAN_CREATE_USER,
  ADMIN_CAN_CREATE_USER_WITH_ROLE,
  MANAGER_CAN_CREATE_USER_WITH_ROLE,
  CAN_DELETE_USER,
  ADMIN_CAN_DELETE_USER_WITH_ROLE,
  CAN_UPDATE_USER,
  ADMIN_CAN_UPDATE_USER_WITH_ROLE,
  MANAGER_CAN_UPDATE_USER_WITH_ROLE,
} = require("../config");
const userService = require("../services/app-user-service");

const checkAllowedRoles = (roleArray) => (req, res, next) => {
  if (req.user?.role === USER_ROLE_OBJ.owner) {
    return next();
  }
  if (!roleArray.includes(req.user?.role)) {
    return res.status(403).json({
      message: `Only ${roleArray.join(" | ")} can perform this action`,
    });
  }
  next();
};

const checkRoleAdmin = (req, res, next) => {
  if (req.user?.role === USER_ROLE_OBJ.owner) {
    return next();
  }
  if (req.user?.role !== USER_ROLE_OBJ.admin) {
    return res.status(403).json({ message: `Requires Admin access` });
  }
  next();
};

const checkRoleAdminAndManager = (req, res, next) => {
  if (req.user?.role === USER_ROLE_OBJ.owner) {
    return next();
  }
  if (![USER_ROLE_OBJ.admin, USER_ROLE_OBJ.manager].includes(req.user.role)) {
    return res.status(403).json({ message: `Requires Admin/Manager access` });
  }
  next();
};

const checkAuthorizationForUserPaths = async (req, res, next) => {
  const loginUserRole = req?.user?.role;
  const httpMethod = req.method;

  if (!loginUserRole) {
    return res.status(401).json({
      success: false,
      error: "ACCESS_DENIED",
      message: "Unauthorized",
    });
  }

  if (loginUserRole === USER_ROLE_OBJ.owner) {
    return next();
  }

  const loginUserPermissions =
    ROLE_BASED_PERMISSIONS[loginUserRole]?.[API_CATEGORY_OBJ.user];

  if (!loginUserPermissions) {
    return res.status(401).json({
      success: false,
      error: "ACCESS_DENIED",
      message: "Unauthorized",
    });
  }

  if (httpMethod === HTTP_METHODS_OBJ.get) {
    if (CAN_GET_USERS?.includes(loginUserRole)) {
      return next();
    } else {
      return res.status(401).json({
        success: false,
        error: "Only Owner, Admin and Manager can able to view users",
        message: "Unauthorized",
      });
    }
  }

  if (httpMethod === HTTP_METHODS_OBJ.post) {
    if (CAN_CREATE_USER?.includes(loginUserRole)) {
      const { role } = req.body;

      if (loginUserRole === USER_ROLE_OBJ?.admin) {
        if (ADMIN_CAN_CREATE_USER_WITH_ROLE?.includes(role)) {
          return next();
        } else {
          return res.status(401).json({
            success: false,
            error:
              "Admin can able to create user with role Manager, Editor and Moderator.",
            message: "Unauthorized",
          });
        }
      }

      if (loginUserRole === USER_ROLE_OBJ?.manager) {
        if (MANAGER_CAN_CREATE_USER_WITH_ROLE?.includes(role)) {
          return next();
        } else {
          return res.status(401).json({
            success: false,
            error:
              "Manager can able to create user with role Editor and Moderator.",
            message: "Unauthorized",
          });
        }
      }
    } else {
      return res.status(401).json({
        success: false,
        error: "Only Owner, Admin and Manager can able to create user",
        message: "Unauthorized",
      });
    }
  }

  if (httpMethod === HTTP_METHODS_OBJ.patch) {
    if (CAN_UPDATE_USER?.includes(loginUserRole)) {
      const { userId } = req.params || {};
      const { role } = req.body;
      const userToBeUpdated = await userService.findUserById(userId);

      if (loginUserRole === USER_ROLE_OBJ?.admin) {
        if (
          ADMIN_CAN_UPDATE_USER_WITH_ROLE?.includes(role) &&
          ADMIN_CAN_UPDATE_USER_WITH_ROLE?.includes(userToBeUpdated?.role)
        ) {
          return next();
        } else {
          return res.status(401).json({
            success: false,
            error:
              "Admin can update users with the roles Manager, Editor, or Moderator to any of these roles.",
            message: "Unauthorized",
          });
        }
      }

      if (loginUserRole === USER_ROLE_OBJ.manager) {
        if (
          MANAGER_CAN_UPDATE_USER_WITH_ROLE?.includes(role) &&
          MANAGER_CAN_UPDATE_USER_WITH_ROLE?.includes(userToBeUpdated?.role)
        ) {
          return next();
        } else {
          return res.status(401).json({
            success: false,
            error:
              "Manager can update users with the roles Editor, or Moderator to any of these roles.",
            message: "Unauthorized",
          });
        }
      }
    } else {
      return res.status(401).json({
        success: false,
        error: "Only Owner, Admin and Manager can able to update user role.",
        message: "Unauthorized",
      });
    }
  }

  if (httpMethod === HTTP_METHODS_OBJ.delete) {
    if (CAN_DELETE_USER?.includes(loginUserRole)) {
      const { userId } = req.params || {};
      const userToBeDeleted = await userService.findUserById(userId);

      if (ADMIN_CAN_DELETE_USER_WITH_ROLE?.includes(userToBeDeleted?.role)) {
        return next();
      } else {
        return res.status(401).json({
          success: false,
          error:
            "Admin can able to delete user with role Manager, Moderator and Editor.",
          message: "Unauthorized",
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        error: "Only Owner and Admin can able to delete user.",
        message: "Unauthorized",
      });
    }
  }

  next();
};

module.exports = {
  checkRoleAdmin,
  checkRoleAdminAndManager,
  checkAllowedRoles,
  checkAuthorizationForUserPaths,
};

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
      message: "Authentication required",
    });
  }

  if (loginUserRole === USER_ROLE_OBJ.owner) {
    return next();
  }

  const loginUserPermissions =
    ROLE_BASED_PERMISSIONS[loginUserRole]?.[API_CATEGORY_OBJ.user];

  if (!loginUserPermissions) {
    return res.status(403).json({
      success: false,
      error: "ACCESS_DENIED",
      message: "You are not Unauthorized to perform this action!!!",
    });
  }

  if (httpMethod === HTTP_METHODS_OBJ.get) {
    if (CAN_GET_USERS?.includes(loginUserRole)) {
      return next();
    } else {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
        message: "Only Owner, Admin and Manager can able to view users",
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
          return res.status(403).json({
            success: false,
            error: "FORBIDDEN",
            message:
              "Admin can able to create user with role Manager, Editor and Moderator.",
          });
        }
      }

      if (loginUserRole === USER_ROLE_OBJ?.manager) {
        if (MANAGER_CAN_CREATE_USER_WITH_ROLE?.includes(role)) {
          return next();
        } else {
          return res.status(403).json({
            success: false,
            error: "FORBIDDEN",
            message:
              "Manager can able to create user with role Editor and Moderator.",
          });
        }
      }
    } else {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
        message: "Only Owner, Admin and Manager can able to create user",
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
          return res.status(403).json({
            success: false,
            error: "FORBIDDEN",
            message:
              "Admin can update users with the roles Manager, Editor, or Moderator to any of these roles.",
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
          return res.status(403).json({
            success: false,
            error: "FORBIDDEN",
            message:
              "Manager can update users with the roles Editor, or Moderator to any of these roles.",
          });
        }
      }
    } else {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
        message: "Only Owner, Admin and Manager can able to update user role.",
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
        return res.status(403).json({
          success: false,
          error: "FORBIDDEN",
          message:
            "Admin can able to delete user with role Manager, Moderator and Editor.",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
        message: "Only Owner and Admin can able to delete user.",
      });
    }
  }

  next();
};

const checkAuthorizationForPagesPaths = async (req, res, next) => {
  const loginUserRole = req?.user?.role;
  const httpMethod = req.method;

  if (!loginUserRole) {
    return res.status(401).json({
      success: false,
      error: "ACCESS_DENIED",
      message: "Authentication required",
    });
  }

  if (loginUserRole === USER_ROLE_OBJ.owner) {
    return next();
  }

  const loginUserPermissions =
    ROLE_BASED_PERMISSIONS[loginUserRole]?.[API_CATEGORY_OBJ.pages];

  if (!loginUserPermissions) {
    return res.status(403).json({
      success: false,
      error: "ACCESS_DENIED",
      message: "You are not Unauthorized to perform this action!!!",
    });
  }

  if (httpMethod === HTTP_METHODS_OBJ.post) {
    const { pageId } = req.params || {};

    if (pageId) {
      if (loginUserPermissions.includes("add_user_to_page")) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          error: "FORBIDDEN",
          message: "Only Owner, Admin and Manager can assign a page to user.",
        });
      }
    }

    if (loginUserPermissions.includes("link_page")) {
      return next();
    } else {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
        message: "Only Owner, Admin and Manager can able to link a page.",
      });
    }
  }

  if (httpMethod === HTTP_METHODS_OBJ.put) {
    if (loginUserPermissions.includes("update_page")) {
      return next();
    } else {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
        message: "Only Owner, Admin and Manager can able to update page.",
      });
    }
  }

  if (httpMethod === HTTP_METHODS_OBJ.delete) {
    if (loginUserRole === USER_ROLE_OBJ.admin) {
      return next();
    } else {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
        message: "Only admin and Owner can able to delete page.",
      });
    }
  }
};

module.exports = {
  checkRoleAdmin,
  checkRoleAdminAndManager,
  checkAllowedRoles,
  checkAuthorizationForUserPaths,
  checkAuthorizationForPagesPaths,
};

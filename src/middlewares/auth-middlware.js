const JWT = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config");

function authMiddleware(req, res, next) {
  const token = req.headers["user_auth_token"];
  console.log({ user_auth_token });

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "ACCESS_DENIED",
      message: "No authentication token provided",
    });
  }

  try {
    const decoded = JWT.verify(token, JWT_SECRET_KEY);
    // token must be saved in database for better securety and for one login allowed
    // it will contain {_id,role} , role will be used for authorization
    console.log({ decoded });

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).send({
      success: false,
      error: "INVALID_TOKEN",
      message: "Invalid or expired token",
    });
  }
}

module.exports = authMiddleware;

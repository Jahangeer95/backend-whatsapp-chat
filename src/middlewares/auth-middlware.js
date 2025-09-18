const JWT = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config");

function authMiddleware(req, res, next) {
  const token = req.headers["user_auth_token"];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "ACCESS_DENIED",
      message: "No authentication token provided",
    });
  }

  try {
    const decoded = JWT.verify(token, JWT_SECRET_KEY);
    // it will contain {_id,role} , role will be used for authorization
    req.user = decoded;
  } catch (error) {
    res.status(400).send("Invalid token.");
  }
}

module.exports = authMiddleware;

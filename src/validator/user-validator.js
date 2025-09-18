const JOI = require("joi");

function validateLoginUser(req, res, next) {
  const joiSchema = JOI.object({
    email: JOI.string().email().required(),
    password: JOI.string().min(7).max(30).required(),
  });

  const { error, value } = joiSchema.validate(req.body);

  if (error) {
    const validationError = new Error(error.details[0].message);
    validationError.statusCode = 400;
    return next(validationError);
  }

  req.body = value;
  next();
}

function validateNewUser(req, res, next) {
  const joiSchema = JOI.object({
    username: JOI.string().min(5).max(50).required(),
    email: JOI.string().email().required(),
    role: JOI.string()
      .valid("ADMIN", "MANAGER", "MODERATOR", "EDITOR")
      .required(),
    password: JOI.string().min(7).max(100).required(),
  });

  const { error, value } = joiSchema.validate(req.body);

  if (error) {
    const validationError = new Error(error.details[0].message);
    validationError.statusCode = 400;
    return next(validationError);
  }

  req.body = value;
  next();
}

module.exports = { validateLoginUser, validateNewUser };

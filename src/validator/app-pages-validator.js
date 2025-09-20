const JOI = require("joi");

function validateNewPage(req, res, next) {
  const joiSchema = JOI.object({
    page_id: JOI.string().required(),
    page_name: JOI.string().required(),
    access_token: JOI.string().required(),
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

module.exports = { validateNewPage };

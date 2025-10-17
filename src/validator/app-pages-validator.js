const JOI = require("joi");

function validateNewPage(req, res, next) {
  const joiSchema = JOI.object({
    page_id: JOI.string().required(),
    ad_token_id: JOI.string().allow(null).optional(),
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

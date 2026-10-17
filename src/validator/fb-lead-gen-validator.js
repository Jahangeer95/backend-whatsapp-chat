const JOI = require("joi");

function validateNewFbLeadGenPage(req, res, next) {
  const joiSchema = JOI.object({
    page_id: JOI.string().required(),
    access_token: JOI.string().required(),
    company_id: JOI.number().required(),
    user_id: JOI.number().required(),
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

module.exports = { validateNewFbLeadGenPage };

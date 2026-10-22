const JOI = require("joi");

function validateNewFbLeadGenPage(req, res, next) {
  const joiSchema = JOI.object({
    page_id: JOI.string().required(),
    access_token: JOI.string().required(),
    verify_token: JOI.string().required(),
    company_id: JOI.number().required(),
    username: JOI.string().required(),
    api_key: JOI.string().required(),
    login_user: JOI.string().required(),
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

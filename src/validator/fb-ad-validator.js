const JOI = require("joi");

const validateFbAdHeaders = (req, res, next) => {
  const { fb_access_token, fb_ad_account_id } = req.headers;

  if (!fb_access_token || !fb_ad_account_id) {
    return res.status(400).json({
      success: false,
      message: "fb_access_token and fb_ad_account_id are required in headers.",
    });
  }

  // Attach them to req for downstream use
  req.facebook = {
    token: fb_access_token,
    adAccountId: fb_ad_account_id,
  };

  next();
};

function validateNewCampaign(req, res, next) {
  const joiSchema = JOI.object({
    name: JOI.string().required(),
    objective: JOI.string()
      .valid(
        "OUTCOME_LEADS",
        "OUTCOME_SALES",
        "OUTCOME_ENGAGEMENT",
        "OUTCOME_AWARENESS",
        "OUTCOME_TRAFFIC",
        "OUTCOME_APP_PROMOTION"
      )
      .required(),
    ad_category: JOI.string()
      .valid(
        "NONE",
        "EMPLOYMENT",
        "HOUSING",
        "CREDIT",
        "ISSUES_ELECTIONS_POLITICS",
        "ONLINE_GAMBLING_AND_GAMING",
        "FINANCIAL_PRODUCTS_SERVICES"
      )
      .required(),
    status: JOI.string()
      .valid("ACTIVE", "PAUSED", "DELETED", "ARCHIVED")
      .required(),
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

module.exports = { validateNewCampaign, validateFbAdHeaders };

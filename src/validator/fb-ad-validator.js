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
    buying_type: JOI.string()
      .valid("AUCTION", "RESERVED", "REACH_AND_FREQUENCY")
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

function validateAdUpdate(req, res, next) {
  const joiSchema = JOI.object({
    name: JOI.string().required(),
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

function validateAdInsightQueryParams(req, res, next) {
  const joiSchema = JOI.object({
    level: JOI.string()
      .valid("ad", "adset", "campaign", "account")
      .default("ad"),
    data_preset: JOI.string()
      .valid(
        "today",
        "yesterday",
        "last_3d",
        "last_7d",
        "last_14d",
        "last_28d",
        "last_30d",
        "this_week_sun_today",
        "this_week_mon_today",
        "last_week_sun_sat",
        "last_week_mon_sun",
        "this_month",
        "last_month",
        "this_quarter"
      )
      .optional(),
  });

  const { error, value } = joiSchema.validate(req.query);

  if (error) {
    const validationError = new Error(error.details[0].message);
    validationError.statusCode = 400;
    return next(validationError);
  }

  req.query = value;
  next();
}

function validateAdCreativeQueryParams(req, res, next) {
  const joiSchema = JOI.object({
    ad_format: JOI.string()
      .valid(
        "MOBILE_FEED_STANDARD",
        "DESKTOP_FEED_STANDARD",
        "FACEBOOK_STORY_MOBILE",
        "INSTAGRAM_STANDARD",
        "INSTAGRAM_STORY",
        "INSTAGRAM_REELS",
        "MESSENGER_MOBILE_INBOX_MEDIA",
        "AUDIENCE_NETWORK_OUTSTREAM_VIDEO",
        "RIGHT_COLUMN_STANDARD"
      )
      .default("MOBILE_FEED_STANDARD"),
  });

  console.log(req.query);

  const { error, value } = joiSchema.validate(req.query);

  if (error) {
    const validationError = new Error(error.details[0].message);
    validationError.statusCode = 400;
    return next(validationError);
  }

  req.query = value;
  next();
}

module.exports = {
  validateNewCampaign,
  validateFbAdHeaders,
  validateAdUpdate,
  validateAdInsightQueryParams,
  validateAdCreativeQueryParams,
};

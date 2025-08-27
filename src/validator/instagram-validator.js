const validateInstagramHeaders = (req, res, next) => {
  const { instagram_access_token, fb_page_id, instagram_account_id } =
    req.headers;

  if (!instagram_access_token || !fb_page_id || !instagram_account_id) {
    return res.status(400).json({
      success: false,
      message:
        "instagram_access_token,instagram_account_id and fb_page_id are required in headers.",
    });
  }

  // Attach them to req for downstream use
  req.instagram = {
    token: instagram_access_token,
    pageId: fb_page_id,
    instaId: instagram_account_id,
  };

  next();
};

module.exports = {
  validateInstagramHeaders,
};

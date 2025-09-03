const validateFbHeaders = (req, res, next) => {
  const { fb_access_token, fb_page_id } = req.headers;

  if (!fb_access_token || !fb_page_id) {
    return res.status(400).json({
      success: false,
      message: "fb_access_token and fb_page_id are required in headers.",
    });
  }

  // Attach them to req for downstream use
  req.facebook = {
    token: fb_access_token,
    pageId: fb_page_id,
  };

  next();
};

module.exports = {
  validateFbHeaders,
};

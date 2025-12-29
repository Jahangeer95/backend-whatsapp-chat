const validateWhatsappHeaders = (req, res, next) => {
  const { whatsapp_access_token, phone_no_id, whatsapp_business_id } =
    req.headers;

  if (!whatsapp_access_token || !phone_no_id || !whatsapp_business_id) {
    return res.status(400).json({
      success: false,
      message:
        "whatsapp_access_token, phone_no_id and whatsapp_business_id are required in headers.",
    });
  }

  // Attach them to req for downstream use
  req.whatsapp = {
    token: whatsapp_access_token,
    phoneId: phone_no_id,
    businessId: whatsapp_business_id,
  };

  next();
};

module.exports = {
  validateWhatsappHeaders,
};

const fbAdService = require("../services/fb-ad-service");

exports.createfbAdCompaign = async (req, res) => {
  const { token, adAccountId } = req.facebook;

  try {
    const response = await fbAdService.createAddCompaign(
      req.body,
      token,
      adAccountId
    );

    res.send({
      success: true,
      campaign_id: response.data.id,
      message: "Campaign created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

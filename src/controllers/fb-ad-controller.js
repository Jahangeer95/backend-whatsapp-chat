const fbAdService = require("../services/fb-ad-service");

exports.createfbAdCompaign = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};

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

exports.updateAdCampaign = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};
  const { campaignId } = req.params || {};

  try {
    await fbAdService.updateAdCampaignbyCampaignId(req.body, campaignId, token);

    res.send({
      success: true,
      message: "Campaign updated successfully",
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

exports.fetchAllCampaign = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};
  const { after } = req.query;

  try {
    const response = await fbAdService.getAllCampaign(
      token,
      adAccountId,
      after
    );

    res.send({
      success: true,
      data: response?.data?.data,
      paging: response?.data?.paging,
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

exports.createAnAdset = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};
  try {
    const response = await fbAdService.createAdSet(
      req.body,
      token,
      adAccountId
    );

    res.send({
      success: true,
      adset_id: response.data.id,
      message: "Adset created successfully",
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

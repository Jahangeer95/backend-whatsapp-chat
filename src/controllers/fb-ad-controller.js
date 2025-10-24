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

exports.deleteCampaign = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};
  const { campaignId } = req.params || {};
  try {
    const response = await fbAdService.deleteCampaignByCampaignId(
      campaignId,
      token
    );
    console.log(response.data);
    res.send({ success: true, message: "Campaign deleted sucessfully" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error?.response?.data?.error?.error_user_msg ||
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
        error?.response?.data?.error?.error_user_msg ||
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

exports.getAdsetsByUsingCampaignId = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};
  const { campaignId } = req.params || {};
  const { after } = req.query;

  try {
    const response = await fbAdService.getAdsetsByUsingCampaignId(
      campaignId,
      token,
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

exports.getAdsets = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};
  const { after } = req.query;

  try {
    const response = await fbAdService.getAllAdsets(token, adAccountId, after);

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

exports.deleteAdset = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};
  const { adsetId } = req.params || {};
  try {
    const response = await fbAdService.deleteAdsetByAdsetId(adsetId, token);
    console.log(response.data);
    res.send({ success: true, message: "Adset deleted sucessfully" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error?.response?.data?.error?.error_user_msg ||
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

exports.updateAdsetByAdsetId = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};
  const { adsetId } = req.params || {};

  try {
    const response = await fbAdService.updateAdsetByAdsetId(
      adsetId,
      req.body,
      token
    );

    console.log(response.data);

    res.send({ success: true, message: "Adset updated successfully" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error?.response?.data?.error?.error_user_msg ||
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

exports.createAdcreative = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};
  try {
    const response = await fbAdService.createAdCreative(
      req.body,
      adAccountId,
      token
    );

    res.send({
      success: true,
      adcreative_id: response.data.id,
      message: "Adcreative created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error?.response?.data?.error?.error_user_msg ||
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

exports.deleteAdcreative = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};
  const { adcreativeId } = req.params || {};

  try {
    const response = await fbAdService.deleteAdcreativeByAdcreativeId(
      adcreativeId,
      token
    );
    console.log(response.data);
    res.send({ success: true, message: "Adcreative deleted sucessfully" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error?.response?.data?.error?.error_user_msg ||
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

exports.fetchAllAdcreative = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};
  const { after } = req.query;

  try {
    const response = await fbAdService.getAllAdcreative(
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

exports.createAd = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};
  try {
    const response = await fbAdService.createAdByUsingAdsetIdAndCreativeId(
      req.body,
      adAccountId,
      token
    );

    res.send({
      success: true,
      ad_id: response?.data?.id,
      message: "Ad created sucessfullys",
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

exports.fetchAllAds = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};
  const { after } = req.query;

  try {
    const response = await fbAdService.getAllAds(token, adAccountId, after);

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

exports.updateAd = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};
  const { adId } = req.params || {};

  try {
    const response = await fbAdService.updateAdByAdId(adId, req.body, token);
    res.send({
      success: true,
      ad_id: response?.data?.id,
      message: "Ad updated successfully",
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

exports.deleteAd = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};
  const { adId } = req.params || {};

  try {
    const response = await fbAdService.deleteAdByAdId(adId, token);
    console.log(response.data);
    res.send({ success: true, message: "Ad deleted sucessfully" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error?.response?.data?.error?.error_user_msg ||
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

exports.uploadImageForAdcreative = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};

  const file = req.file || null;

  if (!file) {
    return res.status(400).json({ error: "File is required" });
  }

  try {
    const response = await fbAdService.uploadImage(file, adAccountId, token);

    res.send({ success: true, data: response });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error?.response?.data?.error?.error_user_msg ||
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

exports.getMediaByUsingHashId = async (req, res) => {
  const { token, adAccountId } = req.facebook || {};
  const { hashId } = req.params;

  try {
    const response = await fbAdService.getImageByUsingImageHash(
      hashId,
      adAccountId,
      token
    );

    res.send(response.data);
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error?.response?.data?.error?.error_user_msg ||
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

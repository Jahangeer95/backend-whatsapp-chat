const { Router } = require("express");
const facebookController = require("../controllers/facebook-controller");
const fbValidator = require("../validator/fb-validator");
const { upload } = require("../middlewares/multer");

const router = Router();

router
  .route("/webhook")
  .get(facebookController.verifyWebhook)
  .post(facebookController.receiveWebhook);

router
  .route("/page-detail")
  .get(fbValidator.validateFbHeaders, facebookController.getPageDetail)
  .post(fbValidator.validateFbHeaders, facebookController.updatePageDetail);

router.get(
  "/page-insights",
  fbValidator.validateFbHeaders,
  facebookController.fetchPageInsights
);

router
  .route("/page-settings")
  .get(fbValidator.validateFbHeaders, facebookController.fetchPageSettings)
  .post(fbValidator.validateFbHeaders, facebookController.updatePageSettings);

router.get(
  "/page-roles",
  fbValidator.validateFbHeaders,
  facebookController.fetchPageRating
);

// block user from page not working
router.post(
  "/page-detail/blocked",
  fbValidator.validateFbHeaders,
  facebookController.blockPersonFromPageById
);

router.post(
  "/send-message",
  fbValidator.validateFbHeaders,
  upload.single("file"),
  facebookController.sendMessage
);
router.get(
  "/user/:userId",
  fbValidator.validateFbHeaders,
  facebookController.fetchUserProfilePic
);
router.get(
  "/participants",
  fbValidator.validateFbHeaders,
  facebookController.fetchParticipants
);

router.get(
  "/conversations",
  fbValidator.validateFbHeaders,
  facebookController.fetchAllConversations
);
router.get(
  "/messages/:conversationId",
  fbValidator.validateFbHeaders,
  facebookController.fetchMessagesByConversationId
);

router.post(
  "/mark-as-read",
  fbValidator.validateFbHeaders,
  facebookController.markedConversationAsRead
);

router
  .route("/page-posts")
  .get(fbValidator.validateFbHeaders, facebookController.fetchAllPosts)
  .post(fbValidator.validateFbHeaders, facebookController.createTextPost);

router
  .route("/page-schedule-posts")
  .get(
    fbValidator.validateFbHeaders,
    facebookController.fetchAllUnPublishedPosts
  );

router
  .route("/page-media-posts")
  .post(
    fbValidator.validateFbHeaders,
    upload.single("file"),
    facebookController.createPhotoPost
  );

router
  .route("/page-media-posts/:postId")
  .post(
    fbValidator.validateFbHeaders,
    upload.single("file"),
    facebookController.createPhotoPost
  );

// An app can only update a Page post if the post was made using that app.

router
  .route("/page-posts/:postId")
  .delete(fbValidator.validateFbHeaders, facebookController.deletePost)
  .post(fbValidator.validateFbHeaders, facebookController.createTextPost);

router
  .route("/page-posts/:postId/insights")
  .get(fbValidator.validateFbHeaders, facebookController.fetchPostsInsight);

router
  .route("/page-posts/:postId/comments")
  .get(fbValidator.validateFbHeaders, facebookController.getPostComments)
  .post(fbValidator.validateFbHeaders, facebookController.uploadPostComment);

router
  .route("/page-posts/:commentId/replies")
  .get(fbValidator.validateFbHeaders, facebookController.getCommentReplies);

module.exports = router;

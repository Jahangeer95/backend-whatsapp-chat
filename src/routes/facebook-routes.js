const { Router } = require("express");
const facebookController = require("../controllers/facebook-controller");
const fbValidator = require("../validator/fb-validator");
const { upload } = require("../middlewares/multer");
const authMiddleware = require("../middlewares/auth-middlware");
const {
  checkRoleAdmin,
  checkAllowedRoles,
} = require("../middlewares/authorize-middleware");
const { CAN_CREATE_POST, CAN_DELETE_POST } = require("../config");

const router = Router();

router
  .route("/webhook")
  .get(facebookController.verifyWebhook)
  .post(facebookController.receiveWebhook);

router
  .route("/page-detail")
  .all(authMiddleware)
  .get(fbValidator.validateFbHeaders, facebookController.getPageDetail)
  .post(fbValidator.validateFbHeaders, facebookController.updatePageDetail);

router.get(
  "/page-insights",
  authMiddleware,
  fbValidator.validateFbHeaders,
  facebookController.fetchPageInsights
);

router
  .route("/page-settings")
  .all(authMiddleware)
  .get(fbValidator.validateFbHeaders, facebookController.fetchPageSettings)
  .post(
    checkRoleAdmin,
    fbValidator.validateFbHeaders,
    facebookController.updatePageSettings
  );

router.get(
  "/page-roles",
  authMiddleware,
  fbValidator.validateFbHeaders,
  facebookController.fetchPageRating
);

// block user from page not working
router.post(
  "/page-detail/blocked",
  authMiddleware,
  fbValidator.validateFbHeaders,
  facebookController.blockPersonFromPageById
);

router.post(
  "/send-message",
  authMiddleware,
  fbValidator.validateFbHeaders,
  upload.single("file"),
  facebookController.sendMessage
);
router.get(
  "/user/:userId",
  authMiddleware,
  fbValidator.validateFbHeaders,
  facebookController.fetchUserProfilePic
);
router.get(
  "/participants",
  authMiddleware,
  fbValidator.validateFbHeaders,
  facebookController.fetchParticipants
);

router.get(
  "/conversations",
  authMiddleware,
  fbValidator.validateFbHeaders,
  facebookController.fetchAllConversations
);
router.get(
  "/messages/:conversationId",
  authMiddleware,
  fbValidator.validateFbHeaders,
  facebookController.fetchMessagesByConversationId
);

router.post(
  "/mark-as-read",
  authMiddleware,
  fbValidator.validateFbHeaders,
  facebookController.markedConversationAsRead
);

router
  .route("/page-posts")
  .all(authMiddleware)
  .get(fbValidator.validateFbHeaders, facebookController.fetchAllPosts)
  .post(
    checkAllowedRoles(CAN_CREATE_POST),
    fbValidator.validateFbHeaders,
    facebookController.createTextPost
  );

router
  .route("/page-schedule-posts")
  .all(authMiddleware)
  .get(
    fbValidator.validateFbHeaders,
    facebookController.fetchAllUnPublishedPosts
  );

router
  .route("/page-media-posts")
  .all(authMiddleware)
  .post(
    checkAllowedRoles(CAN_CREATE_POST),
    fbValidator.validateFbHeaders,
    upload.single("file"),
    facebookController.createPhotoPost
  );

router
  .route("/page-media-posts/:postId")
  .all(authMiddleware)
  .post(
    checkAllowedRoles(CAN_CREATE_POST),
    fbValidator.validateFbHeaders,
    upload.single("file"),
    facebookController.createPhotoPost
  );

// An app can only update a Page post if the post was made using that app.

router
  .route("/page-posts/:postId")
  .all(authMiddleware)
  .delete(
    checkAllowedRoles(CAN_DELETE_POST),
    fbValidator.validateFbHeaders,
    facebookController.deletePost
  )
  .post(
    checkAllowedRoles(CAN_CREATE_POST),
    fbValidator.validateFbHeaders,
    facebookController.createTextPost
  );

router
  .route("/page-posts/:postId/insights")
  .all(authMiddleware)
  .get(fbValidator.validateFbHeaders, facebookController.fetchPostsInsight);

router
  .route("/page-posts/:postId/comments")
  .all(authMiddleware)
  .get(fbValidator.validateFbHeaders, facebookController.getPostComments)
  .post(fbValidator.validateFbHeaders, facebookController.uploadPostComment);

router
  .route("/page-posts/:commentId/replies")
  .all(authMiddleware)
  .get(fbValidator.validateFbHeaders, facebookController.getCommentReplies);

module.exports = router;

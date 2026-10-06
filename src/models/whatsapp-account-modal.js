const { model, Schema } = require("mongoose");

const whatsAppAccountSchema = new Schema(
  {
    account_name: {
      type: String,
    },
    whatsapp_access_token: {
      type: String,
      required: true,
      unique: true,
    },
    phone_no_id: {
      type: String,
      required: true,
      unique: true,
    },
    whatsapp_business_id: {
      type: String,
      required: true,
      unique: true,
    },
    verify_token: {
      type: String,
      required: true, // required so each webhook has its token
    },
    // Facebook Page
    fb_page_id: {
      type: String,
      unique: true,
      sparse: true, //sparse: true is useful because not every WhatsApp account necessarily has a Facebook Page.
    },

    fb_page_access_token: {
      type: String,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "WhatsappAppRegisteredUser",
      },
    ],
  },
  {
    versionKey: false,
  },
);

whatsAppAccountSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    const field = Object.keys(error.keyValue)[0]; // e.g., 'username' or 'email'
    const value = error.keyValue[field];

    const validationError = new Error(
      `The ${field} '${value}' is already taken. Please choose a different one.`,
    );
    validationError.statusCode = 409;

    next(validationError);
  } else {
    next(error);
  }
});

exports.WhatsappAccount = model("WhatsappAccount", whatsAppAccountSchema);

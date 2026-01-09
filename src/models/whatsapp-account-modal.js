const { model, Schema } = require("mongoose");

const whatsAppAccountSchema = new Schema(
  {
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
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "WhatsappAppRegisteredUser",
      },
    ],
  },
  {
    versionKey: false,
  }
);

whatsAppAccountSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    const field = Object.keys(error.keyValue)[0]; // e.g., 'username' or 'email'
    const value = error.keyValue[field];

    const validationError = new Error(
      `The ${field} '${value}' is already taken. Please choose a different one.`
    );
    validationError.statusCode = 409;

    next(validationError);
  } else {
    next(error);
  }
});

exports.WhatsappAccount = model("WhatsappAccount", whatsAppAccountSchema);

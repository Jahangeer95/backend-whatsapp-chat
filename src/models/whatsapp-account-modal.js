const { model, Schema } = require("mongoose");

const whatsAppAccountSchema = new Schema(
  {
    whatsapp_access_token: {
      type: String,
      required: true,
    },
    phone_no_id: {
      type: String,
      required: true,
    },
    whatsapp_business_id: {
      type: String,
      required: true,
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

exports.WhatsappAccount = model("WhatsappAccount", whatsAppAccountSchema);

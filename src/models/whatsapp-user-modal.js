const { model, Schema } = require("mongoose");

const whatsappUserSchema = new Schema(
  {
    whatsapp_business_id: {
      type: String,
      required: true,
      index: true,
    },
    wa_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    profile_pic_url: {
      type: String,
    },
    last_message_time: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

whatsappUserSchema.index(
  { wa_id: 1, whatsapp_business_id: 1 },
  { unique: true }
);

exports.whatsappUser = model("whatsappUser", whatsappUserSchema);

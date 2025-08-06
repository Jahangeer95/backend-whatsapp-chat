const { model, Schema } = require("mongoose");

const whatsappUserSchema = new Schema(
  {
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

exports.whatsappUser = model("whatsappUser", whatsappUserSchema);

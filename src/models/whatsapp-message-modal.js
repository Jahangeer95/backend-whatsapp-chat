const { model, Schema } = require("mongoose");

const whatsappMessageSchema = new Schema(
  {
    message_id: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "whatsappUser",
      required: true,
    },
    direction: {
      type: String,
      enum: ["outgoing", "incoming"],
      required: true,
    },
    message_type: {
      type: String,
      enum: [
        "text",
        "file",
        "image",
        "template",
        "document",
        "sticker",
        "audio",
      ],
      required: true,
    },
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },
    timestamp: {
      type: Date,
      required: true,
    },
    delivery_timestamp: Date,
    read_timestamp: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

exports.whatsappMessage = model("whatsappMessage", whatsappMessageSchema);

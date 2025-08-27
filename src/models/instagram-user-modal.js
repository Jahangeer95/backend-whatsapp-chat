const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true,
    },
    delivery_timestamp: {
      type: String,
      required: true,
    },
    read_timestamp: {
      type: String,
      required: true,
    },
    last_message_time: {
      type: String,
    },
  },
  { versionKey: false }
);

exports.InstaUser = model("InstaUser", userSchema);

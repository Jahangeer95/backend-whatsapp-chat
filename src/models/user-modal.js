const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    userId: {
      type: String,
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
  },
  { versionKey: false }
);

exports.FbUser = model("FbUser", userSchema);

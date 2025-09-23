const { Schema, model } = require("mongoose");

const appPagesSchema = new Schema(
  {
    page_name: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    page_id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    access_token: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
);

exports.AppFbPages = model("AppFbPages", appPagesSchema);

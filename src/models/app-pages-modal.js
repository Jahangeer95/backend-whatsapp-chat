const { Schema, model } = require("mongoose");

const appPagesSchema = new Schema(
  {
    page_name: {
      type: String,
      unique: true,
      required: true,
    },
    page_id: {
      type: String,
      unique: true,
      required: true,
    },
    access_token: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
);

appPagesSchema.index(
  {
    page_name: 1,
    page_id: 1,
  },
  {
    unique: true,
  }
);

exports.AppPages = model("AppPages", appPagesSchema);

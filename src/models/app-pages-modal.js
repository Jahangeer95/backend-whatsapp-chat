const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

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

appPagesSchema.plugin(uniqueValidator);

exports.AppPages = model("AppPages", appPagesSchema);

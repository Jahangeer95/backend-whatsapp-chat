const { Schema, model } = require("mongoose");

const appUserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "MODERATOR", "EDITOR", "MANAGER"],
      required: true,
    },
    password: {
      type: String,
      minLength: 7,
      maxLength: 100,
      required: true,
    },
  },
  {
    versionKey: falses,
  }
);

exports.AppUser = model("AppUser", appUserSchema);

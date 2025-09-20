const { Schema, model, default: mongoose } = require("mongoose");
const JWT = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config");

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
    pages: [
      {
        type: Schema.Types.ObjectId,
        ref: "AppPages",
      },
    ],
  },
  {
    versionKey: false,
  }
);

appUserSchema.methods.generateAuthToken = function () {
  const token = JWT.sign({ _id: this._id, role: this.role }, JWT_SECRET_KEY);

  return token;
};

appUserSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    console.log(error.name, error.code);
    const field = Object.keys(error.keyValue)[0]; // e.g., 'username' or 'email'
    const value = error.keyValue[field];

    const validationError = new Error(
      `The ${field} '${value}' is already taken. Please choose a different one.`
    );
    validationError.statusCode = 409;

    next(validationError);
  } else {
    next(error);
  }
});

exports.AppUser = model("AppUser", appUserSchema);

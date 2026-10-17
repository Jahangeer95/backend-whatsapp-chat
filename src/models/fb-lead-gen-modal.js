const { Schema, model } = require("mongoose");

const fbLeadGenSchema = new Schema(
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
    company_id: {
      type: Number,
      required: true,
    },
    user_id: {
      type: Number,
      required: true,
    },
  },
  { versionKey: false },
);

fbLeadGenSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    console.log(error.name, error.code);
    const field = Object.keys(error.keyValue)[0]; // e.g., 'username' or 'email'
    const value = error.keyValue[field];

    const validationError = new Error(
      `The ${field} '${value}' is already taken. Please choose a different one.`,
    );
    validationError.statusCode = 409;

    next(validationError);
  } else {
    next(error);
  }
});

exports.FbLeadGen = model("FbLeadGen", fbLeadGenSchema);

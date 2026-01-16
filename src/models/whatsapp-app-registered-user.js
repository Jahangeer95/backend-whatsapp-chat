const JWT = require("jsonwebtoken");
const { Schema, model } = require("mongoose");
const { WHATSAPP_USER_ROLE_OBJ, JWT_SECRET_KEY } = require("../config");

const whatsappAppRegisteredUserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "USER"],
      default: "USER",
    },
    password: {
      type: String,
      minLength: 7,
      maxLength: 100,
      required: true,
    },
    can_send_text: {
      type: Boolean,
      default: true,
    },
    can_send_template: {
      type: Boolean,
      default: true,
    },
    can_send_file: {
      type: Boolean,
      default: true,
    },
    can_create_user: {
      type: Boolean,
      default: false,
    },
    can_update_user: {
      type: Boolean,
      default: false,
    },
    can_delete_user: {
      type: Boolean,
      default: false,
    },
    can_link_whatsapp_account: {
      type: Boolean,
      default: false,
    },
    can_assign_whatsapp_account: {
      type: Boolean,
      default: false,
    },
    can_delete_whatsapp_account: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

whatsappAppRegisteredUserSchema.methods.generateAuthToken = function () {
  const token = JWT.sign({ _id: this._id, role: this.role }, JWT_SECRET_KEY);

  return token;
};

whatsappAppRegisteredUserSchema.pre("save", function (next) {
  // Only set defaults on new documents
  if (!this.isNew && !this.isModified("role")) return next();

  if (this.role === WHATSAPP_USER_ROLE_OBJ.owner) {
    this.can_send_text = true;
    this.can_send_template = true;
    this.can_send_file = true;
    this.can_create_user = true;
    this.can_update_user = true;
    this.can_delete_user = true;
    this.can_link_whatsapp_account = true;
    this.can_assign_whatsapp_account = true;
    this.can_delete_whatsapp_account = true;
  } else if (this.role === WHATSAPP_USER_ROLE_OBJ.admin) {
    this.can_send_text = true;
    this.can_send_template = true;
    this.can_send_file = true;
    this.can_create_user = true;
    this.can_update_user = true;
    this.can_delete_user = false;
    this.can_link_whatsapp_account = false;
    this.can_assign_whatsapp_account = true;
    this.can_delete_whatsapp_account = false;
  } else {
    this.can_send_text = true;
    this.can_send_template = true;
    this.can_send_file = true;
    this.can_create_user = false;
    this.can_update_user = false;
    this.can_delete_user = false;
    this.can_link_whatsapp_account = false;
    this.can_assign_whatsapp_account = false;
    this.can_delete_whatsapp_account = false;
  }

  next();
});

whatsappAppRegisteredUserSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
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

whatsappAppRegisteredUserSchema.virtual("permissions").get(function () {
  const permissions = {};

  // Loop through all fields of the document
  Object.keys(this._doc).forEach((key) => {
    if (key.startsWith("can_")) {
      permissions[key] = this[key];
    }
  });

  return permissions;
});

whatsappAppRegisteredUserSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });

  // Remove all can_* fields from root
  Object.keys(obj).forEach((key) => {
    if (key.startsWith("can_")) {
      delete obj[key];
    }
  });

  return obj;
};

whatsappAppRegisteredUserSchema.set("toJSON", { virtuals: true });
whatsappAppRegisteredUserSchema.set("toObject", {
  virtuals: true,
  transform: function (doc, obj) {
    // Remove all can_* fields from root
    Object.keys(obj).forEach((key) => {
      if (key.startsWith("can_")) {
        delete obj[key];
      }
    });

    return obj;
  },
});
// virtuals not work with lean menthods
exports.WhatsappAppRegisteredUser = model(
  "WhatsappAppRegisteredUser",
  whatsappAppRegisteredUserSchema
);

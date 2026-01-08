const { Schema, model } = require("mongoose");

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

  if (this.role === "OWNER") {
    this.can_send_text = true;
    this.can_send_template = true;
    this.can_send_file = true;
    this.can_create_user = true;
    this.can_update_user = true;
    this.can_delete_user = true;
    this.can_link_whatsapp_account = true;
    this.can_assign_whatsapp_account = true;
  } else if (this.role === "ADMIN") {
    this.can_send_text = true;
    this.can_send_template = true;
    this.can_send_file = true;
    this.can_create_user = true;
    this.can_update_user = true;
    this.can_delete_user = false;
    this.can_link_whatsapp_account = true;
    this.can_assign_whatsapp_account = true;
  } else {
    this.can_send_text = true;
    this.can_send_template = true;
    this.can_send_file = true;
    this.can_create_user = false;
    this.can_update_user = false;
    this.can_delete_user = false;
    this.can_link_whatsapp_account = false;
    this.can_assign_whatsapp_account = false;
  }

  next();
});

exports.WhatsappAppRegisteredUser = model(
  "WhatsappAppRegisteredUser",
  whatsappAppRegisteredUserSchema
);

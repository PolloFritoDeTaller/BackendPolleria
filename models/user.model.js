import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"; // Librería para cifrar contraseñas

const userModel = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'worker', 'client'],
    default: 'client'
  },
  university: { type: String, default: '' },
  phone: { type: String, default: '' },
  position: { type: String, default: '' },
  branch: { type: String, default: '' },
}, { timestamps: true });

// Método para cifrar la contraseña antes de guardarla
userModel.pre("save", async function(next) {
  if (!this.isModified("password")) return next(); // Solo cifrar si la contraseña es modificada

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("User", userModel);

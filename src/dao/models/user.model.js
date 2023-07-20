import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: {
    type: String,
    required: true,
    unique: true, // Indica que el campo debe ser único
  },
  age: Number,
  password: String,
  role: {
    type: String,
    enum: ["admin", "usuario"],
    default: "usuario",
  },
});

const userModel = mongoose.model("sessions", userSchema);

export default userModel;
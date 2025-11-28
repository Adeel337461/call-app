import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Provide name"],
    },
    email: {
      type: String,
      required: [true, "provide email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "provide password"],
    },
    avatar: {
      type: String,
      default: "",
    }
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("auth_user", userSchema);

export default UserModel;

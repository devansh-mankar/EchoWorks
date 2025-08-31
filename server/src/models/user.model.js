import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.appleId;
      },
      select: false,
    },
    googleId: String,
    appleId: String,
    avatar: String,
    murfApiUsage: {
      charactersUsed: { type: Number, default: 0 },
      monthlyLimit: { type: Number, default: 100000 },
      lastReset: { type: Date, default: Date.now },
    },
    subscription: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    isEmailVerified: { type: Boolean, default: false },
    refreshToken: String,
  },
  { timestamps: true }
);

//hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password
userSchema.methods.comparePassword = function (candidate) {
  if (!this.password || typeof this.password !== "string") return false;
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;

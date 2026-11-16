const User = require("../model/UserModel");
const { createSecretToken } = require("../utils/SearchToken");
const bcrypt = require("bcryptjs");

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  withCredentials: true,
  httpOnly: false,
  secure: isProduction, // true on Render (HTTPS), false on localhost
  sameSite: isProduction ? "none" : "lax", // "none" allows Vercel <-> Render cookies
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days (matches JWT expiration)
};

module.exports.Signup = async (req, res) => {
  try {
    const { email, password, username, createdAt } = req.body;

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists", success: false });
    }

    const user = await User.create({ email, password, username, createdAt });
    const token = createSecretToken(user._id);

    res.cookie("token", token, cookieOptions);

    return res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
  } catch (error) {
    console.error("Signup Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

module.exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: "All fields are required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        message: "Incorrect password or email",
        success: false,
      });
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({
        message: "Incorrect password or email",
        success: false,
      });
    }

    const token = createSecretToken(user._id);

    res.cookie("token", token, cookieOptions);

    return res
      .status(200)
      .json({ message: "User logged in successfully", success: true });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

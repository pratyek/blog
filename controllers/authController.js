const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Blog = require("../models/Blog");
const sendEmail = require("../utils/email");

exports.getUserDetails = async (req, res) => {
  try {
    // `req.user` is populated by the auth middleware
    const user = await User.findById(req.user._id).select("-password"); // Exclude the password field

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user); // Send the user details
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};


// Signup
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const verificationLink = `http://localhost:3000/api/auth/verify/${token}`;

    await sendEmail(email, "Verify Your Email", `Click here to verify your email: ${verificationLink}`);
    res.status(201).json({ message: "User created. Please verify your email." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isVerified = true;
    await user.save();
    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your email before logging in" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all comments by the user
    await Comment.deleteMany({ user: userId });

    // Unassign the user from blogs
    await Blog.updateMany(
      { $or: [{ author: userId }, { assignedEditor: userId }] },
      { $set: { assignedEditor: null } }
    );

    // Delete the user account
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account" });
  }
};

// Update Role (Admin only)
exports.updateRole = async (req, res) => {
  const { userId, newRole } = req.body;

  try {
    const validRoles = ["Admin", "Editor", "User"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Allow everyone to update their own role
    if (req.user._id.toString() === userId) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.role = newRole;
      await user.save();

      return res.status(200).json({
        message: "Your role has been updated successfully",
        user,
      });
    }

    // Allow Admins to update anyone's role
    if (req.user.role === "Admin") {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.role = newRole;
      await user.save();

      return res.status(200).json({
        message: "Role updated successfully by Admin",
        user,
      });
    }

    // If the user tries to update someone else's role without being Admin
    return res.status(403).json({
      error: "Access denied. You can only update your own role.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update role" });
  }
};



// Get All Users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password field
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

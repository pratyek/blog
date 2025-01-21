const express = require("express");
const {
  signup,
  login,
  verifyEmail,
  deleteAccount,
  updateRole,
  getAllUsers,
  getUserDetails
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth");
const roleMiddleware = require("../middlewares/roles");

const router = express.Router();

// Public Routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/verify/:token", verifyEmail);

// Protected Routes
router.delete("/delete", authMiddleware, deleteAccount);

// Admin Routes
router.put("/update-role", authMiddleware, roleMiddleware(["Admin"]), updateRole);
router.get("/users", authMiddleware, roleMiddleware(["Admin"]), getAllUsers);
router.get("/me", authMiddleware, getUserDetails);

module.exports = router;

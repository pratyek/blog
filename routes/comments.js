const express = require("express");
const { addComment, deleteComment, getComments } = require("../controllers/commentController");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();

// Add a comment (Authenticated users)
router.post("/", authMiddleware, addComment);

// Get comments for a specific blog
router.get("/:blogId", authMiddleware, getComments);

// Delete a comment (Authenticated users can only delete their own)
router.delete("/:id", authMiddleware, deleteComment);

module.exports = router;

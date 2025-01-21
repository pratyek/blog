const Comment = require("../models/Comment");

// Add a Comment
exports.addComment = async (req, res) => {
  const { blogId, content } = req.body;

  try {
    const comment = await Comment.create({
      content,
      blog: blogId,
      user: req.user._id,
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a Comment (User)
exports.deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this comment" });
    }

    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get Comments for a Blog
exports.getComments = async (req, res) => {
  const { blogId } = req.params;

  try {
    const comments = await Comment.find({ blog: blogId }).populate("user", "name");
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

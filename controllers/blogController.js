const Blog = require("../models/Blog");

// Create Blog (Admin)
exports.createBlog = async (req, res) => {
  const { title, content } = req.body;

  try {
    const blog = await Blog.create({
      title,
      content,
      author: req.user._id, // Admin who created the blog
    });

    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "name").populate("assignedEditor", "name");
    res.status(200).json(blogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

// Update Blog (Editor or Admin)
exports.updateBlog = async (req, res) => {
  const { id } = req.params; // Blog ID from the URL
  const { title, content } = req.body;

  try {
    const blog = await Blog.findById(id); // Find the blog by ID

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Only Admins or assigned Editors can edit the blog
    if (req.user.role === "Editor" && (!blog.assignedEditor || blog.assignedEditor.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Allow Admins to update
    if (req.user.role !== "Admin" && req.user.role !== "Editor") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Update blog fields
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    await blog.save();

    res.status(200).json({ message: "Blog updated successfully", blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Assign Blog to Editor (Admin only)
exports.assignBlog = async (req, res) => {
  const { id, editorId } = req.body;

  try {
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    if (blog.assignedEditor) {
      return res.status(400).json({ error: "This blog is already assigned to an editor" });
    }

    blog.assignedEditor = editorId;
    await blog.save();

    res.status(200).json({ message: "Blog assigned successfully", blog });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

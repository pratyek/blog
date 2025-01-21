const express = require("express");
const { createBlog, getBlogs, updateBlog } = require("../controllers/blogController");
const authMiddleware = require("../middlewares/auth");
const roleMiddleware = require("../middlewares/roles");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware(["Admin"]), createBlog);
router.get("/", authMiddleware, getBlogs);
router.put("/:id", authMiddleware, roleMiddleware(["Editor"]), updateBlog);

module.exports = router;

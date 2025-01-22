const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.NODE_ENV === "production"
    ? process.env.MONGO_URI // Use Atlas in production
    : "mongodb://localhost:27017/blogDB"; // Use local MongoDB in development

// Connect to MongoDB
mongoose
  .connect(MONGO_URI) // Removed deprecated options
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import notificationRoutes from "./routes/notification.route.js";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
// import { arcjetMiddleware } from "./middleware/arcjet.middleware.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "http://localhost:19006",
      "exp://localhost:19000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Clerk middleware
app.use(clerkMiddleware());

// Arcjet middleware for security - temporarily disabled
// app.use(arcjetMiddleware);

// Health check endpoint
app.get("/", (req, res) => res.json({ message: "ECHO API Server is running" }));

// API routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

// 404 handler (should be last)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.message,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid ID format",
    });
  }

  res.status(500).json({
    error: "Internal server error",
    message:
      ENV.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
});

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");

    // listen for local development
    if (ENV.NODE_ENV !== "production") {
      const port = ENV.PORT || 5001;
      app.listen(port, () => {
        console.log(`🚀 Server is running on PORT: ${port}`);
        console.log(`📱 API URL: http://localhost:${port}/api`);
      });
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

// export for vercel
export default app;

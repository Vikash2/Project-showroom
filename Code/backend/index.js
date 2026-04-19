require("dotenv").config();
const express = require("express");
const cors = require("cors");
const errorHandler = require("./src/middleware/errorHandler");

// Import routes
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/users");
const showroomRoutes = require("./src/routes/showrooms");
const vehicleRoutes = require("./src/routes/vehicles");
const accessoryRoutes = require("./src/routes/accessories");
const uploadRoutes = require("./src/routes/uploads");
const bookingRoutes = require("./src/routes/bookings");
const salesRoutes = require("./src/routes/sales");
const inquiryRoutes = require("./src/routes/inquiries");
const deliveryRoutes = require("./src/routes/delivery");
const cashierRoutes = require("./src/routes/cashier");
const documentRoutes = require("./src/routes/documents");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    phase: "Phase 2 - Showroom & Vehicle Catalog"
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/showrooms", showroomRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/accessories", accessoryRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/cashier", cashierRoutes);
app.use("/api/documents", documentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    code: "ROUTE_NOT_FOUND",
    path: req.path 
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔥 Firebase DB: ${process.env.FIREBASE_DB_URL}`);
  console.log(`🌐 CORS Origins: ${process.env.ALLOWED_ORIGINS || "*"}`);
});

module.exports = app;

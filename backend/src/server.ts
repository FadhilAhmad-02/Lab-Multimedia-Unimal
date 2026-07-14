import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import materialRoutes from "./routes/material.routes";
import deviceRoutes from "./routes/device.routes";
import serviceRoutes from "./routes/service.routes";
import productConfigRoutes from "./routes/productConfig.routes";
import templateRoutes from "./routes/template.routes";
import userRoutes from "./routes/user.routes";
import orderRoutes from "./routes/order.routes";
import adminRoutes from "./routes/admin.routes";
import laporanRouter from "./routes/laporan.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import promoRoutes from "./routes/promo.routes";
import pengaturanRouter from "./routes/pengaturan.routes";
import { maintenanceGuard } from "./middlewares/maintenance.middleware";
import operatorRouter from "./routes/operator.routes";
import customerOrderRouter from "./routes/customerorder.routes";
import { authenticate } from "./middlewares/auth.middleware";
import notificationRoutes from "./routes/notification.routes";

import { helmetConfig, corsConfig, apiLimiter, speedLimiter } from "./security";

const app = express();

app.use(helmetConfig);

// ── CORS ──────────────────────────────────────
app.use(corsConfig);

// ── RATE LIMITER ─────────────────────────────
app.use(apiLimiter);
app.use(speedLimiter);

// ── BODY PARSER ───────────────────────────────
app.use(express.json());

// ── REQUEST LOGGER (dev) ──────────────────────
app.use((req, _res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// ── STATIC ────────────────────────────────────
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ── ROOT ──────────────────────────────────────
app.get("/", (_req, res) => {
  res.send("Backend Lab Multimedia berjalan 🚀");
});

app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/pengaturan", pengaturanRouter);

// ── ROUTES ────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/laporan", laporanRouter);
app.use("/api/promo", promoRoutes);
app.use("/api/product-config", productConfigRoutes);
app.use("/api/pengaturan", pengaturanRouter);
app.use("/api/templates", templateRoutes);
app.use("/api/orders", maintenanceGuard, orderRoutes);
app.use("/api/products", maintenanceGuard, productRoutes);
app.use("/api/notifications", authenticate, notificationRoutes);

app.use("/api/operator", operatorRouter);

app.use("/api/customer/orders", customerOrderRouter);
// ── START ─────────────────────────────────────
app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});

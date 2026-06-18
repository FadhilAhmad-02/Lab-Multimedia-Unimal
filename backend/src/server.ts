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

const app = express();

/*
=================================
MIDDLEWARE
=================================
*/
app.use(
  cors({
    origin:
      "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

/*
=================================
ROOT TEST
=================================
*/
app.get("/", (_req, res) => {
  res.send(
    "Backend Lab Multimedia berjalan 🚀"
  );
});

/*
=================================
API ROUTES
=================================
*/
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/categories",
  categoryRoutes
);

/* Materials */
app.use(
  "/api/materials",
  materialRoutes
);

/*
=================================
SERVER
=================================
*/
app.listen(3001, () => {
  console.log(
    "Server running on http://localhost:3001"
  );
});

/* Devices */
app.use(
  "/api/devices",
  deviceRoutes
);

/* Service */
app.use(
  "/api/services",
  serviceRoutes
);

/* Konfigurasi Produk */
app.use(
  "/api/product-config",
  productConfigRoutes
);

/*Template*/ 
app.use("/api/templates", templateRoutes);

app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);
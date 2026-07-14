import cors from "cors";

const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];

export const corsConfig = cors({
  origin(origin, callback) {
    // izinkan Postman / curl
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin tidak diizinkan oleh CORS"));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],
});

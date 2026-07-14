import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

/**
 * Rate Limit untuk seluruh API
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit

  max: 100,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Terlalu banyak request. Coba lagi beberapa saat.",
  },
});

/**
 * Rate Limit khusus login
 */
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit

  max: 5,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Terlalu banyak percobaan login. Tunggu 1 menit.",
  },
});

/**
 * Slow Down Middleware
 */
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,

  delayAfter: 20,

  delayMs: () => 500,

  maxDelayMs: 5000,

  validate: {
    delayMs: false,
  },
});

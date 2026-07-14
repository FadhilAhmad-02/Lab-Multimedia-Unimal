import compression from "compression";

export const compressionConfig = compression({
  level: 6,

  threshold: 1024,
});

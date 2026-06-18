import express from "express";
import {
  createTemplate,
  getTemplates,
  getTemplateById,
  getTemplateNormalized
} from "../controllers/template.controller";

const router = express.Router();

router.post("/", createTemplate);
router.get("/", getTemplates);
router.get("/:id", getTemplateById);
router.get("/:id/normalized", getTemplateNormalized);

export default router;
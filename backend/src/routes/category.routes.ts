import { Router } from "express";

import {
    getCategories,
    createCategory,
    updateCategory,
    toggleCategory,
    deleteCategory,
} from "../controllers/category.controller";

const router = Router();

/*
GET ALL CATEGORY
*/
router.get("/", getCategories);

/*
CREATE CATEGORY
*/
router.post("/", createCategory);

/*
UPDATE CATEGORY
*/
router.put("/:id", updateCategory);

/*
TOGGLE ACTIVE
*/
router.patch(
  "/:id/toggle",
  toggleCategory
);

/*
DELETE CATEGORY
*/
router.delete(
  "/:id",
  deleteCategory
);

export default router;
import express from "express";
import { body } from "express-validator";
import { humanizeText } from "../controllers/humanizeController.js";
import validateRequest from "../middlewares/validateRequest.js";

const router = express.Router();

router.post(
  "/humanize",
  [
    body("text")
      .trim()
      .notEmpty()
      .withMessage("Text is required.")
      .isLength({ min: 20, max: 5000 })
      .withMessage("Text must be between 20 and 5000 characters."),
    body("tone")
      .isIn(["casual", "professional", "friendly"])
      .withMessage("Tone must be casual, professional, or friendly."),
    body("mode")
      .optional()
      .isIn(["humanize", "formal", "simplify", "expand", "academic"])
      .withMessage(
        "Mode must be humanize, formal, simplify, expand, or academic."
      ),
    body("creativity")
      .isInt({ min: 1, max: 10 })
      .withMessage("Creativity must be an integer between 1 and 10."),
  ],
  validateRequest,
  humanizeText
);

export default router;

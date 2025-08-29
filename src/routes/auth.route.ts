import { Router } from "express";
import authController from "@/controllers/auth.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import { registerSchema, loginSchema } from "@/validations/auth.validation";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh-token", authController.refreshToken);

// Protected routes
router.post("/logout", authenticate, authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);
router.get("/profile", authenticate, authController.getProfile);

export default router;

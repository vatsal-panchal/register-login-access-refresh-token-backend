import { Router } from "express";
import { loginController, postController, refreshController, registerController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router()

router.post("/register",registerController)
router.post("/login",loginController)
router.post("/refresh",refreshController)
router.get("/posts",authMiddleware,postController)



export default router       
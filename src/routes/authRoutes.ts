import express from 'express';
import { authController } from "../app.module";
const router = express.Router();

router.get('/auth-url', authController.getAuthUrl);

router.get('/exchange-code', authController.exchangeCodeForTokens);

export default router;

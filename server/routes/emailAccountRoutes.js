import express from "express";
import {
  connectEmailAccount,
  getEmailAccounts,
  deleteEmailAccount,
  syncEmailAccount,
  getGoogleAuthUrl,
  googleAuthCallback,
} from "../controllers/emailAccountController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public Google OAuth callback (browser redirect from Google consent)
router.get("/google/callback", googleAuthCallback);

// Protected routes
router.use(protect);

router.get("/google/url", getGoogleAuthUrl);
router.post("/connect", connectEmailAccount);
router.get("/", getEmailAccounts);
router.delete("/:id", deleteEmailAccount);
router.post("/:id/sync", syncEmailAccount);

export default router;

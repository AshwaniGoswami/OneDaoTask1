const express = require("express");
const router = express.Router();
const userController = require("../contollers/userControlller");
const TokenVerificationMiddleware = require("../middleware/authMiddleware");

router.post("/signup", userController.Signup);

router.post("/login", userController.Login);

router.get(
  "/users/country/:country",
  TokenVerificationMiddleware,
  userController.GetUsersByCountry
);

router.post("/otp", userController.SendOtpController);
router.post("/otp/verify", userController.VerifyOtp);

module.exports = router;

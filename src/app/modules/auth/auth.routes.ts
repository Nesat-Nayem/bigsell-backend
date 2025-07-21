import express from "express";
import { 
  loginController, 
  singUpController, 
  getAllUsers, 
  getUserById, 
  resetPassword, 
  activateUser, 
  checkPhoneExists, 
  checkEmailExists,
  updateUser, 
  requestOtp,
  verifyOtp
} from "./auth.controller";
import { auth } from "../../middlewares/authMiddleware";



const router = express.Router();
router.post("/signup", singUpController);
router.post("/signin", loginController);
router.get("/users", auth('admin'), getAllUsers);
router.get("/user/:id", auth(), getUserById);
router.post("/reset-password", resetPassword);
router.post("/activate-user", activateUser);
router.post("/check-phone", checkPhoneExists);
router.post("/check-email", checkEmailExists);
router.patch("/user/:id", auth(), updateUser);


router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);


export const authRouter = router;

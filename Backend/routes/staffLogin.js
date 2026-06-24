import staffLogin from "../controller/staffController.js";
import express from "express";

const router = express.Router();
router.post('/login', staffLogin);

export default router;

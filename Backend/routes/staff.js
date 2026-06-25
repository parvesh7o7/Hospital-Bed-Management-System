import staffLogin from "../controller/staffController.js";
import admitPatient from "../controller/patientController.js";
import express from "express";

const router = express.Router();
router.post('/login', staffLogin);
router.post('/admit-patient', admitPatient);
export default router;

import staffLogin from "../controller/staffController.js";
import admitPatient from "../controller/patientController.js";
import { getWaitingQueue } from "../controller/queueController.js";
import express from "express";

const router = express.Router();
router.post('/login', staffLogin);
router.post('/admit-patient', admitPatient);
router.get('/queue/:hospital_id', async (req, res) => {
    try {
        const result = await getWaitingQueue(req.params.hospital_id);

        if (result.status === 'error') {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
export default router;

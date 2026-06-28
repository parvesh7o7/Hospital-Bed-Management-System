import express from 'express'
import discharge_patient from '../controller/dischargeController.js';
const router = express.Router();
router.post('/discharge', async (req, res) => {
    try {
        const { hospital_id, patient_id, discharge_reason } = req.body;
        const result = await discharge_patient(hospital_id, patient_id, discharge_reason);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

export default router;
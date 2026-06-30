import express from 'express'
import discharge_patient from '../controller/dischargeController.js';
import verify_token from '../middleware/authMiddleware.js';
const router = express.Router();
router.post('/discharge', verify_token, async (req, res) => {
    try {
        const { hospital_id, patient_id, discharge_reason } = req.body;
        const staff_id = req.user.staff_id; // extracted from JWT by verify_token
        const result = await discharge_patient(hospital_id, patient_id, discharge_reason, staff_id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

export default router;
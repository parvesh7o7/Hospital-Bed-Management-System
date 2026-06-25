import { classify_severity } from "../utils/severityClassifier.js";
import supabase from "../config/supabase.js";

const admitPatient = async (req, res) => {
    try {
        const {
            hospital_id,
            diagnosis,
            o2_sat,
            heart_rate,
            temp,
            respiratory_rate,
            has_comorbidities,
            age,
            altered_consciousness,
            hemodynamic_instability,
            needs_respiratory_support
        } = req.body;

        const severity = classify_severity(
            o2_sat,
            respiratory_rate,
            has_comorbidities,
            age,
            temp,
            altered_consciousness,
            hemodynamic_instability,
            needs_respiratory_support,
        )

        const { data: patient, error } = await supabase.from('patients').insert({
            hospital_id,
            diagnosis,
            o2_sat,
            heart_rate,
            temp,
            respiratory_rate,
            has_comorbidities,
            age,
            severity_classification: severity,
            altered_consciousness: altered_consciousness,
            hemodynamic_instability: hemodynamic_instability,
            needs_respiratory_support: needs_respiratory_support,
        }).select().single();

        if (error) throw error;
        res.json({
            status: 'Patient admitted',
            patient,
            severity
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export default admitPatient;
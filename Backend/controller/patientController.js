import { classify_severity } from "../utils/severityClassifier.js";
import supabase from "../config/supabase.js";
import { assignPatientToQueue } from "./queueController.js";
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

        let { data: patient, error } = await supabase.from('patients').insert({
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

        const bed_type = severity == 'ICU' ? 'ICU' : 'Ward';

        const { data: bed, error: bed_error } = await supabase.from('beds').select('*').eq('hospital_id', hospital_id).eq('bed_type', bed_type).eq('is_occupied', false).limit(1).single();
        let bedAssignment = null;
        if (!bed_error && bed) {
            const { data: updatedBed, error: update_error } = await supabase.from('beds').update({ is_occupied: true, current_patient_id: patient.id }).eq('id', bed.id).select().single();

            if (!update_error) {
                bedAssignment = updatedBed;
                const { data: updated_patient } = await supabase
                    .from('patients')
                    .update({ bed_id: bed.id })
                    .eq('id', patient.id).eq('hospital_id', hospital_id).select().single();
                if (updated_patient) {
                    patient = updated_patient;
                }
            }
        } else {
            await assignPatientToQueue(patient.id, hospital_id);
            const { data: queued_patient } = await supabase.from('patients').select('*').eq('id', patient.id).single();
            if (queued_patient) {
                patient = queued_patient;
            }
        }

        res.json({
            status: 'Patient admitted',
            patient,
            severity,
            bed_assignment: bedAssignment || { status: 'No bed available, added to queue' }
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export default admitPatient;
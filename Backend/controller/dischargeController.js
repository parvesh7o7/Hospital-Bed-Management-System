import supabase from "../config/supabase.js";
import { getWaitingQueue } from "./queueController.js";
async function discharge_patient(hospital_id, patient_id, discharge_reason, staff_id) {
    try {
        console.log("Discharging Patient: ", patient_id);
        const { data: patient, error: patient_error } = await supabase.from('patients').select('bed_id').eq('hospital_id', hospital_id).eq('id', patient_id).single();

        if (patient_error) {
            return {
                status: 'error',
                message: 'Patient not found',
                error: patient_error.message
            }
        }

        const bed_id = patient.bed_id;
        if (bed_id) {
            const { error: bed_free_error } = await supabase.from('beds').update({ is_occupied: false, current_patient_id: null }).eq('id', bed_id).eq('current_patient_id', patient_id);

            if (bed_free_error) {
                return {
                    status: 'error',
                    message: 'Could not free the bed',
                    error: bed_free_error.message,
                }
            }
        }

        const { error: disharge_error } = await supabase.from('patients').update({ bed_id: null }).eq('id', patient_id);
        if (disharge_error) {
            return {
                status: 'error',
                message: 'Could not discharge the patient',
                error: disharge_error.message,
            }
        }
        await supabase.from('audit_log').insert({
            hospital_id,
            action: 'DISCHARGE',
            patient_id,
            user_id: staff_id,
            details: discharge_reason
        })
        const queue = await getWaitingQueue(hospital_id);
        let next_patient = null;
        if (Array.isArray(queue) && queue.length > 0) {
            next_patient = queue[0];
            console.log("Next Patient: ", next_patient);

            const { data: bed, error: bed_error } = await supabase.from('beds').select('*').eq('hospital_id', hospital_id).eq('is_occupied', false).eq('bed_type', next_patient.severity_classification === 'ICU' ? 'ICU' : 'Ward').limit(1);

            if (!bed_error && bed && bed.length > 0) {
                const selected_bed = bed[0];

                const { error: bed_assignment_error } = await supabase.from('beds').update({ is_occupied: true, current_patient_id: next_patient.id }).eq('id', selected_bed.id).eq('hospital_id', hospital_id);
                if (bed_assignment_error) {
                    return {
                        status: 'error',
                        message: 'Could not assign the bed to the patient',
                        error: bed_assignment_error.message
                    }
                }

                const { error: patient_assignment_error } = await supabase.from('patients').update({ is_in_queue: false, bed_id: selected_bed.id, queue_position: null }).eq('id', next_patient.id).eq('hospital_id', hospital_id);
                if (patient_assignment_error) {
                    return {
                        status: 'error',
                        message: 'Could not assign the patient to the bed',
                        error: patient_assignment_error.message
                    }
                }
                await supabase.from('audit_log').insert({
                    hospital_id,
                    action: 'BED_ASSIGNMENT',
                    patient_id: next_patient.id,
                    user_id: staff_id,
                    details: `Assigned to bed ${selected_bed.bed_number}`
                })
            }
        }
        return {
            status: 'success',
            message: 'Patient Discharged',
            staff_id: staff_id,
            discharge_id: patient_id,
            assigned_bed_id: bed_id,
            next_patient: next_patient ? next_patient.id : null,
        }
    } catch (error) {
        console.log('Discharge error:', error);
        return {
            status: 'error',
            message: 'Server error during discharge',
            error: error.message
        };
    }
}

export default discharge_patient;
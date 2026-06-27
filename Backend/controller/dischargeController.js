import supabase from "../config/supabase.js";

async function discharge_patient(hospital_id, patient_id) {
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

        return {
            status: 'success',
            message: 'Patient Discharged',
            discharge_id: patient_id,
            free_bed: bed_id,
        }
    } catch (error) {
        console.log(error);
    }
}

export default discharge_patient;
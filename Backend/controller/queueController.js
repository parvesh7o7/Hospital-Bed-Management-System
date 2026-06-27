import supabase from "../config/supabase.js";

const calculateQueuePriority = (patient) => {
    const severity_score = {
        'ICU': 3,
        'Ward': 2,
        'Monitor': 1,
    }

    const wait_time_minutes = Math.floor((new Date() - new Date(patient.admission_date)) / 60000);

    const deterioration_rate = patient.deterioration_rate || 0;

    const priority_score = (severity_score[patient.severity_classification] * 100) + wait_time_minutes + (deterioration_rate * 50);
    return priority_score;
};

const getWaitingQueue = async (hospital_id) => {
    try {
        const { data: waiting_patient, error } = await supabase.from('patients').select('*').eq('hospital_id', hospital_id).eq('is_in_queue', true).is('bed_id', null);

        if (error) throw error;

        const queue_with_priority = waiting_patient.map((patient) => {

            return {
                ...patient,
                priority_score: calculateQueuePriority(patient),
            }
        })

        const sorted_queue = queue_with_priority.sort((a, b) => b.priority_score - a.priority_score);
        return sorted_queue;
    } catch (error) {
        return {
            status: 'error',
            message: 'Server error while fetching queue',
            error: error.message
        };
    }
}

const assignPatientToQueue = async (patient_id, hospital_id) => {
    try {
        const { error } = await supabase.from('patients').update({ is_in_queue: true }).eq('id', patient_id).eq('hospital_id', hospital_id);

        if (error) throw error;

        return {
            status: 'success',
            message: 'Patient added to queue'
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'Server error adding patient to queue',
            error: error.message
        }
    }
}

export { assignPatientToQueue, getWaitingQueue, calculateQueuePriority };
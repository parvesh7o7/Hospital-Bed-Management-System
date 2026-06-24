import supabase from "../config/supabase.js";
import { comparePasswords } from "../utils/passwordUtils.js";
const staffLogin = async (req, res) => {
    try {
        const { hospital_name, staff_id, password } = req.body;
        const { data, error } = await supabase.from('staff').select('*').eq('staff_id', staff_id).single();
        if (error) {
            return res.status(401).json({
                error: "Staff not found"
            });
        };

        const isPasswordValid = await comparePasswords(password, data.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        res.json({
            status: "Login successful",
            staff: data
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export default staffLogin;
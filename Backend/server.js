import express from "express";
import dotenv from "dotenv";
import staffRoute from "./routes/staff.js";
import adminRoute from "./routes/admin.js";
dotenv.config();
const app = express();

app.use(express.json())
app.get('/patient', (req, res) => {
    res.json({ "status": "Server running" });
});

//test-connection-supabase
/*app.get('/test-connection', async (req, res) => {
    try {
        const { data, error } = await supabase.from('hospitals').select('*');
        if (error) throw error;
        res.json({
            status: 'Connected to supabase',
            hospitals: data,
        });
    } catch (error) {
        res.status(500).json({
            status: "Could not connect to supabase",
            error: error.message
        })
    }
})*/
app.use('/api/staff', staffRoute);
app.use('/api/admin', adminRoute);


const PORT = process.env.PORT || 3000;
app.listen(PORT, (req, res) => {
    console.log("Server running on PORT: ", PORT);
})
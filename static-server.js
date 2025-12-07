import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

// Serve all static files
const __dirname = path.resolve();
app.use(express.static(__dirname));

// Load soil data from JSON database
function loadSoilData() {
    const dbPath = path.join(__dirname, "soil-data.json");

    if (fs.existsSync(dbPath)) {
        const raw = fs.readFileSync(dbPath, "utf-8");
        return JSON.parse(raw);
    }

    // Fallback mock data if no DB exists
    return [
        {
            pH: 6.5,
            nitrogen: 40,
            phosphorus: 20,
            potassium: 35,
            moisture: 55,
            soil_type: "Loamy",
            timestamp: "2024-01-05T10:00:00Z"
        },
        {
            pH: 7.1,
            nitrogen: 38,
            phosphorus: 25,
            potassium: 30,
            moisture: 60,
            soil_type: "Sandy",
            timestamp: "2024-01-06T12:00:00Z"
        }
    ];
}

// API endpoint: return soil data as JSON
app.get("/soil-data", (req, res) => {
    const data = loadSoilData();
    res.json(data);
});

// Launch server
app.listen(PORT, () => {
    console.log(`Static server running at http://localhost:${PORT}`);
});

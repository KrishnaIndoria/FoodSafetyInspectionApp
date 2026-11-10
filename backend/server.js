
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Create storage folder and file if they do not exist
const dataFolder = path.join(__dirname, "data");
const dataFile = path.join(dataFolder, "inspections.json");

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
}

if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([], null, 2));
}

// Read inspections from storage
function readInspections() {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

// Save inspections to storage
function writeInspections(inspections) {
    fs.writeFileSync(dataFile, JSON.stringify(inspections, null, 2));
}

// Test route
app.get("/", (req, res) => {
    res.send("Food Safety Inspection API is running!");
});

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Server is healthy"
    });
});

// Receive and store an inspection
app.post("/api/inspections", (req, res) => {
    const audit = req.body;

    if (
        !audit.id ||
        !audit.restaurant ||
        !audit.inspector ||
        !audit.date ||
        !audit.observations ||
        !audit.status
    ) {
        return res.status(400).json({
            message: "Missing required inspection details"
        });
    }

    const inspections = readInspections();

    // Prevent duplicate records during repeated synchronization
    const existing = inspections.find(item => item.id === audit.id);

    if (existing) {
        return res.json({
            message: "Inspection already synchronized",
            id: audit.id
        });
    }

    const savedAudit = {
        id: audit.id,
        restaurant: audit.restaurant,
        inspector: audit.inspector,
        date: audit.date,
        observations: audit.observations,
        status: audit.status,
        receivedAt: new Date().toISOString()
    };

    inspections.push(savedAudit);
    writeInspections(inspections);

    res.status(201).json({
        message: "Inspection synchronized successfully",
        id: audit.id
    });
});

// View inspections received by the server
app.get("/api/inspections", (req, res) => {
    res.json(readInspections());
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
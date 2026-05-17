const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());
// Serve static files (index.html, assets)
app.use(express.static(__dirname));

// Helper to read DB
function readDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([]));
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
}

// Helper to write DB
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// API: Save Score
app.post('/api/save-score', (req, res) => {
    const { studentName, scenario, score } = req.body;
    const db = readDB();
    
    const newRecord = {
        name: scenario,
        date: new Date().toLocaleDateString(),
        score: score,
        studentName: studentName || 'Guest'
    };
    
    db.unshift(newRecord); // Add to start
    writeDB(db);
    
    res.json({ status: 'success', message: 'Score saved to database!', data: newRecord });
});

// API: Get Portfolio
app.get('/api/portfolio', (req, res) => {
    const db = readDB();
    res.json(db);
});

// API: Analyze Speech (Calls Python)
app.post('/api/analyze-speech', (req, res) => {
    const { spoken_text, target_text } = req.body;
    
    // Call Python script
    const python = spawn('python3', [path.join(__dirname, 'ai_analyzer.py')]);
    
    let outputData = '';
    
    // Send data to python via stdin
    python.stdin.write(JSON.stringify({ spoken_text, target_text }));
    python.stdin.end();
    
    python.stdout.on('data', (data) => {
        outputData += data.toString();
    });
    
    python.on('close', (code) => {
        try {
            const result = JSON.parse(outputData);
            res.json(result);
        } catch (e) {
            res.status(500).json({ status: 'error', message: 'Failed to parse AI result' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const express = require('express');
const fs = require('fs');
const path = require('path');

// Express app létrehozása
const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware (hogy a frontend is tudja használni)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// JSON middleware
app.use(express.json());

// Adatok betöltése
const loadData = () => {
    try {
        const dataPath = path.join(__dirname, 'data.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Hiba az adatok betöltésekor:', error);
        return null;
    }
};

// Főoldal endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Üdvözöl az EcoPulse API!',
        version: '1.0.0',
        description: 'Környezettudatos tippek és statisztikák API',
        endpoints: {
            '/': 'API információk',
            '/eco-tips': 'Összes környezettudatos tipp',
            '/eco-tips/:id': 'Konkrét tipp ID alapján',
            '/stats': 'Környezeti statisztikák'
        }
    });
});

// Összes eco tipp lekérése
app.get('/eco-tips', (req, res) => {
    const data = loadData();
    if (!data) {
        return res.status(500).json({ error: 'Hiba az adatok betöltésekor' });
    }
    
    res.json({
        success: true,
        count: data.ecoTips.length,
        data: data.ecoTips
    });
});

// Konkrét eco tipp lekérése ID alapján
app.get('/eco-tips/:id', (req, res) => {
    const data = loadData();
    if (!data) {
        return res.status(500).json({ error: 'Hiba az adatok betöltésekor' });
    }
    
    const tipId = parseInt(req.params.id);
    const tip = data.ecoTips.find(t => t.id === tipId);
    
    if (!tip) {
        return res.status(404).json({ 
            success: false,
            error: 'Nem található ilyen ID-val tipp' 
        });
    }
    
    res.json({
        success: true,
        data: tip
    });
});

// Statisztikák lekérése
app.get('/stats', (req, res) => {
    const data = loadData();
    if (!data) {
        return res.status(500).json({ error: 'Hiba az adatok betöltésekor' });
    }
    
    res.json({
        success: true,
        data: data.stats
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint nem található',
        availableEndpoints: ['/', '/eco-tips', '/eco-tips/:id', '/stats']
    });
});

// Szerver indítása
app.listen(PORT, () => {
    console.log(`🌱 EcoPulse API szerver fut a http://localhost:${PORT} címen`);
    console.log(`📋 Elérhető endpointok:`);
    console.log(`   GET /                 - API információk`);
    console.log(`   GET /eco-tips         - Összes környezettudatos tipp`);
    console.log(`   GET /eco-tips/:id     - Konkrét tipp ID alapján`);
    console.log(`   GET /stats            - Környezeti statisztikák`);
});

module.exports = app;
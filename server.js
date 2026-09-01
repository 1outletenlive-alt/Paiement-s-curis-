const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Dossier de données
const DATA_DIR = path.join(__dirname, 'data');
const STORAGE_FILE = path.join(DATA_DIR, 'paiements.json');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getHistory() {
    try {
        return JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
    } catch {
        return [];
    }
}

function saveHistory(data) {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
}

// Route : soumission du paiement
app.post('/api/paiement', (req, res) => {
    const data = req.body;
    const history = getHistory();
    history.push({
        ...data,
        date: new Date().toISOString(),
        status: 'pending'
    });
    saveHistory(history);
    res.json({ success: true, message: 'Paiement enregistré.', id: history.length - 1 });
});

// Route : liste admin
app.get('/api/admin/list', (req, res) => {
    const history = getHistory();
    res.json({ success: true, data: history });
});

// Route : changement de statut
app.post('/api/admin/toggle', (req, res) => {
    const { id, status } = req.body;
    const history = getHistory();
    if (id === undefined || id >= history.length || id < 0) {
        return res.json({ success: false, message: 'ID invalide.' });
    }
    history[id].status = status;
    saveHistory(history);
    res.json({ success: true, message: 'Statut mis à jour.' });
});

// Route : suppression
app.delete('/api/admin/delete', (req, res) => {
    const { id } = req.body;
    const history = getHistory();
    if (id === undefined || id >= history.length || id < 0) {
        return res.json({ success: false, message: 'ID invalide.' });
    }
    history.splice(id, 1);
    saveHistory(history);
    res.json({ success: true, message: 'Paiement supprimé.' });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur de paiement lancé sur http://localhost:${PORT}`);
    console.log(`🔒 Mot de passe admin : Motdepasse200`);
    console.log(`📁 Données : ${STORAGE_FILE}`);
});
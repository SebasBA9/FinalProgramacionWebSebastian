const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');

const app = express();

// Configuración de middleware
app.use(cors());
app.use(express.json());

// Rutas de la aplicación
app.use('/api/games', gameRoutes);

// Puerto del servidor
const PORT = process.env.PORT || 3003;

// Conexión a MongoDB
if (process.env.NODE_ENV !== 'test') {
    const mongoUri = 'mongodb+srv://<username>:<password>@normando.7i5l1el.mongodb.net/<dbname>?retryWrites=true&w=majority';
    mongoose.connect(mongoUri)
        .then(() => {
            console.log('MongoDB connected');
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch(err => {
            console.error('Failed to connect to MongoDB', err);
        });
} else {
    console.log('Running in test mode, using in-memory MongoDB');
}

// Exportar la aplicación para tests u otros módulos si es necesario
module.exports = app;

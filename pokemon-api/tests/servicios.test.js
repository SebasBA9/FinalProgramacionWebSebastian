const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Game = require('../src/models/gameModel');
const app = require('../src/app');

jest.setTimeout(30000);

describe('Game API', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    // Prueba de éxito para iniciarJuego
    it('should start a new game successfully', async () => {
        const response = await request(app).get('/api/games/crearJuego');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('idJuego');
        expect(response.body).toHaveProperty('equipoInicial');
        expect(response.body.equipoInicial).toHaveLength(6);
    });

    // Prueba de error para iniciarJuego
    it('should return 500 if an error occurs during game initialization', async () => {
        jest.spyOn(Game.prototype, 'save').mockImplementationOnce(() => {
            throw new Error('Database save failed');
        });

        const response = await request(app).get('/api/games/crearJuego');
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Error iniciando el juego: Database save failed');
    });

    // Prueba de éxito para compararSecuencia
    it('should compare sequence successfully', async () => {
        const newGameResponse = await request(app).get('/api/games/crearJuego');
        const idJuego = newGameResponse.body.idJuego;

        // Obtener el pokemon inicial de la respuesta
        const pokemonInicial = newGameResponse.body.equipoInicial[0].identificador;

        const response = await request(app)
            .post('/api/games/enviarSecuencia')
            .send({ idJuego, pokemons: [pokemonInicial] });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('resultado', 'SEGUIR');
        expect(response.body).toHaveProperty('pokemonSequence');
    });

    // Prueba de error para compararSecuencia
    it('should return 500 if an error occurs during sequence comparison', async () => {
        const newGameResponse = await request(app).get('/api/games/crearJuego');
        const idJuego = newGameResponse.body.idJuego;

        jest.spyOn(Game, 'findById').mockImplementationOnce(() => {
            throw new Error('Database find failed');
        });

        const response = await request(app)
            .post('/api/games/enviarSecuencia')
            .send({ idJuego, pokemons: [1] });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Error comparando la secuencia: Database find failed');
    });
});

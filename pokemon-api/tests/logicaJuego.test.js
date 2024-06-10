const axios = require('axios');
const mongoose = require('mongoose');
const { 
    eleccionNumero, 
    _getPokemonInfo, 
    eleccionEquipo, 
    crearJuego, 
    obtenerInfoJuego, 
    actualizarSecuencia 
} = require('../src/utils/logicaJuego');
const Juego = require('../src/models/gameModel');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('axios');
jest.mock('../src/models/gameModel');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Pruebas para eleccionNumero
describe.skip('eleccionNumero', () => {
    it('debería devolver un número aleatorio dentro del rango', () => {
        const resultado = eleccionNumero(1, 10);
        expect(resultado).toBeGreaterThanOrEqual(1);
        expect(resultado).toBeLessThanOrEqual(10);
    });

    it('debería lanzar un error si el rango es inválido', () => {
        expect(() => eleccionNumero(10, 1)).toThrow('Rango inválido: inicio es mayor que fin');
    });
});

// Pruebas para _getPokemonInfo
describe.skip('_getPokemonInfo', () => {
    let consoleSpy;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('debería devolver la información del Pokémon cuando el ID es válido', async () => {
        const data = {
            id: 1,
            name: 'bulbasaur',
            sprites: { front_default: 'url-bulbasaur' }
        };
        axios.get.mockResolvedValue({ data });

        const resultado = await _getPokemonInfo(1);
        expect(resultado).toEqual({
            identificador: 1,
            nombre: 'bulbasaur',
            imagenUrl: 'url-bulbasaur'
        });
    });

    it('debería lanzar un error si la API de Pokémon falla', async () => {
        axios.get.mockRejectedValue(new Error('API Error'));

        await expect(_getPokemonInfo(1)).rejects.toThrow('API Error');
    });
});

// Pruebas para eleccionEquipo
describe.skip('eleccionEquipo', () => {
    let consoleSpy;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('debería devolver un arreglo con la información de los Pokémon', async () => {
        const data = {
            id: 1,
            name: 'bulbasaur',
            sprites: { front_default: 'url-bulbasaur' }
        };
        axios.get.mockResolvedValue({ data });

        const resultado = await eleccionEquipo([1, 2]);
        expect(resultado).toEqual([
            { identificador: 1, nombre: 'bulbasaur', imagenUrl: 'url-bulbasaur' },
            { identificador: 1, nombre: 'bulbasaur', imagenUrl: 'url-bulbasaur' }
        ]);
    });

    it('debería lanzar un error si ocurre un problema al obtener la información de los Pokémon', async () => {
        axios.get.mockRejectedValue(new Error('API Error'));

        await expect(eleccionEquipo([1, 2])).rejects.toThrow('API Error');
    });
});

// Pruebas para crearJuego
describe.skip('crearJuego', () => {
    it('debería crear y guardar un nuevo juego con el equipo inicial', async () => {
        const mockJuego = { _id: '12345', initialTeam: [1, 2, 3], pokemonSequence: [] };
        Juego.mockImplementation(() => ({
            save: jest.fn().mockResolvedValue(mockJuego)
        }));

        const resultado = await crearJuego([1, 2, 3]);
        expect(resultado).toEqual(mockJuego);
    });

    it('debería lanzar un error si ocurre un problema al guardar el juego', async () => {
        Juego.mockImplementation(() => ({
            save: jest.fn().mockRejectedValue(new Error('Save Error'))
        }));

        await expect(crearJuego([1, 2, 3])).rejects.toThrow('Save Error');
    });
});

// Pruebas para obtenerInfoJuego
describe.skip('obtenerInfoJuego', () => {
    it('debería devolver la información del juego si el ID es válido', async () => {
        const mockJuego = { _id: '12345', initialTeam: [1, 2, 3], pokemonSequence: [1] };
        Juego.findById.mockResolvedValue(mockJuego);

        const resultado = await obtenerInfoJuego('12345');
        expect(resultado).toEqual(mockJuego);
    });

    it('debería lanzar un error si el juego no es encontrado', async () => {
        Juego.findById.mockResolvedValue(null);

        await expect(obtenerInfoJuego('12345')).rejects.toThrow('Juego no encontrado');
    });
});

// Pruebas para actualizarSecuencia
describe.skip('actualizarSecuencia', () => {
    it('debería actualizar la secuencia de Pokémon y devolver el juego actualizado', async () => {
        const mockJuego = { _id: '12345', initialTeam: [1, 2, 3], pokemonSequence: [1, 2] };
        Juego.findByIdAndUpdate.mockResolvedValue(mockJuego);

        const resultado = await actualizarSecuencia('12345', 2);
        expect(resultado).toEqual(mockJuego);
    });

    it('debería lanzar un error si el juego no es encontrado para actualizar', async () => {
        Juego.findByIdAndUpdate.mockResolvedValue(null);

        await expect(actualizarSecuencia('12345', 2)).rejects.toThrow('Juego no encontrado para actualizar');
    });
});

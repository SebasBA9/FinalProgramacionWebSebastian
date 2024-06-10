const axios = require('axios');
const Juego = require('../models/gameModel');

const eleccionNumero = (inicio, fin) => {
    if (inicio > fin) {
        throw new Error('Rango inválido: inicio es mayor que fin');
    }
    return Math.floor(Math.random() * (fin - inicio + 1)) + inicio;
};

const _getPokemonInfo = async (id) => {
    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
        return {
            identificador: response.data.id,
            nombre: response.data.name,
            imagenUrl: response.data.sprites.front_default
        };
    } catch (error) {
        console.error('Error obteniendo información del Pokémon:', error);
        throw error;
    }
};

const eleccionEquipo = async (ids) => {
    try {
        const equipoPromises = ids.map(id => _getPokemonInfo(id));
        const equipo = await Promise.all(equipoPromises);
        return equipo;
    } catch (error) {
        console.error('Error en eleccionEquipo:', error);
        throw error;
    }
};

const crearJuego = async (equipoInicial) => {
    const juego = new Juego({ initialTeam: equipoInicial, pokemonSequence: [] });
    return await juego.save();
};

const obtenerInfoJuego = async (idJuego) => {
    const juego = await Juego.findById(idJuego);
    if (!juego) {
        throw new Error('Juego no encontrado');
    }
    return juego;
};

const actualizarSecuencia = async (idJuego, nuevoPokemon) => {
    const juego = await Juego.findByIdAndUpdate(
        idJuego,
        { $push: { pokemonSequence: nuevoPokemon } },
        { new: true }
    );
    if (!juego) {
        throw new Error('Juego no encontrado para actualizar');
    }
    return juego;
};

module.exports = {
    eleccionNumero,
    _getPokemonInfo,
    eleccionEquipo,
    crearJuego,
    obtenerInfoJuego,
    actualizarSecuencia
};

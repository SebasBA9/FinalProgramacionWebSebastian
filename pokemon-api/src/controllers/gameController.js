const {
    eleccionNumero,
    eleccionEquipo,
    crearJuego,
    obtenerInfoJuego,
    actualizarSecuencia
} = require('../utils/logicaJuego');

const iniciarJuego = async (req, res) => {
    try {
        // Crear el equipo inicial de 6 Pokémon
        const equipoInicial = Array.from({ length: 6 }, () => eleccionNumero(1, 386));
        const equipo = await eleccionEquipo(equipoInicial);

        // Seleccionar un Pokémon aleatorio para iniciar la secuencia
        const indiceAleatorio = eleccionNumero(0, equipoInicial.length - 1);
        const pokemonInicial = equipoInicial[indiceAleatorio];

        // Crear el juego con pokemonSequence iniciando con un solo Pokémon
        const juego = await crearJuego(equipoInicial, [pokemonInicial]);

        res.json({
            idJuego: juego._id,
            equipoInicial: equipo
        });
    } catch (error) {
        console.error('Error en iniciarJuego:', error);
        res.status(500).json({ error: 'Error iniciando el juego: ' + error.message });
    }
};

const compararSecuencia = async (req, res) => {
    const { idJuego, pokemons } = req.body;
    try {
        const juego = await obtenerInfoJuego(idJuego);

        // Verificar que la secuencia enviada sea correcta
        const esCorrecta = pokemons.every((pokemon, index) => pokemon === juego.pokemonSequence[index]);

        if (esCorrecta) {
            // Seleccionar un nuevo Pokémon del equipo inicial
            const equipoInicial = juego.initialTeam;
            const nuevoPokemonId = equipoInicial[eleccionNumero(0, equipoInicial.length - 1)];
            const nuevoPokemonInfo = await eleccionEquipo([nuevoPokemonId]);
            const juegoActualizado = await actualizarSecuencia(idJuego, nuevoPokemonId);

            // Obtener la secuencia completa actualizada
            const secuenciaCompleta = await eleccionEquipo(juegoActualizado.pokemonSequence);

            res.json({ 
                resultado: "SEGUIR", 
                pokemonSequence: secuenciaCompleta // Enviar la secuencia completa incluyendo el nuevo Pokémon añadido
            });
        } else {
            res.json({ 
                resultado: "TERMINADO", 
                score: juego.pokemonSequence.length 
            });
        }
    } catch (error) {
        console.error('Error en compararSecuencia:', error);
        res.status(500).json({ error: 'Error comparando la secuencia: ' + error.message });
    }
};

module.exports = { iniciarJuego, compararSecuencia };
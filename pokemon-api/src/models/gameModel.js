const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    initialTeam: {
        type: [Number],
        required: true
    },
    pokemonSequence: {
        type: [Number],
        required: true,
        default: []
    }
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;

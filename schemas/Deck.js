const mongoose = require('mongoose')

var DeckSchema = mongoose.Schema({
    
    deck_id: 
    {
        type: ObjectId, 
        required: true
    },

    game_id: 
    {
        type: ObjectId, 
        required: true
    },

})

module.exports = DeckSchema
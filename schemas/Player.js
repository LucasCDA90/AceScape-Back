const mongoose = require('mongoose')

var PlayerSchema = mongoose.Schema({
    
    player_id:
    {
        type: ObjectId, 
        required: true
    },

    user_id: 
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

module.exports = PlayerSchema
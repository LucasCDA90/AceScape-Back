const mongoose = require('mongoose')

var GameSchema = mongoose.Schema({
    
    game_id: 
    {
        type: ObjectId, 
        required: true
    },

    start_time:
    {
        type: Date.now(),
        required: true
    },

    end_time:
    {
        type: Date.now(),
        required: true
    },
    
    status: 
    {
        type: String,
        required: false
    },
})

module.exports = GameSchema
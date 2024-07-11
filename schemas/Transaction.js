const mongoose = require('mongoose')

var TransactionSchema = mongoose.Schema({
    
    transaction_id: 
    {
        type: ObjectId, 
        required: true
    },

    user_id: 
    {
        type: ObjectId, 
        required: true
    },

    transaction_type: 
    {
        type: String, 
        required: true
    },

    transaction_date: 
    {
        type: Date.now(), 
        required: true
    },

})

module.exports = TransactionSchema
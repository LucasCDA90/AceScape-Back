const mongoose = require('mongoose')

var UserSchema = mongoose.Schema({
    firstName: 
    {
        type: String,
        required: true
    },

    lastName: 
    {
        type: String,
        required: true
    },

    username: 
    {
        type: String,
        required: true,
        index: true,
        unique: true
    },

    email: 
    {
        type: String,
        required: true,
        index: true,
        unique: true
    },

    phone: 
    {
        type: String,
        required: false
    },
    status: 
    {
        type: String,
        required: false
    },
    isAdmin:
    {
        type: Boolean,
        required: false
    },
    password: 
    {
        type: String,
        required: true
    },
    token: String

})

module.exports = UserSchema
const mongoose = require('mongoose')

const KrediSchema = new mongoose.Schema({
    Number: {
        type: Number,
        required: true
    },
    Id: {
        type: String,
        required: true
    } 
})

const Kredi = new mongoose.model('Kredi', KrediSchema)
module.exports = Kredi;
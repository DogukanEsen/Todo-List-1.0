const mongoose = require('mongoose')

const sToDoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
})

const sToDo = new mongoose.model('sToDo', sToDoSchema)
module.exports = sToDo;
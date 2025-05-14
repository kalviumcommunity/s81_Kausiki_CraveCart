const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    area: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    country: {
        type: String
    }
});

module.exports = mongoose.model("Address", addressSchema);

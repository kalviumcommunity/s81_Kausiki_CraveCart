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

    const AddressModel = mongoose.model("Address", addressSchema);
    module.exports = AddressModel;
    module.exports.AddressModel = AddressModel;
    module.exports.Address = AddressModel;

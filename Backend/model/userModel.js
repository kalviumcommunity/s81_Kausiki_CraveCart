    const mongoose = require("mongoose");
    const Address = require("./addressModel");

    const userSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: false
        },
        role: {
            type: String,
            enum: ["customer", "kitchen", "admin"],
            default: "customer"
        },
        isActivated: {
            type: Boolean,
            default: true
        },
        phone: {
            type: String
        },
        address: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address"  
        },
        favoriteKitchens: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Kitchen"
        }]
    });

    const UserModel = mongoose.model("User", userSchema);
    module.exports = { UserModel };

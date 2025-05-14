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
            required: true
        },
        phone: {
            type: String
        },
        address: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address"  
        }
    });

    const UserModel = mongoose.model("User", userSchema);
    module.exports = { UserModel };

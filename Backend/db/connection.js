    const mongoose=require("mongoose")
    require("dotenv").config()

    const connection = mongoose.connect(process.env.mongodb)
      .then(() => {
        console.log("MongoDB connected successfully")
        return true
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err)
        return false
      })
    
    module.exports = connection
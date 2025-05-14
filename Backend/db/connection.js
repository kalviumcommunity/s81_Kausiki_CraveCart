    const mongoose=require("mongoose")
    require("dotenv").config()


    const connection=mongoose.connect(process.env.mongodb)
    .then(()=>console.log(`connected`))
    .catch((err)=>console.log(err))
    module.exports=connection
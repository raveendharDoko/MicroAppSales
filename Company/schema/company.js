const mongoose = require("mongoose")

const companySchema = mongoose.Schema({
    companyName:{
        type:String,
        unique:true
    },
    contact:{
        type:String
    }
},{
    timestamps:true,
    versionKey:false
})

module.exports = mongoose.model("company",companySchema)
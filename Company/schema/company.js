const mongoose = require("mongoose")

const companySchema = mongoose.Schema({
    companyName:{
        type:String,
        unique:true
    },
    contact:{
        type:String
    },
    status:{
        type:Number,
        default:1
    }
},{
    timestamps:true,
    versionKey:false
})

module.exports = mongoose.model("company",companySchema)
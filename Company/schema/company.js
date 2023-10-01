const mongoose = require("mongoose")

const companySchema = mongoose.Schema({
    companyName:{
        type:String,
        unique:true
    },
    contactPerson:{
        type:String
    },
    contactPersonMobileNumber:{
        type:Number
    },
    companyMobileNumber:{
        type:Number
    },
    address:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    pincode:{
        type:Number
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

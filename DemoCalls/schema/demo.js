const mongoose = require("mongoose")

let ObjectId = mongoose.Types.ObjectId
const demoAssignSchema = mongoose.Schema({
    callId: {
        type: ObjectId,
        ref:"salesCalls"
    },
    status:{
        type:Number,
        default:0
    },
    assignedTo:{
        type:ObjectId,
        ref:"users"
    },
    assignedBy:{
        type:ObjectId,
        ref:"users"
    },
    remarks:[
        {
            _id:false,
            enteredDate: { type: Date, default: Date.now() },
            data: { type: String }
        }
    ],
},
{
    timestamps:true,
    versionKey:false
})

module.exports = mongoose.model("demoCall",demoAssignSchema)
const mongoose = require("mongoose")

let ObjectId = mongoose.Types.ObjectId
const salesCallSchema = mongoose.Schema({
    companyId: {
        type: ObjectId,
        require: true,
        ref:"company"
    },
    assignedTo: {
        type: ObjectId,
        require: true,
        ref: "users"
    },
    assignedBy: {
        type: ObjectId,
        require: true,
        ref: "users"
    },
    assignedDate: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
    },
    status: {
        type: Number,
        default: 0
    },
    remarks: [
        {
            _id:false,
            enteredDate: { type: Date, default: Date.now() },
            data: { type: String }
        }
    ]
},{
    timestamps:true,
    versionKey:false
})


module.exports = mongoose.model("salesCalls",salesCallSchema)
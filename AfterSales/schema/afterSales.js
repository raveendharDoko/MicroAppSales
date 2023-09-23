const mongoose = require("mongoose")

let ObjectId = mongoose.Types.ObjectId

const afterSalesSchema = mongoose.Schema({
    companyId: {
        type: ObjectId,
        require: true,
        ref: "company"
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
    status: {
        type: Number,
        default:1
    },
    remarks: [
        {
            _id: false,
            remark: { type: String },
            contactPerson: { type: String },
            createdAt: { type: Date, default: Date.now() },
            currentVolume: { type: Number },
            promisedVolume: { type: Number }
        }
    ]
},{
    timestamps:true,
    versionKey:false
})

module.exports = mongoose.model("afterSales",afterSalesSchema)
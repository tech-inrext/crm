import mongoose from "mongoose";

const leadActivitySchema = new mongoose.Schema(
    {
        leadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lead",
            required: true,
            index: true,
        },
        change: {
            type: Object, // Could store key-value pairs of { fieldName: { prev: "oldValue", new: "newValue" } }
            required: true,
        },
        type: { // To differentiate between lead update vs other types if needed, though mostly "update"
            type: String,
            default: "update",
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.LeadActivity ||
    mongoose.model("LeadActivity", leadActivitySchema);

import mongoose, { Schema } from "mongoose";

const EmbeddedDataSchema = mongoose.Schema(
    {
        namspace_itemId: {
            type: String,
            required: true,
        },
        nameSpaceName: {
            type: String,
            required: true,
        },
        metadata: {
            type: Array,
            required: true,
        },
        values: {
            type: Array,
            required: false,
        },
        text: {
            type: String
        },
    },
    {
        timestamps: true,
    },

);

const EmbeddedData = mongoose.model("embdded_data", EmbeddedDataSchema);

export default EmbeddedData;

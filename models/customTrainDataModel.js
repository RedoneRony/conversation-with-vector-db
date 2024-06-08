import mongoose , {Schema} from "mongoose";

const customTrainDataSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    userName: {
        type: String,
    },
    customDataLink: {
      type: String,
      required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: String, // will be Schema.types.ObjectId ( user id )
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
  });

  const CustomTrainDataModel = mongoose.model("custom_train_data", customTrainDataSchema);
  export default CustomTrainDataModel;
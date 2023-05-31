const mongoose = require("mongoose")

const PersonSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    phoneNumber:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    hobbies:{
        type: String,
        required: true
    }
  }, 
);

module.exports = mongoose.model("PersonTB", PersonSchema);
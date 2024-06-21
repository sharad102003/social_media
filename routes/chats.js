const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://sharadchoudhary:sharad123@cluster0.j7z6fes.mongodb.net/instaclone');
// Define the user schema
const chatSchema = new mongoose.Schema({
 
    senderuser: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    receiveruser:{
        type:  mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date:{
        type: Date,
        default: Date.now
    },
    text:{
        type: String,
    }
    
});
// Create the User model
module.exports = mongoose.model('chat', chatSchema);
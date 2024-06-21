const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://sharadchoudhary:sharad123@cluster0.j7z6fes.mongodb.net/instaclone');
// Define the user schema
const commentSchema = new mongoose.Schema({
  
    picture: String,
    user: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date:{
        type: Date,
        default: Date.now
    },
    text:{
        type: String,
    },
    post:{
        type:  mongoose.Schema.Types.ObjectId,
        ref: "post"
    }




});
// Create the User model
module.exports = mongoose.model('comment', commentSchema);
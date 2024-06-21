const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://sharadchoudhary:sharad123@cluster0.j7z6fes.mongodb.net/instaclone');
// Define the user schema
const postSchema = new mongoose.Schema({
  
    picture: String,
    user: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date:{
        type: Date,
        default: Date.now
    },
    likes:[{
        type:  mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    caption: String,

    comments:[{
        type:  mongoose.Schema.Types.ObjectId,
        ref: "comment"

    }]




});
// Create the User model
module.exports = mongoose.model('post', postSchema);



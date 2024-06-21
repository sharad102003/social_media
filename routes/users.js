const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const { stringify } = require('uuid');
mongoose.connect('mongodb+srv://sharadchoudhary:sharad123@cluster0.j7z6fes.mongodb.net/instaclone');
// Define the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
   // required: true,
    unique: true,
  },
  password: {
    type: String
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post', // Assuming you have a Post model as well
    }
  ],

  email: {
    type: String,
   // required: true,
   // unique: true,
  },
  name: {
    type: String,
   // required: true,
  },
  profileImage:{
    type: String
  },
  bio:{
    type:String
  },
  followers:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  ],
  following:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  ],
  comments:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'comment'
    }
  ],
  chats:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'chat'
    }
  ]


  

});
userSchema.plugin(passportLocalMongoose); 
// Create the User model
module.exports = mongoose.model('user', userSchema);



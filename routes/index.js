require('dotenv').config();
var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const chatModel = require("./chats.js");
const commentModel = require("./comment");
const passport = require("passport");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
const upload = require("./multer");
const { redirect } = require('express/lib/response');
const comment = require('./comment');
const uploadOnCloudinary = require('../utility/cloudinary');

router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});
router.get('/chat',  isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate("following");
  res.render('chat', {footer: false,user});
});
router.get('/chat/:id', isLoggedIn, async function(req, res) {
  const userchat = await (await userModel.findOne({ _id: req.params.id})).populate("chats");
  const user =await userModel.findOne({username: req.session.passport.user}).populate("chats");
  const chat = await chatModel.find({
    $or: [
        { receiveruser: req.params.id, senderuser: user._id },
        { receiveruser: user._id, senderuser: req.params.id }
    ]
}).populate("senderuser receiveruser");
   res.render('chatsection', {footer: true,chat,user,userchat});
 });
 router.post('/chatupload/:id', isLoggedIn,async function(req, res) {
  const userchat = await userModel.findOne({ _id: req.params.id})
  const userId = req.params.id;
  const user = await userModel.findOne({username: req.session.passport.user});
  const chat = await chatModel.create({
    senderuser: user._id,
    receiveruser:  req.params.id,
    text: req.body.text,
    
  
  });
  user.chats.push(chat._id);
  userchat.chats.push(chat._id);
  await user.save();
  
  res.redirect(`/chat/${userId}`);

});


router.get('/feed', isLoggedIn,async function(req, res) {
 const posts = await postModel.find().populate("user");
 const user = await userModel.findOne({username: req.session.passport.user}).populate("following");
  res.render('feed', {footer: true,posts,user});
  console.log(user);
});

router.post('/delete/:id', isLoggedIn,async function(req, res) {
 
  const post = await postModel.findOne({ _id: req.params.id})
  const postId = post._id;
  const result = await postModel.deleteOne({ _id: req.params.id });
  const user = await userModel.findOne({username: req.session.passport.user});
  user.posts.splice(user.posts.indexOf(postId),1);
  await user.save();

  res.redirect('/feed');
});

router.get('/comment/:id', isLoggedIn,async function(req, res) {
  const posts = await postModel.findOne({ _id: req.params.id}).populate({
    path: 'comments',
    populate: {
      path: 'user',
      model: 'user',
    },
  });
  const user = await userModel.findOne({username: req.session.passport.user});
   res.render('comment', {footer: true,posts,user});
 });

 router.post('/commentupload/:id', isLoggedIn,async function(req, res) {
  const posts = await postModel.findOne({ _id: req.params.id})
  const postId = req.params.id;
  const user = await userModel.findOne({username: req.session.passport.user});
  const comment = await commentModel.create({
    user: user._id,
    text: req.body.comment,
    post: posts._id
  });
  posts.comments.push(comment._id)
  await posts.save();
  
  res.redirect(`/comment/${postId}`);

});


router.get('/profile',isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate("posts");

  res.render('profile', {footer: true,user});
});

router.get('/follow/:id',isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.findOne({ _id: req.params.id}).populate("user");

  if(post.user.followers.indexOf(user._id)===-1)
{
  post.user.followers.push(user._id);
  user.following.push(post.user._id);
}
else{
  post.user.followers.splice(post.user.followers.indexOf(user._id),1);
  user.following.splice(user.following.indexOf(post.user._id),1);
  
}
await post.user.save();
await user.save();

  res.render('specific', {footer: true,post,user});

});


router.get('/profile/:id', isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate("posts");

  const post = await postModel.findOne({ _id: req.params.id}).populate({
    path: 'user',
    populate: {
      path: 'posts',
      model: 'post',
    },
  });
 if(post.user.username === user.username){
  res.render('profile', {footer: true,user});
  }
  else{
    res.render('specific', {footer: true,post,user});}
});
router.get('/search', isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('search', {footer: true,user});
});


router.get('/like/post/:id', isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.findOne({ _id: req.params.id});

  if(post.likes.indexOf(user._id)===-1)
  {
    post.likes.push(user._id);
  }
  else{
    post.likes.splice(post.likes.indexOf(user._id),1);
  }
  await post.save();
  res.redirect("/feed");
  
});

router.get('/edit', isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('edit', {footer: true,user});
});

router.get('/upload', isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('upload', {footer: true,user});
});

router.post('/register', function(req, res) {
 const userData = new userModel({
  username: req.body.username,
  email: req.body.email,
  name: req.body.name,
 
});

userModel.register(userData, req.body.password) //iss line se account banta h 
.then(function(){
  passport.authenticate("local")(req,res, function(){
    res.redirect("/profile");
  })
  })

});
router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",

}), function(req, res, next) {
  // This function won't be called
});

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next(); // corrected from req.authenticated()
  res.redirect("/login");
}
router.post('/update', upload.single('image'), async function(req, res, next) {
  try {
    const user = await userModel.findOneAndUpdate(
      { username: req.session.passport.user },
      { username: req.body.username, name: req.body.name, bio: req.body.bio },
      { new: true }
    );

    if (req.file) {
      console.log('File uploaded:', req.file);
      const profilePath = req.file.path;
      const profileUrl = await uploadOnCloudinary(profilePath);
      console.log('Profile URL:', profileUrl);
      user.profileImage = profileUrl;
    } else {
      console.log('No file uploaded');
    }

    await user.save();
    res.redirect("/profile");
  } catch (error) {
    next(error);
  }
});

router.post('/upload', isLoggedIn, upload.single('image'), async function(req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });

    let uploadUrl = null; // Initialize uploadUrl

    if (req.file) {
      const uploadPath = req.file.path;
      uploadUrl = await uploadOnCloudinary(uploadPath); // Assign the result to uploadUrl
    } else {
      console.log('No file uploaded');
    }

    // Ensure that uploadUrl is only used if it is not null
    const post = await postModel.create({
      picture: uploadUrl,
      user: user._id,
      caption: req.body.caption
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/feed");
  } catch (error) {
    console.error('Error in /upload route:', error);
    res.status(500).send('Internal Server Error');
  }
});



module.exports= router;

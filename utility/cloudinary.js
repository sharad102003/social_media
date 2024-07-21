router.post('/upload', isLoggedIn, upload.single('image'), async function(req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    console.log('User found:', user);

    let uploadUrl = null;

    if (req.file) {
      const buffer = req.file.buffer;
      console.log('Buffer to upload:', buffer);
      uploadUrl = await uploadOnCloudinary(buffer); // Upload the file buffer to Cloudinary
      console.log('Upload URL:', uploadUrl);
    } else {
      console.log('No file uploaded');
    }

    // Create a new post with the Cloudinary URL
    const post = await postModel.create({
      picture: uploadUrl,
      user: user._id,
      caption: req.body.caption
    });

    console.log('Post created:', post);

    user.posts.push(post._id);
    await user.save();
    res.redirect("/feed");
  } catch (error) {
    console.error('Error in /upload route:', error);
    res.status(500).send('Internal Server Error');
  }
});

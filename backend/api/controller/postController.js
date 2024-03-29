import postModel from "../../database/models/postModel.js";
import userModel from "../../database/models/userModel.js";

const create = async (req, res) => {
  try {
    if (req.body.likes && req.body.likes.length > 0) {
      return res.status.json(400).json("no likes during create post");
    }
    const post = new postModel(req.body);
    await post.save();
    return res.status(200).json(post._doc);
  } catch (error) {
    console.log(`create => ${error.message}`);
    return res.status(500).json("server error");
  }
};

const update = async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) {
      return res.status(400).json("post not found");
    }
    if (post.userId !== req.body.userId) {
      return res.status(400).json("you can update only your post");
    }
    if (req.body.likes) {
      return res.status(400).json("cannot change likes");
    }
    await post.updateOne({ $set: req.body });
    return res.status(200).json("post updated");
  } catch (error) {
    console.log(`update => ${error.message}`);
    return res.status(500).json("server error");
  }
};

const remove = async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) {
      return res.status(400).json("post not found");
    }
    if (post.userId !== req.body.userId) {
      return res.status(400).json("you can delete only your post");
    }
    await post.deleteOne();
    return res.status(200).json("post deleted");
  } catch (error) {
    console.log(`remove => ${error.message}`);
    return res.status(500).json("server error");
  }
};

const like_dislike = async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) {
      return res.status(400).json("post not found");
    }
    if (post.likes.includes(req.body.userId)) {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      return res.status(200).json("disliked");
    }
    await post.updateOne({ $push: { likes: req.body.userId } });
    return res.status(200).json("liked");
  } catch (error) {
    console.log(`like/dislike => ${error.message}`);
    return res.status(500).json("server error");
  }
};

const get = async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) {
      return res.status(400).json("post not found");
    }
    return res.status(200).json(post);
  } catch (error) {
    console.log(`getPost => ${error.message}`);
    return res.status(500).json("server error");
  }
};

const getAll = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    if (!user) {
      return res.status(400).json("user does not exist");
    }
    const userPosts = await postModel.findById(user._id);
    const friendPosts = await Promise.all(
      user.following.map((id) => {
        return postModel.findById(id);
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (error) {
    console.log(`getAllPost => ${error.message}`);
    return res.status(500).json("server error");
  }
};

export { create, update, remove, like_dislike, get, getAll };

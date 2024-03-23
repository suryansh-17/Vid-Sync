import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(401, "videoId not found");
  }

  try {
    const condition = {
      likedby: req.user?._id,
      video: videoId,
    };
    const comment = await Like.findOne(condition);
    if (!comment) {
      const createLike = await Like.create(condition);
      return res
        .status(200)
        .json(new ApiResponse(200, { createLike }, "successfully liked video"));
    } else {
      const removeLike = await Like.findOneAndDelete(condition);
      return res
        .status(200)
        .json(new ApiResponse(200, { removeLike }, "removed like"));
    }
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  try {
    const condition = { LikedBy: req.user?._id, comment: commentId };
    const comment = await Like.findOne(condition);
    if (!comment) {
      const createLike = await Like.create(condition);
      return res
        .status(200)
        .json(new ApiResponse(200, { createLike }, "Success"));
    } else {
      const removeLike = await Like.findOneAndDelete(condition);
      return res
        .status(200)
        .json(new ApiResponse(200, { removeLike }, "Success"));
    }
  } catch (e) {
    throw new ApiError(400, e.message || "Something went wrong");
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  try {
    const condition = { LikedBy: req.user._id, tweet: tweetId };
    const like = await Like.findOne(condition);
    if (!like) {
      const createLike = await Like.create(condition);
      return res
        .status(200)
        .json(
          new ApiResponse(200, { createLike }, "LikedBy Successfully Created")
        );
    } else {
      const removeLike = await Like.findOneAndDelete(condition);
      return res
        .status(200)
        .json(new ApiResponse(200, { removeLike }, "Successfully Deleted"));
    }
  } catch (e) {
    throw new ApiError(400, e.message);
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  try {
    const allLiked = await Like.find({
      LikedBy: req.user._id,
      video: { $exists: true },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { allLiked }, "Successfully"));
  } catch (e) {
    throw new ApiError(400, e.message);
  }
});

export { getLikedVideos, toggleCommentLike, toggleVideoLike, toggleTweetLike };

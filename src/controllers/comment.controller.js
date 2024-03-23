import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  try {
    const allComments = await Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: parseInt(limit, 10),
      },
    ]);
    return res
      .status(200)
      .json(new ApiResponse(200, { allComments }, "Success"));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

const addComment = asyncHandler(async (req, res) => {
  console.log(req.params, req.body);
  const { videoId } = req.params;
  const { content } = req.body;
  if (!content) {
    throw new ApiError(402, "content field empty");
  }
  const comment = await Comment.create({
    content: content,
    video: videoId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(401, "unable to add new comment");
  }

  return res.status(200).json(new ApiResponse(200, comment, "comment added"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { updatedContent } = req.body;

  if (!commentId) {
    throw new ApiError(401, "comment id not found");
  }
  if (!updatedContent) {
    throw new ApiError(401, "add updated content");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: updatedContent,
      },
    },
    { new: true }
  );
  console.log(updatedComment);
  if (!updatedComment) {
    throw new ApiError(400, "error found while updating comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "updated comment"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(401, "comment id not found");
  }
  const commentDelete = await Comment.findByIdAndDelete(commentId);
  return res.status(200).json(new ApiResponse(200, {}, "comment deleted"));
});

export { addComment, deleteComment, updateComment, getVideoComment };

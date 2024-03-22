import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllVideos = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
});

const publishVideo = asyncHandler(async (req, res) => {
  //1 getting title and desc from frontend
  const { title, description } = req.body;
  if (!(title && description)) {
    throw new ApiError(400, "user should provide title and discription");
  }
  //2 getting video file
  console.log(req);
  const videoLocalPath = req.files?.video[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "video path is required");
  }

  if (!thumbnailLocalPath) {
    throw ApiError(400, "thumbnail path is required");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  const videoData = await Video.create({
    videoFile: video?.url,
    thumbnail: thumbnail?.url,
    title,
    description,
    duration: video.duration,
    views: 0,
    isPublished: true,
    owner: req.user?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, videoData, "video published"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const videoUrl = await Video.findById(videoId);
  console.log(videoUrl);

  if (!videoUrl) throw new ApiError(404, "video not found");

  return res
    .status(200)
    .json(new ApiResponse(200, { videoUrl }, "successfully retrived video"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "cannot find the video");
  }

  if (!video.owner.equals(req.user?._id)) {
    throw new ApiError(401, "user not owner of this video");
  }
  const { title, description } = req.body;
  //upload new vid
  console.log(req.file);
  const thumbnailLocalPath = req.file.path;
  console.log(thumbnailLocalPath);
  //upload to cloudnary
  const updatedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  console.log(updatedThumbnail);
  //change vidurl in databse
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: updatedThumbnail?.url,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "update successfull"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "cannot find vid id");
  }

  const video = await Video.findById(videoId);

  if (!video.owner.equals(req.user?._id)) {
    throw ApiError(401, "user not authorized");
  }

  const deleteVideo = await Video.findByIdAndDelete(videoId);
  console.log(deleteVideo);
  return new res.status(200).json(new ApiResponse(200, {}, "video deleted"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "cannot find vid id");
  }

  const video = await Video.findById(videoId);

  if (!video.owner.equals(req.user?._id)) {
    throw ApiError(401, "user not authorized");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    { new: true }
  );

  if (!updateVideo) {
    throw new ApiError(500, "something went wrong while toggling status");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateVideo,
        "Publish status of vid is toggled successfully"
      )
    );
});
export {
  togglePublishStatus,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  getAllVideos,
};

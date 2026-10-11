import { uploadOnCloudinary } from "../config/cloudinary.js";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const sender = req.userId;
    const { receiver } = req.params;
    const { message } = req.body;

    if (String(sender) === String(receiver)) {
      return res.status(400).json({
        message: "You cannot send a message to yourself.",
      });
    }

    if (!message?.trim() && !req.file) {
      return res.status(400).json({
        message: "Please send text or an image.",
      });
    }

    let image = "";

    if (req.file) {
      const uploadedImage = await uploadOnCloudinary(req.file.path);
      image =
        typeof uploadedImage === "string"
          ? uploadedImage
          : uploadedImage?.secure_url || uploadedImage?.url || "";
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] },
    });

    const newMessage = await Message.create({
      sender,
      receiver,
      message: message?.trim() || "",
      image,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [sender, receiver],
        messages: [newMessage._id],
      });
    } else {
      conversation.messages.push(newMessage._id);
      await conversation.save();
    }

    // Include sender details for the recipient's message UI.
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name profilePic")
      .populate("receiver", "name profilePic");

    // Send the message in real time to the recipient.
    const receiverSocketId = getReceiverSocketId(receiver);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMessage);
    }

    // Return the same populated message to the sender.
    return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const sender = req.userId;
    const { receiver } = req.params;

    const conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] },
    }).populate({
      path: "messages",
      populate: [
        { path: "sender", select: "name profilePic" },
        { path: "receiver", select: "name profilePic" },
      ],
    });

    if (!conversation) {
      return res.status(200).json([]);
    }

    return res.status(200).json(conversation.messages);
  } catch (error) {
    console.error("Error in getMessages:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
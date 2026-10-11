import React, { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import EmojiPicker from "emoji-picker-react";

import {
  FiArrowLeft,
  FiMessageCircle,
  FiSend,
  FiImage,
  FiSmile,
  FiX,
} from "react-icons/fi";

import { setSelectedUser } from "../redux/userSlice";

import {
  setMessages,
  addMessage,
  clearMessages,
} from "../redux/messageSlice";

import { serverUrl } from "../main";

import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";

import "./MessageArea.css";

const MessageArea = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userData, selectedUser, socket } = useSelector(
    (state) => state.user
  );

  const { messages } = useSelector(
    (state) => state.message
  );

  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const initial = (user) =>
    user?.name?.charAt(0)?.toUpperCase() || "U";

  // Fetch messages for the selected conversation.
  useEffect(() => {
    if (!selectedUser?._id) {
      dispatch(clearMessages());
      return;
    }

    let cancelled = false;

    const fetchMessages = async () => {
      dispatch(clearMessages());
      setLoadingMessages(true);
      setError("");

      try {
        const result = await axios.get(
          `${serverUrl}/api/message/get/${selectedUser._id}`,
          {
            withCredentials: true,
          }
        );

        if (!cancelled) {
          dispatch(setMessages(result.data));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Fetch messages error:", err);

          if (err.response?.status === 404) {
            dispatch(setMessages([]));
          } else {
            setError(
              err.response?.data?.message ||
                "Could not load messages."
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    };

    fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [selectedUser?._id, dispatch]);

  // Receive real-time messages through Socket.IO.
  useEffect(() => {
    if (!socket || !selectedUser?._id || !userData?._id) {
      return;
    }

    const handleNewMessage = (newMessage) => {
      const senderId =
        typeof newMessage.sender === "object"
          ? newMessage.sender?._id
          : newMessage.sender;

      const receiverId =
        typeof newMessage.receiver === "object"
          ? newMessage.receiver?._id
          : newMessage.receiver;

      const currentUserId = String(userData._id);
      const selectedUserId = String(selectedUser._id);

      const belongsToCurrentConversation =
        (String(senderId) === selectedUserId &&
          String(receiverId) === currentUserId) ||
        (String(senderId) === currentUserId &&
          String(receiverId) === selectedUserId);

      if (!belongsToCurrentConversation) {
        return;
      }

      dispatch(addMessage(newMessage));
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser?._id, userData?._id, dispatch]);

  // Scroll to the latest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loadingMessages]);

  // Clean up the image preview URL.
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setError("");
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };

  const handleEmojiClick = (emojiData) => {
    setText((previousText) => previousText + emojiData.emoji);
    setShowEmoji(false);
  };

  // Send a message or image.
  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!selectedUser?._id || sending) return;

    const trimmedText = text.trim();

    if (!trimmedText && !image) return;

    const formData = new FormData();

    formData.append("message", trimmedText);

    if (image) {
      formData.append("image", image);
    }

    setSending(true);
    setError("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/message/send/${selectedUser._id}`,
        formData,
        {
          withCredentials: true,
        }
      );

      // Add the sent message to the sender's chat.
      dispatch(addMessage(result.data));

      setText("");
      removeImage();
      setShowEmoji(false);
    } catch (err) {
      console.error("Send message error:", err);

      setError(
        err.response?.data?.message ||
          "Could not send message."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={`message-area ${
        selectedUser ? "chat-open" : "welcome-open"
      }`}
    >
      {selectedUser ? (
        <>
          {/* Chat header */}
          <div className="chat-header">
            <button
              type="button"
              className="back-button"
              onClick={() => dispatch(setSelectedUser(null))}
              aria-label="Back to users"
            >
              <FiArrowLeft />
            </button>

            <div
              className="chat-avatar"
              onClick={() => navigate("/profile")}
            >
              {selectedUser.profilePic ? (
                <img
                  src={selectedUser.profilePic}
                  alt={selectedUser.name}
                />
              ) : (
                <span>{initial(selectedUser)}</span>
              )}
            </div>

            <div className="chat-user-info">
              <h3>{selectedUser.name}</h3>
              <span className="chat-user-status">
                Chat conversation
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-body">
            {loadingMessages ? (
              <div className="chat-status">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="empty-chat">
                <FiMessageCircle />
                <h3>Start a conversation</h3>
                <p>
                  Send a message, emoji, or picture to{" "}
                  {selectedUser.name}.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const senderId =
                  typeof message.sender === "object"
                    ? message.sender?._id
                    : message.sender;

                const currentUserId = userData?._id;

                const isSender =
                  senderId != null &&
                  currentUserId != null &&
                  String(senderId) === String(currentUserId);

                return isSender ? (
                  <SenderMessage
                    key={message._id}
                    message={message}
                  />
                ) : (
                  <ReceiverMessage
                    key={message._id}
                    message={message}
                  />
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error message */}
          {error && (
            <div className="message-error" role="alert">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <FiX />
              </button>
            </div>
          )}

          {/* Image preview */}
          {imagePreview && (
            <div className="image-preview-container">
              <img
                src={imagePreview}
                alt="Selected attachment"
                className="image-preview"
              />

              <button
                type="button"
                className="remove-image-button"
                onClick={removeImage}
                aria-label="Remove image"
              >
                <FiX />
              </button>
            </div>
          )}

          {/* Message input */}
          <form
            className="message-input-area"
            onSubmit={handleSendMessage}
          >
            <div className="message-toolbar">
              <button
                type="button"
                className="tool-button"
                onClick={() =>
                  setShowEmoji((previous) => !previous)
                }
                aria-label="Add emoji"
                title="Add emoji"
              >
                <FiSmile />
              </button>

              <button
                type="button"
                className="tool-button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach image"
                title="Attach image"
              >
                <FiImage />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </div>

            {showEmoji && (
              <div className="emoji-picker-container">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  height={350}
                  width="100%"
                />
              </div>
            )}

            <input
              type="text"
              className="message-input"
              placeholder={`Message ${selectedUser.name}...`}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onFocus={() => setShowEmoji(false)}
              aria-label="Type a message"
            />

            <button
              type="submit"
              className="send-button"
              disabled={sending || (!text.trim() && !image)}
              aria-label="Send message"
              title="Send message"
            >
              <FiSend />
            </button>
          </form>
        </>
      ) : (
        <div className="welcome-screen">
          <FiMessageCircle />
          <h2>Welcome to Chatly</h2>
          <p>
            Hello {userData?.name || "there"}! Select a user
            to start chatting.
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageArea;
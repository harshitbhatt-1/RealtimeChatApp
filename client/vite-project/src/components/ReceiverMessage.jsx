import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import "./ReceiverMessage.css";

const ReceiverMessage = ({ message }) => {
  const scroll = useRef(null);
  const { selectedUser } = useSelector((state) => state.user);

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const handleImageScroll = () => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Works with both populated sender objects and plain sender IDs.
  const sender =
    message.sender && typeof message.sender === "object"
      ? message.sender
      : selectedUser;

  const profilePic = sender?.profilePic;

  const initial =
    sender?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div ref={scroll} className="message-row receiver-row">
      <div className="message-profile-avatar">
        {profilePic ? (
          <img
            src={profilePic}
            alt={sender?.name || "User"}
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>

      <div className="message-bubble receiver-bubble">
        {message.image && (
          <a
            href={message.image}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={message.image}
              alt="Received attachment"
              className="message-image"
              onLoad={handleImageScroll}
            />
          </a>
        )}

        {message.message && (
          <p className="message-text">{message.message}</p>
        )}

        <span className="message-time">{time}</span>
      </div>
    </div>
  );
};

export default ReceiverMessage;
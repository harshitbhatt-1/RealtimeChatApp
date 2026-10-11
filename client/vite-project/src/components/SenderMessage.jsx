import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import "./SenderMessage.css";

const SenderMessage = ({ message }) => {
  const scroll = useRef(null);
  const { userData } = useSelector((state) => state.user);

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

  const profilePic = userData?.profilePic;

  const initial =
    userData?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div ref={scroll} className="message-row sender-row">
      <div className="message-bubble sender-bubble">
        {message.image && (
          <a
            href={message.image}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={message.image}
              alt="Sent attachment"
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

      <div className="message-profile-avatar">
        {profilePic ? (
          <img
            src={profilePic}
            alt={userData?.name || "You"}
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>
    </div>
  );
};

export default SenderMessage;
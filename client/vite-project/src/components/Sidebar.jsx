import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiSearch, FiLogOut, FiX } from "react-icons/fi";

import {
  setSelectedUser,
  setUserData,
  setOtherUserData,
  setOnlineUsers,
  setSearchData,
} from "../redux/userSlice";

import { serverUrl } from "../main";

import "./Sidebar.css";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userData, otherUserData, selectedUser, onlineUsers, searchData } =
    useSelector((state) => state.user);

  const [showSearch, setShowSearch] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const users = Array.isArray(otherUserData) ? otherUserData : [];

  const onlineUserIds = Array.isArray(onlineUsers)
    ? onlineUsers.map(String)
    : [];

  const isOnline = (userId) => onlineUserIds.includes(String(userId));
  const profileImage = (user) => user?.profilePic || "";
  const initial = (user) => user?.name?.charAt(0)?.toUpperCase() || "U";

  // All users except me
  const otherUsers = users.filter(
    (user) => user?._id && String(user._id) !== String(userData?._id)
  );

  const isSearching = showSearch && input.trim().length > 0;

  // Search API (debounced)
  useEffect(() => {
    const query = input.trim();

    if (!showSearch || !query) {
      dispatch(setSearchData(null));
      setLoading(false);
      setSearchError("");
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setSearchError("");

        const response = await axios.get(`${serverUrl}/api/user/search`, {
          params: { query },
          withCredentials: true,
        });

        if (!cancelled) dispatch(setSearchData(response.data));
      } catch (error) {
        if (!cancelled) {
          console.error("Search error:", error.response?.data || error.message);
          dispatch(setSearchData([]));
          setSearchError("Unable to search users.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [input, showSearch, dispatch]);

  const toggleSearch = () => {
    if (showSearch) {
      setShowSearch(false);
      setInput("");
      dispatch(setSearchData(null));
    } else {
      setShowSearch(true);
    }
  };

  const openChat = (user) => {
    if (!user?._id) return;
    if (String(user._id) === String(userData?._id)) return;
    dispatch(setSelectedUser(user));
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(setUserData(null));
      dispatch(setSelectedUser(null));
      dispatch(setOtherUserData([]));
      dispatch(setOnlineUsers([]));
      dispatch(setSearchData(null));
      navigate("/login");
    }
  };

  const renderAvatar = (user) => (
    <div className="sb-avatar">
      {profileImage(user) ? (
        <img
          src={profileImage(user)}
          alt={user?.name || "User"}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span className="sb-avatar-initial">{initial(user)}</span>
      )}

      {isOnline(user?._id) && <span className="sb-online-dot" />}
    </div>
  );

  // List shown below the header
  const displayedUsers = isSearching
    ? Array.isArray(searchData)
      ? searchData
      : []
    : otherUsers;

  // Remove duplicates (search results may include me, like in your design)
  const uniqueUsers = displayedUsers.filter(
    (user, index, array) =>
      user?._id &&
      array.findIndex((item) => String(item?._id) === String(user._id)) ===
        index
  );

  // ONLY online users near the search icon
  const quickUsers = otherUsers.filter((user) => isOnline(user._id));

  return (
    <aside className={`sb-sidebar ${selectedUser ? "sb-mobile-hidden" : ""}`}>
      {/* Blue header */}
      <div className="sb-header">
        <h2 className="sb-brand">chatly</h2>

        <div className="sb-heading">
          <h3>Hii , {userData?.name || "there"}</h3>

          <button
            type="button"
            className="sb-profile-btn"
            onClick={() => navigate("/profile")}
            aria-label="Open profile"
          >
            {profileImage(userData) ? (
              <img
                className="sb-profile"
                src={profileImage(userData)}
                alt="My profile"
              />
            ) : (
              <span className="sb-profile sb-profile-initial">
                {initial(userData)}
              </span>
            )}
          </button>
        </div>

        {showSearch ? (
          <div className="sb-search-bar">
            <FiSearch className="sb-search-bar-icon" />

            <input
              type="text"
              className="sb-search-input"
              placeholder="Search users..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              autoFocus
              aria-label="Search users"
            />

            <button
              type="button"
              className="sb-search-close"
              onClick={toggleSearch}
              aria-label="Close search"
            >
              <FiX />
            </button>
          </div>
        ) : (
          <div className="sb-shortcuts">
            <button
              type="button"
              className="sb-circle-btn sb-search-btn"
              onClick={toggleSearch}
              title="Search users"
              aria-label="Search users"
            >
              <FiSearch />
            </button>

            {quickUsers.map((user) => (
              <button
                type="button"
                key={user._id}
                className="sb-circle-btn sb-quick-user"
                onClick={() => openChat(user)}
                title={user.name || "User"}
              >
                {profileImage(user) ? (
                  <img
                    src={profileImage(user)}
                    alt={user.name || "User"}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="sb-quick-initial">{initial(user)}</span>
                )}

                <span className="sb-online-dot" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User list */}
      <div className={`sb-list ${isSearching ? "sb-search-mode" : ""}`}>
        {isSearching && loading ? (
          <p className="sb-empty">Searching...</p>
        ) : isSearching && searchError ? (
          <p className="sb-empty">{searchError}</p>
        ) : uniqueUsers.length > 0 ? (
          uniqueUsers.map((user) => (
            <button
              type="button"
              key={user._id}
              className={`sb-item ${
                String(selectedUser?._id) === String(user._id) ? "active" : ""
              }`}
              onClick={() => openChat(user)}
            >
              {renderAvatar(user)}
              <span className="sb-name">{user.name}</span>
            </button>
          ))
        ) : (
          <p className="sb-empty">
            {isSearching ? "No matching users found." : "No other users found."}
          </p>
        )}
      </div>

      {/* Logout */}
      <button
        type="button"
        className="sb-logout"
        onClick={handleLogout}
        title="Logout"
        aria-label="Logout"
      >
        <FiLogOut />
      </button>
    </aside>
  );
};

export default Sidebar;
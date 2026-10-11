import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Signup from "./pages/SignUp.jsx";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";

import getCurrentUser from "./hooks/getCurrentUser.jsx";
import { useDispatch, useSelector } from "react-redux";
import getOtherUser from "./hooks/getOtherUser.jsx";
import {io} from 'socket.io-client'
import { serverUrl } from "./main.jsx";
import { setOnlineUsers, setSocket } from "./redux/userSlice.js";

const App = () => {

  getCurrentUser();
  getOtherUser();

  const { userData} = useSelector((state) => state.user);

  const dispatch = useDispatch()

  useEffect(() => {
  if (!userData?._id) {
    dispatch(setOnlineUsers([]));
    return;
  }

  const socketio = io(serverUrl, {
    query: {
      userId: userData._id,
    },
  });

  dispatch(setSocket(socketio));

  socketio.on("getOnlineUsers", (users) => {
    dispatch(setOnlineUsers(users));
  });

  return () => {
    socketio.off("getOnlineUsers");
    socketio.disconnect();
    dispatch(setSocket(null));
  };
}, [userData?._id, dispatch]);

  return (
    <Routes>
  {/* Home */}
  <Route
    path="/"
    element={
      userData ? <Home /> : <Navigate to="/login" replace />
    }
  />

  {/* Login */}
  <Route
    path="/login"
    element={
      !userData ? <Login /> : <Navigate to="/" replace />
    }
  />

  {/* Signup */}
  <Route
    path="/signup"
    element={
      !userData ? <Signup /> : <Navigate to="/" replace />
    }
  />

  {/* Profile */}
  <Route
    path="/profile"
    element={
      userData ? <Profile /> : <Navigate to="/login" replace />
    }
  />

  {/* Invalid routes */}
  <Route
    path="*"
    element={<Navigate to="/" replace />}
  />
</Routes>
  );
};

export default App;
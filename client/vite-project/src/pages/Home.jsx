import React from "react";
import { useSelector } from "react-redux";

import Sidebar from "../components/Sidebar.jsx";
import MessageArea from "../components/MessageArea.jsx";

import "./Home.css";

const Home = () => {
  const { selectedUser } = useSelector((state) => state.user);

  return (
    <div className={`home ${selectedUser ? "home-chat" : "home-list"}`}>
      <Sidebar />
      <MessageArea />
    </div>
  );
};

export default Home;
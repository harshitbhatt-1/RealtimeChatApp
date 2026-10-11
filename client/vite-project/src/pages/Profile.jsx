import React, { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { IoArrowBack } from "react-icons/io5";
import { FaCamera } from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux";

import axios from "axios";

import dp from "../assets/profiledp.jpeg";

import { serverUrl } from "../main";
import { setUserData } from "../redux/userSlice";

import "./Profile.css";


const Profile = () => {

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);


  // -------------------------
  // States
  // -------------------------

  const [name, setName] = useState("");

  const [frontendImage, setFrontendImage] = useState(dp);

  const [backendImage, setBackendImage] = useState(null);

  const [saving, setSaving] = useState(false);


  // Reference to file input
  const image = useRef(null);


  // -------------------------
  // Set existing user data
  // -------------------------

  useEffect(() => {

    if (userData) {

      setName(userData.name || "");

      setFrontendImage(
        userData.profilePic || dp
      );

    }

  }, [userData]);


  // -------------------------
  // Image change
  // -------------------------

  const handleImageChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setBackendImage(file);

  const imageUrl = URL.createObjectURL(file);

  setFrontendImage(imageUrl);
};


  // -------------------------
  // Update Profile
  // -------------------------

  const handleProfile = async (e) => {
  e.preventDefault();

  setSaving(true);

  try {
    const formData = new FormData();

    formData.append("name", name);

    if (backendImage) {
      formData.append("image", backendImage);
    }

    const result = await axios.put(
      `${serverUrl}/api/user/profile`,
      formData,
      {
        withCredentials: true,
      }
    );

    dispatch(setUserData(result.data));

    alert("Profile updated successfully");

    navigate("/");

  } catch (error) {
    console.log(error);

    alert(
      error.response?.data?.message ||
      "Something went wrong"
    );

  } finally {
    setSaving(false);
  }
};


  return (

    <div className="profile-page">


      {/* Back Arrow */}

      <button
        className="back-btn"
        onClick={() => navigate("/")}
      >
        <IoArrowBack />
      </button>


      <div className="profile-container">


        {/* -------------------------
            Profile Picture
        ------------------------- */}

        <div className="profile-pic-wrapper">

          <img
            src={frontendImage}
            alt="Profile"
            className="profile-pic"
            onClick={() => image.current.click()}
          />


          <button
            type="button"
            className="camera-btn"
            onClick={() => image.current.click()}
          >
            <FaCamera />
          </button>


          {/* Hidden file input */}

          <input
  type="file"
  accept="image/*"
  hidden
  ref={image}
  onChange={handleImageChange}
/>

        </div>


        {/* -------------------------
            Profile Form
        ------------------------- */}

        <form
          className="profile-form"
          onSubmit={handleProfile}
        >


          {/* Name */}

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />


          {/* Username */}

          <input
            type="text"
            value={userData?.username || ""}
            readOnly
          />


          {/* Email */}

          <input
            type="email"
            value={userData?.email || ""}
            readOnly
          />


          {/* Save */}

          <button
            type="submit"
            className="save-btn"
            disabled={saving}
          >

            {saving ? "Saving..." : "Save profile"}

          </button>


        </form>

      </div>

    </div>

  );

};


export default Profile;
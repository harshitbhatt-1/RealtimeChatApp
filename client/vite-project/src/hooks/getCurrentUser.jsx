import { useEffect } from "react";

import { useDispatch } from "react-redux";
import axios from "axios";

import { serverUrl } from "../main";
import { setUserData } from "../redux/userSlice";

const getCurrentUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/user/current`,
          {
            withCredentials: true,
          }
        );

        dispatch(setUserData(result.data.user));
      } catch (error) {
        console.error(
          "Fetch current user error:",
          error.response?.data || error.message
        );
      }
    };

    fetchUser();
  }, [dispatch]);
};

export default getCurrentUser;
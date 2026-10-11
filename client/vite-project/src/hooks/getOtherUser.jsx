import { useEffect } from "react";
import { serverUrl } from "../main";
import axios from "axios";
import { setOtherUserData } from "../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";

const getOtherUser = () => {
const dispatch = useDispatch();
const { userData } = useSelector((state) => state.user);

useEffect(() => {
const fetchUser = async () => {
try {
const result = await axios.get(
`${serverUrl}/api/user/others`,
{ withCredentials: true }
);


    dispatch(setOtherUserData(result.data));
  } catch (error) {
    console.log("Error fetching other users:", error);
  }
};

if (userData) {
  fetchUser();
}


}, [userData, dispatch]);
};

export default getOtherUser;

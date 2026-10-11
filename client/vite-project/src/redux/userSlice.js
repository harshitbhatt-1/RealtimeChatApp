import { createSlice } from "@reduxjs/toolkit"

const userSlice = createSlice({
  name:"user",
  initialState:{
    userData:null,
    otherUserData:[],
    selectedUser:null,
    socket:null,
    onlineUsers:[],
    searchData:null
  },
  reducers:{
    setUserData:(state,action)=>{
      state.userData = action.payload
    },
    setOtherUserData:(state,action)=>{
      state.otherUserData = action.payload
    },
    setSelectedUser:(state,action)=>{
      state.selectedUser = action.payload
    },
    setSocket:(state,action)=>{
      state.socket = action.payload
    },
    setOnlineUsers:(state,action)=>{
      state.onlineUsers = action.payload
    },
    setSearchData:(state,action)=>{
      state.searchData = action.payload
    },
    
    
  }
})

export const {setUserData, setOtherUserData, setSelectedUser , setOnlineUsers , setSocket, setSearchData} = userSlice.actions

export default userSlice.reducer
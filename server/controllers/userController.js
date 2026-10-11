import User from "../models/userModel.js";
import { uploadOnCloudinary } from '../config/cloudinary.js';

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId; // ID middleware se mili

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      user
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};




export const editProfile = async (req, res) => {
    try {
        const { name } = req.body;

        const updateData = {};

        if (name !== undefined) {
            updateData.name = name;
        }

        if (req.file) {
            const imageUrl = await uploadOnCloudinary(req.file.path);

            if (!imageUrl) {
                return res.status(500).json({
                    message: "Image upload failed"
                });
            }

            updateData.profilePic = imageUrl;
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};



export const getOtherUser = async (req, res) => {
  try{
    let users = await User.find({_id: {$ne: req.userId}}).select("-password");

    return res.status(200).json(users);
  }
  catch(error){
    console.error(error);
   
    return res.status(500).json({
      message: "Internal server error"
    });
  } 
}


export const search = async(req,res) => {
  try{
    const {query} = req.query
    if(!query){
      return res.status(400).json({
        message:"query is required"
      })
    }

    const users = await User.find({
      $or:[
        {name:{$regex:query,$options:"i"}},
        {userName:{$regex:query,$options:"i"}}
      ]
    })
    return res.status(200).json(users)
  }
  catch(error){
      return res.status(500).json(error)
  }
}
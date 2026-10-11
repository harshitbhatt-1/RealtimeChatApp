import genToken from "../config/token.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        if(password.length<6){
            return res.status(400).json({
                message: "Password Must contain atleast 6 characters"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // creating token
        
        const token = await genToken(user._id)

        // putting in cookies

        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000
          });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.log("Signup error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = await genToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successful",
            user
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


export const logout = async (req, res) => {
    try {
        res.clearCookie("token");

        return res.status(200).json({
            message: "Logout successful"
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

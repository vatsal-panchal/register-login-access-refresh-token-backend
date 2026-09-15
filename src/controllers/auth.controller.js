import { userModel } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateAccessAndRefreshToken } from "../utils/auth.js";

export const registerController = async (req, res) => {
  /**
   * Register User
   *
   * 1. Get data from req.body
   * 2. Validate data
   * 3. Check if user already exists in DB
   * 4. Hash password
   * 5. Save user in DB
   * 6. Generate access token and refresh token
   * 7. Save refresh token in DB
   * 8. Send refresh token in cookie
   * 9. Send response
   */

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All field are required",
    });
  }

  const isUserExist = await userModel.findOne({ email });

  if (isUserExist) {
    return res.status(409).json({
      success: false,
      message: "User already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await userModel.create({
    name,
    email,
    password: hashedPassword,
  });

  const { accessToken, refreshToken } = generateAccessAndRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
  });

  res.status(201).json({
    success: true,
    message: "User Registerd successfully",
    data: {
      user: {
        name: user.name,
        email: user.email,
        id: user._id,
      },
    },
    accessToken,
  });
};

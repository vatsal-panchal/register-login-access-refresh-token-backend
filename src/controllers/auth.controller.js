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

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
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

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      user._id,
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

    user.refreshToken = hashedRefreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          name: user.name,
          email: user.email,
          id: user._id,
        },
      },
      accessToken,
    });
  } catch (error) {
    console.log(`Error in Register Controller || ${error.message}`);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const loginController = async (req, res) => {
  try {
    /**
     * Login User
     *
     * 1. Get data from req.body
     * 2. Validate data
     * 3. Find user in DB
     * 4. Compare password
     * 5. Generate access token and refresh token
     * 6. Hash refresh token
     * 7. Save refresh token in DB
     * 8. Send refresh token in cookie
     * 9. Send response
     */

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      user._id,
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

    user.refreshToken = hashedRefreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        user: {
          name: user.name,
          email: user.email,
        },
      },
      accessToken,
    });
  } catch (error) {
    console.log(`Error in login controller || ${error.message}`);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

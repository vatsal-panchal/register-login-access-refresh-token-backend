import { userModel } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {
  generateAccessAndRefreshToken,
  verifyRefreshToken,
} from "../utils/auth.js";

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

export const postController = async (req, res) => {
  let data = req.user;

  res.send(data);
};

export const refreshController = async (req, res) => {

    /**
 * Refresh Token
 *
 * 1. Get refresh token from cookie
 * 2. Check refresh token exists
 * 3. Verify refresh token
 * 4. Find user in DB
 * 5. Check user exists
 * 6. Compare refresh token with stored hash
 * 7. Generate new access token and refresh token
 * 8. Hash new refresh token
 * 9. Save new refresh token in DB
 * 10. Send new refresh token in cookie
 * 11. Send new access token in response
 */

  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "refresh token not found",
    });
  }
  try {
    const decodedToken = verifyRefreshToken(refreshToken);

    const user = await userModel.findById(decodedToken.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const isValidRefreshToken = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isValidRefreshToken) {
      return res.status(401).json({
        message: "invalid refresh token",
      });
    }

    const { accessToken, refreshToken: newRefreshToken } =
      generateAccessAndRefreshToken(user._id);

    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 12);

    user.refreshToken = hashedRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: "token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    return res.status(401).json({
      message: "invalid or expired refresh token",
    });
  }
};

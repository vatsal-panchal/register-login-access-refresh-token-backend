import { verifyAccessToken } from "../utils/auth.js";
import { userModel } from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({
        message: "token not found",
      });
    }

    const decodedToken = verifyAccessToken(token);

    const user = await userModel.findById(decodedToken.id);

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

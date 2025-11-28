import bcryptjs from 'bcryptjs';

import UserModel from '../models/user.model.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';

export async function registerUserController(req, res) {
  try {
    let { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({
        message: "provide email, name, password ",
        error: true,
        success: false,
      });
    }

    name = name.trim();
    email = email.trim();
    password = password.trim();

    const user = await UserModel.findOne({ email });
    if (user) {
      return res.json({
        message: "Already register email",
        error: true,
        success: false,
      });
    }
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);
    const payload = {
      name,
      email,
      password: hashPassword,
    };
    const newUser = new UserModel(payload);
    const save = await newUser.save();
    return res.json({
      message: "User register successfully",
      error: false,
      success: true,
      data: save,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function loginUserController(req, res) {
  try {
    let { email, password, version } = req.body;

    if (!email || !password) {
      return res.json({
        message: "provide email, password",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.json({
        message: "User not register",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);

    if (!checkPassword) {
      return res.json({
        message: "Check your password",
        error: true,
        success: false,
      });
    }

    const accesstoken = await generatedAccessToken(user._id);

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    res.cookie("accessToken", accesstoken, cookiesOption);

    return res.json({
      message: "Login SuccessFully",
      error: false,
      success: true,
      data: {
        accesstoken,
        userName: user.name,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

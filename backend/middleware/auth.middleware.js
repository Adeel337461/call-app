import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        message: 'No token provided',
        error: true,
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid or expired token',
      error: true,
      success: false,
    });
  }
};

export default auth;

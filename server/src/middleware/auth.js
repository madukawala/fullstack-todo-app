import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';

// Reads the "Authorization: Bearer <token>" header and attaches the user to req.user.
export async function requireAuth(req, _res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized();
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Your session is not valid. Please log in again.';
    throw ApiError.unauthorized(message);
  }

  // Look the user up so a deleted or disabled account loses access straight away.
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Your account is not available. Please log in again.');
  }

  req.user = user;
  next();
}

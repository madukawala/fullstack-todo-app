import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { signToken } from '../utils/token.js';

export async function login(req, res) {
  const email = req.body.email.trim().toLowerCase();
  const user = await User.findOne({ email }).select('+password');

  // Same message for "no such user" and "wrong password" so we don't reveal which emails exist.
  const passwordMatches = user ? await user.comparePassword(req.body.password) : false;
  if (!user || !passwordMatches) {
    throw ApiError.unauthorized('Incorrect email or password.');
  }
  if (!user.isActive) {
    throw ApiError.unauthorized('This account has been disabled.');
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json({ token: signToken(user), user });
}

export function me(req, res) {
  res.json({ user: req.user });
}

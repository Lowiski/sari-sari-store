import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'dev-only-secret-change-me';

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, secret);
}

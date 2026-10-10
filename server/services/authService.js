const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const HttpError = require('../utils/HttpError');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Matching the work factor for nonexistent users helps reduce timing differences.
const dummyHash = bcrypt.hashSync('not-a-user-password', 12);

function validateCredentials(body, isRegistration = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Please provide your account details.');
  }
  if (
    typeof body.email !== 'string' ||
    body.email.trim().length > 254 ||
    !emailPattern.test(body.email.trim())
  ) {
    throw new HttpError(400, 'Please enter a valid email address.');
  }
  if (
    typeof body.password !== 'string' ||
    body.password.length < 8 ||
    Buffer.byteLength(body.password, 'utf8') > 72
  ) {
    throw new HttpError(
      400,
      'Use a password with at least 8 characters and no more than 72 UTF-8 bytes.',
    );
  }
  if (
    isRegistration &&
    (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 100)
  ) {
    throw new HttpError(400, 'Your name must be between 2 and 100 characters.');
  }
  return {
    email: body.email.trim().toLowerCase(),
    password: body.password,
    ...(isRegistration ? { name: body.name.trim() } : {}),
  };
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function sessionFor(user, secret) {
  return {
    token: jwt.sign({}, secret, {
      subject: user.id,
      algorithm: 'HS256',
      expiresIn: '7d',
      issuer: 'forma-api',
      audience: 'forma-client',
    }),
    user: publicUser(user),
  };
}

async function register(body) {
  const { name, email, password } = validateCredentials(body, true);
  if (await User.exists({ email }))
    throw new HttpError(409, 'An account with this email already exists.');
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    return await User.create({ name, email, passwordHash });
  } catch (error) {
    // The unique index also covers simultaneous registration requests.
    if (error.code === 11000)
      throw new HttpError(409, 'An account with this email already exists.');
    throw error;
  }
}

async function login(body) {
  const { email, password } = validateCredentials(body);
  const user = await User.findOne({ email }).select('+passwordHash');
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash || dummyHash);
  if (!user || !passwordMatches) throw new HttpError(401, 'Email or password is incorrect.');
  return user;
}

module.exports = { register, login, sessionFor, publicUser };

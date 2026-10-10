const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { once } = require('node:events');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// The suite never loads server/.env or uses the application's database URI.
const databaseName = `mini_saas_test_${process.pid}_${randomBytes(8).toString('hex')}`;
process.env.MONGO_URI = `mongodb://127.0.0.1:27017/${databaseName}`;
process.env.JWT_SECRET = randomBytes(48).toString('hex');
process.env.CLIENT_ORIGIN = 'http://localhost:5173,http://127.0.0.1:5173';
process.env.TRUST_PROXY = '0';
const { createApp } = require('../app');
const User = require('../models/User');
const Template = require('../models/Template');
const Favorite = require('../models/Favorite');
const samples = require('../data/sampleTemplates');
const seedTemplates = require('../scripts/seed');

let server;
let origin;
let session;
let otherSession;
const password = 'Test-password-2026!';

async function request(path, { method = 'GET', body, token, headers = {} } = {}) {
  const response = await fetch(`${origin}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });
  return { status: response.status, headers: response.headers, data: await response.json() };
}

before(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  await Promise.all([User.init(), Template.init(), Favorite.init()]);
  await seedTemplates();
  server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  origin = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server)
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  try {
    if (mongoose.connection.readyState === 1) {
      assert.match(databaseName, /^mini_saas_test_\d+_[a-f0-9]{16}$/);
      assert.equal(mongoose.connection.name, databaseName, 'Refusing to drop any other database.');
      await mongoose.connection.dropDatabase();
    }
  } finally {
    await mongoose.disconnect();
  }
});

test('API and health endpoints report a connected service with security headers', async () => {
  const root = await request('/');
  assert.equal(root.status, 200);
  assert.equal(root.data.status, 'running');
  assert.equal(root.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(root.headers.get('x-powered-by'), null);
  const health = await request('/health');
  assert.equal(health.status, 200);
  assert.deepEqual(health.data, { status: 'ok', database: 'connected' });
});

test('catalogue supplies all required fields, search, category and details', async () => {
  const all = await request('/api/templates');
  assert.equal(all.status, 200);
  assert.equal(all.data.templates.length, 6);
  for (const template of all.data.templates) {
    assert.deepEqual(Object.keys(template).sort(), [
      'category',
      'description',
      'id',
      'name',
      'thumbnail_url',
    ]);
    assert.match(template.id, /^[a-f0-9]{24}$/);
    assert.match(template.thumbnail_url, /^\/previews\/[a-z-]+\.svg$/);
  }
  const filtered = await request('/api/templates?category=Dashboard&search=metrics');
  assert.equal(filtered.status, 200);
  assert.equal(filtered.data.templates.length, 1);
  assert.equal(filtered.data.templates[0].id, samples[1]._id);
  const detail = await request(`/api/templates/${samples[0]._id}`);
  assert.equal(detail.data.template.id, samples[0]._id);
  const literal = await request('/api/templates?search=%2E%2A');
  assert.equal(literal.data.templates.length, 0, 'Search punctuation must be literal.');
  const invalidQuery = await request('/api/templates?search=x&search=y');
  assert.equal(invalidQuery.status, 400);
});

test('invalid and nonexistent template IDs return JSON 404', async () => {
  for (const id of ['invalid-id', 'aaaaaaaaaaaaaaaaaaaaaaaa']) {
    const result = await request(`/api/templates/${id}`);
    assert.equal(result.status, 404);
    assert.deepEqual(result.data, { message: 'Template not found.' });
  }
  const missing = await request('/api/does-not-exist');
  assert.equal(missing.status, 404);
  assert.equal(missing.data.message, 'Route not found.');
});

test('registration normalizes email, hashes passwords, and returns a seven-day JWT', async () => {
  const response = await request('/api/auth/register', {
    method: 'POST',
    body: { name: '  Test Creator  ', email: ' Creator@Example.test ', password },
  });
  assert.equal(response.status, 201);
  session = response.data;
  assert.deepEqual(Object.keys(session.user).sort(), ['email', 'id', 'name']);
  assert.equal(session.user.name, 'Test Creator');
  assert.equal(session.user.email, 'creator@example.test');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const token = jwt.verify(session.token, process.env.JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: 'forma-api',
    audience: 'forma-client',
  });
  assert.equal(token.sub, session.user.id);
  assert.equal(token.exp - token.iat, 7 * 24 * 60 * 60);
  const user = await User.findById(session.user.id).select('+passwordHash');
  assert.notEqual(user.passwordHash, password);
  assert.equal(await bcrypt.compare(password, user.passwordHash), true);
  assert.equal(user.toJSON().passwordHash, undefined);
  assert.equal((await User.findById(session.user.id)).passwordHash, undefined);
});

test('duplicate emails are rejected case-insensitively, including concurrent registrations', async () => {
  const duplicate = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'Duplicate', email: 'CREATOR@EXAMPLE.TEST', password },
  });
  assert.equal(duplicate.status, 409);
  const body = { name: 'Concurrent', email: 'race@example.test', password };
  const results = await Promise.all([
    request('/api/auth/register', { method: 'POST', body }),
    request('/api/auth/register', { method: 'POST', body }),
  ]);
  assert.deepEqual(results.map((result) => result.status).sort(), [201, 409]);
  assert.equal(await User.countDocuments({ email: body.email }), 1);
});

test('registration rejects missing, wrongly typed and excessive fields', async () => {
  const valid = { name: 'Valid User', email: 'validation@example.test', password };
  const invalidBodies = [
    {},
    [],
    { ...valid, name: 'x' },
    { ...valid, email: { $ne: null } },
    { ...valid, password: { $gt: '' } },
    { ...valid, email: 'broken' },
    { ...valid, password: 'short' },
    { ...valid, password: 'a'.repeat(73) },
    { ...valid, password: '😀'.repeat(19) },
  ];
  for (const body of invalidBodies) {
    const result = await request('/api/auth/register', { method: 'POST', body });
    assert.equal(result.status, 400);
    assert.equal(typeof result.data.message, 'string');
  }
  assert.equal(await User.exists({ email: valid.email }), null);
});

test('login and me work while wrong credentials return the same generic error', async () => {
  const login = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'CREATOR@EXAMPLE.TEST', password },
  });
  assert.equal(login.status, 200);
  assert.deepEqual(login.data.user, session.user);
  const me = await request('/api/auth/me', { token: login.data.token });
  assert.equal(me.status, 200);
  assert.deepEqual(me.data.user, session.user);
  const wrongPassword = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'creator@example.test', password: 'incorrect-password' },
  });
  const missingUser = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'absent@example.test', password },
  });
  assert.equal(wrongPassword.status, 401);
  assert.equal(missingUser.status, 401);
  assert.deepEqual(wrongPassword.data, missingUser.data);
  const injection = await request('/api/auth/login', {
    method: 'POST',
    body: { email: { $ne: null }, password },
  });
  assert.equal(injection.status, 400);
});

test('protected routes reject missing, malformed, expired and incorrect-algorithm tokens', async () => {
  const tokens = [
    undefined,
    'not-a-jwt',
    jwt.sign({}, process.env.JWT_SECRET, {
      subject: session.user.id,
      expiresIn: -1,
      issuer: 'forma-api',
      audience: 'forma-client',
    }),
    jwt.sign({}, process.env.JWT_SECRET, {
      subject: session.user.id,
      algorithm: 'HS384',
      issuer: 'forma-api',
      audience: 'forma-client',
    }),
    jwt.sign({}, process.env.JWT_SECRET, {
      subject: 'invalid',
      issuer: 'forma-api',
      audience: 'forma-client',
    }),
  ];
  for (const token of tokens) {
    assert.equal((await request('/api/auth/me', { token })).status, 401);
    assert.equal((await request('/api/favorites', { token })).status, 401);
    assert.equal(
      (await request(`/api/favorites/${samples[0]._id}`, { method: 'POST', token })).status,
      401,
    );
    assert.equal(
      (await request(`/api/favorites/${samples[0]._id}`, { method: 'DELETE', token })).status,
      401,
    );
  }
});

test('favorites are persisted, idempotent under concurrency, private, and removable', async () => {
  const empty = await request('/api/favorites', { token: session.token });
  assert.deepEqual(empty.data, { templates: [] });
  const saved = await request(`/api/favorites/${samples[0]._id}`, {
    method: 'POST',
    token: session.token,
  });
  assert.equal(saved.status, 201);
  assert.equal(saved.data.templateId, samples[0]._id);
  const duplicate = await request(`/api/favorites/${samples[0]._id}`, {
    method: 'POST',
    token: session.token,
  });
  assert.equal(duplicate.status, 200);
  const simultaneous = await Promise.all(
    Array.from({ length: 3 }, () =>
      request(`/api/favorites/${samples[1]._id}`, { method: 'POST', token: session.token }),
    ),
  );
  assert.equal(simultaneous.filter((result) => result.status === 201).length, 1);
  assert.equal(await Favorite.countDocuments({ user: session.user.id }), 2);
  const list = await request('/api/favorites', { token: session.token });
  assert.equal(list.data.templates.length, 2);
  otherSession = (
    await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Other User', email: 'other@example.test', password },
    })
  ).data;
  const otherList = await request('/api/favorites', { token: otherSession.token });
  assert.deepEqual(otherList.data, { templates: [] });
  await request(`/api/favorites/${samples[0]._id}`, {
    method: 'DELETE',
    token: otherSession.token,
  });
  assert.equal(await Favorite.countDocuments({ user: session.user.id }), 2);
  for (const _ of [1, 2]) {
    const removed = await request(`/api/favorites/${samples[0]._id}`, {
      method: 'DELETE',
      token: session.token,
    });
    assert.equal(removed.status, 200);
  }
  assert.equal(await Favorite.countDocuments({ user: session.user.id }), 1);
  const missing = await request('/api/favorites/not-an-id', {
    method: 'POST',
    token: session.token,
  });
  assert.equal(missing.status, 404);
});

test('deleted users cannot keep using a previously valid token', async () => {
  await User.deleteOne({ _id: otherSession.user.id });
  assert.equal((await request('/api/auth/me', { token: otherSession.token })).status, 401);
});

test('CORS allows configured origins and blocks unknown origins', async () => {
  const allowed = await request('/api/templates', { headers: { Origin: 'http://localhost:5173' } });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  const blocked = await request('/api/templates', {
    headers: { Origin: 'https://unknown.example' },
  });
  assert.equal(blocked.status, 403);
  assert.equal(blocked.headers.get('access-control-allow-origin'), null);
  const preflight = await fetch(`${origin}/api/favorites/${samples[0]._id}`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:5173',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,content-type',
    },
  });
  assert.equal(preflight.status, 204);
  assert.match(preflight.headers.get('access-control-allow-headers'), /Authorization/);
});

test('invalid JSON and oversized requests receive safe errors', async () => {
  const malformed = await request('/api/auth/register', { method: 'POST', body: '{invalid' });
  assert.equal(malformed.status, 400);
  const oversized = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'a'.repeat(20000) },
  });
  assert.equal(oversized.status, 413);
  assert.deepEqual(Object.keys(oversized.data), ['message']);
});

test('repeat seeding preserves user edits and upgrades only old placeholder previews', async () => {
  await Template.updateOne(
    { _id: samples[0]._id },
    { $set: { name: 'My edited title', thumbnail_url: 'https://example.test/custom.svg' } },
  );
  await Template.updateOne(
    { _id: samples[1]._id },
    { $set: { thumbnail_url: 'https://placehold.co/640x400/png?text=Old' } },
  );
  const first = await seedTemplates();
  assert.equal(first.inserted, 0);
  assert.equal(first.updatedPreviews, 1);
  assert.equal(first.count, 6);
  const edited = await Template.findById(samples[0]._id);
  assert.equal(edited.name, 'My edited title');
  assert.equal(edited.thumbnail_url, 'https://example.test/custom.svg');
  assert.equal((await Template.findById(samples[1]._id)).thumbnail_url, '/previews/metrics.svg');
  const second = await seedTemplates();
  assert.equal(second.updatedPreviews, 0);
  assert.equal(await Template.countDocuments(), 6);
});

test('startup rejects missing or too-short JWT secrets', () => {
  const previous = process.env.JWT_SECRET;
  try {
    delete process.env.JWT_SECRET;
    assert.throws(createApp, /JWT_SECRET/);
    process.env.JWT_SECRET = 'unsafe';
    assert.throws(createApp, /JWT_SECRET/);
  } finally {
    process.env.JWT_SECRET = previous;
  }
});

test('repeated failed authentication is rate limited with JSON 429', async () => {
  let result;
  for (let index = 0; index < 31; index += 1) {
    result = await request('/api/auth/login', { method: 'POST', body: {} });
    if (result.status === 429) break;
  }
  assert.equal(result.status, 429);
  assert.match(result.data.message, /Too many/);
  assert.ok(result.headers.get('retry-after'));
});

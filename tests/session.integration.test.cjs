/* eslint-disable @typescript-eslint/no-require-imports */
// Real PostgreSQL integration test; only the Next.js request/cookie context is mocked.
require('dotenv/config')
const assert = require('node:assert/strict')
const { randomUUID, createHash } = require('node:crypto')
const { test } = require('node:test')

const url = new URL(process.env.DATABASE_URL)
if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
  throw new Error('Run session integration tests against a local development database.')
}

const cookieValues = new Map()
const cookieOptions = new Map()
const cookieStore = {
  get: (key) => cookieValues.has(key) ? { value: cookieValues.get(key) } : undefined,
  set: (key, value, options) => { cookieValues.set(key, value); cookieOptions.set(key, options) },
  delete: (key) => { cookieValues.delete(key); cookieOptions.delete(key) },
}
for (const [name, exports] of [
  ['next/headers', { cookies: async () => cookieStore }],
  ['next/navigation', { redirect: (path) => { throw new Error(`REDIRECT:${path}`) } }],
]) {
  const filename = require.resolve(name)
  require.cache[filename] = { id: filename, filename, loaded: true, exports }
}

const { db } = require('../app/lib/db.ts')
const sessions = require('../app/lib/session.tsx')
const actions = require('../app/actions/auth.tsx')
const hash = (token) => createHash('sha256').update(token).digest('hex')
function form(values) {
  const data = new FormData()
  for (const [key, value] of Object.entries(values)) data.set(key, value)
  return data
}

test('database session and authentication lifecycle', async (t) => {
  const email = `session-test-${randomUUID()}@example.com`
  t.after(async () => {
    await db.user.deleteMany({ where: { email } })
    await db.$disconnect()
  })

  assert.equal(await sessions.getSession(), null)
  cookieValues.set('session', 'old.jwt.cookie')
  assert.equal(await sessions.getSession(), null)
  cookieValues.clear()

  const invalid = await actions.signup(undefined, form({ name: 'A', email: 'bad', password: 'short' }))
  assert.ok(invalid.errors.email)
  assert.equal(cookieValues.size, 0)

  const credentials = { name: 'Session Test', email, password: 'Testing123!' }
  await assert.rejects(actions.signup(undefined, form(credentials)), /REDIRECT:\/profile/)
  const firstToken = cookieValues.get('session')
  assert.match(firstToken, /^[A-Za-z0-9_-]{43}$/)
  const user = await db.user.findUniqueOrThrow({ where: { email } })
  assert.notEqual(user.password, credentials.password)
  const firstRow = await db.session.findUniqueOrThrow({ where: { tokenHash: hash(firstToken) } })
  assert.notEqual(firstRow.tokenHash, firstToken)
  assert.equal(firstRow.userId, user.id)
  assert.equal(cookieOptions.get('session').httpOnly, true)
  assert.equal(cookieOptions.get('session').sameSite, 'lax')
  assert.equal(cookieOptions.get('session').secure, false)
  assert.equal(cookieOptions.get('session').expires.getTime(), firstRow.expiresAt.getTime())
  assert.equal((await sessions.getSession()).user.id, user.id)
  assert.equal('password' in (await sessions.getSession()).user, false)

  const duplicate = await actions.signup(undefined, form(credentials))
  assert.ok(duplicate.errors.email)
  const wrong = await actions.login(undefined, form({ email, password: 'Incorrect123!' }))
  assert.ok(wrong.message)
  const unknown = await actions.login(undefined, form({ email: `unknown-${email}`, password: 'Incorrect123!' }))
  assert.equal(unknown.message, wrong.message)

  await assert.rejects(actions.login(undefined, form(credentials)), /REDIRECT:\/profile/)
  const secondToken = cookieValues.get('session')
  assert.notEqual(secondToken, firstToken)
  assert.equal(await db.session.count({ where: { tokenHash: hash(firstToken) } }), 0)
  assert.equal(await db.session.count({ where: { userId: user.id } }), 1)

  // Renew the active row, rather than creating another session.
  await db.session.update({ where: { tokenHash: hash(secondToken) }, data: { expiresAt: new Date(Date.now() + 3600000) } })
  assert.equal(await sessions.updateSession(), true)
  const renewed = await db.session.findUniqueOrThrow({ where: { tokenHash: hash(secondToken) } })
  assert.ok(renewed.expiresAt.getTime() > Date.now() + 6 * 24 * 3600000)
  assert.equal(renewed.expiresAt.getTime(), cookieOptions.get('session').expires.getTime())

  // Expiration and server-side revocation both invalidate a retained cookie.
  await db.session.update({ where: { id: renewed.id }, data: { expiresAt: new Date(Date.now() - 1000) } })
  assert.equal(await sessions.getSession(), null)
  assert.equal(await sessions.updateSession(), false)
  assert.equal(cookieValues.has('session'), false)
  await sessions.createSession(user.id)
  const revokedToken = cookieValues.get('session')
  await db.session.delete({ where: { tokenHash: hash(revokedToken) } })
  assert.equal(await sessions.getSession(), null)
  assert.equal(await sessions.updateSession(), false)
  assert.equal(await db.session.count({ where: { tokenHash: hash(revokedToken) } }), 0)

  // Signing out one browser must not sign out another browser.
  await sessions.createSession(user.id)
  const otherBrowserToken = cookieValues.get('session')
  cookieValues.clear()
  await sessions.createSession(user.id)
  const logoutToken = cookieValues.get('session')
  await assert.rejects(actions.logout(), /REDIRECT:\/login/)
  assert.equal(cookieValues.has('session'), false)
  assert.equal(await db.session.count({ where: { tokenHash: hash(logoutToken) } }), 0)
  cookieValues.set('session', logoutToken)
  assert.equal(await sessions.getSession(), null)
  await assert.rejects(sessions.requireSession(), /REDIRECT:\/login/)
  cookieValues.set('session', otherBrowserToken)
  assert.equal((await sessions.requireSession()).user.id, user.id)
})

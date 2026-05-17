import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const MIN_JWT_SECRET_LENGTH = 32

export function validateJwtSecretOrThrow() {
  const secret = String(process.env.JWT_SECRET || '').trim()
  if (!secret) {
    throw new Error(
      '[libra-api] Startup error: JWT_SECRET is required. Set a strong secret in environment variables.',
    )
  }
  if (secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `[libra-api] Startup error: JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters.`,
    )
  }
  return secret
}

export function jwtSecret() {
  return validateJwtSecretOrThrow()
}

export function hashPassword(plain) {
  return bcrypt.hashSync(plain, 12)
}

export function verifyPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash)
}

export function createAccessToken(userId, email, role) {
  const mins = Number(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || 1440)
  return jwt.sign(
    { sub: String(userId), email, role },
    jwtSecret(),
    { algorithm: 'HS256', expiresIn: `${mins}m` },
  )
}

export function decodeTokenSafe(token) {
  try {
    return jwt.verify(token, jwtSecret(), { algorithms: ['HS256'] })
  } catch {
    return null
  }
}

export function userOut(row) {
  const local = row.email.split('@')[0] || 'reader'
  const name = local.charAt(0).toUpperCase() + local.slice(1)
  return { id: row.id, email: row.email, role: row.role, name }
}

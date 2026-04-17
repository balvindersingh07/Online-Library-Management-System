import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export function jwtSecret() {
  return process.env.JWT_SECRET || 'change-me-in-production-use-openssl-rand'
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

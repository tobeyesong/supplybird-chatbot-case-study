import { createHmac, timingSafeEqual } from 'node:crypto'

const ownerTokenMetadataKey = 'modhaus_owner_token'

type OwnerAccessUser = {
  email?: string | null
  user_metadata?: Record<string, unknown> | null
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) return false

  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function getOwnerInviteCode() {
  return process.env.OWNER_INVITE_CODE?.trim() || null
}

export function getOwnerAccessSecret() {
  return process.env.OWNER_ACCESS_SECRET?.trim() || null
}

export function isOwnerSignupConfigured() {
  return Boolean(getOwnerInviteCode() && getOwnerAccessSecret())
}

export function getAdminAllowedEmails() {
  return (process.env.ADMIN_ALLOWED_EMAILS || '')
    .split(',')
    .map((email) => normalizeEmail(email))
    .filter(Boolean)
}

export function verifyOwnerInviteCode(code: string) {
  const inviteCode = getOwnerInviteCode()

  if (!inviteCode) return false

  return safeCompare(code.trim(), inviteCode)
}

export function createOwnerAccessToken(email: string) {
  const secret = getOwnerAccessSecret()

  if (!secret) return null

  return createHmac('sha256', secret).update(normalizeEmail(email)).digest('hex')
}

export function hasOwnerAccess(user: OwnerAccessUser | null) {
  if (!user?.email) return false

  if (getAdminAllowedEmails().includes(normalizeEmail(user.email))) {
    return true
  }

  const expectedToken = createOwnerAccessToken(user.email)
  const actualToken = user.user_metadata?.[ownerTokenMetadataKey]

  if (!expectedToken || typeof actualToken !== 'string') return false

  return safeCompare(actualToken, expectedToken)
}

export function getOwnerTokenMetadata(email: string) {
  return {
    modhaus_role: 'owner',
    [ownerTokenMetadataKey]: createOwnerAccessToken(email),
  }
}

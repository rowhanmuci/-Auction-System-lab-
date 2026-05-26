const BASE = '/auction/backend/api'

export async function apiGet(endpoint, params = {}) {
  const url = new URL(BASE + '/' + endpoint, window.location.origin)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url, { credentials: 'include' })
  return res.json()
}

export async function apiPost(endpoint, data = {}) {
  const res = await fetch(`${BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  return res.json()
}

export async function apiUpload(endpoint, file) {
  const fd = new FormData()
  fd.append('image', file)
  const res = await fetch(`${BASE}/${endpoint}`, {
    method: 'POST',
    body: fd,
    credentials: 'include',
  })
  
  // Check if response is ok and contains json
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch (e) {
    console.error('Invalid JSON response:', text)
    throw new Error('Invalid response format')
  }
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem('auction_user')) } catch { return null }
}
export function setUser(u)  { localStorage.setItem('auction_user', JSON.stringify(u)) }
export function clearUser() { localStorage.removeItem('auction_user') }
export function isLoggedIn() { return !!getUser() }

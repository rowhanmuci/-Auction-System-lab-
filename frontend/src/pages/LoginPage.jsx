import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import { apiPost, setUser } from '../api'
import heroBg from '../assets/home.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [err,     setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const res = await apiPost('auth/login.php', form)
      if (res.success) { setUser(res.data); navigate('/') }
      else setErr(res.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>

      {/* Site title */}
      <Typography
        variant="h4"
        align="center"
        sx={{ mt: 4, mb: 1.5, color: 'primary.main', letterSpacing: 2, fontWeight: 900, WebkitTextStroke: '1px #317b88' }}
      >
        C.R.E.A.M Auction System
      </Typography>

      {/* Hero image — full width, standalone */}
      <Box
        component="img"
        src={heroBg}
        alt="Cream Auction System"
        sx={{
          width: 'calc(100% - 48px)',
          maxWidth: 800,
          height: 'auto',
          display: 'block',
          mx: 'auto',
          mt: 3,
          borderRadius: 3,
          imageRendering: 'pixelated',
        }}
      />

      {/* Login form */}
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, px: 2 }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 400, borderRadius: 3, p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>登入</Typography>
          <Divider sx={{ mb: 3 }} />

          {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

          <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email" name="email" type="email"
              value={form.email} onChange={handle}
              required fullWidth size="small" disabled={loading}
            />
            <TextField
              label="密碼" name="password" type="password"
              value={form.password} onChange={handle}
              required fullWidth size="small" disabled={loading}
            />
            <Button type="submit" variant="contained" color="primary" size="large" fullWidth disabled={loading}>
              {loading ? '登入中…' : '登入'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
            還沒有帳號？{' '}
            <Link to="/register" style={{ color: '#317b88', fontWeight: 600, textDecoration: 'none' }}>
              立即註冊
            </Link>
          </Typography>
        </Paper>
      </Box>

    </Box>
  )
}

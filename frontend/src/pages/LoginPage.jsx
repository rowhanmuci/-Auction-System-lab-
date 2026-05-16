import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import { apiPost, setUser } from '../api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [err,  setErr]  = useState('')

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setErr('')
    const res = await apiPost('auth/login.php', form)
    if (res.success) { setUser(res.data); navigate('/') }
    else setErr(res.error)
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="xs">
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={700} align="center" gutterBottom>登入</Typography>
          <Divider sx={{ mb: 3 }} />

          {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

          <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Email" name="email" type="email" value={form.email} onChange={handle} required fullWidth size="small" />
            <TextField label="密碼" name="password" type="password" value={form.password} onChange={handle} required fullWidth size="small" />
            <Button type="submit" variant="contained" color="primary" size="large" fullWidth>登入</Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            還沒有帳號？<Link to="/register" style={{ color: '#E53935' }}>立即註冊</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

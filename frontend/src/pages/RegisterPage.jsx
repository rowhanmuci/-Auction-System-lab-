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
import { apiPost } from '../api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form,    setForm]    = useState({ id_number: '', name: '', phone: '', email: '', password: '', confirm_password: '' })
  const [msg,     setMsg]     = useState(null)
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setMsg(null)
    if (form.password !== form.confirm_password) {
      setMsg({ type: 'error', text: '兩次密碼不一致' })
      return
    }
    setLoading(true)
    try {
      const { confirm_password, ...payload } = form
      const res = await apiPost('auth/register.php', payload)
      if (res.success) {
        setMsg({ type: 'success', text: '註冊成功！3 秒後跳轉登入…' })
        setTimeout(() => navigate('/login'), 3000)
      } else {
        setMsg({ type: 'error', text: res.error })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Container maxWidth="xs">
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={700} align="center" gutterBottom>建立帳號</Typography>
          <Divider sx={{ mb: 3 }} />

          {msg && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>}

          <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="身分證字號" name="id_number" value={form.id_number} onChange={handle} required fullWidth size="small" disabled={loading} />
            <TextField label="姓名" name="name" value={form.name} onChange={handle} required fullWidth size="small" disabled={loading} />
            <TextField label="電話" name="phone" value={form.phone} onChange={handle} required fullWidth size="small" disabled={loading} />
            <TextField label="Email" name="email" type="email" value={form.email} onChange={handle} required fullWidth size="small" disabled={loading} />
            <TextField label="密碼" name="password" type="password" value={form.password} onChange={handle} required fullWidth size="small" inputProps={{ minLength: 6 }} disabled={loading} />
            <TextField label="確認密碼" name="confirm_password" type="password" value={form.confirm_password} onChange={handle} required fullWidth size="small" disabled={loading} />
            <Button type="submit" variant="contained" color="primary" size="large" fullWidth disabled={loading}>
              {loading ? '處理中…' : '註冊'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            已有帳號？<Link to="/login" style={{ color: '#317b88' }}>登入</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

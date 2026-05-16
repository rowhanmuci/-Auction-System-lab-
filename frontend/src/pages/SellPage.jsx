import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import { apiGet, apiPost, isLoggedIn } from '../api'

export default function SellPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    title: '', description: '', starting_price: '',
    category_id: '', start_time: '', end_time: '', images: '',
  })
  const [msg,     setMsg]     = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return }
    apiGet('categories/list.php').then(r => { if (r.success) setCategories(r.data) })
  }, [])

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setMsg(null)
    if (form.start_time && form.end_time && new Date(form.end_time) <= new Date(form.start_time)) {
      setMsg({ type: 'error', text: '結束時間必須晚於開始時間' })
      return
    }
    setLoading(true)
    try {
      const images = form.images.split('\n').map(u => u.trim()).filter(Boolean)
      const data = {
        ...form,
        starting_price: parseFloat(form.starting_price),
        category_id:    parseInt(form.category_id),
        start_time:     form.start_time.replace('T', ' ') + ':00',
        end_time:       form.end_time.replace('T', ' ') + ':00',
        images,
      }
      const res = await apiPost('items/create.php', data)
      if (res.success) {
        setMsg({ type: 'success', text: '上架成功！', itemId: res.data.item_id })
      } else {
        setMsg({ type: 'error', text: res.error })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>上架商品</Typography>
          <Divider sx={{ mb: 3 }} />

          {msg && (
            <Alert severity={msg.type} sx={{ mb: 2 }}
              action={msg.itemId && <Button size="small" onClick={() => navigate(`/item/${msg.itemId}`)}>查看商品</Button>}>
              {msg.text}
            </Alert>
          )}

          <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="商品名稱" name="title" value={form.title} onChange={handle} required fullWidth size="small" disabled={loading} />
            <TextField label="商品描述" name="description" value={form.description} onChange={handle} multiline rows={3} fullWidth size="small" disabled={loading} />
            <TextField label="起標價（NT$）" name="starting_price" type="number" value={form.starting_price} onChange={handle} required fullWidth size="small" inputProps={{ min: 1, step: '0.01' }} disabled={loading} />
            <TextField label="分類" name="category_id" select value={form.category_id} onChange={handle} required fullWidth size="small" disabled={loading}>
              {categories.map(c => <MenuItem key={c.CategoryID} value={c.CategoryID}>{c.category_name}</MenuItem>)}
            </TextField>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="開始時間" name="start_time" type="datetime-local" value={form.start_time} onChange={handle} required fullWidth size="small" InputLabelProps={{ shrink: true }} disabled={loading} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="結束時間" name="end_time" type="datetime-local" value={form.end_time} onChange={handle} required fullWidth size="small" InputLabelProps={{ shrink: true }} disabled={loading} />
              </Grid>
            </Grid>
            <TextField
              label="圖片網址（每行一個）"
              name="images" multiline rows={3}
              value={form.images} onChange={handle}
              placeholder="https://example.com/photo.jpg"
              fullWidth size="small" disabled={loading}
            />
            <Button type="submit" variant="contained" color="success" size="large" fullWidth disabled={loading}>
              {loading ? '上架中…' : '上架'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

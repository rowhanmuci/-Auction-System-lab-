import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import CloseIcon from '@mui/icons-material/Close'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import AddLinkIcon from '@mui/icons-material/AddLink'
import { apiGet, apiPost, apiUpload, isLoggedIn } from '../api'
import { getAbsoluteImageUrl } from '../utils'

export default function SellPage() {
  const navigate    = useNavigate()
  const fileInputRef = useRef(null)

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    title: '', description: '', starting_price: '',
    category_id: '', start_time: '', end_time: '',
  })
  const [images,    setImages]    = useState([])   // array of URL strings
  const [urlInput,  setUrlInput]  = useState('')
  const [uploading, setUploading] = useState(false)
  const [msg,       setMsg]       = useState(null)
  const [loading,   setLoading]   = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return }
    apiGet('categories/list.php').then(r => { if (r.success) setCategories(r.data) })
  }, [])

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  // File upload handler
  const handleFiles = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      for (const file of files) {
        try {
          const r = await apiUpload('items/upload_image.php', file)
          if (r.success) {
            setImages(prev => [...prev, r.data.url])
          } else {
            setMsg({ type: 'error', text: `上傳失敗：${r.error}` })
          }
        } catch (error) {
          console.error('Upload error:', error)
          setMsg({ type: 'error', text: `上傳錯誤：${error.message}` })
        }
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // URL add handler
  const addUrl = () => {
    const url = urlInput.trim()
    if (!url) return
    setImages(prev => [...prev, url])
    setUrlInput('')
  }

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx))

  const submit = async e => {
    e.preventDefault()
    setMsg(null)
    if (form.start_time && form.end_time && new Date(form.end_time) <= new Date(form.start_time)) {
      setMsg({ type: 'error', text: '結束時間必須晚於開始時間' })
      return
    }
    setLoading(true)
    try {
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
        setImages([])
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
              <Grid xs={6}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>開始時間 *</Typography>
                <TextField name="start_time" type="datetime-local" value={form.start_time} onChange={handle} required fullWidth size="small" disabled={loading} />
              </Grid>
              <Grid xs={6}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>結束時間 *</Typography>
                <TextField name="end_time" type="datetime-local" value={form.end_time} onChange={handle} required fullWidth size="small" disabled={loading} />
              </Grid>
            </Grid>

            {/* Image section */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>商品圖片</Typography>

              {/* Upload + URL row */}
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFiles}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={uploading ? <CircularProgress size={14} /> : <UploadFileIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || uploading}
                >
                  {uploading ? '上傳中…' : '上傳圖片'}
                </Button>

                <TextField
                  size="small"
                  placeholder="或貼上圖片網址"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                  sx={{ flex: 1 }}
                  disabled={loading}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={addUrl}
                  disabled={!urlInput.trim() || loading}
                  sx={{ minWidth: 0, px: 1.5 }}
                >
                  <AddLinkIcon fontSize="small" />
                </Button>
              </Box>

              {/* Preview grid */}
              {images.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {images.map((url, i) => (
                    <Box key={i} sx={{ position: 'relative', width: 80, height: 80 }}>
                      <Box
                        component="img"
                        src={getAbsoluteImageUrl(url)}
                        alt={`圖片 ${i + 1}`}
                        onError={e => { e.target.src = 'https://placehold.co/80x80?text=?' }}
                        sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeImage(i)}
                        sx={{
                          position: 'absolute', top: -8, right: -8,
                          bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
                          width: 20, height: 20,
                          '&:hover': { bgcolor: 'error.light', color: '#fff' },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              {images.length === 0 && (
                <Typography variant="caption" color="text.secondary">尚未新增圖片</Typography>
              )}
            </Box>

            <Button type="submit" variant="contained" color="success" size="large" fullWidth disabled={loading || uploading}>
              {loading ? '上架中…' : '上架'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

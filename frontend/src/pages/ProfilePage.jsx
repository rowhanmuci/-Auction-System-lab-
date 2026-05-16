import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import { apiGet, apiPost, getUser } from '../api'

export default function ProfilePage() {
  const { userId }  = useParams()
  const navigate    = useNavigate()
  const user        = getUser()
  const [comments, setComments] = useState([])
  const [content,  setContent]  = useState('')
  const [msg,      setMsg]      = useState(null)

  const load = async () => {
    const r = await apiGet('comments/get.php', { user_id: userId })
    if (r.success) setComments(r.data)
  }

  useEffect(() => {
    if (!userId) { navigate(user ? `/profile/${user.user_id}` : '/login'); return }
    load()
  }, [userId])

  const submit = async () => {
    setMsg(null)
    if (!content.trim()) return
    const r = await apiPost('comments/post.php', { board_owner_id: parseInt(userId), content })
    if (r.success) { setContent(''); setMsg({ type: 'success', text: '留言成功！' }); load() }
    else setMsg({ type: 'error', text: r.error })
  }

  const isOwn = user && String(user.user_id) === String(userId)

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: 24 }}>
            {userId}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>留言板</Typography>
            <Typography variant="body2" color="text.secondary">用戶 #{userId}</Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {comments.length === 0 ? (
          <Typography color="text.secondary">目前沒有留言。</Typography>
        ) : (
          comments.map(c => (
            <Paper key={c.CommentID} variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>{c.content}</Typography>
              <Typography variant="caption" color="text.secondary">
                — {c.writer_name}，{new Date(c.post_time).toLocaleString()}
              </Typography>
            </Paper>
          ))
        )}

        {user && !isOwn && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>留下留言</Typography>
            {msg && <Alert severity={msg.type} sx={{ mb: 1.5 }}>{msg.text}</Alert>}
            <TextField
              fullWidth multiline rows={3} size="small"
              placeholder="輸入留言內容…"
              value={content} onChange={e => setContent(e.target.value)}
            />
            <Button variant="contained" sx={{ mt: 1 }} onClick={submit} disabled={!content.trim()}>
              送出
            </Button>
          </Box>
        )}
        {!user && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            <Box
              component="span"
              sx={{ color: 'primary.main', cursor: 'pointer' }}
              onClick={() => navigate('/login')}
            >登入</Box>後才能留言
          </Typography>
        )}
      </Container>
    </Box>
  )
}

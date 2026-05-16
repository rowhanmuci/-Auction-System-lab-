import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { apiGet, isLoggedIn } from '../api'

const STATUS_LABEL = { active: '進行中', upcoming: '即將開始', ended: '已結束' }
const STATUS_COLOR = { active: 'error', upcoming: 'info', ended: 'default' }

export default function MyListingsPage() {
  const navigate  = useNavigate()
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return }
    apiGet('items/my.php').then(r => {
      if (r.success) setItems(r.data)
      setLoading(false)
    })
  }, [])

  const byStatus = status => items.filter(i => i.status === status)

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress />
    </Box>
  )

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h5" fontWeight={700} gutterBottom>我的上架</Typography>
        <Divider sx={{ mb: 3 }} />

        {['active', 'upcoming', 'ended'].map(status => (
          <Box key={status} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
              {STATUS_LABEL[status]}
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({byStatus(status).length})
              </Typography>
            </Typography>

            {byStatus(status).length === 0 ? (
              <Typography color="text.secondary" variant="body2">暫無商品。</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {byStatus(status).map(item => (
                  <Card key={item.ItemID} sx={{ width: 200, flexShrink: 0 }}>
                    <CardMedia
                      component="img"
                      image={item.thumbnail || 'https://placehold.co/200x160?text=No+Image'}
                      alt={item.title}
                      sx={{ height: 140, objectFit: 'cover' }}
                      onError={e => { e.target.src = 'https://placehold.co/200x160?text=No+Image' }}
                    />
                    <CardContent sx={{ pb: 0.5, px: 1.5, pt: 1.5 }}>
                      <Typography
                        variant="body2" fontWeight={500}
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: 0.5 }}
                      >
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        NT$ {parseFloat(item.current_price).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        結束：{new Date(item.end_time).toLocaleDateString()}
                      </Typography>
                      <Chip
                        label={STATUS_LABEL[item.status]}
                        size="small"
                        color={STATUS_COLOR[item.status]}
                        sx={{ mt: 0.5 }}
                      />
                    </CardContent>
                    <CardActions sx={{ px: 1.5, pt: 0.5, pb: 1.5 }}>
                      <Button size="small" onClick={() => navigate(`/item/${item.ItemID}`)}>查看商品</Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Container>
    </Box>
  )
}

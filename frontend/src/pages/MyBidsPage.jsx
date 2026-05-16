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
import { apiGet, getUser, isLoggedIn } from '../api'

function bidChip(item, myUserId) {
  if (item.auction_status === 'ended') {
    return item.WinnerID && String(item.WinnerID) === String(myUserId)
      ? <Chip label="已得標" size="small" sx={{ bgcolor: '#FFD700', color: '#333', fontWeight: 700 }} />
      : <Chip label="未得標" size="small" color="default" />
  }
  return item.is_winning
    ? <Chip label="領先" size="small" color="success" />
    : <Chip label="已被超越" size="small" color="warning" />
}

export default function MyBidsPage() {
  const navigate   = useNavigate()
  const user       = getUser()
  const [bids,    setBids]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return }
    apiGet('bids/my.php').then(r => {
      if (r.success) setBids(r.data)
      setLoading(false)
    })
  }, [])

  const active = bids.filter(b => b.auction_status === 'active')
  const ended  = bids.filter(b => b.auction_status === 'ended')

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress />
    </Box>
  )

  const Section = ({ title, list }) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        {title}
        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          ({list.length})
        </Typography>
      </Typography>
      {list.length === 0 ? (
        <Typography color="text.secondary" variant="body2">暫無紀錄。</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {list.map(item => (
            <Card key={item.ItemID} sx={{ width: 200, flexShrink: 0 }}>
              <CardMedia
                component="img"
                image={item.thumbnail || 'https://placehold.co/200x140?text=No+Image'}
                alt={item.title}
                sx={{ height: 140, objectFit: 'cover' }}
                onError={e => { e.target.src = 'https://placehold.co/200x140?text=No+Image' }}
              />
              <CardContent sx={{ pb: 0.5, px: 1.5, pt: 1.5 }}>
                <Typography
                  variant="body2" fontWeight={500}
                  sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: 0.5 }}
                >
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  我的出價：NT$ {parseFloat(item.bid_amount).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  結束：{new Date(item.end_time).toLocaleDateString()}
                </Typography>
                <Box sx={{ mt: 0.5 }}>{bidChip(item, user?.user_id)}</Box>
              </CardContent>
              <CardActions sx={{ px: 1.5, pt: 0.5, pb: 1.5 }}>
                <Button size="small" onClick={() => navigate(`/item/${item.ItemID}`)}>查看商品</Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h5" fontWeight={700} gutterBottom>我的出價</Typography>
        <Divider sx={{ mb: 3 }} />
        <Section title="進行中拍賣" list={active} />
        <Section title="已結束拍賣" list={ended} />
      </Container>
    </Box>
  )
}

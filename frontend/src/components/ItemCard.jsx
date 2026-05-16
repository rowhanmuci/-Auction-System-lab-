import { useNavigate } from 'react-router-dom'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

function timeLeft(endTime) {
  const diff = new Date(endTime) - new Date()
  if (diff <= 0) return '已結束'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 24) return `${Math.floor(h / 24)}天`
  return `${h}h ${m}m`
}

export default function ItemCard({ item }) {
  const navigate = useNavigate()
  const ended    = new Date() > new Date(item.end_time)

  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'transform .15s, box-shadow .15s',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: 6 },
      }}
    >
      <CardActionArea onClick={() => navigate(`/item/${item.ItemID}`)}>
        {/* Image */}
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            image={item.thumbnail || 'https://placehold.co/300x300?text=No+Image'}
            alt={item.title}
            sx={{ height: 200, objectFit: 'cover' }}
            onError={e => { e.target.src = 'https://placehold.co/300x300?text=No+Image' }}
          />
          {/* Price chip */}
          <Box
            sx={{
              position: 'absolute', bottom: 8, left: 8,
              bgcolor: 'rgba(0,0,0,0.62)',
              color: '#fff', px: 1, py: 0.3,
              borderRadius: 1, fontSize: 13, fontWeight: 700,
            }}
          >
            NT$ {parseFloat(item.current_price).toLocaleString()}
          </Box>
          {ended && (
            <Box sx={{
              position: 'absolute', inset: 0,
              bgcolor: 'rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Chip label="已結束" size="small" sx={{ bgcolor: '#555', color: '#fff', fontWeight: 700 }} />
            </Box>
          )}
        </Box>

        <CardContent sx={{ py: 1.5, px: 1.5 }}>
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {item.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {ended ? '已結束' : `剩 ${timeLeft(item.end_time)}`}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

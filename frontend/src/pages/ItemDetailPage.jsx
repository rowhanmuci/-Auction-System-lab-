import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Collapse from '@mui/material/Collapse'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { apiGet, apiPost, getUser } from '../api'
import { getAbsoluteImageUrl } from '../utils'

function timeLeft(endTime) {
  const diff = new Date(endTime) - new Date()
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return h > 24 ? `${Math.floor(h / 24)} 天` : `${h}h ${m}m`
}

export default function ItemDetailPage() {
  const { itemId }  = useParams()
  const navigate    = useNavigate()
  const user        = getUser()

  const [item,        setItem]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [selImg,      setSelImg]      = useState(0)
  const [bidAmt,      setBidAmt]      = useState('')
  const [bidMsg,      setBidMsg]      = useState(null)
  const [bidding,     setBidding]     = useState(false)
  const [comments,    setComments]    = useState([])
  const [comment,     setComment]     = useState('')
  const [cmtMsg,      setCmtMsg]      = useState(null)
  const [bidHistory,  setBidHistory]  = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)

  const loadItem = async () => {
    const r = await apiGet('items/detail.php', { item_id: itemId })
    if (r.success) { setItem(r.data); setLoading(false) }
    else { setLoading(false) }
  }

  const loadComments = async (itemId) => {
    const r = await apiGet('comments/get.php', { item_id: itemId })
    if (r.success) setComments(r.data)
  }

  const loadHistory = async () => {
    const r = await apiGet('bids/history.php', { item_id: itemId })
    if (r.success) setBidHistory(r.data)
  }

  useEffect(() => {
    loadItem()
    loadHistory()
  }, [itemId])

  useEffect(() => { if (item) loadComments(item.ItemID) }, [item?.ItemID])

  const handleBid = async () => {
    setBidMsg(null)
    setBidding(true)
    try {
      const r = await apiPost('bids/place.php', { item_id: parseInt(itemId), bid_amount: parseFloat(bidAmt) })
      if (r.success) {
        setBidMsg({ type: 'success', text: `出價成功！NT$ ${parseFloat(r.data.bid_amount).toLocaleString()}` })
        setBidAmt('')
        loadItem()
        loadHistory()
      } else {
        setBidMsg({ type: 'error', text: r.error })
      }
    } finally {
      setBidding(false)
    }
  }

  const handleComment = async () => {
    setCmtMsg(null)
    const r = await apiPost('comments/post.php', {
      item_id: item.ItemID,
      board_owner_id: item.SellerID,
      content: comment
    })
    if (r.success) {
      setComment('')
      setCmtMsg({ type: 'success', text: '留言成功！' })
      loadComments(item.ItemID)
    } else {
      setCmtMsg({ type: 'error', text: r.error })
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
  if (!item)   return <Container sx={{ mt: 6 }}><Alert severity="error">商品不存在。</Alert></Container>

  const ended   = new Date() > new Date(item.end_time)
  const canBid  = !ended && user && user.user_id !== item.SellerID
  const images  = item.images?.length 
    ? item.images.map(url => getAbsoluteImageUrl(url))
    : ['https://placehold.co/500x500?text=No+Image']

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        <Grid container spacing={4}>

          {/* Left: image gallery */}
          <Grid xs={12} md={6}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              <Box
                component="img"
                src={images[selImg]}
                alt={item.title}
                onError={e => { e.target.src = 'https://placehold.co/500x500?text=No+Image' }}
                sx={{ width: '100%', borderRadius: 2, maxHeight: 480, objectFit: 'contain', bgcolor: '#f9f9f9' }}
              />
              {images.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                  {images.map((url, i) => (
                    <Box
                      key={i}
                      component="img"
                      src={url}
                      onClick={() => setSelImg(i)}
                      sx={{
                        width: 64, height: 64, objectFit: 'cover', borderRadius: 1,
                        cursor: 'pointer', border: i === selImg ? '2px solid #317b88' : '2px solid transparent',
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Right: info panel */}
          <Grid xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <Chip label={item.category_name} size="small" />
              {ended
                ? <Chip label="已結束" size="small" color="default" />
                : <Chip label={`剩 ${timeLeft(item.end_time)}`} size="small" color="error" />
              }
              {item.WinnerID && <Chip label={`得標：${item.top_bidder}`} size="small" color="warning" />}
            </Box>

            <Typography variant="h5" fontWeight={700} gutterBottom>{item.title}</Typography>

            <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
              NT$ {parseFloat(item.current_price).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {item.top_bidder ? `最高出價：${item.top_bidder}` : '尚無出價，起標價 NT$ ' + parseFloat(item.starting_price).toLocaleString()}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Bid form */}
            {canBid && (
              <Box sx={{ mb: 2 }}>
                {bidMsg && <Alert severity={bidMsg.type} sx={{ mb: 1.5 }}>{bidMsg.text}</Alert>}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small" type="number" placeholder="輸入出價金額"
                    value={bidAmt} onChange={e => setBidAmt(e.target.value)}
                    disabled={bidding}
                    InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>NT$</Typography> }}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="contained" color="primary"
                    onClick={handleBid}
                    disabled={!bidAmt || bidding}
                  >
                    {bidding ? '出價中…' : '出價'}
                  </Button>
                </Box>
              </Box>
            )}
            {!user && !ended && (
              <Button variant="outlined" fullWidth onClick={() => navigate('/login')} sx={{ mb: 2 }}>
                登入後出價
              </Button>
            )}

            {/* Bid history collapsible */}
            <Box sx={{ mb: 2 }}>
              <Button
                size="small"
                variant="text"
                color="inherit"
                onClick={() => setHistoryOpen(o => !o)}
                endIcon={
                  <ExpandMoreIcon
                    sx={{ transition: 'transform .2s', transform: historyOpen ? 'rotate(180deg)' : 'none' }}
                  />
                }
                sx={{ color: 'text.secondary', px: 0 }}
              >
                出價紀錄（{bidHistory.length}）
              </Button>
              <Collapse in={historyOpen}>
                {bidHistory.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>尚無出價。</Typography>
                ) : (
                  <Table size="small" sx={{ mt: 1 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>排名</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>出價者</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>金額</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>時間</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bidHistory.map((b, i) => (
                        <TableRow key={b.BidID}>
                          <TableCell>
                            {i === 0
                              ? <Chip label="最高" size="small" sx={{ bgcolor: '#FFD700', color: '#333', fontWeight: 700 }} />
                              : `#${i + 1}`
                            }
                          </TableCell>
                          <TableCell>{b.bidder_name}</TableCell>
                          <TableCell>NT$ {parseFloat(b.bid_amount).toLocaleString()}</TableCell>
                          <TableCell>{new Date(b.bid_time).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Collapse>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Description */}
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>商品描述</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {item.description || '（無描述）'}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Seller */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                {item.seller_name?.[0]}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600}>{item.seller_name}</Typography>
                <Typography
                  component={Link} to={`/profile/${item.SellerID}`}
                  variant="caption" color="primary" sx={{ textDecoration: 'none' }}
                >
                  查看賣家留言板
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Seller comment board */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            賣家留言板
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({item.seller_name})
            </Typography>
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {comments.length === 0
            ? <Typography color="text.secondary">目前沒有留言。</Typography>
            : comments.map(c => (
              <Paper key={c.CommentID} variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 2 }}>
                <Typography variant="body2">{c.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  — {c.writer_name}，{new Date(c.post_time).toLocaleString()}
                </Typography>
              </Paper>
            ))
          }

          {user && (
            <Box sx={{ mt: 2 }}>
              {cmtMsg && <Alert severity={cmtMsg.type} sx={{ mb: 1 }}>{cmtMsg.text}</Alert>}
              <TextField
                fullWidth multiline rows={2} size="small"
                placeholder="留言給賣家…"
                value={comment} onChange={e => setComment(e.target.value)}
              />
              <Button variant="outlined" sx={{ mt: 1 }} onClick={handleComment} disabled={!comment.trim()}>
                送出留言
              </Button>
            </Box>
          )}
          {!user && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              <Link to="/login" style={{ color: 'inherit' }}>登入</Link>後才能留言
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  )
}

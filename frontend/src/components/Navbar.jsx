import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Badge from '@mui/material/Badge'
import Popover from '@mui/material/Popover'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import { styled, alpha } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import SellOutlinedIcon from '@mui/icons-material/SellOutlined'
import { getUser, clearUser, apiPost, apiGet } from '../api'

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 24,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
  '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.25) },
  width: '100%',
  maxWidth: 480,
  margin: '0 auto',
}))

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  right: 0,
  top: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 5, 1, 2),
    fontSize: 14,
  },
}))

function formatTime(dt) {
  const diff = new Date() - new Date(dt)
  if (diff < 60000)    return '剛剛'
  if (diff < 3600000)  return `${Math.floor(diff / 60000)} 分鐘前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時前`
  return `${Math.floor(diff / 86400000)} 天前`
}

export default function Navbar() {
  const navigate    = useNavigate()
  const user        = getUser()
  const [anchor,    setAnchor]    = useState(null)
  const [searchVal, setSearchVal] = useState('')

  const [notifAnchor,   setNotifAnchor]   = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount,   setUnreadCount]   = useState(0)

  const loadNotifs = async () => {
    if (!user) return
    const r = await apiGet('notifications/list.php')
    if (r.success) {
      setNotifications(r.data.notifications)
      setUnreadCount(r.data.unread_count)
    }
  }

  useEffect(() => { loadNotifs() }, [])

  const handleSearch = () => {
    const q = searchVal.trim()
    if (!q) return
    navigate('/', { state: { search: q } })
  }

  const handleLogout = async () => {
    await apiPost('auth/logout.php')
    clearUser()
    setAnchor(null)
    navigate('/')
    window.location.reload()
  }

  const handleOpenNotif = (e) => {
    setNotifAnchor(e.currentTarget)
    loadNotifs()
  }

  const markRead = async (n) => {
    if (n.is_read != 0) return
    await apiPost('notifications/mark_read.php', { ids: [parseInt(n.id)] })
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: 1 } : x))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    await apiPost('notifications/mark_read.php', { all: true })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
    setUnreadCount(0)
  }

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#317b88' }}>
      <Toolbar sx={{ gap: 1 }}>
        {/* Logo */}
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ cursor: 'pointer', whiteSpace: 'nowrap', mr: 2 }}
          onClick={() => navigate('/')}
        >
          Cream Auction System
        </Typography>

        {/* Search */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Search>
            <StyledInputBase
              placeholder="搜尋商品…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <SearchIconWrapper onClick={handleSearch}>
              <SearchIcon fontSize="small" />
            </SearchIconWrapper>
          </Search>
        </Box>

        {/* Sell icon */}
        <IconButton color="inherit" onClick={() => navigate('/sell')} title="上架商品">
          <SellOutlinedIcon />
        </IconButton>

        {/* Notification icon */}
        <IconButton
          color="inherit"
          title="通知"
          onClick={user ? handleOpenNotif : () => navigate('/login')}
        >
          <Badge badgeContent={unreadCount || null} color="error" max={99}>
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>

        {/* Account icon */}
        <IconButton color="inherit" onClick={e => setAnchor(e.currentTarget)} title="帳號">
          <AccountCircleOutlinedIcon />
        </IconButton>

        {/* Account menu */}
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          {user ? [
            <MenuItem key="name"     disabled>{user.name}</MenuItem>,
            <MenuItem key="profile"  onClick={() => { navigate(`/profile/${user.user_id}`); setAnchor(null) }}>我的留言板</MenuItem>,
            <MenuItem key="listings" onClick={() => { navigate('/my-listings'); setAnchor(null) }}>我的上架</MenuItem>,
            <MenuItem key="bids"     onClick={() => { navigate('/my-bids');     setAnchor(null) }}>我的出價</MenuItem>,
            <MenuItem key="sell"     onClick={() => { navigate('/sell');        setAnchor(null) }}>上架商品</MenuItem>,
            <MenuItem key="logout"   onClick={handleLogout} sx={{ color: 'error.main' }}>登出</MenuItem>,
          ] : [
            <MenuItem key="login"    onClick={() => { navigate('/login');    setAnchor(null) }}>登入</MenuItem>,
            <MenuItem key="register" onClick={() => { navigate('/register'); setAnchor(null) }}>註冊</MenuItem>,
          ]}
        </Menu>

        {/* Notification popover */}
        <Popover
          open={Boolean(notifAnchor)}
          anchorEl={notifAnchor}
          onClose={() => setNotifAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { width: 340, maxHeight: 460, overflow: 'hidden', display: 'flex', flexDirection: 'column' } } }}
        >
          {/* Header */}
          <Box sx={{
            px: 2, py: 1.5, flexShrink: 0,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid', borderColor: 'divider',
          }}>
            <Typography variant="subtitle2" fontWeight={700}>通知</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllRead} sx={{ fontSize: 12, minWidth: 0, py: 0.25 }}>
                全部已讀
              </Button>
            )}
          </Box>

          {/* List */}
          {notifications.length === 0 ? (
            <Typography align="center" sx={{ py: 5, color: 'text.secondary', fontSize: 14 }}>
              暫無通知
            </Typography>
          ) : (
            <List disablePadding sx={{ overflowY: 'auto' }}>
              {notifications.map((n, i) => (
                <Box key={n.id}>
                  <ListItemButton
                    onClick={() => {
                      markRead(n)
                      if (n.item_id) { navigate(`/item/${n.item_id}`); setNotifAnchor(null) }
                    }}
                    sx={{
                      alignItems: 'flex-start', py: 1.5,
                      bgcolor: n.is_read == 0 ? alpha('#317b88', 0.07) : 'transparent',
                    }}
                  >
                    <ListItemText
                      primary={n.message}
                      secondary={formatTime(n.created_at)}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: n.is_read == 0 ? 600 : 400 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItemButton>
                  {i < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Popover>
      </Toolbar>
    </AppBar>
  )
}

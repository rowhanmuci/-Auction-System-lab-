import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import { styled, alpha } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import SellOutlinedIcon from '@mui/icons-material/SellOutlined'
import { getUser, clearUser, apiPost } from '../api'

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

export default function Navbar() {
  const navigate    = useNavigate()
  const user        = getUser()
  const [anchor,    setAnchor]    = useState(null)
  const [searchVal, setSearchVal] = useState('')

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

        {/* Icons */}
        <IconButton color="inherit" onClick={() => navigate('/sell')} title="上架商品">
          <SellOutlinedIcon />
        </IconButton>
        <IconButton color="inherit" title="通知">
          <NotificationsNoneIcon />
        </IconButton>
        <IconButton color="inherit" onClick={e => setAnchor(e.currentTarget)} title="帳號">
          <AccountCircleOutlinedIcon />
        </IconButton>

        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          {user ? [
            <MenuItem key="name"     disabled>{user.name}</MenuItem>,
            <MenuItem key="profile"  onClick={() => { navigate(`/profile/${user.user_id}`); setAnchor(null) }}>我的留言板</MenuItem>,
            <MenuItem key="listings" onClick={() => { navigate('/my-listings'); setAnchor(null) }}>我的上架</MenuItem>,
            <MenuItem key="bids"     onClick={() => { navigate('/my-bids');     setAnchor(null) }}>我的出價</MenuItem>,
            <MenuItem key="sell"     onClick={() => { navigate('/sell');         setAnchor(null) }}>上架商品</MenuItem>,
            <MenuItem key="logout"   onClick={handleLogout} sx={{ color: 'error.main' }}>登出</MenuItem>,
          ] : [
            <MenuItem key="login"    onClick={() => { navigate('/login');    setAnchor(null) }}>登入</MenuItem>,
            <MenuItem key="register" onClick={() => { navigate('/register'); setAnchor(null) }}>註冊</MenuItem>,
          ]}
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

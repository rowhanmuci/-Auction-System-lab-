import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import CircularProgress from '@mui/material/CircularProgress'
import ItemCard from '../components/ItemCard'
import { apiGet } from '../api'

export default function HomePage() {
  const location    = useLocation()
  const searchQuery = location.state?.search ?? ''
  const [categories, setCategories] = useState([])
  const [items,      setItems]      = useState([])
  const [selected,   setSelected]   = useState('')
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    apiGet('categories/list.php').then(r => {
      if (r.success) setCategories(r.data)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    if (searchQuery) {
      apiGet('items/search.php', { q: searchQuery }).then(r => {
        if (r.success) setItems(r.data)
        setLoading(false)
      })
    } else {
      const params = selected ? { category_id: selected } : {}
      apiGet('items/list.php', params).then(r => {
        if (r.success) setItems(r.data)
        setLoading(false)
      })
    }
  }, [selected, searchQuery])

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
      <Container maxWidth="lg" sx={{ pt: 3 }}>

        {searchQuery ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            搜尋「<strong>{searchQuery}</strong>」的結果
          </Typography>
        ) : (
          /* Category filter */
          <Box sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
            <ToggleButtonGroup
              value={selected}
              exclusive
              onChange={(_, v) => { if (v !== null || selected) setSelected(v ?? '') }}
              size="small"
              sx={{ flexWrap: 'nowrap', gap: 1 }}
            >
              <ToggleButton value="" sx={{ borderRadius: '20px !important', px: 2, whiteSpace: 'nowrap' }}>
                所有商品
              </ToggleButton>
              {categories.map(c => (
                <ToggleButton key={c.CategoryID} value={String(c.CategoryID)}
                  sx={{ borderRadius: '20px !important', px: 2, whiteSpace: 'nowrap' }}>
                  {c.category_name}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Item grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : items.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ mt: 8 }}>
            {searchQuery ? '找不到符合的商品。' : '目前沒有進行中的商品。'}
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {items.map(item => (
              <Grid key={item.ItemID} item xs={6} sm={4} md={3} lg={2.4}>
                <ItemCard item={item} />
              </Grid>
            ))}
          </Grid>
        )}

      </Container>
    </Box>
  )
}

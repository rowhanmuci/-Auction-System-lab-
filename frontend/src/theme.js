import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary:    { main: '#E53935' },
    secondary:  { main: '#FF7043' },
    background: { default: '#F6F6F6', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Noto Sans TC", "Helvetica Neue", Arial, sans-serif',
    button: { textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
})

export default theme

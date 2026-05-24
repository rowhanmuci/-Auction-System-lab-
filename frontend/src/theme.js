import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary:    { main: '#317b88' },
    secondary:  { main: '#d63b99' },
    background: { default: '#F5F9FA', paper: '#FFFFFF' },
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

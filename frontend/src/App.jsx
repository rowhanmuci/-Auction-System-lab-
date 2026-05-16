import { HashRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ItemDetailPage from './pages/ItemDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SellPage from './pages/SellPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route path="/"                   element={<HomePage />} />
        <Route path="/item/:itemId"        element={<ItemDetailPage />} />
        <Route path="/login"              element={<LoginPage />} />
        <Route path="/register"           element={<RegisterPage />} />
        <Route path="/sell"               element={<SellPage />} />
        <Route path="/profile/:userId"    element={<ProfilePage />} />
      </Routes>
    </HashRouter>
  )
}

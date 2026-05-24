import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ItemDetailPage from './pages/ItemDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SellPage from './pages/SellPage'
import ProfilePage from './pages/ProfilePage'
import MyListingsPage from './pages/MyListingsPage'
import MyBidsPage from './pages/MyBidsPage'

const HIDE_NAVBAR = ['/login', '/register']

function Layout() {
  const { pathname } = useLocation()
  return (
    <>
      {!HIDE_NAVBAR.includes(pathname) && <Navbar />}
      <Routes>
        <Route path="/"                element={<HomePage />} />
        <Route path="/item/:itemId"    element={<ItemDetailPage />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/sell"            element={<SellPage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/my-listings"     element={<MyListingsPage />} />
        <Route path="/my-bids"         element={<MyBidsPage />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  )
}

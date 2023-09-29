import './App.css'

import { Outlet } from "react-router-dom"
import Navbar from './components/Navbar'

import 'tailwindcss/tailwind.css';
import Footer from './components/Footer';
function App() {
  return (
    <>
      <Navbar />
      <Outlet  />
      <Footer />

    </>
  )
}

export default App

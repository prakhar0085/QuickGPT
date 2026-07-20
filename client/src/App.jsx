import React, { use, useState } from 'react'
import Sidebar from './components/Sidebar'
import { Route, Routes, useLocation } from 'react-router-dom'
import ChatBox from './components/ChatBox'
import Credits from './pages/Credits'
import Community from './pages/Community'
import { assets } from './assets/assets'
import './assets/prism.css'
import Loading from './pages/Loading'
import { useAppContext } from './context/AppContext'
import Login from './pages/Login'
import {Toaster} from 'react-hot-toast'

const App = () => {

  const {user, loadingUser, theme} = useAppContext()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const {pathname} = useLocation()

  if(pathname === '/loading' || loadingUser) return <Loading />

  return (
    <>
      <Toaster />

      {user ? (
        <div className='bg-zinc-50 dark:bg-bg-dark text-zinc-900 dark:text-zinc-50 w-screen h-screen overflow-hidden flex transition-colors duration-200 relative'>
          {/* Ambient background glows for dark mode */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/8 blur-[120px] rounded-full pointer-events-none select-none hidden dark:block"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/8 blur-[120px] rounded-full pointer-events-none select-none hidden dark:block"></div>
          
          <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}/>
          <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
            {/* Mobile Top Header */}
            <div className="flex items-center justify-between p-3 px-5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md md:hidden">
              <img src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark} alt="Logo" className="h-10" />
              <button onClick={() => setIsMenuOpen(true)} className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer">
                <img src={assets.menu_icon} className='w-4 dark:invert' alt="Menu" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <Routes>
                <Route path='/' element={<ChatBox />} />
                <Route path='/credits' element={<Credits />} />
                <Route path='/community' element={<Community />} />
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        <div className='relative flex items-center justify-center h-screen w-screen bg-[#020202] overflow-hidden p-4'>
          {/* Vercel/Linear style grid backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25"></div>
          
          <Login />
        </div>
      )}
    </>
  )
}

export default App


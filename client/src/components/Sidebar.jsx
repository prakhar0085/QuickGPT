import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import moment from 'moment'
import toast from 'react-hot-toast'

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {

    const {chats: contextChats, selectedChat, setSelectedChat, theme, setTheme, user, navigate, createNewChat, axios, setChats, fetchUsersChats, setToken, token} = useAppContext()
    const chats = contextChats || []
    const [search, setSearch] = useState('')

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        toast.success('Logged out successfully')
    }

    const deleteChat = async (e, chatId) => {
        try {
            e.stopPropagation()
            const confirm = window.confirm('Are you sure you want to delete this chat?')
            if(!confirm) return
            const { data } = await axios.post('/api/chat/delete', {chatId}, { headers: { Authorization: token } })
            if(data.success){
                setChats(prev => prev.filter(chat => chat._id !== chatId))
                await fetchUsersChats()
                toast.success(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

  return (
    <div className={`flex flex-col h-screen w-72 min-w-72 p-5 bg-zinc-50 dark:bg-sidebar-dark border-r border-zinc-200 dark:border-border-dark transition-all duration-300 max-md:fixed left-0 z-50 ${!isMenuOpen && 'max-md:-translate-x-full'}`}>
      {/* Logo */}
      <div className="flex items-center justify-between mb-6">
        <img onClick={()=>navigate('/')} src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark} alt="Logo" className='h-11 cursor-pointer hover:opacity-90 transition-opacity'/>
      </div>

      {/* New Chat Button */}
      <button onClick={createNewChat} className='flex justify-center items-center w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 cursor-pointer'>
        <span className='mr-1.5 text-sm'>+</span> New Chat
      </button>

      {/* Search Conversations */}
      <div className='flex items-center gap-2 px-3 py-2 mt-4 border border-zinc-200 dark:border-border-dark bg-white dark:bg-surface-dark/50 rounded-lg'>
        <img src={assets.search_icon} className='w-3.5 opacity-50 dark:invert' alt="" />
        <input onChange={(e)=>setSearch(e.target.value)} value={search} type="text" placeholder='Search chats...' className='text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 bg-transparent outline-none w-full'/>
      </div>

      {/* Recent Chats Section */}
      <div className="flex flex-col flex-1 overflow-hidden mt-6">
        {chats.length > 0 && <p className='text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2'>Recent Chats</p>}
        <div className='flex-1 overflow-y-auto pr-1 space-y-1 scrollbar-thin'>
          {
              chats.filter((chat) => {
                if (!chat) return false;
                const searchLower = search.toLowerCase();
                const firstMsgContent = chat.messages?.[0]?.content;
                if (firstMsgContent) {
                  return firstMsgContent.toLowerCase().includes(searchLower);
                }
                const name = chat.name || '';
                return name.toLowerCase().includes(searchLower);
              }).map((chat)=>(
                  <div onClick={()=> {navigate('/'); setSelectedChat(chat); setIsMenuOpen(false)}}
                   key={chat._id} 
                   className={`group flex items-center justify-between p-2 px-3 rounded-lg cursor-pointer border transition-all duration-150 ${
                     selectedChat?._id === chat._id
                       ? "bg-zinc-200/50 dark:bg-surface-dark border-zinc-300/60 dark:border-border-dark text-zinc-950 dark:text-zinc-50 font-medium"
                       : "bg-transparent border-transparent text-zinc-650 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-surface-dark/30 hover:text-zinc-950 dark:hover:text-zinc-200"
                   }`}
                  >
                      <div className="flex-1 min-w-0 pr-2">
                          <p className='text-xs truncate font-medium text-zinc-800 dark:text-zinc-200'>
                              {(chat.messages && chat.messages.length > 0) ? chat.messages[0].content.slice(0,32) : (chat.name || 'New Chat')}
                          </p>
                          <p className='text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5'>{moment(chat.updatedAt).fromNow()}</p>
                      </div>
                      <button 
                        onClick={e => { e.stopPropagation(); toast.promise(deleteChat(e, chat._id), {loading: 'deleting...', success: 'Deleted', error: 'Failed' }) }}
                        className='opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-surface-dark p-1 rounded transition-all cursor-pointer'
                      >
                        <img src={assets.bin_icon} className='w-3 opacity-60 hover:opacity-100 dark:invert' alt="Delete" />
                      </button>
                  </div>
              ))
          }
        </div>
      </div>

      {/* Navigation Links */}
      <div className="space-y-1.5 mt-auto border-t border-zinc-200 dark:border-border-dark pt-4">
        <div 
          onClick={()=> {navigate('/community'); setIsMenuOpen(false)}} 
          className="flex items-center gap-3 p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-surface-dark/50 hover:text-zinc-950 dark:hover:text-zinc-200 cursor-pointer transition-colors"
        >
          <img src={assets.gallery_icon} className='w-4 dark:invert opacity-70' alt="" />
          <span className="text-xs font-medium">Community Gallery</span>
        </div>
 
        <div 
          onClick={()=> {navigate('/credits'); setIsMenuOpen(false)}} 
          className="flex flex-col p-3 mt-1.5 rounded-xl border border-zinc-200 dark:border-border-dark bg-white dark:bg-surface-dark/30 hover:border-zinc-300 dark:hover:border-border-dark/60 cursor-pointer transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-400">
              <img src={assets.diamond_icon} className='w-4 dark:invert opacity-75' alt="" />
              <span className="text-xs font-semibold">Credits Balance</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/50">
              {user?.credits ?? 0}
            </span>
          </div>
          
          {/* Visual Progress bar */}
          <div className="w-full bg-zinc-100 dark:bg-zinc-900/60 rounded-full h-1.5 mt-3 overflow-hidden border border-zinc-200/20 dark:border-border-dark/20">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (((user?.credits ?? 0) / 150) * 100))}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center mt-1.5 text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">
            <span>Usage</span>
            <span>Limit: 150 credits</span>
          </div>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className='flex items-center justify-between p-2 rounded-lg border border-zinc-200 dark:border-border-dark bg-white dark:bg-surface-dark/40 mt-3'>
          <div className='flex items-center gap-3 text-zinc-600 dark:text-zinc-400'>
              <img src={assets.theme_icon} className='w-4 dark:invert opacity-70' alt="" />
              <span className='text-xs font-medium'>Dark Mode</span>
          </div>
          <label className='relative inline-flex cursor-pointer items-center'>
              <input onChange={()=> setTheme(theme === 'dark' ? 'light' : 'dark')} type="checkbox" className="sr-only peer" checked={theme === 'dark'}/>
              <div className="w-8 h-4 bg-zinc-300 dark:bg-border-dark rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-accent"></div>
          </label>
      </div>
 
      {/* User Account widget */}
      <div className='flex items-center gap-3 p-2.5 mt-3 border border-zinc-200 dark:border-border-dark bg-white dark:bg-surface-dark/20 rounded-xl relative group'>
          <img src={assets.user_icon} className='w-6.5 h-6.5 rounded-full border border-zinc-300 dark:border-border-dark' alt="" />
          <div className="flex-1 min-w-0">
              <p className='text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate'>{user ? user.name : 'Not Logged In'}</p>
              {user && <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{user.email}</p>}
          </div>
          {user && (
            <button 
              onClick={logout} 
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-surface-dark text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-250 transition-all cursor-pointer"
              title="Log out"
            >
              <img src={assets.logout_icon} className='w-3.5 not-dark:invert' alt="Log out" />
            </button>
          )}
      </div>

      {/* Mobile Close Button */}
      <button onClick={()=> setIsMenuOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 md:hidden cursor-pointer">
        <img src={assets.close_icon} className='w-3.5 dark:invert' alt="Close" />
      </button>

    </div>
  )
}

export default Sidebar

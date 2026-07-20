import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'

const ChatBox = () => {

  const containerRef = useRef(null)
  const abortControllerRef = useRef(null)

  const {selectedChat, setSelectedChat, setChats, theme, user, axios, token, setUser} = useAppContext()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const onSubmit = async (e) => {
    try {
      e.preventDefault() 
      if(!user) return toast('Login to send message')
        setLoading(true)
        const promptCopy = prompt
        setPrompt('')

        if (mode === 'image') {
          const userMsg = { role: 'user', content: promptCopy, timestamp: Date.now(), isImage: false }
          setMessages(prev => [...prev, userMsg])
          const {data} = await axios.post(`/api/message/image`, {chatId: selectedChat._id, prompt: promptCopy, isPublished}, {headers: { Authorization: token }})

          if(data.success){
            setMessages(prev => [...prev, data.reply])
            setUser(prev => ({...prev, credits: prev.credits - 2}))
            
            const updatedMessages = [...selectedChat.messages, userMsg, data.reply]
            setSelectedChat(prev => ({ ...prev, messages: updatedMessages }))
            setChats(prev => prev.map(c => c._id === selectedChat._id ? { ...c, messages: updatedMessages, updatedAt: new Date().toISOString() } : c))
          }else{
            toast.error(data.message)
            setPrompt(promptCopy)
          }
        } else {
          // Text SSE Streaming
          const controller = new AbortController()
          abortControllerRef.current = controller

          const userMsg = { role: 'user', content: promptCopy, timestamp: Date.now(), isImage: false }
          const assistantMessageId = `temp-${Date.now()}`
          const initialAssistantMsg = { _id: assistantMessageId, role: 'assistant', content: '', timestamp: Date.now(), isImage: false }

          setMessages(prev => [...prev, userMsg, initialAssistantMsg])

          const serverUrl = import.meta.env.VITE_SERVER_URL || '';
          const response = await fetch(`${serverUrl}/api/message/text`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            },
            body: JSON.stringify({ chatId: selectedChat._id, prompt: promptCopy }),
            signal: controller.signal
          })

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to generate response');
          }

          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errData = await response.json();
            if (!errData.success) {
              throw new Error(errData.message || 'Failed to generate response');
            }
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder("utf-8")
          let done = false
          let accumulatedText = ""
          let buffer = ""

          while (!done) {
            const { value, done: readerDone } = await reader.read()
            done = readerDone
            if (value) {
              buffer += decoder.decode(value, { stream: !done })
              const lines = buffer.split('\n')
              buffer = lines.pop()

              for (const line of lines) {
                const trimmed = line.trim()
                if (!trimmed) continue
                if (trimmed.startsWith('data: ')) {
                  const dataStr = trimmed.slice(6)
                  if (dataStr === '[DONE]') {
                    done = true
                    break
                  }
                  try {
                    const parsed = JSON.parse(dataStr)
                    if (parsed.error) {
                      throw new Error(parsed.error)
                    }
                    if (parsed.content) {
                      accumulatedText += parsed.content
                      setMessages(prev => {
                        const updated = [...prev]
                        const idx = updated.findIndex(m => m._id === assistantMessageId)
                        if (idx !== -1) {
                          updated[idx] = { ...updated[idx], content: accumulatedText }
                        }
                        return updated
                      })
                    }
                  } catch (err) {
                    console.error("Error parsing stream chunk:", err)
                  }
                }
              }
            }
          }

          const finalAssistantMsg = { role: 'assistant', content: accumulatedText, timestamp: Date.now(), isImage: false }
          const updatedMessages = [...selectedChat.messages, userMsg, finalAssistantMsg]
          setSelectedChat(prev => ({ ...prev, messages: updatedMessages }))
          setChats(prev => prev.map(c => c._id === selectedChat._id ? { ...c, messages: updatedMessages, updatedAt: new Date().toISOString() } : c))
          setUser(prev => ({ ...prev, credits: prev.credits - 1 }))
        }
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.success('Generation stopped')
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1]
          if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content) {
            const userMsg = prev[prev.length - 2]
            const updatedMessages = [...selectedChat.messages, userMsg, { ...lastMsg, _id: undefined }]
            setSelectedChat(prevChat => ({ ...prevChat, messages: updatedMessages }))
            setChats(prevChats => prevChats.map(c => c._id === selectedChat._id ? { ...c, messages: updatedMessages, updatedAt: new Date().toISOString() } : c))
            setUser(prevUser => ({ ...prevUser, credits: prevUser.credits - 1 }))
          } else {
            setMessages(selectedChat.messages)
          }
          return prev
        })
      } else {
        toast.error(error.message)
        setMessages(selectedChat.messages)
        setPrompt(promptCopy)
      }
    } finally {
      setPrompt('')
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  useEffect(()=>{
    if(selectedChat){
      setMessages(selectedChat.messages)
    }
  },[selectedChat])

  useEffect(()=>{
    if(containerRef.current){
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  },[messages])

  return (
    <div className='flex flex-col h-full bg-zinc-50 dark:bg-bg-dark relative overflow-hidden'>
      
      {/* Chat Messages scroll area */}
      <div ref={containerRef} className='flex-1 overflow-y-auto w-full max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-4'>
        {messages.length === 0 && (
          <div className='h-full flex flex-col items-center justify-center text-center mt-12 md:mt-24 px-4 welcome-entrance'>
            <div className="px-6 py-4 bg-zinc-150/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl mb-5 shadow-sm logo-box-animated transition-all duration-300 hover:scale-[1.03]">
              <img src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark} alt="Logo" className='h-16 max-w-full'/>
            </div>
            <h2 className='text-2xl md:text-3xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100'>
              How can I help you today?
            </h2>
            <p className='text-xs md:text-sm text-zinc-400 dark:text-zinc-500 mt-2 max-w-md leading-relaxed'>
              Ask questions, write code, or generate high-quality realistic images. Select a mode below to get started.
            </p>
            
            {/* Suggestion Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full max-w-xl">
              <div 
                onClick={() => { setMode('text'); setPrompt('Explain quantum computing in simple terms') }}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-border-dark bg-white dark:bg-surface-dark text-left hover:border-accent/50 dark:hover:border-accent/50 hover:bg-zinc-50 dark:hover:bg-bg-dark/40 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm"
              >
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Explain quantum computing</p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">Use simple terms and daily life analogies.</p>
              </div>
              <div 
                onClick={() => { setMode('image'); setPrompt('A futuristic city with flying vehicles in cyberpunk style, highly detailed, 8k') }}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-border-dark bg-white dark:bg-surface-dark text-left hover:border-accent/50 dark:hover:border-accent/50 hover:bg-zinc-50 dark:hover:bg-bg-dark/40 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm"
              >
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Generate a cyberpunk city</p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">Produce a highly detailed cyberpunk image.</p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index)=> (
          <Message 
            key={index} 
            message={message} 
            isStreaming={loading && mode === 'text' && index === messages.length - 1 && message.role === 'assistant'}
          />
        ))}

        {/* Three Dots Loading (only for image mode since text streams) */}
        {loading && mode === 'image' && (
          <div className='flex items-start gap-3 py-4 max-w-[85%]'>
            <div className='w-6.5 h-6.5 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-950 shadow-sm'>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-ping"></div>
            </div>
            <div className="space-y-1.5 flex-1 px-1 py-1 w-fit max-w-[120px]">
              <div className='loader flex items-center gap-1.5 justify-center py-1'>
                <div className='w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-200 animate-bounce'></div>
                <div className='w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-200 animate-bounce'></div>
                <div className='w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-200 animate-bounce'></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Input Area */}
      <div className="border-t border-zinc-200 dark:border-border-dark bg-zinc-50/50 dark:bg-bg-dark/80 backdrop-blur-lg pb-8 pt-4">
        <div className="max-w-3xl mx-auto px-4 w-full">
          
          {/* Image mode config checkbox */}
          {mode === 'image' && (
            <div className="flex items-center gap-2 mb-3 bg-white dark:bg-surface-dark border border-zinc-200 dark:border-border-dark px-3 py-1.5 rounded-lg w-fit mx-auto transition-all shadow-sm">
              <input 
                type="checkbox" 
                id="publishCheck" 
                className="cursor-pointer rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" 
                checked={isPublished} 
                onChange={(e)=>setIsPublished(e.target.checked)}
              />
              <label htmlFor="publishCheck" className="text-[11px] text-zinc-600 dark:text-zinc-400 cursor-pointer select-none font-medium">
                Publish generated image to Community Gallery
              </label>
            </div>
          )}

          {/* Prompt Form */}
          <form onSubmit={onSubmit} className="bg-white dark:bg-surface-dark border border-zinc-200 dark:border-border-dark rounded-xl shadow-lg focus-within:border-accent/85 dark:focus-within:border-accent/85 focus-within:ring-1 focus-within:ring-accent/40 transition-all p-2 flex items-center gap-3">
            {/* Sleek Switch Selector */}
            <div className="relative flex items-center bg-zinc-100 dark:bg-bg-dark border border-zinc-200/50 dark:border-border-dark rounded-lg p-0.5">
              <button 
                type="button" 
                onClick={()=>setMode('text')} 
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${mode === 'text' ? 'bg-white dark:bg-surface-dark text-zinc-950 dark:text-zinc-50 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
              >
                Text
              </button>
              <button 
                type="button" 
                onClick={()=>setMode('image')} 
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${mode === 'image' ? 'bg-white dark:bg-surface-dark text-zinc-950 dark:text-zinc-50 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
              >
                Image
              </button>
            </div>

            <input 
              onChange={(e)=>setPrompt(e.target.value)} 
              value={prompt} 
              type="text" 
              placeholder={mode === 'text' ? "Ask a question..." : "Describe the image you want to generate..."} 
              className="flex-1 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 bg-transparent outline-none py-1.5 px-1" 
              required
            />

            {loading && mode === 'text' ? (
              <button 
                type="button"
                onClick={handleStop}
                className="p-2 bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-lg transition-colors cursor-pointer flex justify-center items-center"
                title="Stop generation"
              >
                <img src={assets.stop_icon} className="w-3.5 h-3.5 invert" alt="Stop" />
              </button>
            ) : (
              <button 
                type="submit"
                disabled={loading}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 active:bg-black dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:active:bg-zinc-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                <img src={loading ? assets.stop_icon : assets.send_icon} className="w-3.5 h-3.5 dark:invert" alt="Submit" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatBox

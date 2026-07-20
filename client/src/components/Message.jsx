import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import moment from 'moment'
import Markdown from 'react-markdown'
import Prism from 'prismjs'
import toast from 'react-hot-toast'

const CodeBlock = ({ children, ...props }) => {
  let codeText = ""
  let language = "code"

  const childrenArray = React.Children.toArray(children)
  const codeElement = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === "code"
  )

  if (codeElement) {
    codeText = String(codeElement.props.children || "").replace(/\n$/, "")
    const className = codeElement.props.className || ""
    language = className.replace("language-", "") || "code"
  } else {
    codeText = React.Children.toArray(children).map(c => typeof c === 'string' ? c : '').join('')
  }

  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Copied to clipboard!")
    } catch (err) {
      toast.error("Failed to copy")
    }
  }

  useEffect(() => {
    Prism.highlightAll()
  }, [children])

  return (
    <div className="relative my-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-[#0d0e12] overflow-hidden shadow-sm select-text">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200/50 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-900/60 select-none">
        {/* Mac-Style Dot Controls */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
        </div>
        
        {/* Language & Copy Button */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{language}</span>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            type="button"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-600 dark:text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-2 4h5m0 0l-3-3m3 3l-3 3" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Code Text Content */}
      <pre className="!p-4 !m-0 overflow-x-auto !bg-transparent text-zinc-100 !border-0 !rounded-none text-xs md:text-sm font-mono leading-relaxed select-text">
        {children}
      </pre>
    </div>
  )
}

const Message = ({message, isStreaming}) => {
 
  useEffect(()=>{
    Prism.highlightAll()
  },[message.content])
 
  const isUser = message.role === "user"
 
  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} py-2`}>
      <div className={`flex items-start gap-3 ${isUser ? 'max-w-[90%] md:max-w-[80%] flex-row-reverse' : 'w-full flex-row'}`}>
        
        {/* Avatar Section */}
        {isUser ? (
          <img 
            src={assets.user_icon} 
            alt="User" 
            className='w-8 h-8 rounded-full border border-zinc-200 dark:border-border-dark flex-shrink-0'
          />
        ) : (
          <div className="w-8 h-8 rounded-full border border-zinc-200 dark:border-border-dark flex items-center justify-center bg-zinc-950 dark:bg-zinc-100 flex-shrink-0 shadow-sm">
            <span className="text-[10px] font-bold text-zinc-100 dark:text-zinc-900 tracking-tight">AI</span>
          </div>
        )}
 
        {/* Bubble Card Container */}
        <div className={`flex flex-col min-w-0 ${isUser ? '' : 'flex-1'}`}>
          {/* Header Row */}
          <div className={`flex items-center gap-2 mb-1 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              {isUser ? "You" : "QuickGPT"}
            </span>
            <span className='text-[9px] text-zinc-400 dark:text-zinc-500 font-medium'>
              {moment(message.timestamp).format('LT')}
            </span>
          </div>
 
          {/* Card Body */}
          <div className={
            isUser 
              ? 'border border-zinc-200/80 dark:border-border-dark shadow-sm rounded-2xl rounded-tr-none px-4 py-3 bg-zinc-100/70 dark:bg-surface-dark/40 text-zinc-800 dark:text-zinc-200 transition-colors duration-150' 
              : 'text-zinc-800 dark:text-zinc-200 px-1 py-1'
          }>
            {message.isImage ? (
              <div className="flex flex-col gap-2 mt-1 max-w-md">
                <img 
                  src={message.content} 
                  alt="AI Generation" 
                  className='w-full max-h-[360px] object-contain rounded-lg border border-zinc-200 dark:border-border-dark' 
                />
                <div className="flex justify-end gap-2 mt-1">
                  <a 
                    href={message.content} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[10px] font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    Open Original
                  </a>
                </div>
              </div>
            ) : (
              <div className={`text-sm leading-relaxed prose-custom max-w-none break-words ${isStreaming ? 'streaming-cursor' : ''}`}>
                <Markdown components={{ pre: CodeBlock }}>{message.content}</Markdown>
              </div>
            )}
          </div>
        </div>
 
      </div>
    </div>
  )
}

export default Message

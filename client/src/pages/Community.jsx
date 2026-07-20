import React, { useEffect, useState } from 'react'
import { dummyPublishedImages } from '../assets/assets'
import Loading from './Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Community = () => {

  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const { axios } = useAppContext()

  const fetchImages = async () => {
    try {
      const {data} = await axios.get('/api/user/published-images')
      if (data.success) {
        setImages(data.images)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  useEffect(()=>{
    fetchImages()
  },[])

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url)
    toast.success("Image link copied!")
  }

  if(loading) return <Loading />

  return (
    <div className='max-w-6xl mx-auto px-6 py-16 md:py-24 h-full overflow-y-auto'>
      <div className="text-left mb-8 md:mb-12">
        <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white'>
          Community Showcase
        </h1>
        <p className='text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-3 max-w-md leading-relaxed'>
          Browse generated artwork and high-fidelity assets created by the QuickGPT community.
        </p>
      </div>

      {images.length > 0 ? (
        <div className='columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6 mt-8 [column-fill:_balance] w-full'>
          {images.map((item, index)=>(
            <div 
              key={index} 
              className='break-inside-avoid group relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-border-dark bg-zinc-100 dark:bg-surface-dark shadow-sm hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 mb-6'
            >
              <img 
                src={item.imageUrl} 
                alt="Showcase" 
                className='w-full h-auto object-cover group-hover:scale-[1.015] transition-transform duration-500 ease-out'
              />
              
              {/* Hover Details Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Created by</p>
                <p className="text-xs font-bold text-white mt-0.5">{item.userName}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                  <a 
                    href={item.imageUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[10px] font-bold text-white bg-zinc-900/85 border border-white/10 hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Open
                  </a>
                  <button 
                    onClick={() => handleCopyLink(item.imageUrl)} 
                    className="text-[10px] font-bold text-white bg-white/10 border border-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-center text-zinc-500 mt-16 text-sm font-medium'>No community images available yet.</p>
      )}
    </div>
  )
}

export default Community

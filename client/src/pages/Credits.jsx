import React, { useEffect, useState } from 'react'
import { dummyPlans } from '../assets/assets'
import Loading from './Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

const Credits = () => {

  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const { token, axios, user, setUser } = useAppContext()

  const fetchPlans = async () => {
   try {
    const { data } = await axios.get('/api/credit/plan', {
      headers: { Authorization: token }
    })
    if (data.success){
      setPlans(data.plans)
    }else{
      toast.error(data.message || 'Failed to fetch plans.')
    }
   } catch (error) {
    toast.error(error.message)
   }
   setLoading(false)
  }

  const purchasePlan = async (planId) => {
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        return toast.error("Failed to load payment gateway SDK. Please check your internet connection.")
      }

      const { data } = await axios.post('/api/credit/purchase', { planId }, { headers: { Authorization: token } })

      if (!data.success) {
        return toast.error(data.message)
      }

      const { order, key, transactionId } = data

      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: "QuickGPT",
        description: "Credit Purchase",
        order_id: order.id,
        handler: async function (response) {
          // Payment successful, now verify it on backend
          try {
            const verifyRes = await axios.post('/api/credit/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              transactionId: transactionId
            }, { headers: { Authorization: token } })

            if (verifyRes.data.success) {
              toast.success("Payment successful! Credits added.")
              // Refresh user data to show updated credits
              const { data: userData } = await axios.get('/api/user/data', { headers: { Authorization: token } })
              if (userData.success) setUser(userData.user)
            } else {
              toast.error(verifyRes.data.message || "Payment verification failed")
            }
          } catch (err) {
            toast.error(err.message)
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || ""
        },
        theme: {
          color: "#7c3aed"
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    fetchPlans()
  },[])

  if(loading) return <Loading />

  return (
    <div className='max-w-6xl mx-auto px-6 py-16 md:py-24 h-full overflow-y-auto'>
      <div className="text-center mb-12 md:mb-16">
        <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white'>
          Buy Generation Credits
        </h1>
        <p className='text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-3 max-w-md mx-auto leading-relaxed'>
          Choose the plan that fits your creative needs. Get credits immediately to generate text responses and high-fidelity AI artwork.
        </p>
      </div>

      <div className='flex flex-wrap justify-center items-stretch gap-6 md:gap-8'>
        {plans.map((plan)=>(
          <div 
            key={plan._id} 
            className={`relative border rounded-2xl p-8 min-w-[300px] max-w-[330px] flex-1 flex flex-col transition-all duration-300 bg-white dark:bg-surface-dark shadow-sm hover:shadow-lg hover:-translate-y-1 ${
              plan._id === "pro" 
                ? "border-indigo-500/80 dark:border-indigo-500/80 ring-1 ring-indigo-500/80 shadow-indigo-500/5 hover:shadow-indigo-500/10" 
                : "border-zinc-200 dark:border-border-dark hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            {plan._id === "pro" && (
              <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-500 shadow-sm">
                Most Popular
              </span>
            )}

            <div className='flex-1'>
              <h3 className='text-lg font-bold text-zinc-900 dark:text-white'>{plan.name}</h3>
              
              <div className="flex items-baseline gap-1 mt-4 mb-6">
                <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">${plan.price}</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">/ {plan.credits} credits</span>
              </div>

              <div className="w-full h-[1px] bg-zinc-100 dark:bg-[#222226] mb-6"></div>

              <ul className='space-y-3.5 text-xs text-zinc-600 dark:text-zinc-400 mb-8'>
                {plan.features.map((feature, index)=>(
                  <li key={index} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-zinc-900 dark:text-zinc-100 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={()=> purchasePlan(plan._id)} 
              className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center shadow-sm hover:scale-[1.01] active:scale-[0.99] ${
                plan._id === "pro"
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-100 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950"
              }`}
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Credits
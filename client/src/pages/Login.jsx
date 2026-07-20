import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { assets } from '../assets/assets';

const Login = () => {

    const [state, setState] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const {axios, setToken} = useAppContext()

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      const url = state === "login" ? '/api/user/login' : '/api/user/register'

      try {
        const {data} = await axios.post(url, {name, email, password})
        if(data.success){
            toast.success(state === "login" ? "Logged in successfully!" : "Account created successfully!")
            setToken(data.token)
            localStorage.setItem('token', data.token)
        }else{
            toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      } finally {
        setLoading(false);
      }
    }


  return (
    <div className="w-full max-w-[400px] p-8 rounded-2xl border border-zinc-800 bg-zinc-950/70 backdrop-blur-xl shadow-2xl flex flex-col gap-6 relative overflow-hidden">
      {/* Subtle top glow element */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
      
      {/* Header & Logo */}
      <div className="flex flex-col items-center">
        <img src={assets.logo_full} alt="QuickGPT Logo" className="w-64 mb-4 h-auto" />
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
          {state === "login" ? "Sign in to QuickGPT" : "Create your account"}
        </h1>
        <p className="text-xs text-zinc-400 mt-1 text-center">
          {state === "login" ? "Welcome back! Please enter your details." : "Get started with free credits today."}
        </p>
      </div>

      {/* Tab Selector (Clerk style) */}
      <div className="w-full flex p-1 bg-zinc-900 border border-zinc-800/80 rounded-lg">
        <button
          type="button"
          onClick={() => { setState("login"); setName(""); }}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
            state === "login"
              ? "bg-zinc-800 text-zinc-100 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setState("register")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
            state === "register"
              ? "bg-zinc-800 text-zinc-100 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
        {state === "register" && (
          <div className="w-full">
            <label className="text-xs font-medium text-zinc-300 block mb-1.5">Full Name</label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="e.g. John Doe"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              type="text"
              required
              autoComplete="new-password"
            />
          </div>
        )}
        <div className="w-full">
          <label className="text-xs font-medium text-zinc-300 block mb-1.5">Email Address</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="you@example.com"
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            type="email"
            required
            autoComplete="new-password"
          />
        </div>
        <div className="w-full">
          <label className="text-xs font-medium text-zinc-300 block mb-1.5">Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="••••••••"
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            type="password"
            required
            autoComplete="new-password"
          />
        </div>

        {/* Submit button (Vercel Style) */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-950 font-medium py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow-md mt-2 flex justify-center items-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            state === "register" ? "Create Account" : "Sign In"
          )}
        </button>
      </form>
      
      {/* Subtext */}
      <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
        By continuing, you agree to QuickGPT's <br />
        <span className="text-zinc-400 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-zinc-400 hover:underline cursor-pointer">Privacy Policy</span>.
      </p>
    </div>
  )
}

export default Login


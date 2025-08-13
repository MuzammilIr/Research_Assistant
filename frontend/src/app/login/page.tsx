'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signInEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else router.push('/')
  }

  const signInGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  return (
    <main className="max-w-md mx-auto pt-16 px-4">
      <h1 className="text-2xl font-semibold mb-6">Login</h1>
      <form onSubmit={signInEmail} className="space-y-3">
        <input className="w-full border rounded-md p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded-md p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="w-full rounded-md bg-neutral-900 text-white py-2">{loading?'Signing in...':'Sign in'}</button>
      </form>
      <button onClick={signInGoogle} className="w-full mt-3 rounded-md border py-2 hover:bg-neutral-50">Continue with Google</button>
      <p className="mt-4 text-sm">
        Don’t have an account? <a href="/signup" className="underline">Sign up</a>
      </p>
    </main>
  )
}

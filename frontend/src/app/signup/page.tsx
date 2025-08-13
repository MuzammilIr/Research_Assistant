'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const signUpEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else router.push('/') // or show "check your email" if confirm is on
  }

  return (
    <main className="max-w-md mx-auto pt-16 px-4">
      <h1 className="text-2xl font-semibold mb-6">Create account</h1>
      <form onSubmit={signUpEmail} className="space-y-3">
        <input className="w-full border rounded-md p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded-md p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="w-full rounded-md bg-neutral-900 text-white py-2">{loading?'Creating...':'Create account'}</button>
      </form>
    </main>
  )
}

import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/router'
import { Music2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard')
  }, [user, loading, router])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <>
      <Head>
        <title>Log In | Band Bridge</title>
      </Head>
      <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#1DB954] rounded-xl flex items-center justify-center mx-auto mb-4">
              <Music2 className="w-7 h-7 text-black" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
            <p className="text-[#B3B3B3]">Sign in to your BandBridge account</p>
          </div>

          <div className="bg-[#1E1E1E] rounded-2xl p-8 border border-white/5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[#B3B3B3] text-sm mb-1.5 block">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-[#282828] border border-white/10 text-white placeholder-[#B3B3B3]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50"
                />
              </div>

              <div>
                <label className="text-[#B3B3B3] text-sm mb-1.5 block">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#282828] border border-white/10 text-white placeholder-[#B3B3B3]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-full transition-all hover:scale-105 text-sm"
              >
                {submitting ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-[#B3B3B3] text-sm mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#1DB954] hover:underline font-medium">
                Get Listed
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeOAuthCode } from '../api/authApi'

const OAuthCallback = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const called = useRef(false)

    useEffect(() => {
        if (called.current) return
        called.current = true

        const code = searchParams.get('code')
        if (!code) {
            navigate('/login')
            return
        }

        exchangeOAuthCode({ code })
            .then(() => navigate('/dashboard'))
            .catch(() => navigate('/login'))
    }, [])

    return (
        <div className="flex min-h-screen items-center justify-center">
            <p className="text-sm text-slate-500">Signing you in...</p>
        </div>
    )
}

export default OAuthCallback

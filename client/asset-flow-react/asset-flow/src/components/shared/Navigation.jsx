import React, { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logout } from '../../api/authApi'

const AUTH_STORAGE_KEY = 'auth'
const AUTH_CHANGE_EVENT = 'assetflow:auth-change'

const Navigation = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const pathname = location.pathname

    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
    const [session, setSession] = React.useState(null)
    const [isAuthed, setIsAuthed] = React.useState(false)

    const authChecker = () => {
        if (document.cookie !== '') {
            setIsAuthed(true)
        }
    }
    useEffect(() => {
        authChecker()
    }, [])

    const handleLogout = async () => {
        document.cookie.split(';').forEach(cookie => {
            const name = cookie.split('=')[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        try {
            await logout();
        } catch (error) {
            console.log(error);
        }
        setIsAuthed(false)
        navigate('/login')
    }



    const links = [
        { to: '/', label: 'Home', active: pathname === '/' },
        ...(isAuthed ? [{ to: '/dashboard', label: 'Dashboard', active: pathname.startsWith('/dashboard') }] : []),
    ]

    return (
        <header className="sticky top-0 z-50 border-b border-white/70 bg-white/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <Link
                    to="/"
                    className="group flex min-w-0 items-center gap-3 rounded-2xl border border-transparent px-2 py-1 transition hover:border-slate-200/80 hover:bg-white/80"
                >
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-slate-900/10">
                        AF
                    </span>
                    <div className="min-w-0 leading-tight">
                        <p className="truncate text-sm font-semibold text-slate-900">AssetFlow</p>
                        <p className="truncate text-xs text-slate-500">Asset operations workspace</p>
                    </div>
                </Link>

                <div className="hidden items-center gap-3 md:flex">
                    <nav className="flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 p-1 shadow-sm">
                        {links.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${link.active
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {isAuthed ? (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            Logout
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                                Sign in
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                            >
                                Get started
                            </Link>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setMobileMenuOpen((open) => !open)}
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-navigation"
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
                >
                    {mobileMenuOpen ? 'Close' : 'Menu'}
                </button>
            </div>


            {mobileMenuOpen && (
                <div id="mobile-navigation" className="border-t border-slate-200/80 bg-white/90 px-4 py-4 md:hidden sm:px-6">
                    <div className="mx-auto max-w-7xl space-y-4">
                        <nav className="grid gap-2">
                            {links.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${link.active
                                        ? 'border-slate-900 bg-slate-900 text-white'
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {isAuthed ? (
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Account</p>
                                <div className="mt-3 flex items-center justify-end">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <Link
                                    to="/login"
                                    className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="/register"
                                    className="block rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    Get started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

export default Navigation

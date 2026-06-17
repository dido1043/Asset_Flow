import React from "react";
import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { login } from "../../../api/authApi"

const inputClass =
    "mt-2 min-h-11 w-full rounded-2xl border border-slate-200/90 bg-white/75 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"

const btnPrimary =
    "inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-slate-900 px-5 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/15 active:translate-y-0 active:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-60 min-h-12"

const btnOutline =
    "inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-slate-200/90 bg-white/90 px-5 text-base font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md active:translate-y-0 active:bg-slate-50 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-100 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white min-h-12"

const LoginForm = () => {
    const navigate = useNavigate()
    const [credentials, setCredentials] = useState({
        fullName: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            await login(credentials);
            navigate('/dashboard');
            window.location.reload();
        } catch (error) {
            console.log(error);
            setError('An error occurred while submitting the form.');
        } finally {
            setLoading(false);
        }
    };

    const oAuthBtn =  () =>{
        window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
    }
    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                            Work Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between gap-3">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <button
                                type="button"
                                className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                                onClick={() => setShowPassword((v) => !v)}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            className={`${inputClass} pr-20`}
                        />
                    </div>
                </div>

                <button type="submit" className={btnPrimary} disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            {error && (
                <p role="alert" className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Or continue with
                </p>
                <button type="button" className={`mt-4 ${btnOutline}`} disabled={loading} onClick={oAuthBtn}>
                    Sign in with Google
                </button>
            </div>
        </>
    )
}

export default LoginForm;

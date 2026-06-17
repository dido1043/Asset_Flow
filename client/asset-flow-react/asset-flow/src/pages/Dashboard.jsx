import { useState } from 'react'
import ProfilePage from './ProfilePage'

const SECTIONS = [
    { label: 'Overview',    helper: 'Start page',                  key: 'overview'    },
    { label: 'Profile',     helper: 'Account and session',          key: 'profile'     },
    { label: 'Organizations', helper: 'Company structure and teams',   key: 'organizations' },
    { label: 'Products',    helper: 'Inventory and assets',         key: 'products'    },
    { label: 'Assignments', helper: 'Issued equipment',             key: 'assignments' },
    { label: 'Protocols',   helper: 'Standard operating procedures',key: 'protocols'   }
]

const Dashboard = () => {
    const [activeSection, setActiveSection] = useState('overview')

    return (
        <main className="page-enter min-h-screen px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <div className="space-y-6">

                    {/* ── Hero banner ── */}
                    <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.34),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_32%)]" />
                        <div className="relative grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.18fr_0.82fr] lg:px-10">
                            <div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200">
                                        AssetFlow dashboard
                                    </span>
                                </div>
                                <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                                    Dashboard: asset work without the guesswork.
                                </h1>
                                <p className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
                                    Review inventory, assignments, teammates, organizations, and protocols inside your current access scope.
                                </p>

                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Signed in</p>
                                        <p className="mt-3 break-words text-lg font-semibold text-white">Active teammate</p>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">Employee</span>
                                        </div>
                                    </div>
                                    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Current page</p>
                                        <p className="mt-3 text-lg font-semibold text-white">
                                            {SECTIONS.find(s => s.key === activeSection)?.label}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-300">
                                            {SECTIONS.find(s => s.key === activeSection)?.helper}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid content-start gap-4 sm:grid-cols-2">
                                {[
                                    { label: 'Users', hint: 'Teammates visible in your access scope', num: 128 },
                                    { label: 'Products', hint: 'Assets loaded for your organization view', num: 42 },
                                    { label: 'Assignments', hint: 'Assignment records currently loaded', num: 64 },
                                    { label: 'My assignments', hint: 'Assets currently linked to your account', num: 16 },
                                ].map((stat) => (
                                    <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{stat.label}</p>
                                        <p className="mt-3 text-4xl font-bold text-white">{stat.num}</p>
                                        <p className="mt-2 text-xs text-slate-400">{stat.hint}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── Two-column body ── */}
                    <div className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">

                        {/* Sidebar */}
                        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">

                            {/* Navigation */}
                            <div className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Dashboard pages</p>
                                <p className="mt-2 text-sm text-slate-600">Open the asset operation you need next.</p>
                                <nav className="mt-5 space-y-2">
                                    {SECTIONS.map((item) => {
                                        const active = item.key === activeSection
                                        return (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() => setActiveSection(item.key)}
                                                className={`flex w-full cursor-pointer items-center justify-between rounded-3xl border px-4 py-3 text-sm transition ${
                                                    active
                                                        ? 'border-slate-900 bg-slate-900 shadow-lg shadow-slate-900/10'
                                                        : 'border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-white'
                                                }`}
                                            >
                                                <span className="text-left">
                                                    <span className={`block font-semibold ${active ? 'text-white' : 'text-slate-900'}`}>
                                                        {item.label}
                                                    </span>
                                                    <span className={`block text-xs ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                                                        {item.helper}
                                                    </span>
                                                </span>
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? 'bg-white/10 text-white' : 'bg-white text-slate-700 shadow-sm'}`}>
                                                    {active ? 'Current' : 'Open'}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </nav>
                            </div>

                            <div className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Quick actions</p>
                                <p className="mt-3 break-words text-lg font-semibold leading-tight">Active teammate</p>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">Employee</span>
                                </div>
                                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                    <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-transparent px-4 text-sm font-semibold text-white transition duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
                                        Refresh workspace
                                    </button>
                                    <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-slate-200 transition duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
                                        Sign out
                                    </button>
                                </div>
                            </div>

                            {/* Quick facts */}
                            <div className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                                <p className="text-sm font-semibold text-slate-900">Quick facts</p>
                                <div className="mt-4 space-y-3 text-sm text-slate-600">
                                    <div className="flex items-center justify-between gap-4">
                                        <span>Role</span>
                                        <span className="text-right font-semibold text-slate-900">Employee</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span>Companies known</span>
                                        <span className="font-semibold text-slate-900">—</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span>Session storage</span>
                                        <span className="text-right font-semibold text-slate-900">Current tab only</span>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main content area */}
                        <div className="space-y-6">
                            {activeSection === 'overview' && (
                                <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                                    <h2 className="text-xl font-semibold text-slate-950">Welcome back</h2>
                                    <p className="mt-2 text-sm text-slate-600">
                                        Choose a page to manage the part of the asset lifecycle you need: people, products, assignments and protocols.
                                    </p>
                                </div>
                            )}
                            {activeSection === 'profile' && <ProfilePage />}
                            {activeSection === 'products' && (
                                <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                                    <h2 className="text-xl font-semibold text-slate-950">Products</h2>
                                    <p className="mt-2 text-sm text-slate-600">Inventory and asset management coming soon.</p>
                                </div>
                            )}
                            {activeSection === 'assignments' && (
                                <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                                    <h2 className="text-xl font-semibold text-slate-950">Assignments</h2>
                                    <p className="mt-2 text-sm text-slate-600">Issued equipment tracking coming soon.</p>
                                </div>
                            )}
                            {activeSection === 'protocols' && (
                                <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                                    <h2 className="text-xl font-semibold text-slate-950">Protocols</h2>
                                    <p className="mt-2 text-sm text-slate-600">Standard operating procedures coming soon.</p>
                                </div>
                            )}
                             {activeSection === 'organizations' && (
                                <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                                    <h2 className="text-xl font-semibold text-slate-950">Organizations</h2>
                                    <p className="mt-2 text-sm text-slate-600">Company structure and teams coming soon.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </main>
    )
}

export default Dashboard

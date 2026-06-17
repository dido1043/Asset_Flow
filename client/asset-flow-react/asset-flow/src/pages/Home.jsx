import { Link } from 'react-router-dom'

const Home = () => {

    const isAuthenticated = () => {
        return localStorage.getItem('user') !== null;
    }
    return (
        <main className="page-enter relative min-h-[calc(100vh-4.5rem)] overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
            <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-indigo-100/70 via-white/20 to-transparent" />
            <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr]">

                {/* Left panel */}
                <section className="surface-panel rounded-[2rem] border border-white/70 p-6 sm:p-8 lg:p-10">
                    <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Asset tracking for growing teams
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">Secure</span>
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Live</span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Ready</span>
                    </div>

                    <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                        Know where every company asset is, who has it, and what happens next.
                    </h1>
                    <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
                        AssetFlow connects inventory, employee assignments, organizations, and handover protocols in one focused workspace.
                    </p>
                    {
                        isAuthenticated() ? <></> :
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Link to="/register">
                                    <span className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800">
                                        Create account
                                    </span>
                                </Link>
                                <Link to="/login">
                                    <span className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-base font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50">
                                        Sign in
                                    </span>
                                </Link>
                            </div>
                    }


                    <div className="mt-10 grid gap-4 lg:grid-cols-3">
                        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Assigned</p>
                            <p className="mt-3 text-3xl font-semibold text-slate-950">128</p>
                            <p className="mt-2 text-sm text-slate-600">Equipment currently issued to teammates</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Available</p>
                            <p className="mt-3 text-3xl font-semibold text-slate-950">42</p>
                            <p className="mt-2 text-sm text-slate-600">Inventory ready to be assigned</p>
                        </div>
                        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
                            <p className="text-sm font-semibold text-slate-900">Inventory with real ownership</p>
                            <p className="mt-2 text-sm text-slate-600">Track assets by company, assignee, availability, and return status.</p>
                        </div>
                    </div>
                </section>

                {/* Right dark panel */}
                <section className="page-enter relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:p-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.36),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_28%)]" />
                    <div className="relative">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">
                                    AssetFlow workspace
                                </p>
                                <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                                    Live asset work, from assignment to protocol
                                </h2>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                                Live
                            </span>
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                                <p className="text-sm font-semibold text-white">Access that matches each role</p>
                                <p className="mt-2 text-sm text-slate-300">Admins, leaders, and employees see the asset data they are allowed to manage.</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                                <p className="text-sm font-semibold text-white">Inventory with real ownership</p>
                                <p className="mt-2 text-sm text-slate-300">Track assets by company, assignee, availability, and return status.</p>
                            </div>
                            <div className="sm:col-span-2 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                                <p className="text-sm font-semibold text-white">Recent activity</p>
                                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                                    <li className="flex items-start justify-between gap-4">
                                        <span>MacBook Pro assigned to a new employee</span>
                                        <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-200">2m ago</span>
                                    </li>
                                    <li className="flex items-start justify-between gap-4">
                                        <span>iPhone 15 marked as returned</span>
                                        <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-200">16m ago</span>
                                    </li>
                                    <li className="flex items-start justify-between gap-4">
                                        <span>Handover protocol generated for equipment issue</span>
                                        <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-200">1h ago</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </main>
    )
}

export default Home

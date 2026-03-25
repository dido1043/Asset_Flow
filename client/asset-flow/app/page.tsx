import React from "react";
import Link from "next/link";

const Home = () => {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Modern asset operations
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Manage assets with clarity, speed, and control.
            </h1>
            <p className="mt-4 max-w-prose text-base text-slate-600 sm:text-lg">
              Track inventory, automate assignments, and keep teams accountable with audit-ready activity trails.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/user/register"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
              >
                Create account
              </Link>
              <Link
                href="/user/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-base font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Role-based access</p>
                <p className="text-sm text-slate-600">Keep the right people in the right places with clear permissions.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Inventory insights</p>
                <p className="text-sm text-slate-600">Know where every asset is, who has it, and what’s next.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-200/60 via-white to-emerald-200/50 blur-2xl" />
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                <p className="text-sm font-semibold text-slate-900">Asset overview</p>
                <p className="text-xs text-slate-500">A clean, SaaS-style dashboard foundation</p>
              </div>
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Assigned</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">128</p>
                  <p className="mt-1 text-sm text-slate-600">Assets currently in use</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Available</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">42</p>
                  <p className="mt-1 text-sm text-slate-600">Ready for assignment</p>
                </div>
                <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">Recent activity</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    <li className="flex items-center justify-between">
                      <span>MacBook Pro assigned to Marketing</span>
                      <span className="text-xs text-slate-400">2m ago</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>iPhone 15 returned from Sales</span>
                      <span className="text-xs text-slate-400">16m ago</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>New asset added: Dell XPS 13</span>
                      <span className="text-xs text-slate-400">1h ago</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Home;

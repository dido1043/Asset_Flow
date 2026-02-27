"use client";

import React, { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/app/components/shared/ui/Button";

interface UserData{
    id:number,
    fullName:string,
    email:string,
    role:string,
    age:number,
    organizationId:number,
    assignmentIds:Array<number>
}
const AccountPage = () => {

    const [userData, setUserData] = React.useState<UserData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const authData = localStorage.getItem("auth");
            if (!authData) {
                setError("You’re not signed in.");
                setLoading(false);
                return;
            }

            const authJson = JSON.parse(authData);
            try{
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/${authJson.userId}`, {
                    headers: {  
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                    }
                
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }
                
                const data: UserData = await response.json();
                setUserData(data);
            } catch (err) {
                setError("Unable to load your account. Please try again.");
                console.error("Failed to fetch user data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">Account</h1>
                    <p className="text-sm text-slate-500">Manage your profile details and access.</p>
                </div>
                {userData?.role && (
                    <span className="inline-flex w-fit items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                        {userData.role}
                    </span>
                )}
            </div>

            <div className="px-6 py-6 sm:px-8">
                {loading && <p className="text-sm text-slate-600">Loading account…</p>}

                {!loading && error && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <p>{error}</p>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                Retry
                            </Button>
                            <Link
                                href="/user/login"
                                className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-700"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>
                )}

                {!loading && userData && (
                    <dl className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Full name</dt>
                            <dd className="mt-2 text-sm font-semibold text-slate-900">{userData.fullName}</dd>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Email</dt>
                            <dd className="mt-2 text-sm font-semibold text-slate-900">{userData.email}</dd>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Age</dt>
                            <dd className="mt-2 text-sm font-semibold text-slate-900">{userData.age}</dd>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Organization</dt>
                            <dd className="mt-2 text-sm font-semibold text-slate-900">
                                {userData.organizationId != null ? userData.organizationId : "N/A"}
                            </dd>
                        </div>
                    </dl>
                )}
            </div>
        </div>
    );
}

export default AccountPage;

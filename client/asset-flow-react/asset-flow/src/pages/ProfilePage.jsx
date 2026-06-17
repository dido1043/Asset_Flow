import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, editUser, deleteUser } from '../api/authApi'

function getRoleBadgeClass(role) {
    if (role === 'ADMIN') {
        return 'bg-emerald-50 text-emerald-700';
    }
    if (role === 'LEADER') {
        return 'bg-amber-50 text-amber-700';
    }
    return 'bg-indigo-50 text-indigo-600';
}

function formatRoleLabel(role) {
    if (!role) {
        return 'Unknown';
    }
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

const ProfilePage = () => {
    const navigate = useNavigate();
    const [loginResp] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user') ?? 'null');
        } catch {
            return null;
        }
    });

    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [saving, setSaving] = useState(false);
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        email: '',
        age: '',
        password: '',
    });

    useEffect(() => {
        if (!loginResp?.userId) {
            navigate('/login');
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await getUser(loginResp.userId);
                setUser(response.data);
            } catch (err) {
                if (err?.response?.status === 401) {
                    localStorage.removeItem('user');
                    navigate('/login');
                    return;
                }
                console.log('Error fetching user:', err);
                setError('Error fetching user information.');
            }
        };

        if (!user) {
            fetchUser();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            setProfileForm({
                fullName: user.fullName || '',
                email: user.email || '',
                age: user.age ?? '',
                password: '',
                role: user.role,
            });
        }
    }, [user]);

    const editUserData = async (userData) => {
        try {
            const response = await editUser(loginResp.userId, userData);
            setUser(response.data);
        } catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }
            console.log('Error editing user data:', err);
            throw err;
        }
    }

    const handleDeleteUser = async () => {
        try {
            await deleteUser(loginResp.userId);
            setUser(null);
        } catch (err) {
            console.log('Error deleting user:', err);
            setError('Error deleting user information.');
        }
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFeedback(null);
        try {
            const payload = {
                ...profileForm,
                age: profileForm.age === '' ? null : Number(profileForm.age),
            };
            await editUserData(payload);
            setFeedback({ tone: 'success', message: 'Profile updated successfully.' });
        } catch {
            setFeedback({ tone: 'error', message: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "mt-2 min-h-11 w-full rounded-2xl border border-slate-200/90 bg-white/75 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200";
    const labelClass = "block text-sm font-medium text-slate-700";
    const btnBase = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-60 min-h-11 px-4 text-sm";

    return (
        <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400" />

            <div className="flex flex-col gap-4 border-b border-slate-100 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(238,242,255,0.78))] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div>
                    <h2 className="text-xl font-semibold text-slate-950">Profile</h2>
                    <p className="text-sm text-slate-600">Update your personal information and account settings.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        className={`${btnBase} border border-slate-200/90 bg-transparent text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md active:translate-y-0 active:bg-slate-50`}
                        onClick={() => setUser(null)}
                    >
                        Refresh workspace
                    </button>
                </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

                    {/* Left: form */}
                    <div className="space-y-5">
                        {feedback && (
                            <div className={feedback.tone === 'success'
                                ? 'rounded-2xl border border-emerald-100 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-700 shadow-sm'
                                : 'rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm text-red-700 shadow-sm'
                            }>
                                <span className="flex items-start gap-3">
                                    <span className={`mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${feedback.tone === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <span>{feedback.message}</span>
                                </span>
                            </div>
                        )}
                        {error && (
                            <div className="rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm text-red-700 shadow-sm">
                                <span className="flex items-start gap-3">
                                    <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                                    <span>{error}</span>
                                </span>
                            </div>
                        )}

                        <form onSubmit={handleProfileUpdate} className="grid gap-5 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label htmlFor="profile-full-name" className={labelClass}>Full name</label>
                                <input
                                    id="profile-full-name"
                                    value={profileForm.fullName}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="profile-email" className={labelClass}>Email</label>
                                <input
                                    id="profile-email"
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="profile-role" className={labelClass}>Role</label>
                                <div
                                    id="profile-role"
                                    className="mt-2 inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900"
                                >
                                    {formatRoleLabel(user?.role)}
                                </div>
                                <p className="mt-2 text-xs text-slate-500">Your role is managed by an administrator.</p>
                            </div>

                            <div>
                                <label htmlFor="profile-age" className={labelClass}>Age</label>
                                <input
                                    id="profile-age"
                                    type="number"
                                    min={0}
                                    value={profileForm.age}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, age: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="profile-password" className={labelClass}>New password</label>
                                <input
                                    id="profile-password"
                                    type="password"
                                    value={profileForm.password}
                                    placeholder="Leave blank to keep current password"
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, password: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`${btnBase} bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/15 active:translate-y-0 active:bg-slate-800`}
                                >
                                    {saving ? 'Saving…' : 'Save changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right: info panels */}
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Current account</p>
                                    <p className="text-sm text-slate-500">Your active session details.</p>
                                </div>
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(user?.role)}`}>
                                    {formatRoleLabel(user?.role)}
                                </span>
                            </div>
                            {user ? (
                                <dl className="mt-5 grid gap-3 text-sm text-slate-600">
                                    <div className="flex justify-between gap-4">
                                        <dt>Full name</dt>
                                        <dd className="break-words text-right font-semibold text-slate-900">{user.fullName}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt>Email</dt>
                                        <dd className="font-semibold text-slate-900">{user.email}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt>Assignments</dt>
                                        <dd className="font-semibold text-slate-900">{user.assignmentIds?.length ?? 0}</dd>
                                    </div>
                                </dl>
                            ) : (
                                <div className="mt-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-6 text-sm text-slate-500">
                                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">•</div>
                                    <p className="mt-4 font-semibold text-slate-800">Loading profile</p>
                                    <p className="mt-1 max-w-xl">Fetching your account information…</p>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-semibold text-slate-900">Account safety</p>
                            <ul className="mt-3 space-y-2 text-sm text-slate-600">
                                <li>Use a strong, unique password for your account.</li>
                                <li>Never share your credentials with others.</li>
                                <li>Sign out when using shared or public devices.</li>
                                <li>Contact an administrator if you suspect unauthorized access.</li>
                                <li>Your access is scoped to your current workspace.</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default ProfilePage;

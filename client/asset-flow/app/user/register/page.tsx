import RegisterForm from "@/app/components/shared/Forms/Auth/RegisterForm";
import Link from "next/link";

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:flex-row">
            <div className="relative flex flex-col justify-between bg-slate-900 px-8 py-10 text-white lg:w-5/12">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">AssetFlow</p>
                    <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">Join your asset team workspace</h2>
                    <p className="mt-4 text-sm text-slate-200 sm:text-base">
                        Centralize assets, automate assignments, and keep every team member aligned in one modern platform.
                    </p>
                </div>
                <div className="mt-10 space-y-3 text-sm text-slate-200">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        Secure access with role-based permissions
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        Real-time inventory insights
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        Audit-ready activity trails
                    </div>
                </div>
            </div>

            <div className="flex-1 px-6 py-10 sm:px-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">Create your account</h2>
                        <p className="mt-1 text-sm text-slate-500">Start managing your assets in minutes.</p>
                    </div>
                    <span className="hidden rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 sm:inline-flex">
                        Free trial
                    </span>
                </div>
                <RegisterForm />
                <p className="mt-6 text-sm text-slate-600">
                    Already have an account?{" "}
                    <Link href="/user/login" className="font-semibold text-brand-700 hover:text-brand-800">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    </div>  
  );
};

export default RegisterPage;

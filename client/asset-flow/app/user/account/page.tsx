import React from "react";
import AccountPage from "../../components/Pages/User/AccountPage";

const AccountInfo = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
                <AccountPage />
            </div>
        </div>
    );
};

export default AccountInfo;

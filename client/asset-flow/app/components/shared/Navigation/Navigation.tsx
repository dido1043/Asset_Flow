'use client';
import React from "react";
import Link from "next/link";

const Navigation = () => {

    const logout = () => {
        localStorage.clear();
        window.location.href = "/user/login";
    } 
    return(
        <nav className="bg-gray-800 text-white p-4">
            <Link href="/">Home</Link>
            <Link href="/user" className="ml-4">user</Link>
            <Link href="/user/register" className="ml-4">Register</Link>
            <Link href="/user/login" className="ml-4">Login</Link>

            <button type="button" onClick={logout} className="ml-4">Logout</button>
        </nav>
    )
}

export default Navigation;
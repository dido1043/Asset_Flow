'use client';
import React from "react";
import Link from "next/link";

const Navigation = () => {
    return(
        <nav className="bg-gray-800 text-white p-4">
            <Link href="/">Home</Link>
            <Link href="/users" className="ml-4">Users</Link>
        </nav>
    )
}

export default Navigation;
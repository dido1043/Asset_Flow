'use client';
import React from "react";

interface LoginFormData {   
    name: string;
    email: string;
    password: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8080";

const LoginForm = () => {

    const [formData, setFormData] = React.useState<LoginFormData>({
        name: "",
        email: "",
        password: "",
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${apiBaseUrl}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*"
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Login failed. Please check your credentials.");
            }

            const authPayload = await response.json();
            localStorage.setItem("auth", JSON.stringify(authPayload));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unable to login. Please try again.";
            setError(message);
            console.error("Login failed:", err);
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleLogin = () => {
        window.location.href = `${apiBaseUrl}/auth/oauth2/login`;
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-6">Login</h2>

            <form onSubmit={handleSubmit}>
                 <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700">Name</label>
                    <input type="text" id="name" name="name" onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700">Email</label>
                    <input type="email" id="email" name="email" onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700">Password</label>
                    <input type="password" id="password" name="password" onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" />
                </div>
                <button type="submit" className="w-full inline-block text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-60" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <p className="mt-4 text-gray-700">Please click the button below to log in with your Google account.</p>
            <button
                type="button"
                onClick={handleGoogleLogin}
                className="mt-3 w-full inline-block text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
                Login with Google
            </button>
        </div>
    );
}   

export default LoginForm;
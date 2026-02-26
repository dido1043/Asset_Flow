'use client';
import React, { useState } from "react";


interface RegisterFormData {
    fullName: string;
    email: string;
    password: string;
    role: string;
    age: number;
    organizationId: number;
    assignmentIds: Array<number>;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8080";

const RegisterForm = () => {
    const [formData, setFormData] = useState<RegisterFormData>({
        fullName: "",
        email: "",
        password: "",
        role: "",
        age: 0,
        organizationId: 0,
        assignmentIds: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "age" || name === "organizationId" ? Number(value) : value,
        }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
    try{
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Registration failed");
            }
            setSuccess(true);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }


    return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6">Register</h2>
        <form onSubmit={handleSubmit}>
            {/* Full name */}
            <div className="mb-4">
                <label htmlFor="fullName" className="block text-gray-700">Full Name</label>
                <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                />
            </div>

            {/* Email */}
            <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                />
            </div>

            {/* Password */}
            <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                />
            </div>

            {/* Role */}
            <div className="mb-4">
                <label htmlFor="role" className="block text-gray-700">Role</label>
                <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border rounded"
                    required
                >
                    <option value="">Select role</option>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="LEADER">Leader</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            {/* Age */}
            <div className="mb-4">
                <label htmlFor="age" className="block text-gray-700">Age</label>
                <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    min={0}
                />
            </div>

            {/* Organization ID */}
            <div className="mb-4">
                <label htmlFor="organizationId" className="block text-gray-700">Organization ID</label>
                <input
                    type="number"
                    id="organizationId"
                    name="organizationId"
                    value={formData.organizationId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    min={0}
                />
            </div>

            {/* Assignment IDs (comma separated) */}
            <div className="mb-4">
                <label htmlFor="assignmentIds" className="block text-gray-700">Assignment IDs (comma separated)</label>
                <input
                    type="text"
                    id="assignmentIds"
                    name="assignmentIds"
                    value={formData.assignmentIds.join(',')}
                    onChange={(e) => {
                        const text = e.target.value;
                        const arr = text
                            .split(',')
                            .map(s => s.trim())
                            .filter(Boolean)
                            .map(n => Number(n))
                            .filter(n => !Number.isNaN(n));
                        setFormData(prev => ({ ...prev, assignmentIds: arr }));
                    }}
                    placeholder="e.g. 1,2,3"
                    className="w-full px-3 py-2 border rounded"
                />
            </div>

            <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-60"
                disabled={loading}
            >
                {loading ? "Registering..." : "Register"}
            </button>
        </form>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-3 text-sm text-green-600">Registered successfully.</p>}

        {/* Optional: show current form state for debugging */}
        <pre className="mt-4 text-xs bg-gray-50 p-3 rounded text-gray-700">{JSON.stringify(formData, null, 2)}</pre>
    </div>
    );
}

export default RegisterForm;
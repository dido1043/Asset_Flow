import React from "react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { login } from "../../../api/authApi"

const LoginForm = () => {
    const navigate = useNavigate()
    const [credentials, setCredentials] = useState({
        fullName: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            await login(credentials);
            navigate('/dashboard');
        } catch (error) {
            console.log(error);
            setError('An error occurred while submitting the form.');
        } finally {
            setLoading(false);
        }
    };

    return(
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                />
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    )
}

export default LoginForm;
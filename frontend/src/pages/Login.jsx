import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Register.css'; // Reuse the same styles

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            setMessage(res.data.message);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                setMessage(error.response.data.message || 'Login failed');
            } else if (error.request) {
                setMessage('Cannot connect to server. Please check if the backend is running.');
            } else {
                setMessage('An unexpected error occurred');
            }
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/forgot-password', { email: resetEmail });
            setResetMessage('Password reset instructions sent to your email!');
        } catch (error) {
            console.error('Forgot password error:', error);
            if (error.response) {
                setResetMessage(error.response.data.message || 'Failed to send reset email');
            } else {
                setResetMessage('Cannot connect to server');
            }
        }
    };

    if (showForgotPassword) {
        return (
            <div className="form-container">
                <h2>Reset Password</h2>
                <p>Enter your email address and we'll send you instructions to reset your password.</p>
                <form onSubmit={handleForgotPassword}>
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="enabled">Send Reset Instructions</button>
                </form>
                {resetMessage && (
                    <p className={resetMessage.includes('sent') ? 'success' : 'error'}>
                        {resetMessage}
                    </p>
                )}
                <button 
                    type="button" 
                    onClick={() => setShowForgotPassword(false)}
                    className="forgot-password-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    ← Back to Login
                </button>
            </div>
        );
    }

    return (
        <div className="form-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="enabled">Login</button>
            </form>
            
            <button 
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="forgot-password-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
                Forgot your password?
            </button>

            {message && (
                <p className={message.includes('successfully') ? 'success' : 'error'}>
                    {message}
                </p>
            )}
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <span>Don't have an account? </span>
                <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>
                    Register here
                </Link>
            </div>
        </div>
    );
};

export default Login;
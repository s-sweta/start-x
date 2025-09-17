import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false
    });
    const [emailValid, setEmailValid] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const navigate = useNavigate();

    // Real-time password validation
    useEffect(() => {
        if (password) {
            setShowValidation(true);
            setPasswordValidation({
                minLength: password.length >= 6,
                hasUppercase: /[A-Z]/.test(password),
                hasLowercase: /[a-z]/.test(password),
                hasNumber: /\d/.test(password),
                hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
            });
        } else {
            setShowValidation(false);
        }
    }, [password]);

    // Email validation
    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailValid(emailRegex.test(email));
    }, [email]);

    // Check if form is valid
    const isFormValid = () => {
        const passwordValid = Object.values(passwordValidation).every(Boolean);
        return emailValid && passwordValid && email && password;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isFormValid()) {
            setMessage('Please ensure all requirements are met before registering.');
            return;
        }

        try {
            const res = await api.post('/auth/register', { email, password });
            
            localStorage.setItem('token', res.data.token);
            setMessage('Registration successful!');
            navigate('/dashboard');

        } catch (error) {
            console.error('Registration error:', error);
            if (error.response) {
                const errorData = error.response.data;
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    setMessage(errorData.errors.join(', '));
                } else {
                    setMessage(errorData.message || 'Registration failed');
                }
            } else if (error.request) {
                setMessage('Cannot connect to server. Please check if the backend is running.');
            } else {
                setMessage('An unexpected error occurred');
            }
        }
    };

    return (
        <div className="form-container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={email ? (emailValid ? 'valid' : 'invalid') : ''}
                        required
                    />
                    {email && (
                        <span className={`validation-icon ${emailValid ? 'valid' : 'invalid'}`}>
                            {emailValid ? '✓' : '✗'}
                        </span>
                    )}
                </div>

                <div className="input-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={password ? (Object.values(passwordValidation).every(Boolean) ? 'valid' : 'invalid') : ''}
                        required
                    />
                    {password && Object.values(passwordValidation).every(Boolean) && (
                        <span className="validation-icon valid">✓</span>
                    )}
                </div>

                {showValidation && (
                    <div className="password-requirements">
                        <h4>Password Requirements:</h4>
                        <ul>
                            <li className={passwordValidation.minLength ? 'valid' : 'invalid'}>
                                <span className="req-icon">{passwordValidation.minLength ? '✓' : '✗'}</span>
                                At least 6 characters
                            </li>
                            <li className={passwordValidation.hasUppercase ? 'valid' : 'invalid'}>
                                <span className="req-icon">{passwordValidation.hasUppercase ? '✓' : '✗'}</span>
                                One uppercase letter (A-Z)
                            </li>
                            <li className={passwordValidation.hasLowercase ? 'valid' : 'invalid'}>
                                <span className="req-icon">{passwordValidation.hasLowercase ? '✓' : '✗'}</span>
                                One lowercase letter (a-z)
                            </li>
                            <li className={passwordValidation.hasNumber ? 'valid' : 'invalid'}>
                                <span className="req-icon">{passwordValidation.hasNumber ? '✓' : '✗'}</span>
                                One number (0-9)
                            </li>
                            <li className={passwordValidation.hasSpecial ? 'valid' : 'invalid'}>
                                <span className="req-icon">{passwordValidation.hasSpecial ? '✓' : '✗'}</span>
                                One special character (!@#$%^&*)
                            </li>
                        </ul>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={!isFormValid()}
                    className={isFormValid() ? 'enabled' : 'disabled'}
                >
                    Register
                </button>
            </form>
            {message && <p className={message.includes('successful') ? 'success' : 'error'}>{message}</p>}
        </div>
    );
};

export default Register;
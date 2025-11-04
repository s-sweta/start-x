import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // We will create this CSS file next

const Navbar = () => {
    const navigate = useNavigate();
    // Check for the token in localStorage to determine login state
    const isLoggedIn = !!localStorage.getItem('token');

    const handleLogout = () => {
        // Clear the token from storage
        localStorage.removeItem('token');
        // Navigate to the home page
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to={isLoggedIn ? "/dashboard" : "/"}>START-X</Link>
            </div>
            <div className="nav-links">
                {isLoggedIn ? (
                    <>
                        <Link to="/dashboard">Dashboard</Link>
                        <button onClick={handleLogout} className="nav-button">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear the token from storage
        localStorage.removeItem('token');
        // Redirect to the landing page
        navigate('/');
    };

    return (
        <div className="page-container">
            <h1>Welcome to Your Dashboard</h1>
            <p>You are successfully logged in!</p>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
    );
};

export default Dashboard;
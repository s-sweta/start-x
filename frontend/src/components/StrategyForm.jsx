import React, { useState, useEffect } from 'react';

const StrategyForm = ({ onSave, existingStrategy, onCancel }) => {
    // State to manage all form inputs
    const [formData, setFormData] = useState({
        name: '',
        type: 'PERCENTAGE_DISCOUNT', // Default type
        details: {
            discountPercentage: '',
            pointsPerPurchase: '',
            offerMessage: '',
        },
    });

    // If we are editing, pre-fill the form with existing strategy data
    useEffect(() => {
        if (existingStrategy) {
            setFormData({
                name: existingStrategy.name,
                type: existingStrategy.type,
                details: {
                    discountPercentage: existingStrategy.details.discountPercentage || '',
                    pointsPerPurchase: existingStrategy.details.pointsPerPurchase || '',
                    offerMessage: existingStrategy.details.offerMessage || '',
                }
            });
        }
    }, [existingStrategy]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDetailsChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            details: { ...prev.details, [name]: value }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    // Render the correct input fields based on the selected strategy type
    const renderDetailFields = () => {
        switch (formData.type) {
            case 'PERCENTAGE_DISCOUNT':
                return (
                    <input
                        type="number"
                        name="discountPercentage"
                        value={formData.details.discountPercentage}
                        onChange={handleDetailsChange}
                        placeholder="Discount % (e.g., 15)"
                        min="1" max="99" required
                    />
                );
            case 'CRM_LOYALTY_POINTS':
                return (
                    <input
                        type="number"
                        name="pointsPerPurchase"
                        value={formData.details.pointsPerPurchase}
                        onChange={handleDetailsChange}
                        placeholder="Points per purchase (e.g., 10)"
                        required
                    />
                );
            case 'MOBILE_PUSH_OFFER':
                return (
                    <textarea
                        name="offerMessage"
                        value={formData.details.offerMessage}
                        onChange={handleDetailsChange}
                        placeholder="Offer message for push notification"
                        required
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="form-section">
            <h3>{existingStrategy ? 'Edit Strategy' : 'Create New Strategy'}</h3>
            <form onSubmit={handleSubmit} className="dashboard-form">
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Strategy Name (e.g., Summer Sale)"
                    required
                />
                <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="PERCENTAGE_DISCOUNT">Percentage Discount</option>
                    <option value="CRM_LOYALTY_POINTS">CRM Loyalty Points</option>
                    <option value="MOBILE_PUSH_OFFER">Mobile Push Offer</option>
                </select>
                
                {renderDetailFields()}

                <div className="form-actions">
                    <button type="button" onClick={onCancel} className="btn-cancel">Cancel</button>
                    <button type="submit" className="btn-save">Save Strategy</button>
                </div>
            </form>
        </div>
    );
};

export default StrategyForm;
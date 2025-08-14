import React, { useState } from 'react';

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_account' | 'digital_wallet';
  name: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

const PaymentMethods: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'credit_card',
      name: 'Visa ending in 1234',
      lastFour: '1234',
      expiryDate: '12/25',
      isDefault: true
    },
    {
      id: '2',
      type: 'bank_account',
      name: 'Chase Bank ****5678',
      lastFour: '5678',
      isDefault: false
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const handleDeleteMethod = (id: string) => {
    setPaymentMethods(methods => 
      methods.filter(method => method.id !== id)
    );
  };

  const getPaymentMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'credit_card':
        return '💳';
      case 'bank_account':
        return '🏦';
      case 'digital_wallet':
        return '📱';
      default:
        return '💳';
    }
  };

  return (
    <div className="payment-methods">
      <div className="page-header">
        <h1>Payment Methods</h1>
        <button 
          className="add-button"
          onClick={() => setShowAddForm(true)}
        >
          Add Payment Method
        </button>
      </div>

      <div className="payment-methods-list">
        {paymentMethods.length === 0 ? (
          <div className="empty-state">
            <h3>No payment methods added</h3>
            <p>Add a payment method to get started</p>
          </div>
        ) : (
          paymentMethods.map(method => (
            <div key={method.id} className="payment-method-card">
              <div className="method-info">
                <span className="method-icon">
                  {getPaymentMethodIcon(method.type)}
                </span>
                <div className="method-details">
                  <h3>{method.name}</h3>
                  {method.expiryDate && (
                    <p className="expiry">Expires {method.expiryDate}</p>
                  )}
                  {method.isDefault && (
                    <span className="default-badge">Default</span>
                  )}
                </div>
              </div>
              
              <div className="method-actions">
                {!method.isDefault && (
                  <button 
                    className="set-default-btn"
                    onClick={() => handleSetDefault(method.id)}
                  >
                    Set as Default
                  </button>
                )}
                <button 
                  className="edit-btn"
                  onClick={() => console.log('Edit method:', method.id)}
                >
                  Edit
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteMethod(method.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddForm && (
        <div className="add-payment-form">
          <div className="form-overlay">
            <div className="form-content">
              <h2>Add Payment Method</h2>
              <form>
                <div className="payment-type-selector">
                  <label>
                    <input type="radio" name="paymentType" value="credit_card" defaultChecked />
                    Credit/Debit Card
                  </label>
                  <label>
                    <input type="radio" name="paymentType" value="bank_account" />
                    Bank Account
                  </label>
                </div>
                
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input 
                    type="text" 
                    id="cardNumber" 
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input 
                      type="text" 
                      id="expiryDate" 
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input 
                      type="text" 
                      id="cvv" 
                      placeholder="123"
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit">
                    Add Payment Method
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;

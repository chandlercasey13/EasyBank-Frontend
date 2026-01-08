import { useState } from 'react';
import './Page.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    pwd: '',
    confirmPassword: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (formData.pwd !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.pwd.length < 8) {
      newErrors.pwd = 'Password must be at least 8 characters';
    }
    
    if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      // Send only the fields that map to database columns
      const registrationData = {
        name: formData.name,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        pwd: formData.pwd,
        role: 'user'
      };

      const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to register');
      }
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error registering:', error);
      alert('Registration failed. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="page-container">
        <div className="success-message">
          <h2>Registration Successful!</h2>
          <p>Thank you for registering with EasyBank. Your account is being processed.</p>
          <p>You will receive a confirmation email shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Register</h1>
        <p>Create a new account with EasyBank</p>
      </div>
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Create Your Account</h3>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              placeholder="Enter your mobile number"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pwd">Password</label>
              <input
                type="password"
                id="pwd"
                name="pwd"
                value={formData.pwd}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
              {errors.pwd && <span className="error">{errors.pwd}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary btn-large">Register</button>
      </form>
    </div>
  );
}

export default Register;


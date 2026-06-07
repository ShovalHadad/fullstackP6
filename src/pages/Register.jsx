import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

function Register() {
  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <img src={logo} alt="UniSpace Logo" className="auth-logo" />

        <h2>Create Account</h2>
        <p className="auth-subtitle">Join UniSpace and start your journey</p>

        <form>
          <label>Full Name</label>
          <input type="text" placeholder="Enter your full name" />

          <label>Username</label>
          <input type="text" placeholder="Choose a username" />

          <label>Email</label>
          <input type="email" placeholder="Enter your email" />

          <label>Department</label>
          <input type="text" placeholder="Software Engineering" />

          <label>Year</label>
          <input type="number" placeholder="1" min="1" max="6" />

          <label>Password</label>
          <input type="password" placeholder="Create a password" />

          <label>Confirm Password</label>
          <input type="password" placeholder="Confirm your password" />

          <button type="submit">Register</button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
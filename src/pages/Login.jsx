import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

function Login() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={logo} alt="UniSpace Logo" className="auth-logo" />

        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to continue your journey</p>

        <form>
          <label>Username</label>
          <input type="text" placeholder="Enter your username" />

          <label>Password</label>
          <input type="password" placeholder="Enter your password" />

          <button type="submit">Login</button>
        </form>

        <p className="auth-link">
          New to UniSpace? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const passwordsMismatch = repeatPassword.length > 0 && password !== repeatPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== repeatPassword) {
            setError('Passwords must be the same!');
            return;
        }

        try {
            await register(email, password);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Create account</h1>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="repeat-password">Repeat password</label>
                        <input
                            id="repeat-password"
                            type="password"
                            autoComplete="new-password"
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                            required
                        />
                    </div>
                    {passwordsMismatch && <p className="form-error">Passwords must be the same!</p>}
                    {error && !passwordsMismatch && <p className="form-error">{error}</p>}
                    <button type="submit" disabled={passwordsMismatch}>Register</button>
                </form>
                <p className="auth-footer">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
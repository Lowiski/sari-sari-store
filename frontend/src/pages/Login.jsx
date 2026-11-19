import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Boxes, LockKeyhole, ShieldCheck, Store, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await login({ username, password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <section className="login-hero">
        <div className="brand" style={{ paddingLeft: 0 }}>
          <div className="brand-mark"><Store size={20} /></div>
          <div className="brand-text"><strong>Sari-Sari Analytics</strong><span>Sales & Inventory BA</span></div>
        </div>
        <h1>Know your store.<br />Grow your sales.</h1>
        <p>
          A complete business analytics system for the neighborhood sari-sari store —
          from daily point-of-sale and stock movements to descriptive, predictive and
          prescriptive decisions on one dashboard.
        </p>
        <div className="login-features">
          <div className="login-feature"><span className="fi"><BarChart3 size={16} /></span> Descriptive KPIs and visual trends</div>
          <div className="login-feature"><span className="fi"><ShieldCheck size={16} /></span> Predictive sales and stockout forecasts</div>
          <div className="login-feature"><span className="fi"><Boxes size={16} /></span> Prescriptive restock and promo actions</div>
        </div>
      </section>

      <section className="login-panel">
        <form className="login-form" onSubmit={submit}>
          <h2>Welcome back</h2>
          <p>Sign in to access your store analytics workspace.</p>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            autoComplete="username"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <Button type="submit" className="btn-block" disabled={loading} style={{ marginTop: 6 }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="login-demo">
            <strong>Demo account</strong><br />
            Username: <strong>admin</strong> · Password: <strong>admin123</strong><br />
            Seeded with 60 products, 60 customers, 180 sales and 60 marketing campaigns.
            <div style={{ marginTop: 6, opacity: .8 }}><LockKeyhole size={11} style={{ verticalAlign: 'middle' }} /> JWT-protected REST API</div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <User size={12} /> Capstone Project · Business Analytics
          </div>
        </form>
      </section>
    </div>
  );
}

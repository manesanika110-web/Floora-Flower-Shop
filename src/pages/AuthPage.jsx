import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { 
  Flower2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck, 
  Truck, 
  Heart,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage = ({ onShowToast }) => {
  const { currentUser, login, register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';
  const modeParam = searchParams.get('mode');

  // isFlipped = false means Front (Sign Up / Register form), true means Back (Sign In / Login form)
  // Defaults to false so the Sign Up page is shown directly
  const [isFlipped, setIsFlipped] = useState(modeParam === 'login');

  useEffect(() => {
    if (modeParam === 'login') {
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  }, [modeParam]);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const resetAuthForms = () => {
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');
    setLoginEmail('');
    setLoginPassword('');
    setShowRegPassword(false);
    setShowLoginPassword(false);
  };

  // Ensure all form fields are cleared on mount / after logout
  useEffect(() => {
    if (!currentUser) {
      resetAuthForms();
      setErrorMsg('');
      setSuccessNotice('');
    }
  }, [currentUser]);

  // 1. REGISTER SUBMIT: Fill register form -> flips right-to-left to login page
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessNotice('');

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Please fill in your name, email, and password.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    try {
      const res = await register(regName.trim(), regEmail.trim(), regPassword, regPhone.trim());
      if (res.success) {
        // Automatically sign in the registered user
        await login(regEmail.trim(), regPassword);
        resetAuthForms();
        if (onShowToast) onShowToast('Account created successfully! Welcome to Floora 🌸');
        navigate(redirectTarget);
        return;
      } else {
        setErrorMsg(res.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  // 2. LOGIN SUBMIT: Log in -> Redirects to Home page ('/')
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessNotice('');

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      const submittedEmail = loginEmail.trim();
      const res = await login(submittedEmail, loginPassword);
      if (res.success) {
        resetAuthForms();
        if (res.isAdmin || submittedEmail.toLowerCase() === 'flowers@admin.com' || submittedEmail.toLowerCase() === 'floora@admin.com') {
          if (onShowToast) onShowToast('Welcome, Admin! Access granted. 👑');
          navigate('/admin');
          return;
        }
        if (onShowToast) onShowToast('Welcome to Floora! 🌸');
        // Redirect to Home page as requested
        navigate(redirectTarget);
      } else {
        setErrorMsg(res.error || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Failed to sign in. Please verify credentials.');
    }
  };

  // Demo Login -> also redirects to Home page ('/')
  const handleDemoLogin = async () => {
    setErrorMsg('');
    try {
      const res = await login('ananya@example.com', 'password123');
      if (res.success) {
        if (onShowToast) onShowToast('Welcome back, Ananya! 🌸');
        navigate(redirectTarget);
      }
    } catch {
      setErrorMsg('Demo login unavailable.');
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      backgroundColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.25rem'
    }}>
      
      {/* Split Auth Card Container */}
      <div style={{
        width: '100%',
        maxWidth: '1020px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 50px rgba(45, 37, 32, 0.1)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr 1.15fr',
        minHeight: '620px'
      }} className="auth-split-wrapper">
        
        {/* LEFT COLUMN: FLORAL HERO BRANDING WITH IMAGE */}
        <div style={{
          position: 'relative',
          backgroundImage: 'url(/flowers/pink_rose_bouquet.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem 2.5rem',
          color: '#FFFFFF'
        }} className="auth-image-column">
          
          {/* Dark Floral Gradient Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(22, 40, 30, 0.88) 0%, rgba(35, 18, 25, 0.78) 100%)',
            zIndex: 1
          }} />

          {/* Top Brand Logo */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Flower2 size={24} />
              </div>
              <span className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                Floora
              </span>
            </Link>
          </div>

          {/* Middle Inspiring Message */}
          <div style={{ position: 'relative', zIndex: 2, margin: '2.5rem 0' }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(6px)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '1rem'
            }}>
              ✨ The Bloom Club
            </span>
            <h2 className="font-serif" style={{ fontSize: '2.2rem', lineHeight: 1.25, marginBottom: '0.85rem', color: '#FFFFFF' }}>
              Fresh flowers, <br />
              <span style={{ fontStyle: 'italic', color: '#F8DCE5' }}>delivered with love.</span>
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.82)', lineHeight: 1.6 }}>
              Join thousands of flower lovers. Send sunrise-harvested bouquets, manage your orders, and enjoy member-exclusive discounts.
            </p>
          </div>

          {/* Bottom Trust Highlights */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '0.82rem',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle size={16} color="#A8C3A0" />
              <span>100% Sunrise Fresh Plucking Guarantee</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Truck size={16} color="#A8C3A0" />
              <span>Express 2-Hour Delivery with Hydration Wrap</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: 3D FLIP CONTAINER (REGISTER ON FRONT, LOGIN ON BACK) */}
        <div style={{
          position: 'relative',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF'
        }}>
          
          {/* Top Toggle Pills */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--card-bg)',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            maxWidth: '240px',
            margin: '0 auto 1.5rem',
            border: '1px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={() => {
                setIsFlipped(false);
                resetAuthForms();
                setErrorMsg('');
                setSuccessNotice('');
              }}
              style={{
                flex: 1,
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: !isFlipped ? 'var(--primary)' : 'transparent',
                color: !isFlipped ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFlipped(true);
                resetAuthForms();
                setErrorMsg('');
                setSuccessNotice('');
              }}
              style={{
                flex: 1,
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: isFlipped ? 'var(--primary)' : 'transparent',
                color: isFlipped ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              Sign In
            </button>
          </div>

          {/* Feedback Notices */}
          {errorMsg && (
            <div style={{
              padding: '0.7rem 1rem',
              backgroundColor: '#FFF5F5',
              border: '1px solid #FFC9C9',
              borderRadius: 'var(--radius-sm)',
              color: '#E03131',
              fontSize: '0.82rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              {errorMsg}
            </div>
          )}

          {successNotice && (
            <div style={{
              padding: '0.7rem 1rem',
              backgroundColor: '#E6FCF5',
              border: '1px solid #96F2D7',
              borderRadius: 'var(--radius-sm)',
              color: '#0CA678',
              fontSize: '0.82rem',
              marginBottom: '1rem',
              textAlign: 'center',
              fontWeight: 600
            }}>
              {successNotice}
            </div>
          )}

          {/* 3D FLIP CARD SHELL */}
          <div className="auth-flip-viewport">
            <div className={`auth-flip-card ${isFlipped ? 'flipped-left' : ''}`}>
              
              {/* ================= FRONT FACE: REGISTER FORM ================= */}
              <div className="auth-card-face auth-face-front">
                
                <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                  <h3 className="font-serif" style={{ fontSize: '1.6rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                    Create Account
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    Join Floora for instant coupon discounts and easy flower deliveries.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  
                  {/* Name */}
                  <div style={{ position: 'relative' }}>
                    <User size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text"
                      name="floora_reg_name"
                      autoComplete="off"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readonly')}
                      onTouchStart={(e) => e.target.removeAttribute('readonly')}
                      placeholder="Full Name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      className="form-input"
                      style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
                    />
                  </div>

                  {/* Email */}
                  <div style={{ position: 'relative' }}>
                    <Mail size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="email"
                      name="floora_reg_email"
                      autoComplete="off"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readonly')}
                      onTouchStart={(e) => e.target.removeAttribute('readonly')}
                      placeholder="Email Address"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      className="form-input"
                      style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
                    />
                  </div>

                  {/* Phone */}
                  <div style={{ position: 'relative' }}>
                    <Phone size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="tel"
                      name="floora_reg_phone"
                      autoComplete="off"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readonly')}
                      onTouchStart={(e) => e.target.removeAttribute('readonly')}
                      placeholder="Phone Number (e.g. +91 98765 43210)"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
                    />
                  </div>

                  {/* Password */}
                  <div style={{ position: 'relative' }}>
                    <Lock size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type={showRegPassword ? "text" : "password"}
                      name="floora_reg_password"
                      autoComplete="new-password"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readonly')}
                      onTouchStart={(e) => e.target.removeAttribute('readonly')}
                      placeholder="Create Password (min. 6 characters)"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      className="form-input"
                      style={{ paddingLeft: '38px', paddingRight: '36px', fontSize: '0.88rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
                  >
                    <span>{loading ? 'Creating Account...' : 'Register & Continue →'}</span>
                  </button>

                  {/* Prompt to flip to Sign In */}
                  <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(true);
                        resetAuthForms();
                        setErrorMsg('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Sign In (Flip) ↺
                    </button>
                  </div>

                </form>

              </div>

              {/* ================= BACK FACE: LOGIN FORM ================= */}
              <div className="auth-card-face auth-face-back">
                
                <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                  <h3 className="font-serif" style={{ fontSize: '1.6rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                    Welcome Back!
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    Sign in to access your flower cart, wishlist, and orders.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  
                  {/* Email */}
                  <div style={{ position: 'relative' }}>
                    <Mail size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="email"
                      name="floora_login_email"
                      autoComplete="off"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readonly')}
                      onTouchStart={(e) => e.target.removeAttribute('readonly')}
                      placeholder="Email Address"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="form-input"
                      style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
                    />
                  </div>

                  {/* Password */}
                  <div style={{ position: 'relative' }}>
                    <Lock size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type={showLoginPassword ? "text" : "password"}
                      name="floora_login_password"
                      autoComplete="new-password"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readonly')}
                      onTouchStart={(e) => e.target.removeAttribute('readonly')}
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="form-input"
                      style={{ paddingLeft: '38px', paddingRight: '36px', fontSize: '0.88rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
                  >
                    <span>{loading ? 'Signing in...' : 'Sign In to Floora →'}</span>
                  </button>

                  {/* 1-Click Demo Login Button */}
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', padding: '0.55rem' }}
                  >
                    <Sparkles size={15} style={{ color: '#D97706' }} />
                    <span>Instant Demo Login (Ananya)</span>
                  </button>

                  {/* Prompt to flip back to Register */}
                  <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(false);
                        resetAuthForms();
                        setErrorMsg('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Create Account (Flip) ↻
                    </button>
                  </div>

                </form>

              </div>

            </div>
          </div>

        </div>

      </div>

      {/* 3D FLIP CARD CSS STYLES */}
      <style>{`
        @media (max-width: 820px) {
          .auth-split-wrapper {
            grid-template-columns: 1fr !important;
          }
          .auth-image-column {
            display: none !important;
          }
        }

        .auth-flip-viewport {
          perspective: 1200px;
          width: 100%;
          min-height: 400px;
          position: relative;
        }

        .auth-flip-card {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(0.34, 1.4, 0.64, 1);
        }

        /* Right-to-Left 3D Flip */
        .auth-flip-card.flipped-left {
          transform: rotateY(-180deg);
        }

        .auth-card-face {
          width: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .auth-face-front {
          position: relative;
          z-index: 2;
          transform: rotateY(0deg);
        }

        .auth-face-back {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          transform: rotateY(180deg);
        }
      `}</style>

    </div>
  );
};

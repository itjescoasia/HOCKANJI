import React, { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(`Đăng nhập Google thất bại: ${err.message}. Nếu bạn đang xem trước ứng dụng, hãy thử mở ở thẻ (tab) mới vì tính năng popup bị chặn trong khung xem trước.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-base-alt text-theme-primary font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-theme-panel border border-theme-subtle p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#8b0000] border border-theme-accent flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-serif text-4xl" style={{ fontFamily: 'serif' }}>漢</span>
          </div>
          <h1 className="text-2xl font-serif tracking-widest text-theme-accent">KANJI FLOW</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-2">Hệ thống Spaced Repetition</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-500 p-3 text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-theme-accent opacity-70 mb-2">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-theme-accent opacity-70 mb-2">Mật khẩu</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-theme-base border border-theme-subtle focus:outline-none focus:border-theme-accent transition-colors text-theme-primary text-sm"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-theme-hover border border-theme-accent text-theme-accent hover:bg-theme-accent hover:text-theme-inverted font-medium py-3 mt-2 transition-colors uppercase tracking-[0.2em] text-[11px] disabled:opacity-50"
          >
            {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6 opacity-30">
          <div className="flex-1 h-px bg-[#d4d4d4]"></div>
          <span className="text-[10px] uppercase tracking-widest">hoặc</span>
          <div className="flex-1 h-px bg-[#d4d4d4]"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-gray-900 border border-transparent hover:bg-gray-100 font-bold py-3 transition-colors uppercase tracking-widest text-[11px] flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>

        <div className="mt-8 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-[10px] uppercase tracking-widest text-theme-accent opacity-70 hover:opacity-100 transition-opacity"
          >
            {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}

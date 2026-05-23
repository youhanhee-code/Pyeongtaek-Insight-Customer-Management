import { useState, FormEvent, ChangeEvent } from 'react';
import { loginUser, registerManager } from '../utils/auth';
import { ManagerUser } from '../types';
import { Lock, User, Phone, Shield, ArrowRight, CheckCircle, ShieldAlert } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: ManagerUser) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const formatPhoneNumber = (value: string) => {
    const rawVal = value.replace(/[^0-9]/g, '');
    if (rawVal.length <= 3) return rawVal;
    if (rawVal.length <= 7) return `${rawVal.slice(0, 3)}-${rawVal.slice(3)}`;
    return `${rawVal.slice(0, 3)}-${rawVal.slice(3, 7)}-${rawVal.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneNumber(e.target.value));
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username || !password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    const res = loginUser(username, password);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setError(res.message);
    }
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username || !password || !name || !phone) {
      setError('모든 항목을 올바르게 작성해 주세요.');
      return;
    }

    const res = registerManager(username, password, name, phone);
    if (res.success) {
      setSuccessMsg(res.message);
      // Reset form
      setUsername('');
      setPassword('');
      setName('');
      setPhone('');
      setTimeout(() => {
        setIsRegisterMode(false);
        setSuccessMsg('');
      }, 5000);
    } else {
      setError(res.message);
    }
  };

  const autoFill = (uid: string, pass: string) => {
    setUsername(uid);
    setPassword(pass);
    setIsRegisterMode(false);
    setError('');
  };

  return (
    <div className="min-h-screen geometric-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden self-center">
        
        {/* Header decoration */}
        <div className="bg-[#0F172A] p-8 text-white relative">
          <div className="absolute right-4 top-4 bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1">
            <Shield className="w-3 h-3" /> SECURITY ENGAGE
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">R</div>
            <span className="font-extrabold text-xs tracking-widest text-slate-300">REAL CRM CLOUD</span>
          </div>
          <h2 className="text-2.5xl font-extrabold mt-3 tracking-tight">공인중개사 통합 CRM</h2>
          <p className="text-xs text-slate-400 mt-1">담당 중개인 매물 격리 관리 & 관리자 가입 승인 시스템</p>
        </div>

        {/* Status Indicators/Alerts */}
        {error && (
          <div className="bg-rose-50 border-b border-rose-100 p-4 text-xs font-bold text-rose-700 flex items-center gap-2 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" /> {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border-b border-emerald-100 p-4 text-xs font-semibold text-emerald-800 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> 
            <div>{successMsg}</div>
          </div>
        )}

        {/* Dynamic Form Area */}
        <div className="p-8">
          {!isRegisterMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">ID (아이디)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="아이디를 입력하세요"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-900 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">PASSWORD (비밀번호)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-900 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F172A] hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-lg active:scale-98 flex items-center justify-center gap-1"
              >
                중개인 로그인 <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-blue-650 hover:underline font-bold"
                >
                  📝 신규 담당 중개인 계정 가입 신청하기
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">ID (아이디)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="사용할 아이디"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-900 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">PASSWORD (비밀번호)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="사용할 비밀번호"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-900 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">NAME (중개인 성함)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 홍길동 (또는 홍길동 중개사)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-900 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">PHONE (휴대전화)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="010-0000-0000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-900 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F172A] hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-lg active:scale-98"
              >
                가입 승인 신청서 제출
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                >
                  이미 계정이 있으신가요? 로그인하기
                </button>
              </div>
            </form>
          )}

          {/* Quick tester helper widget */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h4 className="text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-3">⚡ 평가 및 테스트용 계정 퀵로그인</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => autoFill('admin', 'admin')}
                className="bg-slate-900 text-white hover:bg-black py-2.5 px-3 rounded-xl text-2xs font-bold leading-tight flex flex-col items-center justify-center text-center transition"
              >
                <span className="text-blue-400 font-black">대표 관리자</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 mt-0.5">ID: admin / PW: admin</span>
              </button>
              <button
                type="button"
                onClick={() => autoFill('yoo', '123123')}
                className="bg-slate-50 border hover:bg-slate-100 text-slate-800 py-2.5 px-3 rounded-xl text-2xs font-bold leading-tight flex flex-col items-center justify-center text-center transition"
              >
                <span className="text-slate-950">유한희 중개사</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">ID: yoo / PW: 123123</span>
              </button>
              <button
                type="button"
                onClick={() => autoFill('jin', '123123')}
                className="bg-slate-50 border hover:bg-slate-100 text-slate-800 py-2.5 px-3 rounded-xl text-2xs font-bold leading-tight flex flex-col items-center justify-center text-center transition py-2.5"
              >
                <span className="text-slate-950">유진옥 중개사</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">ID: jin / PW: 123123</span>
              </button>
              <button
                type="button"
                onClick={() => autoFill('kim', '123123')}
                className="bg-slate-50 border hover:bg-slate-100 text-slate-800 py-2.5 px-3 rounded-xl text-2xs font-bold leading-tight flex flex-col items-center justify-center text-center transition"
              >
                <span className="text-slate-950">김서하 중개사</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">ID: kim / PW: 123123</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { User } from '../types';
import { loadUsers, saveUser, getAdminPassword } from '../utils';

interface AuthProps {
  onLogin: (user: User | null, isAdmin: boolean) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'admin'>('login');
  
  // Login State
  const [loginName, setLoginName] = useState('');
  const [loginBirth, setLoginBirth] = useState('');
  
  // Signup State
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [phone, setPhone] = useState('');
  
  // Admin State
  const [adminPw, setAdminPw] = useState('');
  
  // Privacy Modal State
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!loginName || !loginBirth) {
      setError('이름과 생년월일을 입력해주세요.');
      return;
    }
    
    try {
      const users = await loadUsers();
      const user = users.find(u => u.name === loginName && u.birth === loginBirth);
      
      if (!user) {
        setError('일치하는 회원 정보가 없습니다.');
        return;
      }
      
      // Check validity
      const now = new Date();
      const validUntil = new Date(user.validUntil);
      if (now > validUntil) {
        setError('열람 유효기간이 만료되었습니다. 관리자에게 문의하세요.');
        return;
      }
      
      onLogin(user, false);
    } catch (err) {
      console.error(err);
      setError('서버에 연결할 수 없습니다. 사내 보안망/방화벽에 의해 차단되었거나 네트워크가 불안정할 수 있습니다.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!company || !name || !birth || !phone) {
      setError('모든 정보를 입력해주세요.');
      return;
    }

    if (!isPrivacyAgreed) {
      setError('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }
    
    try {
      const users = await loadUsers();
      
      // Check if user already exists
      if (users.some(u => u.name === name && u.birth === birth)) {
        setError('이미 가입된 회원입니다. 로그인해주세요.');
        return;
      }
      
      // Valid for 1 month
      const now = new Date();
      const validUntil = new Date(now);
      validUntil.setMonth(validUntil.getMonth() + 1);
      
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        company,
        name,
        birth,
        phone,
        signupDate: now.toISOString(),
        validUntil: validUntil.toISOString()
      };
      
      await saveUser(newUser);
      
      onLogin(newUser, false);
    } catch (err) {
      console.error(err);
      setError('서버에 연결할 수 없습니다. 사내 보안망/방화벽에 의해 차단되었거나 네트워크가 불안정할 수 있습니다.');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const pw = await getAdminPassword();
    if (adminPw === pw) {
      onLogin(null, true);
    } else {
      setError('관리자 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 w-full bg-[#fbf7ef]">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 border border-orange-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-400 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-4 shadow-lg shadow-orange-200">
            B
          </div>
          <h1 className="text-2xl font-bold text-gray-800">B·S·S E-Book 교안</h1>
          <p className="text-sm text-gray-500 mt-1">창원사업장 안전보건 가이드</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 flex flex-col">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">이름 (ID)</label>
              <input 
                type="text" 
                value={loginName}
                onChange={e => setLoginName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors"
                placeholder="홍길동"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">생년월일 (비밀번호)</label>
              <input 
                type="password" 
                value={loginBirth}
                onChange={e => setLoginBirth(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors"
                placeholder="YYMMDD"
              />
            </div>
            <button type="submit" className="w-full bg-orange-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-500 transition-all mt-4">
              로그인
            </button>
            <div className="flex justify-between items-center mt-6 text-sm">
              <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="text-gray-500 hover:text-orange-500 bg-transparent shadow-none p-0">
                회원가입
              </button>
              <button type="button" onClick={() => { setMode('admin'); setError(''); }} className="text-gray-400 hover:text-gray-600 bg-transparent shadow-none p-0 text-xs">
                관리자 모드
              </button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4 flex flex-col">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">업체명</label>
              <input 
                type="text" 
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors"
                placeholder="소속 업체명 입력"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">이름</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors"
                placeholder="성함 입력"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">생년월일</label>
              <input 
                type="text" 
                value={birth}
                onChange={e => setBirth(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors"
                placeholder="예: 900101"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">전화번호</label>
              <input 
                type="tel" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors"
                placeholder="010-0000-0000"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="privacy" 
                checked={isPrivacyAgreed}
                onChange={e => setIsPrivacyAgreed(e.target.checked)}
                className="w-4 h-4 text-orange-400 border-gray-300 rounded focus:ring-orange-400"
              />
              <label htmlFor="privacy" className="text-sm text-gray-700">
                <button type="button" onClick={() => setIsPrivacyModalOpen(true)} className="text-orange-500 underline font-medium">개인정보 수집 및 이용</button>에 동의합니다.
              </label>
            </div>
            <button type="submit" className="w-full bg-orange-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-500 transition-all mt-4">
              가입하고 열람하기
            </button>
            <div className="flex justify-center mt-6 text-sm">
              <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-gray-500 hover:text-orange-500 bg-transparent shadow-none p-0">
                이미 계정이 있으신가요? 로그인
              </button>
            </div>
          </form>
        )}

        {isPrivacyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-[400px] max-h-[80vh] flex flex-col shadow-2xl relative">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <span className="font-bold text-gray-900 text-lg">개인정보 수집 및 이용 동의</span>
                <button type="button" onClick={() => setIsPrivacyModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto text-sm text-gray-600 space-y-4">
                <p>B·S·S E-Book 안전보건 매뉴얼 서비스 제공을 위해 아래와 같이 개인정보를 수집 및 이용합니다.</p>
                <div className="space-y-4 bg-gray-50 p-4 rounded-xl text-gray-700">
                  <div>
                    <h4 className="font-bold mb-1 text-gray-900">1. 수집하는 개인정보 항목</h4>
                    <p>성명, 생년월일, 소속 업체명, 휴대전화번호</p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 text-gray-900">2. 수집 및 이용 목적</h4>
                    <p>안전보건 매뉴얼 열람 권한 부여 및 본인 확인, 사용자 관리</p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 text-gray-900">3. 보유 및 이용 기간</h4>
                    <p>가입일로부터 열람 유효기간과 동일</p>
                  </div>
                </div>
                <p className="text-xs text-red-500 pt-2">※ 귀하는 개인정보 수집 및 이용에 동의하지 않을 권리가 있으나, 동의 거부 시 E-Book 열람 및 서비스 이용이 제한됩니다.</p>
              </div>
              <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
                <button 
                  type="button" 
                  onClick={() => { 
                    setIsPrivacyAgreed(true); 
                    setIsPrivacyModalOpen(false); 
                  }} 
                  className="w-full bg-orange-400 text-white font-bold py-3.5 rounded-xl transition-colors hover:bg-orange-500 shadow-sm"
                >
                  동의합니다
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4 flex flex-col">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">관리자 비밀번호</label>
              <input 
                type="password" 
                value={adminPw}
                onChange={e => setAdminPw(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors"
                placeholder="비밀번호 입력"
              />
            </div>
            <button type="submit" className="w-full bg-gray-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-gray-300 hover:bg-gray-900 transition-all mt-4">
              관리자 로그인
            </button>
            <div className="flex justify-center mt-6 text-sm">
              <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-gray-500 hover:text-gray-800 bg-transparent shadow-none p-0">
                사용자 로그인으로 돌아가기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

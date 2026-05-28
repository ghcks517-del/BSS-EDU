import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { loadUsers, saveUser, deleteUserAuth } from '../utils';
import { UserCheck, Clock, ShieldCheck, LogOut, Trash2 } from 'lucide-react';

interface AdminProps {
  onLogout: () => void;
}

export default function Admin({ onLogout }: AdminProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadUsers().then(setUsers);
  }, []);

  const handleSetValidity = async (id: string, dateStr: string) => {
    if (!dateStr) return;
    const newDate = new Date(dateStr);
    newDate.setHours(23, 59, 59, 999);
    
    let updatedUser: User | undefined;
    const updatedUsers = users.map(u => {
      if (u.id === id) {
        updatedUser = { ...u, validUntil: newDate.toISOString() };
        return updatedUser;
      }
      return u;
    });
    setUsers(updatedUsers);
    if (updatedUser) {
      await saveUser(updatedUser);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('해당 사용자를 삭제하시겠습니까?')) {
      const updatedUsers = users.filter(u => u.id !== id);
      setUsers(updatedUsers);
      await deleteUserAuth(id);
    }
  };

  const formatDateForInput = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const isExpired = (isoString: string) => {
    return new Date() > new Date(isoString);
  };

  return (
    <div className="flex flex-col w-full max-w-md md:max-w-4xl mx-auto min-h-screen bg-gray-50 pb-8">
      <header className="bg-white p-4 items-center flex justify-between border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-2 text-gray-800">
          <ShieldCheck size={20} className="text-blue-600" />
          <h1 className="font-bold">관리자 대시보드</h1>
        </div>
        <button onClick={onLogout} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow-none border-none">
          <LogOut size={14} />
          <span>로그아웃</span>
        </button>
      </header>

      <div className="p-4 space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
          <div className="mt-0.5 text-blue-500">
            <UserCheck size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-blue-900">가입자 현황</h2>
            <p className="text-xs text-blue-700 mt-1">총 {users.length}명의 사용자가 등록되어 있습니다.</p>
          </div>
        </div>

        {/* Mobile View (Cards) */}
        <div className="space-y-4 md:hidden">
          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              등록된 사용자가 없습니다.
            </div>
          ) : (
            users.map(user => {
              const expired = isExpired(user.validUntil);
              return (
                <div key={user.id} className={`bg-white border rounded-xl p-4 ${expired ? 'border-red-200' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{user.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">{user.company}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        생년월일: {user.birth} | {user.phone}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expired ? (
                        <span className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-600 rounded-md">만료됨</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-600 rounded-md">열람가능</span>
                      )}
                      <button onClick={() => handleDeleteUser(user.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded p-1 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 mb-3 space-y-1">
                    <div className="flex justify-between">
                      <span>가입일자</span>
                      <span className="font-medium text-gray-800">{formatDate(user.signupDate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1"><Clock size={12}/> 유효기간</span>
                      <input 
                        type="date"
                        value={formatDateForInput(user.validUntil)}
                        onChange={(e) => handleSetValidity(user.id, e.target.value)}
                        className={`text-right font-bold bg-transparent border-0 focus:outline-none focus:ring-0 cursor-pointer ${expired ? 'text-red-500' : 'text-orange-500'}`}
                        style={{ padding: 0 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-4">
          <table className="w-full text-left text-sm text-gray-600 border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-800">
              <tr>
                <th className="py-3 px-4 font-bold">이름</th>
                <th className="py-3 px-4 font-bold">소속</th>
                <th className="py-3 px-4 font-bold">생년월일/연락처</th>
                <th className="py-3 px-4 font-bold">가입일</th>
                <th className="py-3 px-4 font-bold">유효기간</th>
                <th className="py-3 px-4 font-bold text-center">상태</th>
                <th className="py-3 px-4 font-bold text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">등록된 사용자가 없습니다.</td>
                </tr>
              ) : (
                users.map(user => {
                  const expired = isExpired(user.validUntil);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-800 whitespace-nowrap">{user.name}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{user.company}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div>{user.birth}</div>
                        <div className="text-xs text-gray-500">{user.phone}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{formatDate(user.signupDate)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-gray-400" />
                          <input 
                            type="date"
                            value={formatDateForInput(user.validUntil)}
                            onChange={(e) => handleSetValidity(user.id, e.target.value)}
                            className={`font-bold bg-transparent border-0 focus:outline-none focus:ring-0 cursor-pointer p-0 ${expired ? 'text-red-500' : 'text-orange-500'}`}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {expired ? (
                          <span className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-600 rounded-md">만료됨</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-600 rounded-md">열람가능</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button onClick={() => handleDeleteUser(user.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded p-1.5 transition-colors inline-flex items-center justify-center">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { ManagerUser } from '../types';
import { getManagers, updateApprovalStatus, deleteManager, updateSharingStatus } from '../utils/auth';
import { Users, CheckCircle, XCircle, Trash2, Shield, UserX, UserCheck, Handshake } from 'lucide-react';

interface ManagerApprovalProps {
  onManagersChanged?: () => void;
}

export default function ManagerApproval({ onManagersChanged }: ManagerApprovalProps) {
  const [managers, setManagers] = useState<ManagerUser[]>([]);

  useEffect(() => {
    setManagers(getManagers());
  }, []);

  const handleToggleApproval = (id: string, currentStatus: boolean) => {
    const updated = updateApprovalStatus(id, !currentStatus);
    setManagers(updated);
    if (onManagersChanged) onManagersChanged();
  };

  const handleToggleSharing = (id: string, currentSharingStatus: boolean) => {
    const updated = updateSharingStatus(id, !currentSharingStatus);
    setManagers(updated);
    if (onManagersChanged) onManagersChanged();
  };

  const handleDelete = (id: string, name: string) => {
    if (id === 'm-admin') {
      alert('대표 관리자 계정은 삭제할 수 없습니다.');
      return;
    }
    if (confirm(`[${name}] 계정을 정말 삭제하시겠습니까?`)) {
      const updated = deleteManager(id);
      setManagers(updated);
      if (onManagersChanged) onManagersChanged();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
      
      {/* Header Info */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-800" />
          <h3 className="text-lg font-bold text-slate-900">👥 공인중개인 승인 및 가입 관리</h3>
        </div>
        <span className="text-[10px] bg-blue-100 text-blue-700 font-extrabold px-2.5 py-1 rounded-full uppercase">
          관리자 권한
        </span>
      </div>

      <p className="text-slate-500 text-xs leading-relaxed">
        신규 승인 신청을 제출한 중개인들의 목록입니다. <strong>[승인]</strong>을 완료해야 해당 중개인이 사이트에 접속하여 본인의 담당 매물을 관리할 수 있습니다.
      </p>

      {/* Managers Queue */}
      <div className="space-y-3">
        {managers.map((m) => (
          <div
            key={m.id}
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              m.role === 'admin'
                ? 'bg-slate-50 border-slate-200'
                : m.isApproved
                ? 'bg-white border-slate-200 hover:border-slate-350'
                : 'bg-amber-50/40 border-amber-200 animate-pulse'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-950 text-sm">{m.name}</span>
                {m.role === 'admin' && (
                  <span className="bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                    ADMIN
                  </span>
                )}
                {!m.isApproved && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                    승인 대기 중
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-mono space-x-3 flex flex-wrap items-center gap-y-1">
                <span>ID: <strong className="text-slate-800">{m.username}</strong></span>
                <span>•</span>
                <span>연락처: <strong className="text-slate-800">{m.phone}</strong></span>
                <span>•</span>
                <span>가입일: {new Date(m.createdAt).toLocaleDateString()}</span>
                {m.sharesWithAdmin && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-blue-600 font-extrabold bg-blue-50 px-1.5 py-0.5 rounded-md">
                      <Handshake className="w-3.5 h-3.5 text-blue-500" /> 유한희 중개사와 실시간 동시 공유 중
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
              {m.role !== 'admin' && (
                <>
                  {m.isApproved && (
                    <button
                      type="button"
                      onClick={() => handleToggleSharing(m.id, !!m.sharesWithAdmin)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        m.sharesWithAdmin
                          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="대표(유한희 중개사)와 실시간 동시 데이터 공유 설정 토글"
                    >
                      <Handshake className={`w-4 h-4 ${m.sharesWithAdmin ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`} />
                      {m.sharesWithAdmin ? '동시 공유 ON' : '동시 공유 OFF'}
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleApproval(m.id, m.isApproved)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      m.isApproved
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {m.isApproved ? (
                      <>
                        <UserX className="w-3.5 h-3.5" /> 승인 취소
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" /> 가입 승인
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(m.id, m.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="계정 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {managers.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-xs">
            신청 내역이 존재하지 않습니다.
          </div>
        )}
      </div>

    </div>
  );
}

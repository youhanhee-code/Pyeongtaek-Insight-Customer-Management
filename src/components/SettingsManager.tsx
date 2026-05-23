import { useState, FormEvent } from 'react';
import { Settings, Plus, Trash2, RotateCcw, HelpCircle } from 'lucide-react';
import { INITIAL_GROUPS, INITIAL_STATUSES } from '../utils/storage';

interface SettingsManagerProps {
  groups: string[];
  statuses: string[];
  onUpdateGroups: (groups: string[]) => void;
  onUpdateStatuses: (statuses: string[]) => void;
}

export default function SettingsManager({
  groups,
  statuses,
  onUpdateGroups,
  onUpdateStatuses
}: SettingsManagerProps) {
  const [newGroup, setNewGroup] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // Manage Groups
  const handleAddGroup = (e: FormEvent) => {
    e.preventDefault();
    if (!newGroup.trim()) return;
    if (groups.includes(newGroup.trim())) {
      alert('이미 존재하는 그룹 이름입니다.');
      return;
    }
    onUpdateGroups([...groups, newGroup.trim()]);
    setNewGroup('');
  };

  const handleDeleteGroup = (target: string) => {
    if (groups.length <= 1) {
      alert('최소 한 개 이상의 고객 분류 그룹이 필요합니다.');
      return;
    }
    onUpdateGroups(groups.filter(g => g !== target));
  };

  // Manage Statuses
  const handleAddStatus = (e: FormEvent) => {
    e.preventDefault();
    if (!newStatus.trim()) return;
    if (statuses.includes(newStatus.trim())) {
      alert('이미 존재하는 상태 이름입니다.');
      return;
    }
    onUpdateStatuses([...statuses, newStatus.trim()]);
    setNewStatus('');
  };

  const handleDeleteStatus = (target: string) => {
    if (statuses.length <= 1) {
      alert('최소 한 개 이상의 계약 진행상태가 필요합니다.');
      return;
    }
    onUpdateStatuses(statuses.filter(s => s !== target));
  };

  const handleResetToBaseline = () => {
    if (confirm('모든 설정값을 시스템 초기 기본값으로 되돌리시겠습니까?')) {
      onUpdateGroups(INITIAL_GROUPS);
      onUpdateStatuses(INITIAL_STATUSES);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-8">
      
      {/* Settings Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-800 animate-spin-slow" />
          <h3 className="text-lg font-bold text-slate-900">CRM 마스터 설정</h3>
        </div>
        <button
          onClick={handleResetToBaseline}
          className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold hover:underline"
        >
          <RotateCcw className="w-3 h-3" /> 마스터 초기화
        </button>
      </div>

      {/* Group Configuration Area */}
      <div className="space-y-4">
        <div>
          <h4 className="font-bold text-slate-800 text-sm">🗂 고객그룹 설정</h4>
          <p className="text-slate-400 text-xs mt-1">대시보드와 등록폼에서 분류할 고객의 투자/의뢰 유형 그룹</p>
        </div>

        {/* Existing Groups List */}
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 min-h-[50px]">
          {groups.map((g) => (
            <span
              key={g}
              className="bg-white border text-xs font-bold pl-3 pr-2 py-1.5 rounded-xl flex items-center gap-1.5 text-slate-850 shadow-3xs"
            >
              <span>{g}</span>
              <button
                type="button"
                onClick={() => handleDeleteGroup(g)}
                className="hover:bg-slate-100 text-slate-400 hover:text-slate-700 p-0.5 rounded transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Add Group Form */}
        <form onSubmit={handleAddGroup} className="flex gap-2">
          <input
            type="text"
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-slate-800"
            placeholder="예: 실거주 상담고객, VIP 투자단"
          />
          <button
            type="submit"
            className="bg-[#0F172A] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 transition flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> 추가
          </button>
        </form>
      </div>

      {/* Status Configuration Area */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div>
          <h4 className="font-bold text-slate-800 text-sm">📍 계약 진행상태 설정</h4>
          <p className="text-slate-400 text-xs mt-1">거래 체결율을 분석하고 일차 필터링하기 위한 계약 단계명 수정</p>
        </div>

        {/* Existing Statuses List */}
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 min-h-[50px]">
          {statuses.map((s) => (
            <span
              key={s}
              className="bg-white border text-xs font-bold pl-3 pr-2 py-1.5 rounded-xl flex items-center gap-1.5 text-slate-850 shadow-3xs"
            >
              <span>{s}</span>
              <button
                type="button"
                onClick={() => handleDeleteStatus(s)}
                className="hover:bg-slate-100 text-slate-400 hover:text-slate-700 p-0.5 rounded transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Add Status Form */}
        <form onSubmit={handleAddStatus} className="flex gap-2">
          <input
            type="text"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-slate-800"
            placeholder="예: 가계약 완료, 대기중"
          />
          <button
            type="submit"
            className="bg-[#0F172A] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 transition flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> 추가
          </button>
        </form>
      </div>

      {/* Proactive Info Panel */}
      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 text-xs text-blue-900 leading-relaxed">
        <div className="font-bold flex items-center gap-1.5 mb-1 text-blue-950">
          <HelpCircle className="w-3.5 h-3.5 shrink-0" /> 일지 변경 실시간 연동 가이드
        </div>
        설정에서 추가 또는 삭제된 그룹과 상태 항목은 상단 <strong>고객 등록폼</strong>과 <strong>고객 조회 필터 목록</strong>에 실시간 반영되어 재접속 없이도 즉각 업무에 사용하실 수 있습니다.
      </div>
    </div>
  );
}

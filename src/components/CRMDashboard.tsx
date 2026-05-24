import { useState } from 'react';
import { Customer } from '../types';
import { Users, FileCheck, RefreshCw, Layers, TrendingUp, Download, Trash2, AlertTriangle, X } from 'lucide-react';

interface CRMDashboardProps {
  customers: Customer[];
  onExport: () => void;
  onClearAll: () => void;
  selectedType?: string;
  setSelectedType?: (type: string) => void;
  selectedStatus?: string;
  setSelectedStatus?: (status: string) => void;
  selectedGroup?: string;
  setSelectedGroup?: (group: string) => void;
}

export default function CRMDashboard({ 
  customers, 
  onExport, 
  onClearAll,
  selectedType = '전체',
  setSelectedType,
  selectedStatus = '전체',
  setSelectedStatus,
  selectedGroup = '전체',
  setSelectedGroup
}: CRMDashboardProps) {
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const total = customers.length;
  
  const statusStats = customers.reduce((acc, curr) => {
    const status = curr.status;
    if (status === '계약완료' || status === '계약') {
      acc.completed += 1;
    } else if (status === '보류') {
      acc.hold += 1;
    } else {
      acc.active += 1; // '상담중', '진행', etc.
    }
    return acc;
  }, { active: 0, completed: 0, hold: 0 });

  // Calculate customer type distribution
  const typeCounts = customers.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const defaultTypes = ['매수인', '임차인', '매도인', '임대인', '관리인', '대리인', '중개사', '기타'];

  const handleFilterClick = (typeVal?: string, statusVal?: string, groupVal?: string) => {
    if (setSelectedType && typeVal !== undefined) {
      setSelectedType(typeVal);
    }
    if (setSelectedStatus && statusVal !== undefined) {
      setSelectedStatus(statusVal);
    }
    if (setSelectedGroup && groupVal !== undefined) {
      setSelectedGroup(groupVal);
    }

    // Scroll to the database list with smooth animation
    setTimeout(() => {
      const element = document.getElementById('customer-database-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  return (
    <div className="mb-12">
      {/* Top Welcome & KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-left">
        
        {/* Metric 1: Total Customers */}
        <button
          type="button"
          onClick={() => handleFilterClick('전체', '전체', '전체')}
          className={`w-full text-left bg-white border rounded-3xl p-6 shadow-3xs hover:shadow-md transition duration-200 cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] group focus:outline-hidden ${
            selectedStatus === '전체' && selectedType === '전체' && selectedGroup === '전체'
              ? 'ring-2 ring-slate-900 border-slate-900 bg-slate-50/10'
              : 'border-slate-200'
          }`}
          title="클릭 시 전체 고객 검색 필터 초기화"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 font-bold text-xs uppercase tracking-wider block">전체 관리 고객수</span>
            <div className="w-10 h-10 rounded-2xl bg-slate-900/5 flex items-center justify-center text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition duration-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900">{total}</span>
            <span className="text-sm font-bold text-slate-500">명</span>
          </div>
          <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 font-semibold">
            <span>전체 의뢰인 보기</span>
            <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition duration-150">전체 선택 ➔</span>
          </div>
        </button>

        {/* Metric 2: Active Consultings */}
        <button
          type="button"
          onClick={() => handleFilterClick('전체', '상담중')}
          className={`w-full text-left bg-white border rounded-3xl p-6 shadow-3xs hover:shadow-md transition duration-200 cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] group focus:outline-hidden ${
            selectedStatus === '상담중'
              ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/10'
              : 'border-slate-200'
          }`}
          title="클릭 시 '상담중' 고객들을 우선 필터링"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 font-bold text-xs uppercase tracking-wider block">상담 및 진행중</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition duration-200">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900">{statusStats.active}</span>
            <span className="text-sm font-bold text-slate-500">명</span>
          </div>
          <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 font-semibold">
            <span>예비 진행건 보기</span>
            <span className="text-amber-600 opacity-0 group-hover:opacity-100 transition duration-150">상담 필터 ➔</span>
          </div>
        </button>

        {/* Metric 3: Contracts Closed */}
        <button
          type="button"
          onClick={() => handleFilterClick('전체', '계약완료')}
          className={`w-full text-left bg-white border rounded-3xl p-6 shadow-3xs hover:shadow-md transition duration-200 cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] group focus:outline-hidden ${
            selectedStatus === '계약완료'
              ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/10'
              : 'border-slate-200'
          }`}
          title="클릭 시 '계약완료' 고객들을 우선 필터링"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 font-bold text-xs uppercase tracking-wider block">계약 성사 건수</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition duration-200">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-emerald-600">{statusStats.completed}</span>
            <span className="text-sm font-bold text-slate-500">건</span>
          </div>
          <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 font-semibold">
            <span>수수료 확보건 보기</span>
            <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition duration-150">완료 필터 ➔</span>
          </div>
        </button>

        {/* Metric 4: On Hold */}
        <button
          type="button"
          onClick={() => handleFilterClick('전체', '보류')}
          className={`w-full text-left bg-white border rounded-3xl p-6 shadow-3xs hover:shadow-md transition duration-200 cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] group focus:outline-hidden ${
            selectedStatus === '보류'
              ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/10'
              : 'border-slate-200'
          }`}
          title="클릭 시 '보류' 고객들을 우선 필터링"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 font-bold text-xs uppercase tracking-wider block">보류 고객</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition duration-200">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900">{statusStats.hold}</span>
            <span className="text-sm font-bold text-slate-500">명</span>
          </div>
          <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 font-semibold">
            <span>보류 상태군 보기</span>
            <span className="text-rose-600 opacity-0 group-hover:opacity-100 transition duration-150">보류 필터 ➔</span>
          </div>
        </button>

      </div>

      {/* Database Actions & Type Metrics Section */}
      <div className="bg-[#0F172A] text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <TrendingUp className="w-3.5 h-3.5" /> 실시간 통합 부동산 DB 현황
          </div>
          <h3 className="text-2xl font-bold mb-2">체계적인 CRM 관리 대시보드</h3>
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            고객의 요구를 분석하고 거래 형태에 적합한 매칭 매물을 선별하십시오. 아래 검색 기능과 필터를 조합하여 원하시는 타겟 목록을 신속히 확인하고, 백업 목적의 전체 데이터 내보내기(CSV)가 가능합니다.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 shrink-0">
          <button
            onClick={onExport}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all px-5 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Download className="w-4 h-4" /> CRM 고객 DB 백업 (CSV)
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmingClear(true)}
            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white transition-all px-5 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer text-sm shadow-md"
          >
            <Trash2 className="w-4 h-4" /> 전체 데이터 일괄 삭제
          </button>
        </div>
      </div>

      {/* Warning Batch Delete Confirmation Modal */}
      {isConfirmingClear && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div 
            className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 relative animate-scale-up"
            style={{ animation: 'scaleUp 0.15s ease-out' }}
          >
            <button
              type="button"
              onClick={() => setIsConfirmingClear(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 border-4 border-rose-100 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-extrabold text-[#0F172A]">⚠️ 전체 데이터 일괄 삭제</h4>
                <p className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-100 py-1.5 px-3 rounded-lg">
                  ❌ 경고: 저장된 모든 데이터가 영구히 지워집니다!
                </p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                정말로 전체 고객 정보를 일괄 삭제하시겠습니까? 이 동작은 되돌릴 수 없으며, 등록된 모든 거래 의뢰고객 목록, 상담 상세 메모, 첨부파일 내역이 로컬 및 실시간 기기 데이터베이스(Local Database)에서 흔적 없이 완전히 제거됩니다.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmingClear(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3.5 rounded-2xl text-xs transition border cursor-pointer"
              >
                취소 (보존하기)
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setIsConfirmingClear(false);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3.5 rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> 예, 전체 삭제합니다
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Type Distribution Charts Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-slate-800 text-sm">🗂️ 유형별 의뢰자 분석 (클릭하여 대시보드 및 리스트 필터링)</h4>
          {selectedType !== '전체' && (
            <button
              onClick={() => handleFilterClick('전체')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition"
            >
              필터 해제 ↺
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
          {defaultTypes.map((type) => {
            const count = typeCounts[type] || 0;
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleFilterClick(isActive ? '전체' : type)}
                className={`w-full text-center rounded-2xl p-3 border flex flex-col justify-between items-center transition duration-200 cursor-pointer transform hover:scale-[1.03] active:scale-[0.97] focus:outline-hidden ${
                  isActive
                    ? 'ring-2 ring-slate-900 border-slate-900 bg-slate-100 shadow-3xs'
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'
                }`}
                title={`클릭하여 '${type}' 고객 필터링`}
              >
                <div className="font-semibold text-xs flex items-center gap-1">
                  {type === '매수인' ? '👤' : 
                   type === '임차인' ? '🏠' : 
                   type === '매도인' ? '🏢' : 
                   type === '임대인' ? '🔑' : 
                   type === '관리인' ? '🛠️' : 
                   type === '대리인' ? '📄' : 
                   type === '중개사' ? '🤝' : '➕'} {type}
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden my-2.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isActive ? 'bg-blue-600' : 'bg-slate-900'
                    }`}
                    style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="font-extrabold text-[#0F172A] text-xl mt-0.5">
                  {count}
                  <span className="text-xs text-slate-400 font-bold ml-0.5">명</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { Customer } from '../types';
import { Users, FileCheck, RefreshCw, Layers, TrendingUp, Download } from 'lucide-react';

interface CRMDashboardProps {
  customers: Customer[];
  onExport: () => void;
}

export default function CRMDashboard({ customers, onExport }: CRMDashboardProps) {
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

  return (
    <div className="mb-12">
      {/* Top Welcome & KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Metric 1: Total Customers */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 font-medium text-sm">전체 관리 고객수</span>
            <div className="w-10 h-10 rounded-2xl bg-slate-900/5 flex items-center justify-center text-slate-800">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900">{total}</span>
            <span className="text-sm font-semibold text-slate-500">명</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">전체 등록된 거래 의뢰인 목록</p>
        </div>

        {/* Metric 2: Active Consultings */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 font-medium text-sm">상담 및 진행중</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900">{statusStats.active}</span>
            <span className="text-sm font-semibold text-slate-500">명</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">상담, 계약검토 중인 예비 거래건</p>
        </div>

        {/* Metric 3: Contracts Closed */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 font-medium text-sm">계약 성사 건수</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-emerald-600">{statusStats.completed}</span>
            <span className="text-sm font-semibold text-slate-500">건</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">안전 수수료 확보 및 계약서 작성 완료</p>
        </div>

        {/* Metric 4: On Hold */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 font-medium text-sm">보류 고객</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900">{statusStats.hold}</span>
            <span className="text-sm font-semibold text-slate-500">명</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">시장 관망 상태 또는 재상담 보류 상태</p>
        </div>

      </div>

      {/* Database Actions & Type Metrics Section */}
      <div className="bg-[#0F172A] text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-stretch gap-6">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <TrendingUp className="w-3.5 h-3.5" /> 실시간 통합 부동산 DB 현황
          </div>
          <h3 className="text-2xl font-bold mb-2">체계적인 CRM 관리 대시보드</h3>
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            고객의 요구를 분석하고 거래 형태에 적합한 매칭 매물을 선별하십시오. 아래 검색 기능과 필터를 조합하여 원하시는 타겟 목록을 신속히 확인하고, 백업 목적의 전체 데이터 내보내기(CSV)가 가능합니다.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 min-w-[200px]">
          <button
            onClick={onExport}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all px-5 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> CRM 고객 DB 백업 (CSV)
          </button>
        </div>
      </div>

      {/* Customer Type Distribution Charts Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mt-6">
        <h4 className="font-bold text-slate-800 mb-4 text-base">유형별 의뢰자 분석</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
          {defaultTypes.map((type) => {
            const count = typeCounts[type] || 0;
            const percentage = total > 0 ? Math.round((count / total) * 105) : 0; // limit height ratio slightly
            return (
              <div key={type} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col justify-between items-center transition hover:bg-slate-100/50">
                <span className="text-slate-500 text-xs font-medium block mb-1">{type}</span>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden my-2">
                  <div 
                    className="bg-slate-900 h-full rounded-full transition-all duration-500"
                    style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="font-bold text-slate-900 text-lg mt-1">{count}<span className="text-xs text-slate-500 font-normal">명</span></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

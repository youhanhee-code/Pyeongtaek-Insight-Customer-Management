import { useState, useEffect, FormEvent } from 'react';
import { Customer, CustomerNote, ManagerUser } from './types';
import {
  getCustomers,
  saveCustomers,
  getGroups,
  saveGroups,
  getStatuses,
  saveStatuses
} from './utils/storage';
import { getCurrentUser, logoutUser } from './utils/auth';
import CRMDashboard from './components/CRMDashboard';
import CustomerForm from './components/CustomerForm';
import CustomerList from './components/CustomerList';
import SettingsManager from './components/SettingsManager';
import LoginScreen from './components/LoginScreen';
import ManagerApproval from './components/ManagerApproval';

import {
  LayoutDashboard,
  Layers,
  FileText,
  BadgeAlert,
  PhoneCall,
  UserCheck,
  Building,
  CheckCircle,
  FolderOpen,
  Info,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Handshake
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<ManagerUser | null>(null);
  const [managersRevision, setManagersRevision] = useState(0);

  // Live CRM Database State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  // Navigation Tabs: 'live-crm' (Interactive App), 'guide' (Original Template Content)
  const [activeTab, setActiveTab] = useState<'live-crm' | 'guide'>('live-crm');

  // Load state on mount
  useEffect(() => {
    setCustomers(getCustomers());
    setGroups(getGroups());
    setStatuses(getStatuses());
    setCurrentUser(getCurrentUser());
  }, [managersRevision]);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  // Save updates to storage and synchronize state
  const handleSaveCustomer = (newCustomerOrList: Customer | Customer[]) => {
    setCustomers((prev) => {
      let updated: Customer[];
      if (Array.isArray(newCustomerOrList)) {
        updated = [...newCustomerOrList, ...prev];
      } else {
        updated = [newCustomerOrList, ...prev];
      }
      saveCustomers(updated);
      return updated;
    });
  };

  const handleDeleteCustomer = (id: string) => {
    const updated = customers.filter((c) => c.id !== id);
    setCustomers(updated);
    saveCustomers(updated);
  };

  const handleClearAllCustomers = () => {
    setCustomers([]);
    saveCustomers([]);
  };

  const handleToggleCustomerShare = (id: string) => {
    setCustomers((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id) {
          return { ...c, isShared: !c.isShared };
        }
        return c;
      });
      saveCustomers(updated);
      return updated;
    });
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    const updated = customers.map((c) => {
      if (c.id === id) {
        return { ...c, status: newStatus };
      }
      return c;
    });
    setCustomers(updated);
    saveCustomers(updated);
  };

  const handleAddNote = (id: string, content: string) => {
    const updated = customers.map((c) => {
      if (c.id === id) {
        const newNote: CustomerNote = {
          id: `note-${Date.now()}`,
          content,
          createdAt: new Date().toISOString()
        };
        return { ...c, notes: [...c.notes, newNote] };
      }
      return c;
    });
    setCustomers(updated);
    saveCustomers(updated);
  };

  const handleAddFile = (id: string, fileName: string) => {
    const updated = customers.map((c) => {
      if (c.id === id) {
        if (c.files.length >= 5) {
          alert('파일은 한 고객당 최대 5개까지만 등록할 수 있습니다.');
          return c;
        }
        const suffix = Math.floor(Math.random() * 900) + 100;
        const finalName = `${fileName}_${suffix}.pdf`;
        return { ...c, files: [...c.files, finalName] };
      }
      return c;
    });
    setCustomers(updated);
    saveCustomers(updated);
  };

  // Update master settings
  const handleUpdateGroups = (newGroups: string[]) => {
    setGroups(newGroups);
    saveGroups(newGroups);
  };

  const handleUpdateStatuses = (newStatuses: string[]) => {
    setStatuses(newStatuses);
    saveStatuses(newStatuses);
  };

  // Export database as CSV file helper
  const handleExportCSV = () => {
    if (customers.length === 0) {
      alert('내보낼 고객 데이터가 없습니다.');
      return;
    }

    // Prepare header
    const headers = ['이름', '연락처', '구분', '성별', '의뢰유형', '분류그룹', '상태', '담당자', '기매물/예산정보', '등록일'];
    
    // Prepare rows
    const rows = customers.map(c => [
      c.name,
      c.phone,
      c.division,
      c.gender,
      c.type,
      c.group,
      c.status,
      c.managerName,
      c.propertyDetails || c.budget || '없음',
      new Date(c.createdAt).toLocaleDateString()
    ]);

    // Build CSV content with BOM for Korean character layout in Excel
    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `공인중개사_CRM_고객DB_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Contact modal inquiry state
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('고객관리 CRM 구축');

  const handleInquirySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone) {
      alert('이름과 연락처를 작성해 주십시오.');
      return;
    }
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setInquiryName('');
      setInquiryPhone('');
    }, 4000);
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={setCurrentUser} />;
  }

  // Filter visible customers based on role and real-time sharing preferences (row-level sharing)
  const visibleCustomers = currentUser.role === 'admin'
    ? customers
    : customers.filter(c => c.managerName === currentUser.name || c.isShared === true);

  return (
    <div className="geometric-grid text-slate-800 min-h-screen font-sans">
      
      {/* Universal Sticky Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center font-black text-white text-base tracking-tighter">
              R
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-950">공인중개사 전문 CRM</h1>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">REAL CRM PLATFORM</span>
            </div>
          </div>

          {/* Active User Session Info & Logout */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 px-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              {currentUser.role === 'admin' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span className="text-blue-700">대표 관리자 권한</span>
                </>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">{currentUser.name}</span>
                  </div>
                  {currentUser.sharesWithAdmin && (
                    <span className="bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 leading-none shadow-2xs">
                      <Handshake className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                      유한희 대표와 동시 공유 중
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <button
              onClick={handleLogout}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-600 transition flex items-center gap-1.5 uppercase"
              title="로그아웃"
            >
              <LogOut className="w-3.5 h-3.5" /> 로그아웃
            </button>
          </div>

          {/* Mode Tabs Selector */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('live-crm')}
              className={`flex-1 sm:flex-none text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'live-crm'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> ⚡ 실무 CRM 대시보드
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex-1 sm:flex-none text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'guide'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Info className="w-4 h-4" /> 📖 CRM 가이드 및 홈피 소개
            </button>
          </div>
        </div>
      </header>

      {/* Main Tabbed Layout Container */}
      <main className="transition-all duration-300">
        
        {/* TAB 1: Live Interactive CRM Application */}
        {activeTab === 'live-crm' && (
          <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
            
            {/* Active Analytics counters header */}
            <CRMDashboard customers={visibleCustomers} onExport={handleExportCSV} onClearAll={handleClearAllCustomers} />

            {/* Split view: Register customer form on left/right, customer list with search on other */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Column: Register Form */}
              <div className="lg:col-span-2 space-y-8">
                <CustomerForm
                  onSave={handleSaveCustomer}
                  existingCustomers={customers}
                  groups={groups}
                  statuses={statuses}
                  currentUser={currentUser}
                />
              </div>

              {/* Right Column: Settings control desk & Manager Approvals queue */}
              <div className="space-y-8">
                {currentUser?.role === 'admin' && (
                  <ManagerApproval onManagersChanged={() => setManagersRevision(prev => prev + 1)} />
                )}

                <SettingsManager
                  groups={groups}
                  statuses={statuses}
                  onUpdateGroups={handleUpdateGroups}
                  onUpdateStatuses={handleUpdateStatuses}
                />

                {/* Micro Guide Card */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                  <h4 className="font-bold text-base mb-2">💡 고객관리 자동 팁</h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    새 고객을 등록하기 전, 휴대전화번호를 입력하시면 DB에 있는 기존 고객명과 매칭되어 <strong>중복 여부</strong>를 실시간으로 감지하고 경고를 띄웁니다.
                    불필요한 중복 의뢰 유입을 완벽히 퇴치하세요!
                  </p>
                </div>
              </div>

            </div>

            {/* Full Width bottom widget: Customer Filtering and Lookup Board */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 bg-slate-900 rounded-sm"></span>
                <h3 className="text-xl font-bold text-slate-900">🗃️ 전체 고객 데이터베이스 조회</h3>
              </div>
              <CustomerList
                customers={visibleCustomers}
                groups={groups}
                statuses={statuses}
                onDelete={handleDeleteCustomer}
                onUpdateStatus={handleUpdateStatus}
                onAddNote={handleAddNote}
                onAddFile={handleAddFile}
                currentUser={currentUser}
                onToggleCustomerShare={handleToggleCustomerShare}
              />
            </div>

          </div>
        )}

        {/* TAB 2: Marketing & Informational Guides Page (User's Exact Design Spec Template) */}
        {activeTab === 'guide' && (
          <div className="animate-fade-in">
            
            {/* Hero Banner Section */}
            <section className="bg-gradient-to-br from-slate-900 to-slate-700 text-white py-24 px-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,#3b82f61a,transparent_60%)]"></div>
              <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
                <div>
                  <div className="inline-block bg-blue-500/20 text-blue-200 px-4 py-2 rounded-full text-xs font-semibold mb-6">
                    🚀 공인중개사 전용 임베디드 관리 웹사이트
                  </div>

                  <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 tracking-tight">
                    고객관리와 매물등록을
                    <br />
                    더 쉽고 빠르게
                  </h1>

                  <p className="text-lg text-slate-300 leading-relaxed mb-8">
                    공인중개사를 위한 전문 고객관리 CRM 시스템.
                    <br />
                    고객 등록 · 상담관리 · 매물관리 · 계약관리까지 한 번에 안전하고 편하게 처리하십시오.
                  </p>

                  <div className="flex flex-wrap gap-4 mb-10">
                    <button
                      onClick={() => setActiveTab('live-crm')}
                      className="bg-blue-500 hover:bg-blue-600 transition duration-200 px-7 py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 text-sm"
                    >
                      실시간 대시보드 열기
                    </button>

                    <button
                      onClick={() => {
                        const contactSec = document.getElementById('contact-guide-anchor');
                        if (contactSec) contactSec.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-white text-slate-950 hover:bg-slate-100 transition duration-200 px-7 py-4 rounded-2xl font-bold shadow-lg text-sm"
                    >
                      홈페이지 제작 설명
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      '고객 자동저장 지원',
                      '고객 중복체크 기능',
                      '담당자 관리 기능',
                      '계약 진행단계 관리',
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl px-5 py-4 text-sm flex items-center gap-2"
                      >
                        <CheckCircle className="w-4.5 h-4.5 text-blue-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Visual Display Mock */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl text-slate-800 border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">고객 등록 템플릿</h3>
                    <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">
                      CRM GUIDE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { icon: '👤', title: '매수인', desc: '부동산 매수 희망 고객' },
                      { icon: '🏠', title: '임차인', desc: '임대 및 전세 고객' },
                      { icon: '🏢', title: '매도인', desc: '매물 판매 고객' },
                      { icon: '🔑', title: '임대인', desc: '임대 매물 등록 고객' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="border border-slate-150 bg-slate-50/50 rounded-2xl p-3.5 hover:border-blue-400 hover:shadow-2xs transition"
                      >
                        <div className="text-2xl mb-1">{item.icon}</div>
                        <div className="font-bold text-sm text-slate-850">{item.title}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-400 text-sm outline-none cursor-not-allowed"
                      placeholder="고객명 (실무 데이터 저장 탭에서 테스트 가능)"
                      disabled
                    />
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-400 text-sm outline-none cursor-not-allowed"
                      placeholder="휴대전화번호 (실무 데이터 저장 탭에서 테스트 가능)"
                      disabled
                    />
                    <button
                      type="button"
                      onClick={() => setActiveTab('live-crm')}
                      className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl text-xs hover:bg-slate-850 transition"
                    >
                      실시간 데이터 저장 엔진으로 가기 ➔
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Customer Type Matrix Info */}
            <section className="py-24 px-6 bg-white">
              <div className="max-w-7xl mx-auto text-center mb-16">
                <div className="text-blue-600 font-bold text-sm mb-3">고객 등록폼 종류 선택</div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                  고객 유형에 따라 간편하게 분류 관리
                </h2>
                <p className="text-slate-500 text-base max-w-3xl mx-auto leading-relaxed">
                  고객 등록폼 최상단에서 고객의 구분을 신속하게 선택하고 일정 관리를 시작할 수 있습니다.
                  등록 구분에 따라 예산, 희망지역, 타겟 빌딩 등 필요 필드가 자동 매칭되어 관리가 더 효율적입니다.
                </p>
              </div>

              <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: '👤', title: '매수인', desc: '부동산 매수 희망 고객' },
                  { icon: '🏠', title: '임차인', desc: '임대 및 전세 고객' },
                  { icon: '🏢', title: '매도인', desc: '매물 판매 고객' },
                  { icon: '🔑', title: '임대인', desc: '임대 매물 등록 고객' },
                  { icon: '🛠️', title: '관리인', desc: '건물 및 매물 관리 담당' },
                  { icon: '📄', title: '대리인', desc: '위임 대리 고객' },
                  { icon: '🤝', title: '중개사', desc: '협력 중개사' },
                  { icon: '➕', title: '기타', desc: '기타 고객 유형' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-100 rounded-3xl p-6.5 hover:shadow-lg hover:-translate-y-1 transition duration-200"
                  >
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Input Details Guideline Section */}
            <section className="bg-slate-50 py-24 px-6 border-y border-slate-200">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <div className="text-blue-600 font-bold text-sm mb-3">고객 등록폼 입력 안내</div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    체계적인 고객 정보 파악 노하우
                  </h2>
                  <p className="text-slate-500 text-base">
                    고객 등록 시 제공되는 데이터 필드 설명과 올바른 CRM 입력 순서입니다.
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-3xs flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">진행 상태 관리</h3>
                      <div className="flex flex-wrap gap-2.5 mb-6">
                        {['상담중', '계약완료', '보류', '재상담 예정'].map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-800 border-blue-100 border px-3.5 py-1.5 rounded-xl font-bold text-xs"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        고객의 신규 방문, 의뢰 검토 수준에 맞춰 수수료 발생 가능 단계까지 마스터 상태 기재가 원활합니다. 진행 상황이 변경되면 실시간으로 색상이 다르게 표시됩니다.
                      </p>
                    </div>
                    <div className="text-blue-600 font-bold text-xs">※ 실무 탭 마스터 설정에서 항목 자율 삭제/추가 지원</div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-3xs">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 font-sans">고객 기본정보 입력 구성</h3>

                    <div className="space-y-4">
                      {[
                        { title: '👤 고객명 및 성별', desc: '고객 이름 필수값 / 성별 토글 단추로 선택' },
                        { title: '🏢 의뢰 지위', desc: '개인 고객과 상가 법인 기재 자율 분류 선택 가능' },
                        { title: '📱 연락처 정보 및 주소', desc: '전화번호 입력 검출 / 매물 위치 및 희망 지점 입력창' }
                      ].map((info, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                          <div className="font-bold text-sm text-slate-850 mb-1">{info.title}</div>
                          <div className="text-slate-500 text-xs">{info.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Document Backup and Auto-saves highlights */}
            <section className="py-24 px-6 bg-white border-b">
              <div className="max-w-7xl mx-auto">
                
                <div className="text-center mb-16">
                  <div className="text-blue-600 font-bold text-sm mb-3">스마트 기술 연동</div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    서류 누락 없는 스마트 계약 보조 기능
                  </h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-16">
                  {/* File Upload Box */}
                  <div className="bg-slate-50 border rounded-3xl p-8">
                    <h4 className="font-bold text-xl text-slate-900 mb-4">📂 분실 없는 계약 특약 및 서류 관리</h4>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      고객 프로필별로 계약서, 등기부등본, 신분증 스캔본 등 각종 증명 보관용 파일(최대 5개)을 연계 보관할 수 있습니다.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['계약서 파일', '등기부 초본', '신분증 사본', '상담 일지', '건축 대장'].map((item) => (
                        <div key={item} className="bg-white border text-center p-3 rounded-2xl font-bold text-xs text-slate-700">
                          📄 {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Auto features Highlights */}
                  <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between">
                    <div>
                      <span className="text-3xl block mb-4">💾</span>
                      <h4 className="font-bold text-xl mb-3">자동 고객 저장 & 중복 가드</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        전화번호 키패드를 누르는 순간 데이터베이스 연동이 즉시 동작하여 등록된 고객의 담당 여부를 사전에 가려냅니다.
                        실수가 잦은 수작업 분산 시트를 폐기하고 하나의 정규화된 관리 시트로 자동 합류 시켜 마케팅 수익률을 가속시킬 수 있습니다.
                      </p>
                    </div>
                    <div className="text-xs text-blue-400 font-bold mt-6">
                      ✔ 중복 차단 · 시간 단축 · 보안 강화
                    </div>
                  </div>
                </div>

                {/* Dashboard Recommendations Section */}
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                  <div className="max-w-3xl">
                    <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 border border-blue-150 px-2.5 py-1 rounded-md">추천 마스터 컬러 & 레이아웃 디자인</span>
                    <h3 className="text-2xl font-extrabold text-slate-900 mt-3 mb-4">심플하고 권위있는 신뢰도 디자인</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      부동산 신뢰도를 강화하는 <strong>Deep Charcoal Blue</strong>와 <strong>Classic Off-White</strong>의 투톤 테마를 사용하여 공인중개사가 거래 계약 협상을 중개하는 동안 전문적인 품격을 극대화할 수 있도록 설계되었습니다.
                    </p>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-slate-900 block border border-slate-200"></span> 네이비 메인
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-white block border border-slate-200"></span> 화이트 카드
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-slate-100 block border border-slate-200"></span> 라이트 그레이
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* Sticky contact and development order Form */}
            <section id="contact-guide-anchor" className="bg-slate-900 text-white py-24 px-6 relative">
              <div className="max-w-4xl mx-auto text-center">
                <span className="text-blue-400 font-bold text-sm block mb-2 uppercase">제작 및 기술 고도화 상담</span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight leading-tight">
                  공인중개사 고객관리 홈페이지를
                  <br />
                  원하시는 디자인과 사양대로 맞춤제작 해드립니다.
                </h2>
                <p className="text-slate-300 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed mb-12">
                  본 프로토타입과 같이 실제 작동하는 고객관리 시스템 외에도 네이버 부동산 매물 연동, 지도 정보 검색, 카카오 비즈톡 상담 알림 전송 등을 구현해 드릴 수 있습니다.
                </p>

                {/* Simulated Inquiry interactive Form Card */}
                <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 md:p-8 text-left max-w-xl mx-auto shadow-xl">
                  {inquirySent ? (
                    <div className="text-center py-10 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                        ✔
                      </div>
                      <h4 className="text-lg font-bold">감사합니다. 상담이 정식 접수되었습니다!</h4>
                      <p className="text-xs text-slate-300">작성해주신 연락처로 기술지원 담당자가 조속히 연락드리겠습니다.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-4">
                      <div>
                        <label className="block text-slate-300 text-xs font-bold mb-1.5">희망 개발 구분</label>
                        <select
                          value={inquiryType}
                          onChange={(e) => setInquiryType(e.target.value)}
                          className="w-full bg-slate-850 border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none text-white font-semibold"
                        >
                          <option value="고객관리 CRM 구축">고객관리 CRM 구축</option>
                          <option value="매물등록 시스템 개발">매물등록 시스템 개발</option>
                          <option value="반응형 홈페이지 제작">반응형 홈페이지 제작</option>
                          <option value="맞춤 기능 커스터마이징">맞춤 기능 커스터마이징</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 text-xs font-bold mb-1.5">성과 이름</label>
                          <input
                            type="text"
                            value={inquiryName}
                            onChange={(e) => setInquiryName(e.target.value)}
                            placeholder="명함 성함"
                            className="w-full bg-slate-850 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs outline-none text-white focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 text-xs font-bold mb-1.5">휴대전화번호</label>
                          <input
                            type="text"
                            value={inquiryPhone}
                            onChange={(e) => setInquiryPhone(e.target.value)}
                            placeholder="상담 연락처"
                            className="w-full bg-slate-850 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs outline-none text-white focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl text-xs transition mt-2 shadow-lg shadow-blue-500/10"
                      >
                        상담 및 제작견적 무료 신청하기 ➔
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </section>

          </div>
        )}

      </main>

      {/* Bottom Stats Tracking Bar */}
      <div className="bg-slate-950 flex flex-col sm:flex-row items-center justify-between px-8 py-3.5 text-white text-[10px] uppercase tracking-widest font-mono gap-2 text-center sm:text-left border-t border-slate-900">
        <div className="flex flex-wrap justify-center sm:justify-start gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
            전체 등록 고객: <span className="font-extrabold text-blue-400">{customers.length}명</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            계약 성사 건수: <span className="font-extrabold text-emerald-400">{customers.filter(c => ['계약완료', '계약'].includes(c.status)).length}건</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-450 rounded-full"></span>
            상담 진행 건수: <span className="font-extrabold text-amber-400">{customers.filter(c => !['계약완료', '계약', '보류'].includes(c.status)).length}건</span>
          </div>
        </div>
        <div className="text-slate-500 font-semibold">
          REAL CRM CLOUD V.2.4.0 — SERVER STATUS: OPTIMAL
        </div>
      </div>

      {/* Simple Footer Bar */}
      <footer className="bg-slate-900 text-slate-500 py-10 px-6 text-center text-xs font-medium">
        <div className="max-w-7xl mx-auto space-y-2">
          <p>© 2026 공인중개사 CRM 플랫폼 - 정규화된 중개사 생산성 솔루션</p>
          <p className="text-[10px] text-slate-600">본 홈페이지의 고객관리 DB 데이터는 로컬보안 저장소를통해 안전하게 기기 내에서만 암호화 및 영속 기재됩니다.</p>
        </div>
      </footer>

    </div>
  );
}

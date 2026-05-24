import { useState } from 'react';
import { Customer, CustomerNote, ManagerUser } from '../types';
import { Search, Phone, User, Calendar, Folder, Plus, Trash2, ChevronDown, ChevronUp, FileText, CheckCircle2, UserCheck, PlusCircle, Handshake } from 'lucide-react';
import { getManagers } from '../utils/auth';

interface CustomerListProps {
  customers: Customer[];
  groups: string[];
  statuses: string[];
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: string) => void;
  onAddNote: (id: string, content: string) => void;
  onAddFile: (id: string, fileName: string) => void;
  currentUser: ManagerUser;
  onUpdateCustomerShare: (id: string, isShared: boolean, sharedManagerIds: string[]) => void;
}

const CUSTOMER_TYPES = ['전체', '매수인', '임차인', '매도인', '임대인', '관리인', '대리인', '중개사', '기타'];

export default function CustomerList({
  customers,
  groups,
  statuses,
  onDelete,
  onUpdateStatus,
  onAddNote,
  onAddFile,
  currentUser,
  onUpdateCustomerShare
}: CustomerListProps) {
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('전체');
  const [selectedGroup, setSelectedGroup] = useState('전체');
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [sharingMenuOpenId, setSharingMenuOpenId] = useState<string | null>(null);

  // Expanded cards state
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [newNotes, setNewNotes] = useState<Record<string, string>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddNoteSubmit = (customerId: string) => {
    const text = newNotes[customerId];
    if (!text || !text.trim()) return;

    onAddNote(customerId, text.trim());
    setNewNotes(prev => ({ ...prev, [customerId]: '' }));
  };

  const handleQuickAddFile = (customerId: string, fileType: string) => {
    onAddFile(customerId, fileType);
  };

  // Filter customers logic
  const filteredCustomers = customers.filter(customer => {
    // 1. Text search
    const textMatch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.replace(/[^0-9]/g, '').includes(searchTerm.replace(/[^0-9]/g, '')) ||
      customer.memo.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Type filter
    const typeMatch = selectedType === '전체' || customer.type === selectedType;

    // 3. Group filter
    const groupMatch = selectedGroup === '전체' || customer.group === selectedGroup;

    // 4. Status filter
    const statusMatch = selectedStatus === '전체' || customer.status === selectedStatus;

    return textMatch && typeMatch && groupMatch && statusMatch;
  });

  // Calculate Status color badges
  const getStatusStyle = (status: string) => {
    switch(status) {
      case '계약완료':
      case '계약':
        return 'bg-emerald-100 text-emerald-800 border-emerald-250';
      case '보류':
        return 'bg-rose-100 text-rose-850 border-rose-200';
      case '상담중':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header and Quick Filter Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm outline-none focus:bg-white focus:border-slate-900 transition-all font-medium text-slate-800"
              placeholder="고객명, 전화번호 뒷자리, 또는 메모 키워드 검색"
            />
            <Search className="w-4.5 h-4.5 absolute left-3.5 top-3.5 text-slate-400" />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3.5 top-3 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                지우기
              </button>
            )}
          </div>

          {/* Group and Status dropdown filters */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <div className="w-full sm:w-auto">
              <label className="block text-[11px] font-bold text-slate-400 mb-1 ml-1 uppercase">고객 그룹 필터</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full sm:min-w-[140px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 focus:bg-white transition"
              >
                <option value="전체">그룹 전체</option>
                {groups.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-[11px] font-bold text-slate-400 mb-1 ml-1 uppercase">계약 진행상태 필터</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:min-w-[140px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 focus:bg-white transition"
              >
                <option value="전체">상태 전체</option>
                {statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Horizontal Role Filter Tabs */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <label className="block text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase">의뢰 유형 필터</label>
          <div className="flex flex-wrap gap-2">
            {CUSTOMER_TYPES.map((typeOption) => (
              <button
                key={typeOption}
                onClick={() => setSelectedType(typeOption)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedType === typeOption
                    ? 'bg-[#0F172A] text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {typeOption === '전체' ? '🌐 전체 보기' : typeOption}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Customer Cards List Node */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white border text-center py-16 px-6 rounded-3xl text-slate-500">
            <div className="text-4xl mb-3">🔍</div>
            <h4 className="text-lg font-bold">일치하는 등록 고객이 없습니다</h4>
            <p className="text-sm text-slate-400 mt-1">상세 검색단어나 필터 조합을 재조정해보십시오.</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const isExpanded = expandedIds[customer.id] || false;
            return (
              <div
                key={customer.id}
                className="bg-white border border-slate-200 rounded-3xl shadow-xs hover:shadow-md transition-all divide-y divide-slate-100 overflow-hidden"
              >
                {/* Visible Info Card Header */}
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Role Icon Shield */}
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl border border-slate-200">
                      {customer.type === '매수인' ? '👤' : 
                       customer.type === '임차인' ? '🏠' : 
                       customer.type === '매도인' ? '🏢' : 
                       customer.type === '임대인' ? '🔑' : 
                       customer.type === '관리인' ? '🛠️' : 
                       customer.type === '대리인' ? '📄' : 
                       customer.type === '중개사' ? '🤝' : '➕'}
                    </div>

                    <div>
                      {/* Name, Division, Group Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-extrabold text-slate-900">{customer.name}</span>
                        <span className="bg-slate-100 border text-[10px] font-bold px-2 py-0.5 rounded text-slate-600">
                          {customer.division} · {customer.gender}
                        </span>
                        <span className="bg-blue-50 text-blue-800 border-blue-100 border text-[10px] font-bold px-2 py-0.5 rounded">
                          {customer.group}
                        </span>
                        
                        {/* Simultaneous sharing switch (Admin Toggleable with dropdown, Manager Read-only Status Card) */}
                        {currentUser.role === 'admin' ? (
                          <div className="relative inline-block">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSharingMenuOpenId(sharingMenuOpenId === customer.id ? null : customer.id);
                              }}
                              className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg border transition-all duration-150 cursor-pointer active:scale-95 ${
                                customer.isShared || (customer.sharedManagerIds && customer.sharedManagerIds.length > 0)
                                  ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
                                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                              }`}
                              title="대표 전용: 특정 중개사 지정 실시간 데이터 공유 설정"
                            >
                              <Handshake className={`w-3.5 h-3.5 ${(customer.isShared || (customer.sharedManagerIds && customer.sharedManagerIds.length > 0)) ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`} />
                              <span>
                                {customer.isShared 
                                  ? '모두동시공유' 
                                  : (customer.sharedManagerIds && customer.sharedManagerIds.length > 0)
                                    ? `${getManagers().filter(m => customer.sharedManagerIds?.includes(m.id)).map(m => m.name.split(' ')[0]).join(', ')} 공유`
                                    : '동시공유 지정'
                                }
                              </span>
                              <ChevronDown className="w-3 h-3 text-slate-400" />
                            </button>
                            
                            {sharingMenuOpenId === customer.id && (
                              <div 
                                className="absolute left-0 mt-2 w-56 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-50 p-3.5 space-y-3 text-left animate-fade-in text-xs"
                                onClick={(e) => e.stopPropagation()} // Prevent card collapse on click
                              >
                                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                  <span className="text-2xs font-extrabold text-slate-900">🔗 공유 대상 지정</span>
                                  <button 
                                    type="button" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSharingMenuOpenId(null);
                                    }}
                                    className="text-2xs text-slate-400 hover:text-slate-600 font-bold p-1 rounded-md hover:bg-slate-50 cursor-pointer"
                                  >
                                    닫기
                                  </button>
                                </div>

                                {/* Global / Full Share option */}
                                <label className="flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                                  <input
                                    type="checkbox"
                                    checked={!!customer.isShared}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      onUpdateCustomerShare(customer.id, !customer.isShared, customer.sharedManagerIds || []);
                                    }}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                                  />
                                  <div className="leading-tight">
                                    <span className="text-2xs font-extrabold text-slate-800 block">모든 중개사와 공유 (전체)</span>
                                    <span className="text-[9px] text-slate-400 block mt-0.5">승인된 소속 전원 공유</span>
                                  </div>
                                </label>

                                <div className="pt-2 border-t border-slate-100/60">
                                  <div className="flex items-center justify-between px-1 mb-1.5">
                                    <span className="text-[10px] font-extrabold text-slate-400">🤝 특정 중개사 지정 선택</span>
                                    {getManagers().filter(m => m.role !== 'admin' && m.isApproved).length > 0 && !customer.isShared && (
                                      <div className="flex gap-1.5 text-[9px] font-bold">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const allIds = getManagers()
                                              .filter(m => m.role !== 'admin' && m.isApproved)
                                              .map(m => m.id);
                                            onUpdateCustomerShare(customer.id, !!customer.isShared, allIds);
                                          }}
                                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-blue-50/80 px-1 py-0.5 rounded transition"
                                        >
                                          전체 선택
                                        </button>
                                        <span className="text-slate-300">|</span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateCustomerShare(customer.id, !!customer.isShared, []);
                                          }}
                                          className="text-slate-500 hover:text-slate-700 hover:underline cursor-pointer bg-slate-100 px-1 py-0.5 rounded transition"
                                        >
                                          전체 해제
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  {getManagers().filter(m => m.role !== 'admin' && m.isApproved).length === 0 ? (
                                    <span className="text-[10px] text-slate-400 italic block px-1">승인된 중개사가 없습니다.</span>
                                  ) : (
                                    <div className="max-h-28 overflow-y-auto space-y-1 pr-0.5">
                                      {getManagers().filter(m => m.role !== 'admin' && m.isApproved).map((mgr) => {
                                        const isSelected = !!customer.sharedManagerIds?.includes(mgr.id);
                                        return (
                                          <label key={mgr.id} className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              disabled={!!customer.isShared} // disabled if universally shared
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                const currentList = customer.sharedManagerIds || [];
                                                const newList = isSelected
                                                  ? currentList.filter(id => id !== mgr.id)
                                                  : [...currentList, mgr.id];
                                                onUpdateCustomerShare(customer.id, !!customer.isShared, newList);
                                              }}
                                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer disabled:opacity-50"
                                            />
                                            <span className={`text-2xs font-bold ${customer.isShared ? 'text-slate-450' : 'text-slate-700'}`}>
                                              👤 {mgr.name}
                                            </span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            {customer.isShared ? (
                              <span className="bg-blue-50 text-blue-800 border-blue-100 border text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                                <Handshake className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                                전체 동시공유중
                              </span>
                            ) : customer.sharedManagerIds?.includes(currentUser.id) ? (
                              <span className="bg-emerald-50 text-emerald-850 border-emerald-100 border text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                                <Handshake className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                                대표 지정 동시공유중
                              </span>
                            ) : null}
                          </>
                        )}
                      </div>

                      {/* Phone & Date Info Row */}
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-800 bg-slate-50 px-2 py-1 rounded-lg">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> 등록: {new Date(customer.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                          🎯 {customer.managerName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    {/* Custom Status Dropdown Select inside list */}
                    <select
                      value={customer.status}
                      onChange={(e) => onUpdateStatus(customer.id, e.target.value)}
                      className={`text-xs font-bold px-3.5 py-2.5 rounded-xl border select-none transition ${getStatusStyle(customer.status)}`}
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(customer.id)}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl flex items-center gap-1 text-xs font-bold text-slate-700 transition"
                        title="상세정보 및 일지 확인"
                      >
                        {isExpanded ? (
                          <>상세접기 <ChevronUp className="w-4 h-4" /></>
                        ) : (
                          <>상세확인 <ChevronDown className="w-4 h-4" /></>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('이 고객을 삭제하시겠습니까? 관련 데이터가 모두 지워집니다.')) {
                            onDelete(customer.id);
                          }
                        }}
                        className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                        title="고객 삭제"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Section Panel */}
                {isExpanded && (
                  <div className="p-6 bg-slate-50/75 space-y-6">
                    {/* Role Specific Dynamic Properties Panel */}
                    {(customer.budget || customer.preferredArea || customer.propertyDetails) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border rounded-2xl p-4 shadow-2xs">
                        {customer.budget && (
                          <div>
                            <span className="text-slate-400 text-[10px] font-bold block uppercase">의뢰 투자 예산</span>
                            <span className="text-sm font-extrabold text-slate-800">{customer.budget}</span>
                          </div>
                        )}
                        {customer.preferredArea && (
                          <div>
                            <span className="text-slate-400 text-[10px] font-bold block uppercase">희망 선호 지역</span>
                            <span className="text-sm font-bold text-slate-800">{customer.preferredArea}</span>
                          </div>
                        )}
                        {customer.propertyDetails && (
                          <div className="col-span-1 md:col-span-2">
                            <span className="text-slate-400 text-[10px] font-bold block uppercase">매도/임대 정보 또는 매물 목적지</span>
                            <span className="text-sm font-semibold text-slate-800 block mt-0.5">{customer.propertyDetails}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Basic Initial Memo view */}
                    <div className="bg-white border rounded-2xl p-5 shadow-2xs">
                      <h5 className="font-bold text-slate-800 mb-2 text-xs flex items-center gap-1">
                        📢 접수의뢰 특약 및 기본 요구조항
                      </h5>
                      <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                        {customer.memo}
                      </p>
                    </div>

                    {/* Historical Nested Log Timelines */}
                    <div className="space-y-4">
                      <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        📋 추가 개별 상담 및 임장 보고 타임라인 ({customer.notes.length})
                      </h5>

                      <div className="space-y-3">
                        {customer.notes.length === 0 ? (
                          <div className="bg-white rounded-2xl p-4 text-center border text-slate-400 text-xs">
                            작성된 추가 상담 이력이 없습니다. 아래 일지 쓰기에서 기록해보십시오.
                          </div>
                        ) : (
                          customer.notes.map((note) => (
                            <div key={note.id} className="bg-white rounded-2xl p-4 border shadow-3xs flex items-start gap-3">
                              <div className="w-2 h-2 mt-2 rounded-full bg-[#0F172A] shrink-0"></div>
                              <div className="flex-1">
                                <p className="text-slate-700 text-sm leading-relaxed">{note.content}</p>
                                <span className="text-[10px] text-slate-400 font-medium block mt-1.5">
                                  ✍ {new Date(note.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Note Composer Input Box */}
                      <div className="flex gap-2">
                        <textarea
                          value={newNotes[customer.id] || ''}
                          onChange={(e) => setNewNotes({ ...newNotes, [customer.id]: e.target.value })}
                          className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-slate-800 resize-none h-16 text-slate-800 leading-relaxed"
                          placeholder="새 상담 내역을 파악하거나 미팅, 신규 임장 보고를 자유롭게 등록하십시오."
                        />
                        <button
                          onClick={() => handleAddNoteSubmit(customer.id)}
                          className="bg-[#0F172A] text-white hover:bg-slate-900 transition px-4 rounded-xl text-xs font-bold leading-tight flex items-center justify-center shrink-0 self-stretch"
                        >
                          일지 추가
                        </button>
                      </div>
                    </div>

                    {/* Files Storage inside Card */}
                    <div className="pt-3 border-t border-slate-200">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                          <h6 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            📂 업로드된 첨부 서류 ({customer.files.length} / 5)
                          </h6>
                        </div>

                        {/* Drop-to-add simulated preset documents directly inside user card list */}
                        {customer.files.length < 5 && (
                          <div className="flex flex-wrap gap-1.5">
                            {['계약서', '등기부등본', '신분증 사본', '상담 자료'].map((fType) => (
                              <button
                                key={fType}
                                onClick={() => handleQuickAddFile(customer.id, fType)}
                                className="bg-white hover:bg-slate-100 border text-[10px] font-semibold px-2 py-1 rounded text-slate-600 transition"
                              >
                                ➕ {fType}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Display of attached files */}
                      {customer.files.length === 0 ? (
                        <p className="text-[11px] text-slate-450 mt-2 block">보관중인 부동산 관련 공무 서류 또는 사진이 없습니다.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {customer.files.map((file, fIdx) => (
                            <div key={fIdx} className="bg-white border text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-slate-800">
                              <span className="text-blue-500">📄</span>
                              <span>{file}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

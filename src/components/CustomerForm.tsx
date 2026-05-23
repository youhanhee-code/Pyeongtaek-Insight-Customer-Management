import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Customer } from '../types';
import { Sparkles, Phone, User, Landmark, HelpCircle, FilePlus, X, HelpCircle as HelpIcon, AlertCircle } from 'lucide-react';

interface CustomerFormProps {
  onSave: (customer: Customer) => void;
  existingCustomers: Customer[];
  groups: string[];
  statuses: string[];
}

const CUSTOMER_TYPES = [
  { icon: '👤', id: '매수인', title: '매수인', desc: '부동산 매수 희망 고객' },
  { icon: '🏠', id: '임차인', title: '임차인', desc: '임대 및 전세 고객' },
  { icon: '🏢', id: '매도인', title: '매도인', desc: '매물 판매 고객' },
  { icon: '🔑', id: '임대인', title: '임대인', desc: '임대 매물 등록 고객' },
  { icon: '🛠️', id: '관리인', title: '관리인', desc: '건물 및 매물 관리 담당' },
  { icon: '📄', id: '대리인', title: '대리인', desc: '위임 대리 고객' },
  { icon: '🤝', id: '중개사', title: '중개사', desc: '협력 중개사' },
  { icon: '➕', id: '기타', title: '기타', desc: '기타 고객 유형' },
];

const PRESET_DOCUMENTS = ['계약서', '등기부등본', '신분증 사본', '상담 자료', '기타 문서'];

export default function CustomerForm({ onSave, existingCustomers, groups, statuses }: CustomerFormProps) {
  // Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'남자' | '여자'>('남자');
  const [division, setDivision] = useState<'개인' | '법인'>('개인');
  const [type, setType] = useState('매수인');
  const [phone, setPhone] = useState('');
  const [group, setGroup] = useState(groups[0] || '신규 고객');
  const [status, setStatus] = useState(statuses[0] || '상담중');
  const [memo, setMemo] = useState('');
  const [managerName, setManagerName] = useState('유한희 중개사');

  // Dynamic role fields
  const [budget, setBudget] = useState('');
  const [preferredArea, setPreferredArea] = useState('');
  const [propertyDetails, setPropertyDetails] = useState('');

  // Auto save status & duplicates checker
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Phone input formatting (010-XXXX-XXXX or similar)
  const formatPhoneNumber = (value: string) => {
    const rawVal = value.replace(/[^0-9]/g, '');
    if (rawVal.length <= 3) return rawVal;
    if (rawVal.length <= 7) return `${rawVal.slice(0, 3)}-${rawVal.slice(3)}`;
    return `${rawVal.slice(0, 3)}-${rawVal.slice(3, 7)}-${rawVal.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  // Check duplicate telephone numbers in real-time
  useEffect(() => {
    if (!phone) {
      setIsDuplicate(false);
      return;
    }
    const matched = existingCustomers.find((c) => c.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, ''));
    if (matched) {
      setIsDuplicate(true);
      setDuplicateName(matched.name);
    } else {
      setIsDuplicate(false);
    }
  }, [phone, existingCustomers]);

  // Synchronize dynamic defaults when type switches
  useEffect(() => {
    // Clear dynamic fields to prevent cross-over
    setBudget('');
    setPreferredArea('');
    setPropertyDetails('');
  }, [type]);

  // File Upload Handlers (Simulation for preview ease, allowing custom input type uploads as well)
  const handleAddFilePreset = (fileName: string) => {
    if (uploadedFiles.length >= 5) {
      alert('파일은 최대 5개까지 업로드 가능합니다.');
      return;
    }
    const suffix = Math.floor(Math.random() * 1000);
    const mockFullName = `${fileName}_첨부_${suffix}.pdf`;
    setUploadedFiles([...uploadedFiles, mockFullName]);
  };

  const handleFileUploadInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (uploadedFiles.length >= 5) {
      alert('파일은 최대 5개까지 업로드 가능합니다.');
      return;
    }
    const files = e.target.files;
    if (files && files[0]) {
      setUploadedFiles([...uploadedFiles, files[0].name]);
    }
  };

  const deleteFile = (index: number) => {
    setUploadedFiles([
      ...uploadedFiles.slice(0, index),
      ...uploadedFiles.slice(index + 1)
    ]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('고객명을 입력해주세요.');
      return;
    }
    if (!phone.trim()) {
      alert('휴대전화번호를 입력해주세요.');
      return;
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name,
      phone,
      gender,
      division,
      type,
      group,
      status,
      memo: memo.trim() || '상담 이력이 등록되지 않았습니다.',
      notes: [],
      files: uploadedFiles,
      createdAt: new Date().toISOString(),
      managerName,
      budget: ['매수인', '임차인'].includes(type) ? budget : undefined,
      preferredArea: ['매수인', '임차인'].includes(type) ? preferredArea : undefined,
      propertyDetails: ['매도인', '임대인', '관리인'].includes(type) ? propertyDetails : undefined,
    };

    onSave(newCustomer);

    // Reset Form
    setName('');
    setPhone('');
    setMemo('');
    setBudget('');
    setPreferredArea('');
    setPropertyDetails('');
    setUploadedFiles([]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="bg-[#0F172A] text-white px-3 py-1 rounded-full text-xs font-semibold mr-2 inline-block">
            REAL ESTATE DB
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">고객 신규 등록</h3>
        </div>
        <div className="hidden sm:block text-slate-500 font-medium text-sm">
          📍 자동저장 지원 가능
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Customer Type Selector */}
        <div>
          <label className="block text-slate-700 font-semibold mb-3">
            구분 구분선택 <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CUSTOMER_TYPES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  type === item.id
                    ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-md scale-102'
                    : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-xs text-slate-800'
                }`}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-sm font-bold block">{item.title}</span>
                <span className={`text-[10px] mt-1 text-center leading-tight block ${type === item.id ? 'text-slate-300' : 'text-slate-500'}`}>
                  {item.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Primary Customer Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name & Division / Gender */}
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                👤 고객명 & 성별 <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white transition-all rounded-xl px-4 py-3 text-slate-800 outline-none"
                  placeholder="의뢰인 또는 기업명"
                  required
                />
                <button
                  type="button"
                  onClick={() => setGender(gender === '남자' ? '여자' : '남자')}
                  className="bg-slate-100 hover:bg-slate-200 font-medium px-4 py-3 rounded-xl border border-slate-200 text-slate-700 transition"
                >
                  {gender}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">🏢 의뢰 구분</label>
                <div className="flex bg-slate-150 p-1 rounded-xl bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDivision('개인')}
                    className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition ${
                      division === '개인' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    개인
                  </button>
                  <button
                    type="button"
                    onClick={() => setDivision('법인')}
                    className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition ${
                      division === '법인' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    법인
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-2">👨‍💼 담당 중개인</label>
                <select
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl px-3 py-2 text-sm text-slate-800 outline-none"
                >
                  <option value="유한희 중개사">유한희 중개사</option>
                  <option value="유진옥 중개사">유진옥 중개사</option>
                  <option value="김서하 중개사">김서하 중개사</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact and Warning */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-slate-700 font-semibold">
                  📱 연락처 (전화번호) <span className="text-rose-500">*</span>
                </label>
                {isDuplicate && (
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5" /> 이미 등록됨 ({duplicateName})
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={handlePhoneChange}
                  className={`w-full bg-slate-50 border focus:bg-white rounded-xl px-4 py-3 pl-10 text-slate-800 outline-none transition-all ${
                    isDuplicate ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-slate-900'
                  }`}
                  placeholder="010-0000-0000"
                  required
                />
                <Phone className="w-4.5 h-4.5 absolute left-3.5 top-4 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">🗂 분류 그룹</label>
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none"
                >
                  {groups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-2"> 진행 상태</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Conditional Fields Based on Selected Role */}
        {['매수인', '임차인'].includes(type) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
            <div>
              <label className="block text-blue-900 font-semibold mb-2 text-sm">💰 투자 예산 범위</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="예: 전세 5억, 또는 20억 - 30억"
                className="w-full bg-white border border-blue-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-blue-900 font-semibold mb-2 text-sm">📍 희망 선호지역</label>
              <input
                type="text"
                value={preferredArea}
                onChange={(e) => setPreferredArea(e.target.value)}
                placeholder="예: 서포 소형 전세, 강남 역세권"
                className="w-full bg-white border border-blue-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none"
              />
            </div>
          </div>
        )}

        {['매도인', '임대인', '관리인'].includes(type) && (
          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
            <label className="block text-amber-900 font-semibold mb-2 text-sm">🏢 의뢰 매물 소재지 및 대장 요약</label>
            <input
              type="text"
              value={propertyDetails}
              onChange={(e) => setPropertyDetails(e.target.value)}
              placeholder="예: 서초구 양재동 상가건물 3층, 대지 100평"
              className="w-full bg-white border border-amber-200 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none"
            />
          </div>
        )}

        {/* 4. Consultation Note Memoranda */}
        <div>
          <label className="block text-slate-700 font-semibold mb-2">📝 의뢰 및 초기 상담 세부내용</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white transition-all rounded-xl p-4 h-24 text-sm text-slate-800 outline-none resize-none"
            placeholder="상담 과정에서 파악된 예산, 일정 등 보충사항을 기재해주십시오."
          />
        </div>

        {/* 5. Document attachments with maximum limits */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-slate-700 font-semibold">
              📁 서류 파일 첨부 ({uploadedFiles.length} / 5)
            </label>
            <span className="text-xs text-slate-400">최대 5개까지 보관 지원</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            {PRESET_DOCUMENTS.map((docType) => (
              <button
                key={docType}
                type="button"
                onClick={() => handleAddFilePreset(docType)}
                className="bg-slate-50 border border-slate-200 hover:border-slate-400 hover:bg-slate-100/70 p-3 rounded-xl text-center text-xs font-semibold text-slate-700 transition"
              >
                📁 {docType} 추가
              </button>
            ))}
          </div>

          {/* Real file input simulation */}
          <div className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50/80 transition relative">
            <input
              type="file"
              onChange={handleFileUploadInput}
              className="absolute inset-0 opacity-0 cursor-pointer"
              title="Drag and drop or select files"
            />
            <div className="text-center">
              <span className="text-slate-600 block text-xs font-medium">컴퓨터에 보관된 사용자 정의 파일 추가</span>
              <span className="text-[10px] text-slate-400 mt-1 block">모든 형식의 문서/이미지 파일 등 등록 가능</span>
            </div>
          </div>

          {/* List of files with delete actions */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              {uploadedFiles.map((f, index) => (
                <div
                  key={index}
                  className="bg-white border text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-800"
                >
                  <span className="text-blue-500">📄</span>
                  <span className="truncate max-w-[150px]">{f}</span>
                  <button
                    type="button"
                    onClick={() => deleteFile(index)}
                    className="hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isDuplicate}
          className={`w-full text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-md ${
            isDuplicate
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-[#0F172A] hover:bg-slate-900'
          }`}
        >
          {saveSuccess ? (
            <span className="flex items-center gap-2 text-emerald-400">
              ✔ 성공적으로 저장되었습니다!
            </span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              신규 고객으로 데이터베이스 저장
            </>
          )}
        </button>
      </form>
    </div>
  );
}

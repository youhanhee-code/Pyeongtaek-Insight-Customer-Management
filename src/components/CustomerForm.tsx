import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Customer, ManagerUser } from '../types';
import { Sparkles, Phone, User, Landmark, HelpCircle, FilePlus, X, HelpCircle as HelpIcon, AlertCircle, FileSpreadsheet, Download, Upload, CheckCircle } from 'lucide-react';
import { getManagers } from '../utils/auth';
import * as XLSX from 'xlsx';

interface CustomerFormProps {
  onSave: (customer: Customer | Customer[]) => void;
  existingCustomers: Customer[];
  groups: string[];
  statuses: string[];
  currentUser?: ManagerUser | null;
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

export default function CustomerForm({ onSave, existingCustomers, groups, statuses, currentUser }: CustomerFormProps) {
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

  // New Registration Mode Selector and Excel parameters
  const [registrationMode, setRegistrationMode] = useState<'manual' | 'excel'>('manual');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [importedCustomers, setImportedCustomers] = useState<Customer[]>([]);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [excelSuccessMsg, setExcelSuccessMsg] = useState<string | null>(null);

  // Dynamic available managers list
  const [availableManagers, setAvailableManagers] = useState<string[]>([]);

  useEffect(() => {
    const mgrs = getManagers().filter(m => m.isApproved && m.role !== 'admin').map(m => m.name);
    const unique = Array.from(new Set([...mgrs, '유한희 중개사', '유진옥 중개사', '김서하 중개사']));
    setAvailableManagers(unique);
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role !== 'admin') {
        setManagerName(currentUser.name);
      } else {
        setManagerName('유한희 중개사');
      }
    }
  }, [currentUser]);

  // Phone input formatting (010-XXXX-XXXX or similar)
  const formatPhoneNumber = (value: string) => {
    const rawVal = value.replace(/[^0-9]/g, '');
    if (rawVal.length <= 3) return rawVal;
    if (rawVal.length <= 7) return `${rawVal.slice(0, 3)}-${rawVal.slice(3)}`;
    return `${rawVal.slice(0, 3)}-${rawVal.slice(3, 7)}-${rawVal.slice(7, 11)}`;
  };

  const checkIsDuplicate = (num: string) => {
    return existingCustomers.some(
      (c) => c.phone.replace(/[^0-9]/g, '') === num.replace(/[^0-9]/g, '')
    );
  };

  const handleDownloadTemplate = () => {
    const headers = [
      '이름(필수)',
      '연락처(필수)',
      '의뢰지위(개인/법인)',
      '의뢰유형(매수인/임차인/매도인/임대인/관리인/대리인/중개사/기타)',
      '성별(남자/여자)',
      '투자예산',
      '희망지역',
      '매물정보',
      '분류그룹',
      '상태',
      '담당자',
      '상담메모'
    ];
    const sampleRow1 = [
      '김철수',
      '010-1234-5678',
      '개인',
      '매수인',
      '남자',
      '3억 ~ 5억',
      '강남구 역삼동',
      '',
      groups[0] || '신규 고객',
      statuses[0] || '상담중',
      currentUser?.name || '유한희 중개사',
      '마당 있는 전원주택 선호'
    ];
    const sampleRow2 = [
      '유진종합상사',
      '010-9876-5432',
      '법인',
      '매도인',
      '여자',
      '',
      '',
      '마포구 서교동 빌딩',
      groups[0] || '신규 고객',
      statuses[0] || '상담중',
      currentUser?.name || '유한희 중개사',
      '빠른 매도 기한 필요'
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow1, sampleRow2]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '고객등록 양식');
    XLSX.writeFile(wb, '공인중개사_CRM_고객일괄등록_양식.xlsx');
  };

  const handleExcelUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    setExcelError(null);
    setExcelSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        if (rawData.length === 0) {
          setExcelError('엑셀 파일에 데이터가 없습니다.');
          return;
        }

        // Search first 15 rows to find the best header row index
        let headerRowIndex = 0;
        let maxMatches = -1;
        for (let i = 0; i < Math.min(rawData.length, 15); i++) {
          const row = rawData[i];
          if (!Array.isArray(row)) continue;
          let matches = 0;
          row.forEach(cell => {
            if (!cell) return;
            const str = cell.toString().toLowerCase().trim();
            if (str.includes('이름') || str.includes('고객명') || str.includes('성명') || str.includes('성함') || str.toLowerCase() === 'name') matches += 2;
            if (str.includes('연락처') || str.includes('전화') || str.includes('휴대폰') || str.includes('폰번호') || str.includes('핸드폰') || str.toLowerCase() === 'phone' || str.toLowerCase() === 'tel') matches += 2;
            if (str.includes('구분') || str.includes('의뢰') || str.includes('유형') || str.includes('성별') || str.includes('메모') || str.includes('상태') || str.includes('담당')) matches += 1;
          });
          if (matches > maxMatches && matches > 0) {
            maxMatches = matches;
            headerRowIndex = i;
          }
        }

        const headers = (rawData[headerRowIndex] || []) as any[];
        const rows = rawData.slice(headerRowIndex + 1);

        const getColumnIndex = (names: string[]): number => {
          return headers.findIndex(h => 
            h !== undefined && h !== null && names.some(n => h.toString().toLowerCase().trim().includes(n))
          );
        };

        let nameIdx = getColumnIndex(['이름', '고객명', '성명', '성함', '고객', 'name']);
        let phoneIdx = getColumnIndex(['연락처', '전화번호', '휴대폰', '폰번호', '전화', '핸드폰', 'phone', 'tel']);
        
        // Fallback option in case headers couldn't be detected by text:
        if (nameIdx === -1 || phoneIdx === -1) {
          if (headers.length >= 2) {
            // Find a row with numeric field to assume it is the phone column
            const firstWithData = rows.find(r => Array.isArray(r) && r.some(c => c && c.toString().trim().length > 0));
            if (firstWithData) {
              const detectedPhoneIdx = firstWithData.findIndex(cell => cell && /[0-9\-\(\)\s]{8,15}/.test(cell.toString()));
              if (detectedPhoneIdx !== -1) {
                phoneIdx = detectedPhoneIdx;
                nameIdx = detectedPhoneIdx === 0 ? 1 : 0;
              }
            }
          }
        }

        const divisionIdx = getColumnIndex(['의뢰지위', '의뢰구분', '구분', '개인/법인', '지위', 'division']);
        const typeIdx = getColumnIndex(['의뢰유형', '유형', '타입', '매수', '매도', '임차', '임대', 'type']);
        const genderIdx = getColumnIndex(['성별', 'gender']);
        const budgetIdx = getColumnIndex(['예산', '투자예산', '금액', 'budget']);
        const areaIdx = getColumnIndex(['희망지역', '선호지역', '지역', 'area']);
        const propertyIdx = getColumnIndex(['매물정보', '소재지', '매물', 'property']);
        const groupIdx = getColumnIndex(['분류그룹', '그룹', '분류', 'group']);
        const statusIdx = getColumnIndex(['상태', '진행상태', 'status']);
        const managerIdx = getColumnIndex(['담당자', '담당중개인', '중개사', 'manager']);
        const memoIdx = getColumnIndex(['상담메모', '상담내용', '메모', '상세내용', 'memo']);

        if (nameIdx === -1 || phoneIdx === -1) {
          setExcelError("필수 열(예: '이름(필수)' 및 '연락처(필수)')을 찾을 수 없습니다. 올바른 전용 양식을 활용해 주십시오.");
          return;
        }

        const customersToRegister: Customer[] = [];
        rows.forEach((row, index) => {
          if (!Array.isArray(row)) return;
          const rawName = row[nameIdx]?.toString().trim() || '';
          let rawPhone = row[phoneIdx]?.toString().trim() || '';

          if (!rawName || !rawPhone) return;

          // Excel formatted numbers starting with 0 sometimes drop the 0, e.g. 1012345678 instead of 01012345678
          const cleanDigits = rawPhone.replace(/[^0-9]/g, '');
          if (cleanDigits.length === 10 && cleanDigits.startsWith('10')) {
            rawPhone = '0' + cleanDigits;
          } else if (cleanDigits.length === 9 && cleanDigits.startsWith('1')) {
            rawPhone = '010' + cleanDigits;
          }

          const formattedPhone = formatPhoneNumber(rawPhone);

          const rawDivision = divisionIdx !== -1 && row[divisionIdx] ? row[divisionIdx].toString().trim() : '';
          const finalDivision: '개인' | '법인' = rawDivision.includes('법인') ? '법인' : '개인';

          const rawType = typeIdx !== -1 && row[typeIdx] ? row[typeIdx].toString().trim() : '';
          let finalType = '매수인';
          if (rawType.includes('임차')) finalType = '임차인';
          else if (rawType.includes('매도')) finalType = '매도인';
          else if (rawType.includes('임대')) finalType = '임대인';
          else if (rawType.includes('관리')) finalType = '관리인';
          else if (rawType.includes('대리')) finalType = '대리인';
          else if (rawType.includes('중개')) finalType = '중개사';
          else if (rawType.includes('기타')) finalType = '기타';

          const rawGender = genderIdx !== -1 && row[genderIdx] ? row[genderIdx].toString().trim() : '';
          const finalGender: '남자' | '여자' = rawGender.includes('여') ? '여자' : '남자';

          const finalBudget = budgetIdx !== -1 && row[budgetIdx] ? row[budgetIdx].toString().trim() : '';
          const finalArea = areaIdx !== -1 && row[areaIdx] ? row[areaIdx].toString().trim() : '';
          const finalProperty = propertyIdx !== -1 && row[propertyIdx] ? row[propertyIdx].toString().trim() : '';

          const rawGroup = groupIdx !== -1 && row[groupIdx] ? row[groupIdx].toString().trim() : '';
          const finalGroup = groups.includes(rawGroup) ? rawGroup : (groups[0] || '신규 고객');

          const rawStatus = statusIdx !== -1 && row[statusIdx] ? row[statusIdx].toString().trim() : '';
          const finalStatus = statuses.includes(rawStatus) ? rawStatus : (statuses[0] || '상담중');

          const rawManager = managerIdx !== -1 && row[managerIdx] ? row[managerIdx].toString().trim() : '';
          const finalManager = rawManager || (currentUser?.name || managerName);

          const rawMemo = memoIdx !== -1 && row[memoIdx] ? row[memoIdx].toString().trim() : '';
          const finalMemo = rawMemo || '엑셀 일괄 등록을 통해 생성되었습니다.';

          customersToRegister.push({
            id: `excel-cust-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
            name: rawName,
            phone: formattedPhone,
            gender: finalGender,
            division: finalDivision,
            type: finalType,
            group: finalGroup,
            status: finalStatus,
            memo: finalMemo,
            notes: [],
            files: [],
            createdAt: new Date().toISOString(),
            managerName: finalManager,
            budget: ['매수인', '임차인'].includes(finalType) ? finalBudget : undefined,
            preferredArea: ['매수인', '임차인'].includes(finalType) ? finalArea : undefined,
            propertyDetails: ['매도인', '임대인', '관리인'].includes(finalType) ? finalProperty : undefined,
          });
        });

        if (customersToRegister.length === 0) {
          setExcelError('유효한 고객 데이터 행을 찾을 수 없습니다.');
        } else {
          setImportedCustomers(customersToRegister);
        }
      } catch (err) {
        console.error(err);
        setExcelError('파일 가공 중 오류가 발생했습니다. 올바른 엑셀/CSV 파일인지 확인해주십시오.');
      }
    };

    reader.readAsArrayBuffer(file);
    
    // Reset file input value to allow triggering onChange with the same file multiple times
    e.target.value = '';
  };

  const handleSaveImported = () => {
    if (importedCustomers.length === 0) return;

    const customersWithFreshIds = importedCustomers.map((cust, idx) => ({
      ...cust,
      id: `cust-${Date.now()}-${idx}-${Math.floor(Math.random() * 100000)}`
    }));

    onSave(customersWithFreshIds);

    setExcelSuccessMsg(`총 ${customersWithFreshIds.length}명의 고객이 실시간 데이터베이스에 성공적으로 저장되었습니다!`);
    setImportedCustomers([]);
    setExcelFile(null);
    setTimeout(() => {
      setExcelSuccessMsg(null);
    }, 4000);
  };

  const handleBatchTypeChange = (newType: string) => {
    setImportedCustomers((prev) =>
      prev.map((cust) => ({
        ...cust,
        type: newType,
        budget: ['매수인', '임차인'].includes(newType) ? (cust.budget || '') : undefined,
        preferredArea: ['매수인', '임차인'].includes(newType) ? (cust.preferredArea || '') : undefined,
        propertyDetails: ['매도인', '임대인', '관리인'].includes(newType) ? (cust.propertyDetails || '') : undefined,
      }))
    );
  };

  const handleRowTypeChange = (idx: number, newType: string) => {
    setImportedCustomers((prev) =>
      prev.map((cust, index) => {
        if (index !== idx) return cust;
        return {
          ...cust,
          type: newType,
          budget: ['매수인', '임차인'].includes(newType) ? (cust.budget || '') : undefined,
          preferredArea: ['매수인', '임차인'].includes(newType) ? (cust.preferredArea || '') : undefined,
          propertyDetails: ['매도인', '임대인', '관리인'].includes(newType) ? (cust.propertyDetails || '') : undefined,
        };
      })
    );
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <span className="bg-[#0F172A] text-white px-3 py-1 rounded-full text-xs font-semibold mr-2 inline-block">
            REAL ESTATE DB
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">고객 신규 등록</h3>
        </div>
        
        {/* Toggle navigation for Manual vs Excel */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setRegistrationMode('manual');
              setExcelFile(null);
              setImportedCustomers([]);
              setExcelError(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              registrationMode === 'manual'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✍️ 개별 입력
          </button>
          <button
            type="button"
            onClick={() => setRegistrationMode('excel')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              registrationMode === 'excel'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> 엑셀/CSV 일괄 업로드
          </button>
        </div>
      </div>

      {registrationMode === 'excel' ? (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4">
            <h4 className="font-extrabold text-[#0F172A] text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              엑셀/CSV 고객 일괄등록 안내 및 양식 다운로드
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              사용자가 보유하고 계신 대량의 의뢰 고객 명단을 엑셀 파일(.xlsx, .xls) 또는 .csv 형태로 일괄 보관 처리합니다.
              아래의 <strong>양식 다운로드</strong> 버튼을 눌러 올바른 헤더 형식을 다운로드한 뒤, 내용만 기재하여 첨부 하시면 중복 체크 감지와 함께 일괄 가입이 개시됩니다.
            </p>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 bg-white text-[#0F172A] border border-slate-300 hover:border-slate-500 font-bold px-4 py-2.5 rounded-xl text-xs transition duration-150 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> 전용 엑셀 업로드 양식 받기
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50 hover:bg-slate-50/80 transition-all text-center relative flex flex-col items-center justify-center">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleExcelUpload}
              className="absolute inset-0 opacity-0 cursor-pointer text-[0px]"
            />
            <div className="p-4 bg-white rounded-full shadow-xs mb-3">
              <Upload className="w-6 h-6 text-slate-400" />
            </div>
            {excelFile ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">{excelFile.name}</p>
                <p className="text-2xs text-slate-400 font-mono">{(excelFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-slate-800">엑셀(.xlsx) 또는 CSV 파일을 끌어오거나 클릭해서 첨부하십시오.</p>
                <p className="text-2xs text-slate-400 mt-1">이름, 연락처가 필수로 지정된 단일 시트 파일</p>
              </div>
            )}
          </div>

          {excelError && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{excelError}</span>
            </div>
          )}

          {excelSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-pulse">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{excelSuccessMsg}</span>
            </div>
          )}

          {/* Parsed Rows Preview block */}
          {importedCustomers.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <span className="text-xs font-bold text-slate-500">
                  📋 업로드 분석 결과: 총 <strong className="text-slate-800 font-extrabold">{importedCustomers.length}명</strong>의 고객 감지됨
                </span>
                <span className="text-2xs text-[#0F172A] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md font-bold">
                  ⚠️ 번호 중복 가드 실시간 작동 중
                </span>
              </div>

              {/* Batch Action Widget */}
              <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    💡 의뢰유형 일괄 지정하기
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    선택 시 대기열에 있는 모든 업로드 고객의 의뢰유형이 한 번에 변경됩니다.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 md:justify-end">
                  {['매수인', '임차인', '매도인', '임대인', '관리인', '대리인', '중개사', '기타'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleBatchTypeChange(t)}
                      className="bg-white hover:bg-slate-900 hover:text-white text-slate-800 font-bold border border-slate-200 rounded-lg px-2.5 py-1 text-2xs transition active:scale-95 cursor-pointer"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto max-h-80 border border-slate-100 rounded-xl shadow-xs">
                <table className="w-full text-left text-xs bg-slate-50/50">
                  <thead className="bg-[#0F172A] text-white text-2xs uppercase tracking-wider font-semibold sticky top-0">
                    <tr>
                      <th className="px-4 py-3">이름/성별</th>
                      <th className="px-4 py-3">연락처</th>
                      <th className="px-4 py-3">의뢰유형(수정 가능)</th>
                      <th className="px-4 py-3">담당자</th>
                      <th className="px-4 py-3">진행검출</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importedCustomers.map((cust, idx) => {
                      const isRowDup = checkIsDuplicate(cust.phone);
                      return (
                        <tr key={idx} className="hover:bg-slate-100/50 bg-white transition">
                          <td className="px-4 py-2.5 font-bold text-slate-900">
                            {cust.name} <span className="text-slate-400 font-normal">({cust.gender})</span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-slate-600">{cust.phone}</td>
                          <td className="px-4 py-2.5">
                            <select
                              value={cust.type}
                              onChange={(e) => handleRowTypeChange(idx, e.target.value)}
                              className="bg-slate-50 border border-slate-250 rounded-lg px-2 py-1 text-2xs font-extrabold text-slate-800 focus:bg-white focus:border-[#0F172A] outline-none cursor-pointer"
                            >
                              {['매수인', '임차인', '매도인', '임대인', '관리인', '대리인', '중개사', '기타'].map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2.5 font-medium text-slate-600">{cust.managerName}</td>
                          <td className="px-4 py-2.5">
                            {isRowDup ? (
                              <span className="inline-flex items-center gap-0.5 font-extrabold text-2xs text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded animate-pulse">
                                <AlertCircle className="w-3 h-3 shrink-0" /> 중복 발견
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 font-bold text-2xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                <CheckCircle className="w-3 h-3 shrink-0" /> 등록 가능
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setExcelFile(null);
                    setImportedCustomers([]);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-xs transition border cursor-pointer"
                >
                  취소하기
                </button>
                <button
                  type="button"
                  onClick={handleSaveImported}
                  className="flex-1 bg-[#0F172A] hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  실시간 DB로 {importedCustomers.length}명 일괄 가입저장
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
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
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
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
                    className="bg-slate-100 hover:bg-slate-200 font-medium px-4 py-3 rounded-xl border border-slate-200 text-slate-700 transition cursor-pointer"
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
                      className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                        division === '개인' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      개인
                    </button>
                    <button
                      type="button"
                      onClick={() => setDivision('법인')}
                      className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
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
                    disabled={currentUser && currentUser.role !== 'admin'}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl px-3 py-2 text-sm text-slate-800 outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {currentUser && currentUser.role !== 'admin' ? (
                      <option value={currentUser.name}>{currentUser.name}</option>
                    ) : (
                      availableManagers.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))
                    )}
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
                  className="bg-slate-50 border border-slate-200 hover:border-slate-400 hover:bg-slate-100/70 p-3 rounded-xl text-center text-xs font-semibold text-slate-700 transition cursor-pointer"
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
                      className="hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
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
            className={`w-full text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-md cursor-pointer ${
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
      )}
    </div>
  );
}

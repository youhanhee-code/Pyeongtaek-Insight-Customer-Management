export interface CustomerNote {
  id: string;
  content: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  gender: '남자' | '여자';
  division: '개인' | '법인';
  type: string; // '매수인' | '임차인' | '매도인' | '임대인' | '관리인' | '대리인' | '중개사' | '기타'
  group: string;
  status: string;
  memo: string;
  notes: CustomerNote[];
  files: string[];
  createdAt: string;
  managerName: string;
  isShared?: boolean; // 대표 유한희 중개사와 타 중개사(김서하 등) 간 동시 데이터 공유 여부
  // Dynamic fields based on role
  budget?: string; // 예산 (매수인, 임차인용)
  preferredArea?: string; // 희망지역 (매수인, 임차인용)
  propertyDetails?: string; // 매물정보/주소 (매도인, 임대인, 관리인용)
}

export interface CRMStats {
  total: number;
  inProgress: number;
  contracted: number;
  onHold: number;
}

export interface ManagerUser {
  id: string;
  username: string;
  password?: string; // stored for login verification in localStorage
  name: string;
  phone: string;
  isApproved: boolean;
  role: 'admin' | 'manager';
  createdAt: string;
  sharesWithAdmin?: boolean; // 대표 유한희 중개사와 실시간 동시 데이터 공유 여부
}


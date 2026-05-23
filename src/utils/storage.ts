import { Customer } from '../types';

const CUSTOMERS_KEY = 'real_estate_crm_customers';
const GROUPS_KEY = 'real_estate_crm_groups';
const STATUSES_KEY = 'real_estate_crm_statuses';

export const INITIAL_GROUPS = ['VIP 고객', '신규 고객', '투자 고객', '임대 고객', '재계약 고객', '재방문 고객'];
export const INITIAL_STATUSES = ['상담중', '계약완료', '보류', '재상담 예정', '계약 실패'];

// Seed realistic dummy customer data if none exists
const DUMMY_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: '김태호',
    phone: '010-3456-7890',
    gender: '남자',
    division: '개인',
    type: '매수인',
    group: '투자 고객',
    status: '상담중',
    memo: '강남구 역삼동 부근 꼬마빌딩 매입 희망. 예산 50억~70억 선 양호한 수익률 요망.',
    notes: [
      { id: 'n1', content: '현장 방문 상담 완료. 테헤란로 이면 도로 중심 매물 2건 브리핑 진행.', createdAt: '2026-05-20T10:30:00Z' },
      { id: 'n2', content: '수익률 분석 및 세무 조건 추가 검토 요청 받음.', createdAt: '2026-05-22T14:15:00Z' }
    ],
    files: ['등기부등본.pdf', '상담 자료.pdf'],
    createdAt: '2026-05-19T09:00:00Z',
    managerName: '이강민 중개사',
    budget: '50억 ~ 70억',
    preferredArea: '서울 강남구 역삼동, 삼성동'
  },
  {
    id: 'cust-2',
    name: '최미경',
    phone: '010-8765-4321',
    gender: '여자',
    division: '개인',
    type: '임차인',
    group: 'VIP 고객',
    status: '상담중',
    memo: '서초동 아크로비스타 전세 또는 월세 희망. 보증금 높은 조건 원함.',
    notes: [
      { id: 'n3', content: '전화 문의 접수. 학군 좋은 중대형 평형 찾으심.', createdAt: '2026-05-21T11:00:00Z' }
    ],
    files: ['신분증 사본.png'],
    createdAt: '2026-05-21T10:45:00Z',
    managerName: '이지원 상무',
    budget: '전세 15억',
    preferredArea: '서울 서초구 서초동'
  },
  {
    id: 'cust-3',
    name: '㈜한성디벨롭',
    phone: '02-511-1234',
    gender: '남자',
    division: '법인',
    type: '매도인',
    group: '재계약 고객',
    status: '계약완료',
    memo: '송파구 방이동 상가건물 매도 의뢰. 대지 120평, 연면적 450평.',
    notes: [
      { id: 'n4', content: '전속 중개 계약서 날인 완료. 매물 전산 등록 진행.', createdAt: '2026-05-15T15:00:00Z' },
      { id: 'n5', content: '매수인 현장 실사 동행 및 계약 성사.', createdAt: '2026-05-23T04:20:00Z' }
    ],
    files: ['계약서_날인본.pdf', '건축물대장.pdf', '등기부등본.pdf'],
    createdAt: '2026-05-15T10:00:00Z',
    managerName: '김진우 소장',
    propertyDetails: '서울 송파구 방이동 98-3 상가빌딩'
  },
  {
    id: 'cust-4',
    name: '정우성',
    phone: '010-2233-4455',
    gender: '남자',
    division: '개인',
    type: '임대인',
    group: '임대 고객',
    status: '상담중',
    memo: '마포구 공덕동 신축 오피스텔 투룸 전세 임대 등록 의뢰 (전세 3억 8천).',
    notes: [],
    files: ['임대차신청목록.xlsx'],
    createdAt: '2026-05-22T16:30:00Z',
    managerName: '이강민 중개사',
    propertyDetails: '서울 마포구 공덕동 공덕팰리스 802호'
  }
];

export const getCustomers = (): Customer[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CUSTOMERS_KEY);
  if (!stored) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(DUMMY_CUSTOMERS));
    return DUMMY_CUSTOMERS;
  }
  return JSON.parse(stored);
};

export const saveCustomers = (customers: Customer[]): void => {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
};

export const getGroups = (): string[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(GROUPS_KEY);
  if (!stored) {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(INITIAL_GROUPS));
    return INITIAL_GROUPS;
  }
  return JSON.parse(stored);
};

export const saveGroups = (groups: string[]): void => {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
};

export const getStatuses = (): string[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STATUSES_KEY);
  if (!stored) {
    localStorage.setItem(STATUSES_KEY, JSON.stringify(INITIAL_STATUSES));
    return INITIAL_STATUSES;
  }
  return JSON.parse(stored);
};

export const saveStatuses = (statuses: string[]): void => {
  localStorage.setItem(STATUSES_KEY, JSON.stringify(statuses));
};

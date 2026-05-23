import { ManagerUser } from '../types';

const MANAGERS_KEY = 'real_estate_crm_managers';
const CURRENT_USER_KEY = 'real_estate_crm_current_user';

const DEFAULT_MANAGERS: ManagerUser[] = [
  {
    id: 'm-admin',
    username: 'admin',
    password: 'admin',
    name: '대표 관리자',
    phone: '010-0000-0000',
    isApproved: true,
    role: 'admin',
    createdAt: '2026-05-10T00:00:00Z'
  },
  {
    id: 'm-yoo',
    username: 'yoo',
    password: '123123',
    name: '유한희 중개사',
    phone: '010-1111-2222',
    isApproved: true,
    role: 'manager',
    createdAt: '2026-05-15T09:00:00Z'
  },
  {
    id: 'm-jin',
    username: 'jin',
    password: '123123',
    name: '유진옥 중개사',
    phone: '010-3333-4444',
    isApproved: true,
    role: 'manager',
    createdAt: '2026-05-16T12:00:00Z'
  },
  {
    id: 'm-kim',
    username: 'kim',
    password: '123123',
    name: '김서하 중개사',
    phone: '010-5555-6666',
    isApproved: true,
    role: 'manager',
    createdAt: '2026-05-17T15:00:00Z'
  }
];

export const getManagers = (): ManagerUser[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(MANAGERS_KEY);
  if (!stored) {
    localStorage.setItem(MANAGERS_KEY, JSON.stringify(DEFAULT_MANAGERS));
    return DEFAULT_MANAGERS;
  }
  return JSON.parse(stored);
};

export const saveManagers = (managers: ManagerUser[]): void => {
  localStorage.setItem(MANAGERS_KEY, JSON.stringify(managers));
};

export const registerManager = (
  username: string,
  password: string,
  name: string,
  phone: string
): { success: boolean; message: string; manager?: ManagerUser } => {
  const managers = getManagers();
  const exists = managers.some((m) => m.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    return { success: false, message: '이미 존재하는 ID입니다.' };
  }

  const newManager: ManagerUser = {
    id: `m-${Date.now()}`,
    username,
    password,
    name: name.endsWith('중개사') ? name : `${name} 중개사`,
    phone,
    isApproved: false, // Must be approved by admin!
    role: 'manager',
    createdAt: new Date().toISOString()
  };

  const updated = [...managers, newManager];
  saveManagers(updated);
  return { success: true, message: '가입 신청이 완료되었습니다! 관리자의 승인 완료 후 로그인할 수 있습니다.', manager: newManager };
};

export const updateApprovalStatus = (managerId: string, approved: boolean): ManagerUser[] => {
  const managers = getManagers();
  const updated = managers.map((m) => {
    if (m.id === managerId) {
      return { ...m, isApproved: approved };
    }
    return m;
  });
  saveManagers(updated);
  return updated;
};

export const deleteManager = (managerId: string): ManagerUser[] => {
  const managers = getManagers().filter((m) => m.id !== managerId);
  saveManagers(managers);
  return managers;
};

export const getCurrentUser = (): ManagerUser | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (!stored) return null;
  
  // Refresh current user status in case admin approved/unapproved them
  const parsed = JSON.parse(stored) as ManagerUser;
  if (parsed.username === 'admin') return parsed;
  
  const managers = getManagers();
  const matched = managers.find(m => m.id === parsed.id);
  if (matched) {
    // If status changed, save updated
    if (matched.isApproved !== parsed.isApproved || matched.name !== parsed.name) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(matched));
      return matched;
    }
    return matched;
  }
  return null;
};

export const loginUser = (username: string, password: string): { success: boolean; message: string; user?: ManagerUser } => {
  const managers = getManagers();
  const user = managers.find((m) => m.username.toLowerCase() === username.toLowerCase() && m.password === password);
  
  if (!user) {
    return { success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' };
  }
  
  if (!user.isApproved) {
    return { success: false, message: '아직 승인되지 않은 계정입니다. 관리자의 승인이 필요합니다.' };
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, message: '로그인 성공!', user };
};

export const logoutUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

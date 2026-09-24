export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}
export interface Category {
  id: string;
  name: string;
  description?: string | null;
}
export interface Group {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  categoryId?: string | null;
}

export interface GroupMember {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export interface Credential {
  id: string;
  title: string;
  username: string | null;
  url: string | null;
  notes: string | null;
  groupId: string | null;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialForm {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  groupId: string;
  categoryId: string;
}

export interface RevealedPassword {
  password: string;
}
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}
export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

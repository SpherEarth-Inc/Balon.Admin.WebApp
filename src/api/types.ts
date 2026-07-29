export type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
};

export type TipTapDoc = {
  type: "doc";
  content?: TipTapNode[];
};

export type NewsStatus = "draft" | "published";

export type Product = "website" | "soccer";

export type News = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  featured_image: string | null;
  content: TipTapDoc;
  author: number | null;
  author_email: string | null;
  category: number | null;
  category_name: string | null;
  status: NewsStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MediaItem = {
  id: number;
  file_name: string;
  object_name: string;
  url: string;
  mime_type: string;
  size: number;
  width: number | null;
  height: number | null;
  uploaded_by: number | null;
  uploaded_by_email: string | null;
  created_at: string;
};

export type CreateInviteResponse = {
  id: number;
  email: string;
  role: string;
  token: string;
  invite_link: string;
  expires_at: string;
};

export type AcceptInviteResponse = {
  message: string;
  email: string;
  role: string;
};

export type TokenPair = {
  access: string;
  refresh: string;
};

export type StaffAccess = {
  role: string | null;
  role_permissions?: string[];
  extra_permissions?: string[];
  effective_permissions?: string[];
  permissions?: string[];
};

export type UserProfile = {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string | null;
  phone_number: string;
  job_title: string;
  photo_url: string | null;
};

export type MeResponse = {
  id: number;
  email: string;
  is_super_admin: boolean;
  permissions: string[];
  access: StaffAccess | null;
  profile: UserProfile;
};

export type StaffMember = {
  id: number;
  email: string;
  is_super_admin: boolean;
  permissions?: string[];
  profile: UserProfile;
  access: StaffAccess | null;
};

export type RoleItem = {
  id: number;
  name: string;
  description: string;
  is_system?: boolean;
  permissions?: string[];
};

export type PermissionItem = {
  name: string;
  description: string;
};

export type StaffAccessUpdate = {
  role: string | null;
  extra_permissions: string[];
};

export type ProfileUpdatePayload = {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  date_of_birth?: string | null;
  phone_number?: string;
  job_title?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

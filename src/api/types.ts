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

export type Platform = {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type News = {
  id: number;
  platform: number;
  platformName: string;
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
  platform: number;
  platformName: string;
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
  platformId: number;
  platformName: string;
  role: string;
  token: string;
  invite_link: string;
  expires_at: string;
};

export type AcceptInviteResponse = {
  message: string;
  email: string;
  platformId: number;
  platformName: string;
  role: string;
};

export type TokenPair = {
  access: string;
  refresh: string;
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
  profile: UserProfile;
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

import { DefaultSession } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      displayName: string;
      role: string;
      createdAt?: Date | string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    displayName: string;
    role: string;
    createdAt?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    displayName: string;
    role: string;
    createdAt?: Date | string;
    accessToken?: string;
    provider?: string;
  }
}

export type UserRole = "USER" | "MODERATOR" | "VERIFICATION_OFFICER" | "SUPPORT_STAFF" | "SUPER_ADMIN";

export type ListingStatus = "DRAFT" | "PENDING_REVIEW" | "ACTIVE" | "EXPIRED" | "WITHDRAWN" | "RENTED" | "SUSPENDED" | "STALE";

export type VerificationType = "CONTACT_VERIFIED" | "AUTHORITY_VERIFIED" | "PROPERTY_VERIFIED" | "AVAILABILITY_VERIFIED";

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";

export type ReportType = "SCAM" | "FRAUDULENT_LISTING" | "INAPPROPRIATE_CONTENT" | "SPAM" | "IMPERSONATION" | "MISLEADING_INFO" | "OTHER";

export type ReportStatus = "PENDING" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED" | "ESCALATED";

export interface PropertyType {
  value: string;
  label: string;
}

export interface Amenity {
  value: string;
  label: string;
}

export interface KenyanCounty {
  name: string;
  towns: string[];
}

export interface SearchFilters {
  query?: string;
  county?: string;
  town?: string;
  estate?: string;
  propertyType?: string;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  amenities?: string[];
  verificationStatus?: VerificationStatus[];
  availability?: "available" | "soon" | "any";
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest" | "price_asc" | "price_desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

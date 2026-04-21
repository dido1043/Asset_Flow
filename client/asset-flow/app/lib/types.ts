export type Role = "ADMIN" | "LEADER" | "EMPLOYEE";
export type ProtocolType = "ASSET_ASSIGNMENT" | "ASSET_RETURN";

export type AuthSession = {
  token: string;
  expiresIn: number;
  userId: number;
  role: Role | string;
  issuedAt?: number;
};

export type UserDto = {
  id?: number | null;
  fullName: string;
  email: string;
  password?: string | null;
  role: Role;
  age: number | null;
  organizationId: number | null;
  assignmentIds?: number[] | null;
};

export type OrganizationDto = {
  id?: number | null;
  organizationName: string;
};

export type ProductDto = {
  id?: number | null;
  productType: string;
  productBrand: string;
  productModel: string;
  assetTag: string;
  organizationId: number | null;
};

export type AssignmentDto = {
  id?: number | null;
  employeeId: number | null;
  productId: number | null;
  dateAssigned: string | null;
  dateReturned: string | null;
};

export type ProtocolDto = {
  id?: number | null;
  protocolUri: string;
  employeeId: number | null;
  organizationId: number | null;
  content?: string | null;
  type?: ProtocolType | string | null;
};

export type AiResponseDto = {
  model?: string | null;
  remote_model?: string | null;
  remote_host?: string | null;
  created_at?: string | null;
  response?: string | null;
  thinking?: string | null;
  done?: boolean | null;
  done_reason?: string | null;
  total_duration?: number | null;
  prompt_eval_count?: number | null;
  eval_count?: number | null;
};

export type LoginResponse = AuthSession;

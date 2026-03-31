import type {
  AssignmentDto,
  OrganizationDto,
  ProductDto,
  ProtocolDto,
  UserDto,
} from "@/app/lib/types";

export type Feedback = {
  tone: "success" | "error";
  message: string;
};

export type KnownOrganization = OrganizationDto & {
  leaderId: number | null;
  leaderName: string | null;
  memberCount: number;
};

export type WorkspaceSnapshot = {
  currentUser: UserDto | null;
  users: UserDto[];
  organizations: KnownOrganization[];
  leaderOrganization: OrganizationDto | null;
  organizationInventory: ProductDto[];
  products: ProductDto[];
  assignments: AssignmentDto[];
  currentAssignments: AssignmentDto[];
  protocols: ProtocolDto[];
  errors: string[];
};

export type ProfileFormState = {
  fullName: string;
  email: string;
  password: string;
  role: UserDto["role"];
  age: string;
};

export type OrganizationCreateFormState = {
  leaderId: string;
  organizationName: string;
};

export type JoinOrganizationFormState = {
  userId: string;
  organizationId: string;
};

export type BecomeLeaderFormState = {
  userId: string;
  organizationId: string;
};

export type ProductFormState = {
  id: string;
  productType: string;
  productBrand: string;
  productModel: string;
  assetTag: string;
  organizationId: string;
};

export type AssignmentFormState = {
  id: string;
  employeeId: string;
  productId: string;
  dateAssigned: string;
  dateReturned: string;
};

export type ProtocolCreateFormState = {
  organizationId: string;
  userId: string;
};

export type SelectOption = {
  value: string;
  label: string;
};

export type WorkspaceSection = {
  href: string;
  path: string;
  label: string;
  helper: string;
};

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "@/app/components/shared/ui/Button";
import { Input } from "@/app/components/shared/ui/Input";
import { Label } from "@/app/components/shared/ui/Label";
import { Textarea } from "@/app/components/shared/ui/Textarea";
import { apiRequest, getApiBaseUrl, getErrorMessage } from "@/app/lib/api";
import {
  clearAuthSession,
  formatSessionExpiry,
  readAuthSession,
  saveAuthSession,
  subscribeToAuthChanges,
} from "@/app/lib/session";
import type {
  AiResponseDto,
  AssignmentDto,
  AuthSession,
  OrganizationDto,
  ProductDto,
  ProtocolDto,
  Role,
  UserDto,
} from "@/app/lib/types";

type Feedback = {
  tone: "success" | "error";
  message: string;
};

type SectionCardProps = {
  id: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

type StatCardProps = {
  label: string;
  value: string | number;
  hint: string;
};

type EmptyStateProps = {
  title: string;
  description: string;
};

type KnownOrganization = OrganizationDto & {
  leaderId: number | null;
  leaderName: string | null;
  memberCount: number;
};

type SelectOption = {
  value: string;
  label: string;
};

const roleOptions: Role[] = ["LEADER", "EMPLOYEE"];

const selectClassName =
  "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200";

const quickLinks = [
  { href: "#profile", label: "Profile" },
  { href: "#users", label: "Users" },
  { href: "#organizations", label: "Organizations" },
  { href: "#products", label: "Products" },
  { href: "#assignments", label: "Assignments" },
  { href: "#protocols", label: "Protocols" },
  { href: "#ai-tools", label: "AI" },
];

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRequiredNumber(value: string, label: string) {
  const parsed = parseOptionalNumber(value);
  if (parsed === null) {
    throw new Error(`${label} is required.`);
  }
  return parsed;
}

function requireText(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required.`);
  }
  return trimmed;
}

function toIsoDateTime(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function toLocalDateTime(value?: string | null) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const timezoneOffset = parsed.getTimezoneOffset() * 60_000;
  return new Date(parsed.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Open";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

function formatDuration(duration?: number | null) {
  if (duration === null || duration === undefined) {
    return "N/A";
  }

  if (duration >= 1_000_000) {
    return `${(duration / 1_000_000).toFixed(1)} ms`;
  }

  return `${duration} ns`;
}

function getRoleBadgeClass(role?: string | null) {
  if (role === "ADMIN") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (role === "LEADER") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-brand-50 text-brand-700";
}

function SectionCard({ id, title, description, actions, children, className }: SectionCardProps) {
  return (
    <section
      id={id}
      className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className ?? ""}`.trim()}
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      <div className="px-6 py-6 sm:px-8">{children}</div>
    </section>
  );
}

function FeedbackMessage({ feedback }: { feedback?: Feedback | null }) {
  if (!feedback) {
    return null;
  }

  return (
    <div
      className={
        feedback.tone === "success"
          ? "rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          : "rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
      }
    >
      {feedback.message}
    </div>
  );
}

function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{hint}</p>
    </div>
  );
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
      <p className="font-semibold text-slate-700">{title}</p>
      <p className="mt-1">{description}</p>
    </div>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs text-slate-500">{children}</p>;
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  hint,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <select id={id} className={selectClassName} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder ?? `Select ${label.toLowerCase()}`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <FieldHint>{hint}</FieldHint> : null}
    </div>
  );
}

const AccountPage = () => {
  const router = useRouter();
  const seededIdsRef = React.useRef(false);

  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [bootstrapping, setBootstrapping] = React.useState(true);
  const [bootstrapError, setBootstrapError] = React.useState<string | null>(null);

  const [feedbackByKey, setFeedbackByKey] = React.useState<Record<string, Feedback | undefined>>({});
  const [pendingByKey, setPendingByKey] = React.useState<Record<string, boolean>>({});

  const [currentUser, setCurrentUser] = React.useState<UserDto | null>(null);
  const [users, setUsers] = React.useState<UserDto[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<UserDto | null>(null);
  const [organizations, setOrganizations] = React.useState<KnownOrganization[]>([]);

  const [leaderOrganization, setLeaderOrganization] = React.useState<OrganizationDto | null>(null);
  const [organizationInventory, setOrganizationInventory] = React.useState<ProductDto[]>([]);

  const [products, setProducts] = React.useState<ProductDto[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<ProductDto | null>(null);
  const [productTypeResults, setProductTypeResults] = React.useState<ProductDto[]>([]);

  const [assignments, setAssignments] = React.useState<AssignmentDto[]>([]);
  const [selectedAssignment, setSelectedAssignment] = React.useState<AssignmentDto | null>(null);
  const [userAssignments, setUserAssignments] = React.useState<AssignmentDto[]>([]);
  const [productAssignments, setProductAssignments] = React.useState<AssignmentDto[]>([]);
  const [currentAssignments, setCurrentAssignments] = React.useState<AssignmentDto[]>([]);

  const [selectedProtocol, setSelectedProtocol] = React.useState<ProtocolDto | null>(null);
  const [aiResult, setAiResult] = React.useState<AiResponseDto | null>(null);

  const [profileForm, setProfileForm] = React.useState({
    fullName: "",
    email: "",
    password: "",
    role: "EMPLOYEE" as Role,
    age: "",
  });

  const [userLookupId, setUserLookupId] = React.useState("");
  const [deleteUserId, setDeleteUserId] = React.useState("");

  const [organizationLookupLeaderId, setOrganizationLookupLeaderId] = React.useState("");
  const [organizationCreateForm, setOrganizationCreateForm] = React.useState({
    leaderId: "",
    organizationName: "",
  });
  const [joinOrganizationForm, setJoinOrganizationForm] = React.useState({
    userId: "",
    organizationId: "",
  });
  const [becomeLeaderForm, setBecomeLeaderForm] = React.useState({
    userId: "",
    organizationId: "",
  });
  const [inventoryOrgId, setInventoryOrgId] = React.useState("");

  const [productForm, setProductForm] = React.useState({
    id: "",
    productType: "",
    productBrand: "",
    productModel: "",
    assetTag: "",
    organizationId: "",
  });
  const [productLookupId, setProductLookupId] = React.useState("");
  const [productAssetTag, setProductAssetTag] = React.useState("");
  const [productTypeQuery, setProductTypeQuery] = React.useState("");

  const [assignmentForm, setAssignmentForm] = React.useState({
    id: "",
    employeeId: "",
    productId: "",
    dateAssigned: "",
    dateReturned: "",
  });
  const [assignmentLookupId, setAssignmentLookupId] = React.useState("");
  const [assignmentUserId, setAssignmentUserId] = React.useState("");
  const [assignmentProductId, setAssignmentProductId] = React.useState("");

  const [protocolLookupId, setProtocolLookupId] = React.useState("");
  const [protocolCreateForm, setProtocolCreateForm] = React.useState({
    organizationId: "",
    userId: "",
  });

  const [aiPrompt, setAiPrompt] = React.useState("");

  const apiBaseUrl = getApiBaseUrl();
  const sessionExpiresAt = formatSessionExpiry(session);
  const myAssignmentsCount = currentUser?.assignmentIds?.length ?? 0;

  const setFeedback = React.useCallback((key: string, feedback: Feedback | null) => {
    setFeedbackByKey((previous) => {
      const next = { ...previous };

      if (feedback) {
        next[key] = feedback;
      } else {
        delete next[key];
      }

      return next;
    });
  }, []);

  const setPending = React.useCallback((key: string, value: boolean) => {
    setPendingByKey((previous) => ({
      ...previous,
      [key]: value,
    }));
  }, []);

  const runAction = React.useCallback(
    async <T,>(key: string, action: () => Promise<T>, successMessage?: string) => {
      setPending(key, true);
      setFeedback(key, null);

      try {
        const result = await action();
        if (successMessage) {
          setFeedback(key, { tone: "success", message: successMessage });
        }
        return result;
      } catch (error) {
        setFeedback(key, { tone: "error", message: getErrorMessage(error) });
        return null;
      } finally {
        setPending(key, false);
      }
    },
    [setFeedback, setPending],
  );

  React.useEffect(() => {
    const syncSession = () => {
      setSession(readAuthSession());
    };

    syncSession();
    return subscribeToAuthChanges(syncSession);
  }, []);

  React.useEffect(() => {
    if (!session) {
      setBootstrapping(false);
      setBootstrapError(null);
      setCurrentUser(null);
      return;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      setBootstrapping(true);
      setBootstrapError(null);

      const [userResult, usersResult, productsResult, assignmentsResult, currentAssignmentsResult] =
        await Promise.allSettled([
          apiRequest<UserDto>(`/auth/user/${session.userId}`),
          apiRequest<UserDto[]>("/auth/users"),
          apiRequest<ProductDto[]>("/product/all"),
          apiRequest<AssignmentDto[]>("/assignment/all"),
          apiRequest<AssignmentDto[]>("/assignment/current"),
        ]);

      if (cancelled) {
        return;
      }

      const errors: string[] = [];

      if (userResult.status === "fulfilled") {
        setCurrentUser(userResult.value);
        setSelectedUser(userResult.value);
      } else {
        errors.push("current user");
      }

      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value);
      } else {
        errors.push("users");
      }

      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value);
      } else {
        errors.push("products");
      }

      if (assignmentsResult.status === "fulfilled") {
        setAssignments(assignmentsResult.value);
      } else {
        errors.push("assignments");
      }

      if (currentAssignmentsResult.status === "fulfilled") {
        setCurrentAssignments(currentAssignmentsResult.value);
      } else {
        errors.push("current assignments");
      }

      setBootstrapError(
        errors.length > 0
          ? `Some workspace data could not be loaded (${errors.join(", ")}). You can still use the forms below.`
          : null,
      );
      setBootstrapping(false);
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [session]);

  React.useEffect(() => {
    if (!currentUser) {
      return;
    }

    setProfileForm({
      fullName: currentUser.fullName ?? "",
      email: currentUser.email ?? "",
      password: "",
      role: currentUser.role,
      age: currentUser.age?.toString() ?? "",
    });

    if (seededIdsRef.current) {
      return;
    }

    const userIdValue = currentUser.id ? String(currentUser.id) : "";
    const organizationIdValue = currentUser.organizationId ? String(currentUser.organizationId) : "";

    setUserLookupId(userIdValue);
    setDeleteUserId(userIdValue);
    setOrganizationLookupLeaderId(userIdValue);
    setOrganizationCreateForm((previous) => ({ ...previous, leaderId: userIdValue }));
    setJoinOrganizationForm((previous) => ({ ...previous, userId: userIdValue }));
    setBecomeLeaderForm((previous) => ({ ...previous, userId: userIdValue }));
    setInventoryOrgId(organizationIdValue);
    setAssignmentForm((previous) => ({ ...previous, employeeId: userIdValue }));
    setAssignmentUserId(userIdValue);
    setProtocolCreateForm((previous) => ({ ...previous, userId: userIdValue, organizationId: organizationIdValue }));

    seededIdsRef.current = true;
  }, [currentUser]);

  React.useEffect(() => {
    const leaderUsers = users.filter((user) => user.role === "LEADER" && typeof user.id === "number");

    if (leaderUsers.length === 0) {
      setOrganizations([]);
      return;
    }

    let cancelled = false;

    const loadOrganizations = async () => {
      const results = await Promise.allSettled(
        leaderUsers.map(async (leader) => {
          const organization = await apiRequest<OrganizationDto>(`/org/leader/${leader.id}`);
          return { leader, organization };
        }),
      );

      if (cancelled) {
        return;
      }

      const nextOrganizations = results.flatMap((result) => {
        if (result.status !== "fulfilled") {
          return [];
        }

        const { leader, organization } = result.value;

        if (organization.id == null) {
          return [];
        }

        return [
          {
            ...organization,
            leaderId: leader.id ?? null,
            leaderName: leader.fullName ?? null,
            memberCount: users.filter((user) => user.organizationId === organization.id).length,
          },
        ];
      });

      const uniqueOrganizations = nextOrganizations.reduce<KnownOrganization[]>((accumulator, organization) => {
        if (accumulator.some((item) => item.id === organization.id)) {
          return accumulator;
        }

        return [...accumulator, organization];
      }, []);

      setOrganizations(
        uniqueOrganizations.sort((left, right) => left.organizationName.localeCompare(right.organizationName)),
      );
    };

    void loadOrganizations();

    return () => {
      cancelled = true;
    };
  }, [users]);

  const upsertOrganizationSummary = React.useCallback(
    (organization: OrganizationDto, leaderId?: number | null) => {
      if (organization.id == null) {
        return;
      }

      setOrganizations((previous) => {
        const current = previous.find((item) => item.id === organization.id);
        const leader = typeof leaderId === "number" ? users.find((user) => user.id === leaderId) : null;

        const nextOrganization: KnownOrganization = {
          ...organization,
          leaderId: leaderId ?? current?.leaderId ?? null,
          leaderName: leader?.fullName ?? current?.leaderName ?? null,
          memberCount: users.filter((user) => user.organizationId === organization.id).length,
        };

        return [...previous.filter((item) => item.id !== organization.id), nextOrganization].sort((left, right) =>
          left.organizationName.localeCompare(right.organizationName),
        );
      });
    },
    [users],
  );

  const allOrganizations = leaderOrganization?.id && !organizations.some((organization) => organization.id === leaderOrganization.id)
    ? [
        ...organizations,
        {
          ...leaderOrganization,
          leaderId: null,
          leaderName: null,
          memberCount: users.filter((user) => user.organizationId === leaderOrganization.id).length,
        },
      ]
    : organizations;

  const getUserName = (userId?: number | null) => {
    if (userId == null) {
      return "Not assigned";
    }

    const user = users.find((candidate) => candidate.id === userId) ?? (currentUser?.id === userId ? currentUser : null);
    return user ? user.fullName : `User #${userId}`;
  };

  const getUserOptionLabel = (user: UserDto) => `${user.fullName} • ${user.email}`;

  const getOrganizationName = (organizationId?: number | null) => {
    if (organizationId == null) {
      return "Not assigned";
    }

    const organization = allOrganizations.find((candidate) => candidate.id === organizationId);
    return organization ? organization.organizationName : `Company #${organizationId}`;
  };

  const getOrganizationOptionLabel = (organization: KnownOrganization) =>
    organization.leaderName
      ? `${organization.organizationName} • led by ${organization.leaderName}`
      : organization.organizationName;

  const getProductLabel = (product?: ProductDto | null) => {
    if (!product) {
      return "Unknown asset";
    }

    return `${product.productBrand} ${product.productModel} • ${product.assetTag}`;
  };

  const getProductName = (productId?: number | null) => {
    if (productId == null) {
      return "No asset selected";
    }

    const product = products.find((candidate) => candidate.id === productId);
    return product ? getProductLabel(product) : `Product #${productId}`;
  };

  const leaderUsers = users.filter((user) => user.role === "LEADER" && typeof user.id === "number");
  const usersWithIds = users.filter((user) => typeof user.id === "number");
  const employeeUsers = users.filter((user) => user.role === "EMPLOYEE" && typeof user.id === "number");
  const productsWithIds = products.filter((product) => typeof product.id === "number");
  const assignmentsWithIds = assignments.filter((assignment) => typeof assignment.id === "number");

  const userOptions: SelectOption[] = usersWithIds.map((user) => ({
    value: String(user.id),
    label: getUserOptionLabel(user),
  }));

  const leaderOptions: SelectOption[] = leaderUsers.map((user) => ({
    value: String(user.id),
    label: getUserOptionLabel(user),
  }));

  const employeeOptions: SelectOption[] = employeeUsers.map((user) => ({
    value: String(user.id),
    label: getUserOptionLabel(user),
  }));

  const organizationOptions: SelectOption[] = allOrganizations
    .filter((organization) => typeof organization.id === "number")
    .map((organization) => ({
      value: String(organization.id),
      label: getOrganizationOptionLabel(organization),
    }));

  const productOptions: SelectOption[] = productsWithIds.map((product) => ({
    value: String(product.id),
    label: getProductLabel(product),
  }));

  const assignmentOptions: SelectOption[] = assignmentsWithIds.map((assignment) => ({
    value: String(assignment.id),
    label: `#${assignment.id} • ${getUserName(assignment.employeeId)} • ${getProductName(assignment.productId)}`,
  }));

  const selectedProtocolOrganizationId = parseOptionalNumber(protocolCreateForm.organizationId);
  const protocolUserOptions: SelectOption[] = usersWithIds
    .filter((user) => {
      if (selectedProtocolOrganizationId == null) {
        return true;
      }

      return user.organizationId === selectedProtocolOrganizationId;
    })
    .map((user) => ({
      value: String(user.id),
      label: getUserOptionLabel(user),
    }));

  const refreshCurrentUserSnapshot = async () => {
    if (!session) {
      return null;
    }

    const nextUser = await apiRequest<UserDto>(`/auth/user/${session.userId}`);
    setCurrentUser(nextUser);
    return nextUser;
  };

  const refreshUsersList = async () => {
    const nextUsers = await apiRequest<UserDto[]>("/auth/users");
    setUsers(nextUsers);
    return nextUsers;
  };

  const refreshProductsList = async () => {
    const nextProducts = await apiRequest<ProductDto[]>("/product/all");
    setProducts(nextProducts);
    return nextProducts;
  };

  const refreshAssignmentsList = async () => {
    const [allAssignments, activeAssignments] = await Promise.all([
      apiRequest<AssignmentDto[]>("/assignment/all"),
      apiRequest<AssignmentDto[]>("/assignment/current"),
    ]);

    setAssignments(allAssignments);
    setCurrentAssignments(activeAssignments);
    return allAssignments;
  };

  const handleWorkspaceRefresh = async () => {
    if (!session) {
      return;
    }

    const refreshed = await runAction("workspace", async () => {
      const [nextCurrentUser, nextUsers, nextProducts, nextAssignments, nextCurrentAssignments] = await Promise.all([
        apiRequest<UserDto>(`/auth/user/${session.userId}`),
        apiRequest<UserDto[]>("/auth/users"),
        apiRequest<ProductDto[]>("/product/all"),
        apiRequest<AssignmentDto[]>("/assignment/all"),
        apiRequest<AssignmentDto[]>("/assignment/current"),
      ]);

      setCurrentUser(nextCurrentUser);
      setUsers(nextUsers);
      setProducts(nextProducts);
      setAssignments(nextAssignments);
      setCurrentAssignments(nextCurrentAssignments);
    }, "Workspace refreshed.");

    if (refreshed === null) {
      return;
    }
  };

  const handleProfileUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session) {
      return;
    }

    const updatedUser = await runAction("profile", async () => {
      const payload: UserDto = {
        fullName: requireText(profileForm.fullName, "Full name"),
        email: requireText(profileForm.email, "Email"),
        password: profileForm.password || null,
        role: profileForm.role,
        age: parseOptionalNumber(profileForm.age),
        organizationId: currentUser?.organizationId ?? null,
        assignmentIds: currentUser?.assignmentIds ?? [],
      };

      return apiRequest<UserDto>(`/auth/user/edit/${session.userId}`, {
        method: "PUT",
        json: payload,
      });
    }, "Profile updated.");

    if (!updatedUser) {
      return;
    }

    setCurrentUser(updatedUser);
    setSelectedUser(updatedUser);
    setUsers((previous) =>
      previous.map((user) => (user.id === updatedUser.id ? { ...user, ...updatedUser } : user)),
    );
    setProfileForm((previous) => ({ ...previous, password: "" }));
    saveAuthSession({
      ...session,
      role: updatedUser.role,
      issuedAt: session.issuedAt,
    });
  };

  const handleLoadUsers = async () => {
    const nextUsers = await runAction("users", () => apiRequest<UserDto[]>("/auth/users"), "Users loaded.");
    if (nextUsers) {
      setUsers(nextUsers);
    }
  };

  const handleLookupUser = async () => {
    const userId = parseRequiredNumber(userLookupId, "User ID");
    const user = await runAction("users", () => apiRequest<UserDto>(`/auth/user/${userId}`), "User loaded.");
    if (user) {
      setSelectedUser(user);
    }
  };

  const handleDeleteUser = async () => {
    const userId = parseRequiredNumber(deleteUserId, "Delete user ID");

    if (!window.confirm(`Delete ${getUserName(userId)}? This cannot be undone.`)) {
      return;
    }

    const deletedUser = await runAction(
      "users",
      () => apiRequest<UserDto>(`/auth/user/delete/${userId}`, { method: "DELETE" }),
      "User deleted.",
    );

    if (!deletedUser) {
      return;
    }

    setUsers((previous) => previous.filter((user) => user.id !== userId));
    setSelectedUser((previous) => (previous?.id === userId ? null : previous));

    if (session?.userId === userId) {
      clearAuthSession();
      router.replace("/user/login");
    }
  };

  const handleLookupOrganization = async () => {
    const leaderId = parseRequiredNumber(organizationLookupLeaderId, "Leader ID");
    const organization = await runAction(
      "organizations",
      () => apiRequest<OrganizationDto>(`/org/leader/${leaderId}`),
      "Organization loaded.",
    );

    if (organization) {
      setLeaderOrganization(organization);
      upsertOrganizationSummary(organization, leaderId);
    }
  };

  const handleCreateOrganization = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const leaderId = parseRequiredNumber(organizationCreateForm.leaderId, "Leader ID");
    const organizationName = requireText(organizationCreateForm.organizationName, "Organization name");

    const organization = await runAction(
      "organizations",
      () =>
        apiRequest<OrganizationDto>(`/org/create/${leaderId}`, {
          method: "POST",
          json: { organizationName },
        }),
      "Organization created.",
    );

    if (!organization) {
      return;
    }

    setLeaderOrganization(organization);
    upsertOrganizationSummary(organization, leaderId);
    if (session?.userId === leaderId) {
      await refreshCurrentUserSnapshot();
    }
    await refreshUsersList();
  };

  const handleJoinOrganization = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userId = parseRequiredNumber(joinOrganizationForm.userId, "User ID");
    const organizationId = parseRequiredNumber(joinOrganizationForm.organizationId, "Organization ID");

    const organization = await runAction(
      "organizations",
      () =>
        apiRequest<OrganizationDto>(`/org/join/${userId}/${organizationId}`, {
          method: "POST",
        }),
      "User joined organization.",
    );

    if (!organization) {
      return;
    }

    setLeaderOrganization(organization);
    upsertOrganizationSummary(organization);
    if (session?.userId === userId) {
      await refreshCurrentUserSnapshot();
    }
    await refreshUsersList();
  };

  const handleBecomeLeader = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userId = parseRequiredNumber(becomeLeaderForm.userId, "User ID");
    const organizationId = parseRequiredNumber(becomeLeaderForm.organizationId, "Organization ID");

    const result = await runAction(
      "organizations",
      () =>
        apiRequest<void>(`/org/becomeLeader/${userId}/${organizationId}`, {
          method: "POST",
        }),
      "Leader updated.",
    );

    if (result === null) {
      return;
    }

    if (session?.userId === userId) {
      await refreshCurrentUserSnapshot();
      saveAuthSession({
        ...(session ?? readAuthSession()),
        role: "LEADER",
        token: session?.token ?? "",
        expiresIn: session?.expiresIn ?? 0,
        userId: session?.userId ?? 0,
        issuedAt: session?.issuedAt,
      });
    }

    await refreshUsersList();
    const organization = await apiRequest<OrganizationDto>(`/org/leader/${userId}`);
    setLeaderOrganization(organization);
    upsertOrganizationSummary(organization, userId);
  };

  const handleLoadOrganizationInventory = async () => {
    const organizationId = parseRequiredNumber(inventoryOrgId, "Organization ID");
    const inventory = await runAction(
      "organizations",
      () => apiRequest<ProductDto[]>(`/org/inventory/${organizationId}`),
      "Inventory loaded.",
    );

    if (inventory) {
      setOrganizationInventory(inventory);
    }
  };

  const buildProductPayload = () => ({
    productType: requireText(productForm.productType, "Product type"),
    productBrand: requireText(productForm.productBrand, "Brand"),
    productModel: requireText(productForm.productModel, "Model"),
    assetTag: requireText(productForm.assetTag, "Asset tag"),
    organizationId: parseOptionalNumber(productForm.organizationId),
  });

  const handleCreateProduct = async (legacy = false) => {
    const endpoint = legacy ? "/product/add" : "/product";

    const product = await runAction(
      "products",
      () =>
        apiRequest<ProductDto>(endpoint, {
          method: "POST",
          json: buildProductPayload(),
        }),
      legacy ? "Product created through legacy endpoint." : "Product created.",
    );

    if (!product) {
      return;
    }

    setSelectedProduct(product);
    await refreshProductsList();
  };

  const handleUpdateProduct = async () => {
    const productId = parseRequiredNumber(productForm.id, "Product ID");

    const payload = {
      productType: productForm.productType.trim() || undefined,
      productBrand: productForm.productBrand.trim() || undefined,
      productModel: productForm.productModel.trim() || undefined,
      assetTag: productForm.assetTag.trim() || undefined,
      organizationId: parseOptionalNumber(productForm.organizationId),
    };

    const product = await runAction(
      "products",
      () =>
        apiRequest<ProductDto>(`/product/${productId}`, {
          method: "PUT",
          json: payload,
        }),
      "Product updated.",
    );

    if (!product) {
      return;
    }

    setSelectedProduct(product);
    await refreshProductsList();
  };

  const handleLoadAllProducts = async () => {
    const nextProducts = await runAction("products", () => apiRequest<ProductDto[]>("/product/all"), "Products loaded.");
    if (nextProducts) {
      setProducts(nextProducts);
    }
  };

  const handleLookupProduct = async () => {
    const productId = parseRequiredNumber(productLookupId, "Product ID");
    const product = await runAction(
      "products",
      () => apiRequest<ProductDto>(`/product/${productId}`),
      "Product loaded.",
    );

    if (product) {
      setSelectedProduct(product);
    }
  };

  const handleSearchProductByAssetTag = async () => {
    const assetTag = requireText(productAssetTag, "Asset tag");
    const product = await runAction(
      "products",
      () => apiRequest<ProductDto>(`/product/asset/${encodeURIComponent(assetTag)}`),
      "Asset tag search complete.",
    );

    if (product) {
      setSelectedProduct(product);
    }
  };

  const handleSearchProductByType = async () => {
    const productType = requireText(productTypeQuery, "Product type");
    const result = await runAction(
      "products",
      () => apiRequest<ProductDto[]>(`/product/search/type/${encodeURIComponent(productType)}`),
      "Type search complete.",
    );

    if (result) {
      setProductTypeResults(result);
    }
  };

  const handleDeleteProduct = async () => {
    const productId = parseRequiredNumber(productLookupId || productForm.id, "Product ID");

    if (!window.confirm(`Delete ${getProductName(productId)}?`)) {
      return;
    }

    const result = await runAction(
      "products",
      () =>
        apiRequest<void>(`/product/${productId}`, {
          method: "DELETE",
        }),
      "Product deleted.",
    );

    if (result === null) {
      return;
    }

    setSelectedProduct((previous) => (previous?.id === productId ? null : previous));
    setProductTypeResults((previous) => previous.filter((product) => product.id !== productId));
    setOrganizationInventory((previous) => previous.filter((product) => product.id !== productId));
    await refreshProductsList();
  };

  const buildAssignmentPayload = () => ({
    employeeId: parseRequiredNumber(assignmentForm.employeeId, "Employee ID"),
    productId: parseRequiredNumber(assignmentForm.productId, "Product ID"),
    dateAssigned: toIsoDateTime(assignmentForm.dateAssigned),
    dateReturned: toIsoDateTime(assignmentForm.dateReturned),
  });

  const handleCreateAssignment = async () => {
    const payload = buildAssignmentPayload();

    if (!payload.dateAssigned) {
      setFeedback("assignments", { tone: "error", message: "Assigned date is required." });
      return;
    }

    const assignment = await runAction(
      "assignments",
      () =>
        apiRequest<AssignmentDto>("/assignment/add", {
          method: "POST",
          json: payload,
        }),
      "Assignment created.",
    );

    if (!assignment) {
      return;
    }

    setSelectedAssignment(assignment);
    await refreshAssignmentsList();
    if (session?.userId === assignment.employeeId) {
      await refreshCurrentUserSnapshot();
    }
  };

  const handleUpdateAssignment = async () => {
    const assignmentId = parseRequiredNumber(assignmentForm.id, "Assignment ID");

    const assignment = await runAction(
      "assignments",
      () =>
        apiRequest<AssignmentDto>(`/assignment/update/${assignmentId}`, {
          method: "PUT",
          json: {
            employeeId: parseOptionalNumber(assignmentForm.employeeId),
            productId: parseOptionalNumber(assignmentForm.productId),
            dateAssigned: toIsoDateTime(assignmentForm.dateAssigned),
            dateReturned: assignmentForm.dateReturned ? toIsoDateTime(assignmentForm.dateReturned) : null,
          },
        }),
      "Assignment updated.",
    );

    if (!assignment) {
      return;
    }

    setSelectedAssignment(assignment);
    await refreshAssignmentsList();
    if (session?.userId === assignment.employeeId) {
      await refreshCurrentUserSnapshot();
    }
  };

  const handleLookupAssignment = async () => {
    const assignmentId = parseRequiredNumber(assignmentLookupId, "Assignment ID");
    const assignment = await runAction(
      "assignments",
      () => apiRequest<AssignmentDto>(`/assignment/get/${assignmentId}`),
      "Assignment loaded.",
    );

    if (assignment) {
      setSelectedAssignment(assignment);
    }
  };

  const handleLoadAllAssignments = async () => {
    const nextAssignments = await runAction(
      "assignments",
      () => apiRequest<AssignmentDto[]>("/assignment/all"),
      "Assignments loaded.",
    );

    if (nextAssignments) {
      setAssignments(nextAssignments);
    }
  };

  const handleLoadAssignmentsByUser = async () => {
    const userId = parseRequiredNumber(assignmentUserId, "User ID");
    const result = await runAction(
      "assignments",
      () => apiRequest<AssignmentDto[]>(`/assignment/user/${userId}`),
      "User assignments loaded.",
    );

    if (result) {
      setUserAssignments(result);
    }
  };

  const handleLoadAssignmentsByProduct = async () => {
    const productId = parseRequiredNumber(assignmentProductId, "Product ID");
    const result = await runAction(
      "assignments",
      () => apiRequest<AssignmentDto[]>(`/assignment/product/${productId}`),
      "Product assignments loaded.",
    );

    if (result) {
      setProductAssignments(result);
    }
  };

  const handleLoadCurrentAssignments = async () => {
    const result = await runAction(
      "assignments",
      () => apiRequest<AssignmentDto[]>("/assignment/current"),
      "Current assignments loaded.",
    );

    if (result) {
      setCurrentAssignments(result);
    }
  };

  const handleDeleteAssignment = async () => {
    const assignmentId = parseRequiredNumber(assignmentLookupId || assignmentForm.id, "Assignment ID");

    if (!window.confirm(`Delete assignment #${assignmentId}?`)) {
      return;
    }

    const result = await runAction(
      "assignments",
      () =>
        apiRequest<void>(`/assignment/delete/${assignmentId}`, {
          method: "DELETE",
        }),
      "Assignment deleted.",
    );

    if (result === null) {
      return;
    }

    setSelectedAssignment((previous) => (previous?.id === assignmentId ? null : previous));
    setUserAssignments((previous) => previous.filter((assignment) => assignment.id !== assignmentId));
    setProductAssignments((previous) => previous.filter((assignment) => assignment.id !== assignmentId));
    setCurrentAssignments((previous) => previous.filter((assignment) => assignment.id !== assignmentId));
    await refreshAssignmentsList();
    await refreshCurrentUserSnapshot();
  };

  const handleLookupProtocol = async () => {
    const protocolId = parseRequiredNumber(protocolLookupId, "Protocol ID");
    const protocol = await runAction(
      "protocols",
      () => apiRequest<ProtocolDto>(`/protocol/${protocolId}`),
      "Protocol loaded.",
    );

    if (protocol) {
      setSelectedProtocol(protocol);
    }
  };

  const handleCreateProtocol = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const organizationId = parseRequiredNumber(protocolCreateForm.organizationId, "Organization ID");
    const userId = parseRequiredNumber(protocolCreateForm.userId, "User ID");

    const protocol = await runAction(
      "protocols",
      () =>
        apiRequest<ProtocolDto>(`/protocol/create/${organizationId}/user/${userId}`, {
          method: "POST",
        }),
      "Protocol created.",
    );

    if (protocol) {
      setSelectedProtocol(protocol);
    }
  };

  const handleGenerateAiResponse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const prompt = requireText(aiPrompt, "Prompt");
    const response = await runAction(
      "ai",
      () =>
        apiRequest<AiResponseDto>("/ai/generate", {
          method: "POST",
          searchParams: { prompt },
        }),
      "AI response generated.",
    );

    if (response) {
      setAiResult(response);
    }
  };

  const populateProductForm = (product: ProductDto) => {
    setProductForm({
      id: product.id?.toString() ?? "",
      productType: product.productType ?? "",
      productBrand: product.productBrand ?? "",
      productModel: product.productModel ?? "",
      assetTag: product.assetTag ?? "",
      organizationId: product.organizationId?.toString() ?? "",
    });
  };

  const populateAssignmentForm = (assignment: AssignmentDto) => {
    setAssignmentForm({
      id: assignment.id?.toString() ?? "",
      employeeId: assignment.employeeId?.toString() ?? "",
      productId: assignment.productId?.toString() ?? "",
      dateAssigned: toLocalDateTime(assignment.dateAssigned),
      dateReturned: toLocalDateTime(assignment.dateReturned),
    });
  };

  if (!session) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-5 sm:px-8">
          <h1 className="text-2xl font-semibold text-slate-900">Workspace</h1>
          <p className="text-sm text-slate-500">
            Sign in first, then this page becomes the full frontend for your backend endpoints.
          </p>
        </div>
        <div className="px-6 py-8 sm:px-8">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6">
            <p className="text-base font-semibold text-slate-900">No active session found</p>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Your login, register, and Google OAuth pages are wired already. Once you sign in, this workspace opens up
              users, organizations, products, assignments, protocols, and AI tools in one place.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/user/login"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-700"
              >
                Sign in
              </Link>
              <Link
                href="/user/register"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-slate-900 text-white shadow-xl">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.25fr_0.85fr] lg:px-10">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
              Backend workspace
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Frontend control center for every AssetFlow endpoint.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
              This dashboard wires your auth flow, account editing, organization management, products, assignments,
              protocol generation, and AI prompt endpoint into one frontend workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {quickLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Session</p>
                <p className="mt-2 font-semibold text-white">
                  {currentUser?.fullName || `User #${session.userId}`}
                </p>
                <p className="mt-1">Role: {currentUser?.role || session.role}</p>
                <p className="mt-1">User ID: {session.userId}</p>
                <p className="mt-1">Expires: {sessionExpiresAt || "Unknown"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">API target</p>
                <p className="mt-2 break-all font-semibold text-white">{apiBaseUrl}</p>
                <p className="mt-1">OAuth, REST forms, and local session storage are connected.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Users" value={users.length} hint="Loaded from `GET /auth/users`" />
            <StatCard label="Products" value={products.length} hint="Loaded from `GET /product/all`" />
            <StatCard
              label="Assignments"
              value={assignments.length}
              hint="Loaded from `GET /assignment/all`"
            />
            <StatCard
              label="My Assignments"
              value={myAssignmentsCount}
              hint="Current user assignment IDs from the auth profile"
            />
          </div>
        </div>
      </section>

      {bootstrapError ? <FeedbackMessage feedback={{ tone: "error", message: bootstrapError }} /> : null}
      {feedbackByKey.workspace ? <FeedbackMessage feedback={feedbackByKey.workspace} /> : null}

      <SectionCard
        id="profile"
        title="Profile"
        description="Manage the current account with `GET /auth/user/{userId}` and `PUT /auth/user/edit/{userId}`."
        actions={
          <>
            <Button
              variant="outline"
              onClick={handleWorkspaceRefresh}
              disabled={Boolean(pendingByKey.workspace || bootstrapping)}
            >
              {pendingByKey.workspace || bootstrapping ? "Refreshing..." : "Refresh workspace"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                clearAuthSession();
                router.replace("/user/login");
              }}
            >
              Sign out
            </Button>
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <FeedbackMessage feedback={feedbackByKey.profile} />
            <form onSubmit={handleProfileUpdate} className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="profile-full-name">Full name</Label>
                <Input
                  id="profile-full-name"
                  value={profileForm.fullName}
                  onChange={(event) =>
                    setProfileForm((previous) => ({ ...previous, fullName: event.target.value }))
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={profileForm.email}
                  onChange={(event) =>
                    setProfileForm((previous) => ({ ...previous, email: event.target.value }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="profile-role">Role</Label>
                <select
                  id="profile-role"
                  className={selectClassName}
                  value={profileForm.role}
                  onChange={(event) =>
                    setProfileForm((previous) => ({
                      ...previous,
                      role: event.target.value as Role,
                    }))
                  }
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="profile-age">Age</Label>
                <Input
                  id="profile-age"
                  type="number"
                  min={0}
                  value={profileForm.age}
                  onChange={(event) =>
                    setProfileForm((previous) => ({ ...previous, age: event.target.value }))
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="profile-password">New password</Label>
                <Input
                  id="profile-password"
                  type="password"
                  value={profileForm.password}
                  placeholder="Leave blank to keep the current password"
                  onChange={(event) =>
                    setProfileForm((previous) => ({ ...previous, password: event.target.value }))
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <Button type="submit" disabled={Boolean(pendingByKey.profile)}>
                  {pendingByKey.profile ? "Saving..." : "Save profile"}
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Current account</p>
                  <p className="text-sm text-slate-500">Live data from your backend.</p>
                </div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(
                    currentUser?.role,
                  )}`}
                >
                  {currentUser?.role || session.role}
                </span>
              </div>
              {currentUser ? (
                <dl className="mt-5 grid gap-3 text-sm text-slate-600">
                  <div className="flex justify-between gap-4">
                    <dt>Full name</dt>
                    <dd className="font-semibold text-slate-900">{currentUser.fullName}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Email</dt>
                    <dd className="font-semibold text-slate-900">{currentUser.email}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Company</dt>
                    <dd className="font-semibold text-slate-900">
                      {getOrganizationName(currentUser.organizationId)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Assignments</dt>
                    <dd className="font-semibold text-slate-900">{currentUser.assignmentIds?.length ?? 0}</dd>
                  </div>
                </dl>
              ) : (
                <EmptyState
                  title="Loading account"
                  description="Your current profile will appear here after the workspace finishes loading."
                />
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Auth routes covered</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>`POST /auth/register` on the register page</li>
                <li>`POST /auth/login` and Google OAuth on the login page</li>
                <li>`POST /auth/oauth/exchange` on the OAuth callback page</li>
                <li>
                  {String.raw`GET /auth/user/{userId} and PUT /auth/user/edit/{userId} here in the workspace`}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="users"
        title="Users"
        description="Explore `GET /auth/users`, `GET /auth/user/{userId}`, and `DELETE /auth/user/delete/{userId}`."
        actions={
          <Button variant="outline" onClick={handleLoadUsers} disabled={Boolean(pendingByKey.users)}>
            {pendingByKey.users ? "Loading..." : "Reload users"}
          </Button>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <FeedbackMessage feedback={feedbackByKey.users} />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Choose a teammate</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  {userOptions.length > 0 ? (
                    <SelectField
                      id="user-lookup-id"
                      label="User"
                      value={userLookupId}
                      onChange={setUserLookupId}
                      options={userOptions}
                      placeholder="Select a teammate"
                      hint="Names are shown here, while the backend still receives the selected user ID."
                    />
                  ) : (
                    <>
                      <Label htmlFor="user-lookup-id">User ID</Label>
                      <Input
                        id="user-lookup-id"
                        type="number"
                        value={userLookupId}
                        onChange={(event) => setUserLookupId(event.target.value)}
                      />
                    </>
                  )}
                </div>
                <div className="flex items-end">
                  <Button onClick={handleLookupUser} disabled={Boolean(pendingByKey.users)}>
                    Load user
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Remove a user</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  {userOptions.length > 0 ? (
                    <SelectField
                      id="delete-user-id"
                      label="User to remove"
                      value={deleteUserId}
                      onChange={setDeleteUserId}
                      options={userOptions}
                      placeholder="Select a teammate"
                    />
                  ) : (
                    <>
                      <Label htmlFor="delete-user-id">Delete user ID</Label>
                      <Input
                        id="delete-user-id"
                        type="number"
                        value={deleteUserId}
                        onChange={(event) => setDeleteUserId(event.target.value)}
                      />
                    </>
                  )}
                </div>
                <div className="flex items-end">
                  <Button variant="danger" onClick={handleDeleteUser} disabled={Boolean(pendingByKey.users)}>
                    Delete user
                  </Button>
                </div>
              </div>
            </div>

            {selectedUser ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{selectedUser.fullName}</p>
                    <p className="text-sm text-slate-500">{selectedUser.email}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(
                      selectedUser.role,
                    )}`}
                  >
                    {selectedUser.role}
                  </span>
                </div>
                <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                  <div className="flex justify-between gap-4">
                    <dt>ID</dt>
                    <dd className="font-semibold text-slate-900">{selectedUser.id}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Age</dt>
                    <dd className="font-semibold text-slate-900">{selectedUser.age ?? "Not set"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Company</dt>
                    <dd className="font-semibold text-slate-900">
                      {getOrganizationName(selectedUser.organizationId)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Assignments</dt>
                    <dd className="font-semibold text-slate-900">
                      {selectedUser.assignmentIds?.join(", ") || "None"}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <EmptyState
                title="No user selected"
                description="Choose a teammate from the selector to inspect their details here."
              />
            )}
          </div>

          <div>
            {users.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {users.map((user) => (
                  <div key={user.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(
                          user.role,
                        )}`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p>User ID: {user.id}</p>
                      <p>Company: {getOrganizationName(user.organizationId)}</p>
                      <p>Assignments: {user.assignmentIds?.length ?? 0}</p>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setUserLookupId(user.id?.toString() ?? "");
                          setDeleteUserId(user.id?.toString() ?? "");
                        }}
                      >
                        Use in panel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No users loaded"
                description="Use the reload button or the workspace refresh action to fetch the user list."
              />
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="organizations"
        title="Organizations"
        description="Work with leader lookup, organization creation, member joins, leadership transfer, and inventory."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <FeedbackMessage feedback={feedbackByKey.organizations} />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Find a company by leader</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  {leaderOptions.length > 0 ? (
                    <SelectField
                      id="organization-leader-id"
                      label="Leader"
                      value={organizationLookupLeaderId}
                      onChange={setOrganizationLookupLeaderId}
                      options={leaderOptions}
                      placeholder="Select a leader"
                    />
                  ) : (
                    <>
                      <Label htmlFor="organization-leader-id">Leader ID</Label>
                      <Input
                        id="organization-leader-id"
                        type="number"
                        value={organizationLookupLeaderId}
                        onChange={(event) => setOrganizationLookupLeaderId(event.target.value)}
                      />
                    </>
                  )}
                </div>
                <div className="flex items-end">
                  <Button onClick={handleLookupOrganization} disabled={Boolean(pendingByKey.organizations)}>
                    Load organization
                  </Button>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleCreateOrganization}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <p className="text-sm font-semibold text-slate-900">Create organization</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {leaderOptions.length > 0 ? (
                  <SelectField
                    id="create-organization-leader-id"
                    label="Leader"
                    value={organizationCreateForm.leaderId}
                    onChange={(value) =>
                      setOrganizationCreateForm((previous) => ({
                        ...previous,
                        leaderId: value,
                      }))
                    }
                    options={leaderOptions}
                    placeholder="Select who leads this company"
                    hint="The selected leader name is shown here, but the backend still uses that leader's ID."
                  />
                ) : (
                  <div>
                    <Label htmlFor="create-organization-leader-id">Leader ID</Label>
                    <Input
                      id="create-organization-leader-id"
                      type="number"
                      value={organizationCreateForm.leaderId}
                      onChange={(event) =>
                        setOrganizationCreateForm((previous) => ({
                          ...previous,
                          leaderId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="create-organization-name">Company name</Label>
                  <Input
                    id="create-organization-name"
                    value={organizationCreateForm.organizationName}
                    onChange={(event) =>
                      setOrganizationCreateForm((previous) => ({
                        ...previous,
                        organizationName: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button type="submit" disabled={Boolean(pendingByKey.organizations)}>
                  Create organization
                </Button>
              </div>
            </form>

            <form onSubmit={handleJoinOrganization} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Join organization</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {userOptions.length > 0 ? (
                  <SelectField
                    id="join-user-id"
                    label="Teammate"
                    value={joinOrganizationForm.userId}
                    onChange={(value) =>
                      setJoinOrganizationForm((previous) => ({
                        ...previous,
                        userId: value,
                      }))
                    }
                    options={userOptions}
                    placeholder="Select a teammate"
                  />
                ) : (
                  <div>
                    <Label htmlFor="join-user-id">User ID</Label>
                    <Input
                      id="join-user-id"
                      type="number"
                      value={joinOrganizationForm.userId}
                      onChange={(event) =>
                        setJoinOrganizationForm((previous) => ({
                          ...previous,
                          userId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                {organizationOptions.length > 0 ? (
                  <SelectField
                    id="join-organization-id"
                    label="Company"
                    value={joinOrganizationForm.organizationId}
                    onChange={(value) =>
                      setJoinOrganizationForm((previous) => ({
                        ...previous,
                        organizationId: value,
                      }))
                    }
                    options={organizationOptions}
                    placeholder="Select a company"
                  />
                ) : (
                  <div>
                    <Label htmlFor="join-organization-id">Organization ID</Label>
                    <Input
                      id="join-organization-id"
                      type="number"
                      value={joinOrganizationForm.organizationId}
                      onChange={(event) =>
                        setJoinOrganizationForm((previous) => ({
                          ...previous,
                          organizationId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Button type="submit" disabled={Boolean(pendingByKey.organizations)}>
                  Join organization
                </Button>
              </div>
            </form>

            <form onSubmit={handleBecomeLeader} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Become leader</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {userOptions.length > 0 ? (
                  <SelectField
                    id="leader-user-id"
                    label="New leader"
                    value={becomeLeaderForm.userId}
                    onChange={(value) =>
                      setBecomeLeaderForm((previous) => ({
                        ...previous,
                        userId: value,
                      }))
                    }
                    options={userOptions}
                    placeholder="Select who becomes leader"
                  />
                ) : (
                  <div>
                    <Label htmlFor="leader-user-id">User ID</Label>
                    <Input
                      id="leader-user-id"
                      type="number"
                      value={becomeLeaderForm.userId}
                      onChange={(event) =>
                        setBecomeLeaderForm((previous) => ({
                          ...previous,
                          userId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                {organizationOptions.length > 0 ? (
                  <SelectField
                    id="leader-organization-id"
                    label="Company"
                    value={becomeLeaderForm.organizationId}
                    onChange={(value) =>
                      setBecomeLeaderForm((previous) => ({
                        ...previous,
                        organizationId: value,
                      }))
                    }
                    options={organizationOptions}
                    placeholder="Select a company"
                  />
                ) : (
                  <div>
                    <Label htmlFor="leader-organization-id">Organization ID</Label>
                    <Input
                      id="leader-organization-id"
                      type="number"
                      value={becomeLeaderForm.organizationId}
                      onChange={(event) =>
                        setBecomeLeaderForm((previous) => ({
                          ...previous,
                          organizationId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Button type="submit" disabled={Boolean(pendingByKey.organizations)}>
                  Promote to leader
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Selected company</p>
              {leaderOrganization ? (
                <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                  <div className="flex justify-between gap-4">
                    <dt>ID</dt>
                    <dd className="font-semibold text-slate-900">{leaderOrganization.id}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Name</dt>
                    <dd className="font-semibold text-slate-900">{leaderOrganization.organizationName}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Leader</dt>
                    <dd className="font-semibold text-slate-900">
                      {allOrganizations.find((organization) => organization.id === leaderOrganization.id)?.leaderName ||
                        "Unknown"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Members</dt>
                    <dd className="font-semibold text-slate-900">
                      {users.filter((user) => user.organizationId === leaderOrganization.id).length}
                    </dd>
                  </div>
                </dl>
              ) : (
                <EmptyState
                title="No organization selected"
                description="Use the leader lookup or company creation form to load one here."
              />
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Inventory by company</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  {organizationOptions.length > 0 ? (
                    <SelectField
                      id="inventory-organization-id"
                      label="Company"
                      value={inventoryOrgId}
                      onChange={setInventoryOrgId}
                      options={organizationOptions}
                      placeholder="Select a company"
                    />
                  ) : (
                    <>
                      <Label htmlFor="inventory-organization-id">Organization ID</Label>
                      <Input
                        id="inventory-organization-id"
                        type="number"
                        value={inventoryOrgId}
                        onChange={(event) => setInventoryOrgId(event.target.value)}
                      />
                    </>
                  )}
                </div>
                <div className="flex items-end">
                  <Button onClick={handleLoadOrganizationInventory} disabled={Boolean(pendingByKey.organizations)}>
                    Load inventory
                  </Button>
                </div>
              </div>
            </div>

            {organizationInventory.length > 0 ? (
              <div className="grid gap-4">
                {organizationInventory.map((product) => (
                  <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {product.productBrand} {product.productModel}
                        </p>
                        <p className="text-sm text-slate-500">{product.productType}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        #{product.id}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">Asset tag: {product.assetTag}</p>
                    <div className="mt-4">
                      <Button variant="outline" onClick={() => populateProductForm(product)}>
                        Use in product form
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No inventory loaded"
                description="Load products by company to see them listed here."
              />
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="products"
        title="Products"
        description="Create, update, delete, search, and list products through the product controller."
        actions={
          <Button variant="outline" onClick={handleLoadAllProducts} disabled={Boolean(pendingByKey.products)}>
            {pendingByKey.products ? "Loading..." : "Reload products"}
          </Button>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <FeedbackMessage feedback={feedbackByKey.products} />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Create or update product</p>
              <FieldHint>Companies are shown by name here. The selected company ID is still sent to the backend.</FieldHint>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="product-id">Product ID for update</Label>
                  <Input
                    id="product-id"
                    type="number"
                    value={productForm.id}
                    onChange={(event) =>
                      setProductForm((previous) => ({ ...previous, id: event.target.value }))
                    }
                  />
                </div>
                {organizationOptions.length > 0 ? (
                  <SelectField
                    id="product-organization-id"
                    label="Company"
                    value={productForm.organizationId}
                    onChange={(value) =>
                      setProductForm((previous) => ({
                        ...previous,
                        organizationId: value,
                      }))
                    }
                    options={organizationOptions}
                    placeholder="Select a company"
                  />
                ) : (
                  <div>
                    <Label htmlFor="product-organization-id">Organization ID</Label>
                    <Input
                      id="product-organization-id"
                      type="number"
                      value={productForm.organizationId}
                      onChange={(event) =>
                        setProductForm((previous) => ({
                          ...previous,
                          organizationId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="product-type">Product type</Label>
                  <Input
                    id="product-type"
                    value={productForm.productType}
                    onChange={(event) =>
                      setProductForm((previous) => ({
                        ...previous,
                        productType: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="product-brand">Brand</Label>
                  <Input
                    id="product-brand"
                    value={productForm.productBrand}
                    onChange={(event) =>
                      setProductForm((previous) => ({
                        ...previous,
                        productBrand: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="product-model">Model</Label>
                  <Input
                    id="product-model"
                    value={productForm.productModel}
                    onChange={(event) =>
                      setProductForm((previous) => ({
                        ...previous,
                        productModel: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="product-asset-tag">Asset tag</Label>
                  <Input
                    id="product-asset-tag"
                    value={productForm.assetTag}
                    onChange={(event) =>
                      setProductForm((previous) => ({
                        ...previous,
                        assetTag: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={() => handleCreateProduct(false)} disabled={Boolean(pendingByKey.products)}>
                  Create with `POST /product`
                </Button>
                <Button variant="outline" onClick={() => handleCreateProduct(true)} disabled={Boolean(pendingByKey.products)}>
                  Create with `POST /product/add`
                </Button>
                <Button variant="secondary" onClick={handleUpdateProduct} disabled={Boolean(pendingByKey.products)}>
                  Update product
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Read and delete</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {productOptions.length > 0 ? (
                  <SelectField
                    id="product-lookup-id"
                    label="Asset"
                    value={productLookupId}
                    onChange={setProductLookupId}
                    options={productOptions}
                    placeholder="Select an asset"
                  />
                ) : (
                  <div>
                    <Label htmlFor="product-lookup-id">Product ID</Label>
                    <Input
                      id="product-lookup-id"
                      type="number"
                      value={productLookupId}
                      onChange={(event) => setProductLookupId(event.target.value)}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="product-asset-search">Asset tag</Label>
                  <Input
                    id="product-asset-search"
                    value={productAssetTag}
                    onChange={(event) => setProductAssetTag(event.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="product-type-query">Search by type</Label>
                  <Input
                    id="product-type-query"
                    value={productTypeQuery}
                    onChange={(event) => setProductTypeQuery(event.target.value)}
                  />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleLookupProduct} disabled={Boolean(pendingByKey.products)}>
                  Load by ID
                </Button>
                <Button variant="outline" onClick={handleSearchProductByAssetTag} disabled={Boolean(pendingByKey.products)}>
                  Search asset tag
                </Button>
                <Button variant="outline" onClick={handleSearchProductByType} disabled={Boolean(pendingByKey.products)}>
                  Search type
                </Button>
                <Button variant="danger" onClick={handleDeleteProduct} disabled={Boolean(pendingByKey.products)}>
                  Delete product
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {selectedProduct ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedProduct.productBrand} {selectedProduct.productModel}
                    </p>
                    <p className="text-sm text-slate-500">{selectedProduct.productType}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    #{selectedProduct.id}
                  </span>
                </div>
                <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                  <div className="flex justify-between gap-4">
                    <dt>Asset tag</dt>
                    <dd className="font-semibold text-slate-900">{selectedProduct.assetTag}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Organization</dt>
                    <dd className="font-semibold text-slate-900">
                      {getOrganizationName(selectedProduct.organizationId)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4">
                  <Button variant="outline" onClick={() => populateProductForm(selectedProduct)}>
                    Edit in form
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No selected product"
                description="Use the lookup or create actions to view a product here."
              />
            )}

            {productTypeResults.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Type search results</p>
                <div className="mt-4 grid gap-3">
                  {productTypeResults.map((product) => (
                    <div key={product.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        {product.productBrand} {product.productModel}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {product.productType} • {product.assetTag}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Company: {getOrganizationName(product.organizationId)}
                      </p>
                      <div className="mt-3">
                        <Button variant="outline" onClick={() => populateProductForm(product)}>
                          Use in form
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {products.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">All products</p>
                <div className="mt-4 grid gap-3 max-h-[30rem] overflow-y-auto pr-1">
                  {products.map((product) => (
                    <div key={product.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {product.productBrand} {product.productModel}
                          </p>
                          <p className="text-sm text-slate-600">
                            {product.productType} • {product.assetTag}
                          </p>
                          <p className="text-sm text-slate-500">
                            Company: {getOrganizationName(product.organizationId)}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          #{product.id}
                        </span>
                      </div>
                      <div className="mt-3">
                        <Button variant="outline" onClick={() => populateProductForm(product)}>
                          Use in form
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No products loaded"
                description="Create a product or reload the product list to populate this panel."
              />
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="assignments"
        title="Assignments"
        description="Drive assignment creation, lookups, filters, updates, current-assignment loading, and deletion."
        actions={
          <Button variant="outline" onClick={handleLoadAllAssignments} disabled={Boolean(pendingByKey.assignments)}>
            {pendingByKey.assignments ? "Loading..." : "Reload assignments"}
          </Button>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <FeedbackMessage feedback={feedbackByKey.assignments} />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Create or update assignment</p>
              <FieldHint>Choose a teammate and asset by name. The form still sends their IDs to the backend.</FieldHint>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {assignmentOptions.length > 0 ? (
                  <SelectField
                    id="assignment-id"
                    label="Assignment for update"
                    value={assignmentForm.id}
                    onChange={(value) =>
                      setAssignmentForm((previous) => ({ ...previous, id: value }))
                    }
                    options={assignmentOptions}
                    placeholder="Select an assignment"
                  />
                ) : (
                  <div>
                    <Label htmlFor="assignment-id">Assignment ID for update</Label>
                    <Input
                      id="assignment-id"
                      type="number"
                      value={assignmentForm.id}
                      onChange={(event) =>
                        setAssignmentForm((previous) => ({ ...previous, id: event.target.value }))
                      }
                    />
                  </div>
                )}
                {employeeOptions.length > 0 ? (
                  <SelectField
                    id="assignment-employee-id"
                    label="Teammate"
                    value={assignmentForm.employeeId}
                    onChange={(value) =>
                      setAssignmentForm((previous) => ({
                        ...previous,
                        employeeId: value,
                      }))
                    }
                    options={employeeOptions}
                    placeholder="Select a teammate"
                  />
                ) : (
                  <div>
                    <Label htmlFor="assignment-employee-id">Employee ID</Label>
                    <Input
                      id="assignment-employee-id"
                      type="number"
                      value={assignmentForm.employeeId}
                      onChange={(event) =>
                        setAssignmentForm((previous) => ({
                          ...previous,
                          employeeId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                {productOptions.length > 0 ? (
                  <SelectField
                    id="assignment-product-id"
                    label="Asset"
                    value={assignmentForm.productId}
                    onChange={(value) =>
                      setAssignmentForm((previous) => ({
                        ...previous,
                        productId: value,
                      }))
                    }
                    options={productOptions}
                    placeholder="Select an asset"
                  />
                ) : (
                  <div>
                    <Label htmlFor="assignment-product-id">Product ID</Label>
                    <Input
                      id="assignment-product-id"
                      type="number"
                      value={assignmentForm.productId}
                      onChange={(event) =>
                        setAssignmentForm((previous) => ({
                          ...previous,
                          productId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="assignment-date-assigned">Date assigned</Label>
                  <Input
                    id="assignment-date-assigned"
                    type="datetime-local"
                    value={assignmentForm.dateAssigned}
                    onChange={(event) =>
                      setAssignmentForm((previous) => ({
                        ...previous,
                        dateAssigned: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="assignment-date-returned">Date returned</Label>
                  <Input
                    id="assignment-date-returned"
                    type="datetime-local"
                    value={assignmentForm.dateReturned}
                    onChange={(event) =>
                      setAssignmentForm((previous) => ({
                        ...previous,
                        dateReturned: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={handleCreateAssignment} disabled={Boolean(pendingByKey.assignments)}>
                  Create assignment
                </Button>
                <Button variant="secondary" onClick={handleUpdateAssignment} disabled={Boolean(pendingByKey.assignments)}>
                  Update assignment
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Read, filter, and delete</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {assignmentOptions.length > 0 ? (
                  <SelectField
                    id="assignment-lookup-id"
                    label="Assignment"
                    value={assignmentLookupId}
                    onChange={setAssignmentLookupId}
                    options={assignmentOptions}
                    placeholder="Select an assignment"
                  />
                ) : (
                  <div>
                    <Label htmlFor="assignment-lookup-id">Assignment ID</Label>
                    <Input
                      id="assignment-lookup-id"
                      type="number"
                      value={assignmentLookupId}
                      onChange={(event) => setAssignmentLookupId(event.target.value)}
                    />
                  </div>
                )}
                {userOptions.length > 0 ? (
                  <SelectField
                    id="assignment-user-filter"
                    label="Teammate"
                    value={assignmentUserId}
                    onChange={setAssignmentUserId}
                    options={userOptions}
                    placeholder="Select a teammate"
                  />
                ) : (
                  <div>
                    <Label htmlFor="assignment-user-filter">User ID</Label>
                    <Input
                      id="assignment-user-filter"
                      type="number"
                      value={assignmentUserId}
                      onChange={(event) => setAssignmentUserId(event.target.value)}
                    />
                  </div>
                )}
                {productOptions.length > 0 ? (
                  <SelectField
                    id="assignment-product-filter"
                    label="Asset"
                    value={assignmentProductId}
                    onChange={setAssignmentProductId}
                    options={productOptions}
                    placeholder="Select an asset"
                    className="sm:col-span-2"
                  />
                ) : (
                  <div className="sm:col-span-2">
                    <Label htmlFor="assignment-product-filter">Product ID</Label>
                    <Input
                      id="assignment-product-filter"
                      type="number"
                      value={assignmentProductId}
                      onChange={(event) => setAssignmentProductId(event.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleLookupAssignment} disabled={Boolean(pendingByKey.assignments)}>
                  Load by ID
                </Button>
                <Button variant="outline" onClick={handleLoadAssignmentsByUser} disabled={Boolean(pendingByKey.assignments)}>
                  Load by user
                </Button>
                <Button variant="outline" onClick={handleLoadAssignmentsByProduct} disabled={Boolean(pendingByKey.assignments)}>
                  Load by product
                </Button>
                <Button variant="outline" onClick={handleLoadCurrentAssignments} disabled={Boolean(pendingByKey.assignments)}>
                  Load current
                </Button>
                <Button variant="danger" onClick={handleDeleteAssignment} disabled={Boolean(pendingByKey.assignments)}>
                  Delete assignment
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {selectedAssignment ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Assignment #{selectedAssignment.id}</p>
                    <p className="text-sm text-slate-500">
                      {getUserName(selectedAssignment.employeeId)} • {getProductName(selectedAssignment.productId)}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {selectedAssignment.dateReturned ? "Closed" : "Current"}
                  </span>
                </div>
                <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                  <div className="flex justify-between gap-4">
                    <dt>Assigned</dt>
                    <dd className="font-semibold text-slate-900">
                      {formatDateTime(selectedAssignment.dateAssigned)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Returned</dt>
                    <dd className="font-semibold text-slate-900">
                      {formatDateTime(selectedAssignment.dateReturned)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4">
                  <Button variant="outline" onClick={() => populateAssignmentForm(selectedAssignment)}>
                    Edit in form
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No selected assignment"
                description="Load or create an assignment to inspect it here."
              />
            )}

            {userAssignments.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Assignments by user</p>
                <div className="mt-4 grid gap-3">
                  {userAssignments.map((assignment) => (
                    <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        Assignment #{assignment.id} • {getProductName(assignment.productId)}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Assigned {formatDateTime(assignment.dateAssigned)}
                      </p>
                      <div className="mt-3">
                        <Button variant="outline" onClick={() => populateAssignmentForm(assignment)}>
                          Use in form
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {productAssignments.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Assignments by product</p>
                <div className="mt-4 grid gap-3">
                  {productAssignments.map((assignment) => (
                    <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        Assignment #{assignment.id} • {getUserName(assignment.employeeId)}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Returned {formatDateTime(assignment.dateReturned)}
                      </p>
                      <div className="mt-3">
                        <Button variant="outline" onClick={() => populateAssignmentForm(assignment)}>
                          Use in form
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {currentAssignments.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Currently assigned</p>
                <div className="mt-4 grid gap-3 max-h-[24rem] overflow-y-auto pr-1">
                  {currentAssignments.map((assignment) => (
                    <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        Assignment #{assignment.id} • {getProductName(assignment.productId)}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {getUserName(assignment.employeeId)} • {formatDateTime(assignment.dateAssigned)}
                      </p>
                      <div className="mt-3">
                        <Button variant="outline" onClick={() => populateAssignmentForm(assignment)}>
                          Use in form
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No active assignments"
                description="Use the current assignment action or create a new assignment to populate this area."
              />
            )}
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          id="protocols"
          title="Protocols"
          description="Create and fetch protocols with generated PDF URIs."
        >
          <div className="space-y-5">
            <FeedbackMessage feedback={feedbackByKey.protocols} />

            <form onSubmit={handleCreateProtocol} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Create protocol</p>
              <FieldHint>Pick the company and teammate by name. The matching IDs are still sent to the backend.</FieldHint>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {organizationOptions.length > 0 ? (
                  <SelectField
                    id="protocol-organization-id"
                    label="Company"
                    value={protocolCreateForm.organizationId}
                    onChange={(value) =>
                      setProtocolCreateForm((previous) => ({
                        ...previous,
                        organizationId: value,
                      }))
                    }
                    options={organizationOptions}
                    placeholder="Select a company"
                  />
                ) : (
                  <div>
                    <Label htmlFor="protocol-organization-id">Organization ID</Label>
                    <Input
                      id="protocol-organization-id"
                      type="number"
                      value={protocolCreateForm.organizationId}
                      onChange={(event) =>
                        setProtocolCreateForm((previous) => ({
                          ...previous,
                          organizationId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                {protocolUserOptions.length > 0 ? (
                  <SelectField
                    id="protocol-user-id"
                    label={selectedProtocolOrganizationId == null ? "Teammate" : "Teammate in this company"}
                    value={protocolCreateForm.userId}
                    onChange={(value) =>
                      setProtocolCreateForm((previous) => ({
                        ...previous,
                        userId: value,
                      }))
                    }
                    options={protocolUserOptions}
                    placeholder="Select a teammate"
                  />
                ) : (
                  <div>
                    <Label htmlFor="protocol-user-id">User ID</Label>
                    <Input
                      id="protocol-user-id"
                      type="number"
                      value={protocolCreateForm.userId}
                      onChange={(event) =>
                        setProtocolCreateForm((previous) => ({
                          ...previous,
                          userId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Button type="submit" disabled={Boolean(pendingByKey.protocols)}>
                  Create protocol
                </Button>
              </div>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Get protocol by ID</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <Label htmlFor="protocol-lookup-id">Protocol ID</Label>
                  <Input
                    id="protocol-lookup-id"
                    type="number"
                    value={protocolLookupId}
                    onChange={(event) => setProtocolLookupId(event.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleLookupProtocol} disabled={Boolean(pendingByKey.protocols)}>
                    Load protocol
                  </Button>
                </div>
              </div>
            </div>

            {selectedProtocol ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Protocol #{selectedProtocol.id}</p>
                <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                  <div className="flex justify-between gap-4">
                    <dt>Teammate</dt>
                    <dd className="font-semibold text-slate-900">{getUserName(selectedProtocol.employeeId)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Company</dt>
                    <dd className="font-semibold text-slate-900">
                      {getOrganizationName(selectedProtocol.organizationId)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Protocol URI</p>
                  <p className="mt-2 break-all">{selectedProtocol.protocolUri}</p>
                  <div className="mt-4">
                    <a
                      href={selectedProtocol.protocolUri}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
                    >
                      Open protocol URI
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No protocol selected"
                description="Generate a protocol or fetch one by ID to inspect its PDF URI here."
              />
            )}
          </div>
        </SectionCard>

        <SectionCard
          id="ai-tools"
          title="AI"
          description="Use `POST /ai/generate?prompt=...` from the frontend."
        >
          <div className="space-y-5">
            <FeedbackMessage feedback={feedbackByKey.ai} />

            <form onSubmit={handleGenerateAiResponse} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <Label htmlFor="ai-prompt">Prompt</Label>
              <Textarea
                id="ai-prompt"
                value={aiPrompt}
                placeholder="Describe the content you want the backend AI endpoint to generate."
                onChange={(event) => setAiPrompt(event.target.value)}
              />
              <div className="mt-4">
                <Button type="submit" disabled={Boolean(pendingByKey.ai)}>
                  {pendingByKey.ai ? "Generating..." : "Generate response"}
                </Button>
              </div>
            </form>

            {aiResult ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    {aiResult.model || "Unknown model"}
                  </span>
                  {aiResult.remote_model ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {aiResult.remote_model}
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {aiResult.response || "The endpoint returned an empty response."}
                </div>
                <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                  <div className="flex justify-between gap-4">
                    <dt>Created</dt>
                    <dd className="font-semibold text-slate-900">{formatDateTime(aiResult.created_at)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Total duration</dt>
                    <dd className="font-semibold text-slate-900">{formatDuration(aiResult.total_duration)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Prompt eval count</dt>
                    <dd className="font-semibold text-slate-900">{aiResult.prompt_eval_count ?? "N/A"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Eval count</dt>
                    <dd className="font-semibold text-slate-900">{aiResult.eval_count ?? "N/A"}</dd>
                  </div>
                </dl>
                {aiResult.thinking ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Thinking</p>
                    <p className="mt-2 whitespace-pre-wrap">{aiResult.thinking}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyState
                title="No AI response yet"
                description="Submit a prompt to see the backend-generated response and metadata."
              />
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default AccountPage;

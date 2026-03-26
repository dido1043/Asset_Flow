"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { apiRequest, getErrorMessage } from "@/app/lib/api";
import {
  clearAuthSession,
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
  UserDto,
} from "@/app/lib/types";

import type { Feedback, KnownOrganization, SelectOption } from "./types";
import {
  formatRoleLabel,
  getWorkspaceSections,
  parseOptionalNumber,
  parseRequiredNumber,
  requireText,
  toIsoDateTime,
  toLocalDateTime,
} from "./utils";

type WorkspaceSnapshot = {
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

function dedupeById<T extends { id?: number | null }>(items: T[]) {
  const seen = new Set<number>();

  return items.filter((item) => {
    if (typeof item.id !== "number") {
      return true;
    }

    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function ensureUserIncluded(users: UserDto[], currentUser: UserDto) {
  return dedupeById([currentUser, ...users]);
}

function syncSelectedItem<T extends { id?: number | null }>(items: T[], previous: T | null) {
  if (typeof previous?.id !== "number") {
    return null;
  }

  return items.find((item) => item.id === previous.id) ?? null;
}

function buildOrganizationPlaceholder(
  organizationId: number,
  organizationName: string,
  memberCount: number,
  leaderId?: number | null,
  leaderName?: string | null,
): KnownOrganization {
  return {
    id: organizationId,
    organizationName,
    leaderId: leaderId ?? null,
    leaderName: leaderName ?? null,
    memberCount,
  };
}

export function useAccountWorkspace() {
  const router = useRouter();
  const seededIdsRef = React.useRef(false);

  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [sessionChecked, setSessionChecked] = React.useState(false);
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

  const [protocols, setProtocols] = React.useState<ProtocolDto[]>([]);
  const [selectedProtocol, setSelectedProtocol] = React.useState<ProtocolDto | null>(null);
  const [aiResult, setAiResult] = React.useState<AiResponseDto | null>(null);

  const [profileForm, setProfileForm] = React.useState({
    fullName: "",
    email: "",
    password: "",
    role: "EMPLOYEE" as UserDto["role"],
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

  const activeRole = currentUser?.role ?? session?.role ?? null;
  const isAdmin = activeRole === "ADMIN";
  const isLeader = activeRole === "LEADER";
  const isEmployee = activeRole === "EMPLOYEE";

  const canManageUsers = isAdmin || isLeader;
  const canManageOrganizations = isAdmin || isLeader;
  const canManageProducts = isAdmin || isLeader;
  const canManageAssignments = isAdmin || isLeader;
  const canManageProtocols = isAdmin || isLeader;
  const canDeleteUsers = isAdmin;
  const canManageOrganizationMembers = isAdmin;
  const canCreateOrganizations = isAdmin;

  const workspaceScopeLabel = isAdmin ? "All company data" : isLeader ? "Your company only" : "Your records only";
  const visibleSections = getWorkspaceSections(activeRole);

  const myAssignmentsCount =
    currentAssignments.filter((assignment) => assignment.employeeId === currentUser?.id).length ||
    currentUser?.assignmentIds?.length ||
    0;

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

  const handleSignOut = React.useCallback(() => {
    clearAuthSession();
    router.replace("/user/login");
  }, [router]);

  React.useEffect(() => {
    const syncSession = () => {
      setSession(readAuthSession());
      setSessionChecked(true);
    };

    syncSession();
    return subscribeToAuthChanges(syncSession);
  }, []);

  React.useEffect(() => {
    if (sessionChecked && !session) {
      router.replace("/user/login");
    }
  }, [router, session, sessionChecked]);

  const loadWorkspaceSnapshot = React.useCallback(async (activeSession: AuthSession): Promise<WorkspaceSnapshot> => {
    const errors: string[] = [];
    const rememberError = (label: string) => {
      if (!errors.includes(label)) {
        errors.push(label);
      }
    };

    const loadOrFallback = async <T,>(label: string, action: () => Promise<T>, fallback: T) => {
      try {
        return await action();
      } catch (error) {
        console.error(`[workspace] Failed to load ${label}`, error);
        rememberError(label);
        return fallback;
      }
    };

    const loadProductsFromAssignments = async (assignmentList: AssignmentDto[]) => {
      const productIds = [...new Set(assignmentList.map((assignment) => assignment.productId).filter(Number.isFinite))];

      if (productIds.length === 0) {
        return [];
      }

      const results = await Promise.allSettled(
        productIds.map((productId) => apiRequest<ProductDto>(`/product/${productId}`)),
      );

      if (results.some((result) => result.status === "rejected")) {
        rememberError("products");
      }

      return dedupeById(
        results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : [])),
      );
    };

    const loadProtocolsForOrganizations = async (organizationIds: number[]) => {
      if (organizationIds.length === 0) {
        return [];
      }

      const results = await Promise.allSettled(
        organizationIds.map((organizationId) => apiRequest<ProtocolDto[]>(`/protocol/org/${organizationId}`)),
      );

      if (results.some((result) => result.status === "rejected")) {
        rememberError("protocols");
      }

      return dedupeById(
        results.flatMap((result) => (result.status === "fulfilled" ? result.value : [])),
      ).sort((left, right) => (right.id ?? 0) - (left.id ?? 0));
    };

    const nextCurrentUser = await loadOrFallback(
      "current user",
      () => apiRequest<UserDto>(`/auth/user/${activeSession.userId}`),
      null as UserDto | null,
    );

    if (!nextCurrentUser) {
      return {
        currentUser: null,
        users: [],
        organizations: [],
        leaderOrganization: null,
        organizationInventory: [],
        products: [],
        assignments: [],
        currentAssignments: [],
        protocols: [],
        errors,
      };
    }

    const nextOrganizationId = nextCurrentUser.organizationId ?? null;
    const nextUserId = typeof nextCurrentUser.id === "number" ? nextCurrentUser.id : null;

    const nextUsers =
      nextCurrentUser.role === "ADMIN"
        ? ensureUserIncluded(
            await loadOrFallback("users", () => apiRequest<UserDto[]>("/auth/users"), []),
            nextCurrentUser,
          )
        : nextCurrentUser.role === "LEADER" && nextOrganizationId != null
          ? ensureUserIncluded(
              await loadOrFallback(
                "users",
                () => apiRequest<UserDto[]>(`/auth/users/org/${nextOrganizationId}`),
                [],
              ),
              nextCurrentUser,
            )
          : [nextCurrentUser];

    const nextAssignments =
      nextCurrentUser.role === "ADMIN"
        ? await loadOrFallback("assignments", () => apiRequest<AssignmentDto[]>("/assignment/all"), [])
        : nextCurrentUser.role === "LEADER" && nextOrganizationId != null
          ? await loadOrFallback(
              "assignments",
              () => apiRequest<AssignmentDto[]>(`/assignment/org/${nextOrganizationId}`),
              [],
            )
          : nextUserId != null
            ? await loadOrFallback(
                "assignments",
                () => apiRequest<AssignmentDto[]>(`/assignment/user/${nextUserId}`),
                [],
              )
            : [];

    const nextCurrentAssignments =
      nextCurrentUser.role === "ADMIN"
        ? await loadOrFallback("current assignments", () => apiRequest<AssignmentDto[]>("/assignment/current"), [])
        : nextAssignments.filter((assignment) => !assignment.dateReturned);

    const nextProducts =
      nextCurrentUser.role === "ADMIN"
        ? await loadOrFallback("products", () => apiRequest<ProductDto[]>("/product/all"), [])
        : nextCurrentUser.role === "LEADER" && nextOrganizationId != null
          ? await loadOrFallback(
              "products",
              () => apiRequest<ProductDto[]>(`/product/org/${nextOrganizationId}`),
              [],
            )
          : await loadProductsFromAssignments(nextAssignments);

    const nextOrganizations = await (async () => {
      if (nextCurrentUser.role === "ADMIN") {
        const leaderUsers = nextUsers.filter((user) => user.role === "LEADER" && typeof user.id === "number");
        const results = await Promise.allSettled(
          leaderUsers.map(async (leader) => {
            const organization = await apiRequest<OrganizationDto>(`/org/leader/${leader.id}`);
            return { leader, organization };
          }),
        );

        if (results.some((result) => result.status === "rejected")) {
          rememberError("organizations");
        }

        return dedupeById(
          results.flatMap((result) => {
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
                memberCount: nextUsers.filter((user) => user.organizationId === organization.id).length,
              },
            ];
          }),
        ).sort((left, right) => left.organizationName.localeCompare(right.organizationName));
      }

      if (nextCurrentUser.role === "LEADER") {
        if (typeof nextCurrentUser.id === "number") {
          const organization = await loadOrFallback(
            "organizations",
            () => apiRequest<OrganizationDto>(`/org/leader/${nextCurrentUser.id}`),
            null as OrganizationDto | null,
          );

          if (organization?.id != null) {
            return [
              {
                ...organization,
                leaderId: nextCurrentUser.id ?? null,
                leaderName: nextCurrentUser.fullName ?? null,
                memberCount: nextUsers.filter((user) => user.organizationId === organization.id).length,
              },
            ];
          }
        }

        if (nextOrganizationId != null) {
          return [
            buildOrganizationPlaceholder(
              nextOrganizationId,
              "Current company",
              nextUsers.filter((user) => user.organizationId === nextOrganizationId).length,
              nextCurrentUser.id ?? null,
              nextCurrentUser.fullName ?? null,
            ),
          ];
        }

        return [];
      }

      if (nextOrganizationId != null) {
        return [
          buildOrganizationPlaceholder(
            nextOrganizationId,
            "Your company",
            1,
          ),
        ];
      }

      return [];
    })();

    const nextProtocols =
      nextCurrentUser.role === "ADMIN"
        ? await loadProtocolsForOrganizations(
            nextOrganizations.flatMap((organization) =>
              typeof organization.id === "number" ? [organization.id] : [],
            ),
          )
        : nextCurrentUser.role === "LEADER" && nextOrganizationId != null
          ? await loadProtocolsForOrganizations([nextOrganizationId])
          : [];

    const nextLeaderOrganization =
      nextOrganizationId == null
        ? null
        : nextOrganizations.find((organization) => organization.id === nextOrganizationId) ?? null;

    return {
      currentUser: nextCurrentUser,
      users: nextUsers,
      organizations: nextOrganizations,
      leaderOrganization: nextLeaderOrganization,
      organizationInventory: nextCurrentUser.role === "LEADER" ? nextProducts : [],
      products: nextProducts,
      assignments: nextAssignments,
      currentAssignments: nextCurrentAssignments,
      protocols: nextProtocols,
      errors,
    };
  }, []);

  const applyWorkspaceSnapshot = React.useCallback((snapshot: WorkspaceSnapshot) => {
    if (!snapshot.currentUser) {
      setCurrentUser(null);
      setUsers([]);
      setSelectedUser(null);
      setOrganizations([]);
      setLeaderOrganization(null);
      setOrganizationInventory([]);
      setProducts([]);
      setSelectedProduct(null);
      setProductTypeResults([]);
      setAssignments([]);
      setSelectedAssignment(null);
      setUserAssignments([]);
      setProductAssignments([]);
      setCurrentAssignments([]);
      setProtocols([]);
      setSelectedProtocol(null);
      return;
    }

    const nextCurrentUser = snapshot.currentUser;

    setCurrentUser(nextCurrentUser);
    setUsers(snapshot.users);
    setOrganizations(snapshot.organizations);
    setLeaderOrganization(snapshot.leaderOrganization);
    setOrganizationInventory(snapshot.organizationInventory);
    setProducts(snapshot.products);
    setAssignments(snapshot.assignments);
    setCurrentAssignments(snapshot.currentAssignments);
    setProtocols(snapshot.protocols);

    setSelectedUser((previous) => syncSelectedItem(snapshot.users, previous) ?? nextCurrentUser);
    setSelectedProduct((previous) => syncSelectedItem(snapshot.products, previous));
    setSelectedAssignment((previous) => syncSelectedItem(snapshot.assignments, previous));
    setSelectedProtocol((previous) => syncSelectedItem(snapshot.protocols, previous));
    setUserAssignments(
      nextCurrentUser.role === "EMPLOYEE"
        ? snapshot.assignments.filter((assignment) => assignment.employeeId === nextCurrentUser.id)
        : [],
    );
    setProductAssignments([]);
    setProductTypeResults((previous) =>
      previous.filter((product) => snapshot.products.some((candidate) => candidate.id === product.id)),
    );
  }, []);

  const refreshWorkspaceSnapshot = React.useCallback(async () => {
    if (!session) {
      return null;
    }

    const snapshot = await loadWorkspaceSnapshot(session);
    applyWorkspaceSnapshot(snapshot);
    return snapshot;
  }, [applyWorkspaceSnapshot, loadWorkspaceSnapshot, session]);

  React.useEffect(() => {
    if (!session) {
      setBootstrapping(false);
      setBootstrapError(null);
      applyWorkspaceSnapshot({
        currentUser: null,
        users: [],
        organizations: [],
        leaderOrganization: null,
        organizationInventory: [],
        products: [],
        assignments: [],
        currentAssignments: [],
        protocols: [],
        errors: [],
      });
      return;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      setBootstrapping(true);
      setBootstrapError(null);

      const snapshot = await loadWorkspaceSnapshot(session);

      if (cancelled) {
        return;
      }

      applyWorkspaceSnapshot(snapshot);

      if (!snapshot.currentUser) {
        setBootstrapError("We could not load your workspace account.");
        setBootstrapping(false);
        return;
      }

      setBootstrapError(
        snapshot.errors.length > 0
          ? `Some workspace data could not be loaded (${snapshot.errors.join(", ")}). Your view is still limited to ${snapshot.currentUser.role === "ADMIN" ? "allowed admin data" : snapshot.currentUser.role === "LEADER" ? "your company" : "your own records"}.`
          : null,
      );
      setBootstrapping(false);
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [applyWorkspaceSnapshot, loadWorkspaceSnapshot, session]);

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

  const allOrganizations =
    leaderOrganization?.id && !organizations.some((organization) => organization.id === leaderOrganization.id)
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
    return user ? user.fullName : "Unknown teammate";
  };

  const getUserOptionLabel = (user: UserDto) => `${user.fullName} • ${user.email}`;

  const getOrganizationName = (organizationId?: number | null) => {
    if (organizationId == null) {
      return "Not assigned";
    }

    const organization = allOrganizations.find((candidate) => candidate.id === organizationId);
    if (organization) {
      return organization.organizationName;
    }

    if (organizationId === currentUser?.organizationId) {
      return isEmployee ? "Your company" : "Current company";
    }

    return "Unknown company";
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
    return product ? getProductLabel(product) : "Unknown asset";
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

  const protocolOptions: SelectOption[] = protocols
    .filter((protocol) => typeof protocol.id === "number")
    .map((protocol) => ({
      value: String(protocol.id),
      label: `#${protocol.id} • ${getUserName(protocol.employeeId)} • ${getOrganizationName(protocol.organizationId)}`,
    }));

  const accessibleUserIds = new Set(usersWithIds.map((user) => user.id as number));
  const accessibleProductIds = new Set(productsWithIds.map((product) => product.id as number));
  const accessibleAssignmentIds = new Set(assignmentsWithIds.map((assignment) => assignment.id as number));
  const accessibleProtocolIds = new Set(
    protocols
      .map((protocol) => protocol.id)
      .filter((protocolId): protocolId is number => typeof protocolId === "number"),
  );

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

  const workspaceSectionBadges: Record<string, string> = {
    profile: formatRoleLabel(currentUser?.role || String(session?.role || "You")),
    users: String(users.length),
    organizations: String(allOrganizations.length),
    products: String(products.length),
    assignments: String(assignments.length),
    protocols: String(protocols.length),
    "ai-tools": aiResult ? "Ready" : "Live",
  };

  const refreshCurrentUserSnapshot = async () => {
    if (!session) {
      return null;
    }

    const nextUser = await apiRequest<UserDto>(`/auth/user/${session.userId}`);
    setCurrentUser(nextUser);
    return nextUser;
  };

  const refreshProductsList = async () => {
    const snapshot = await refreshWorkspaceSnapshot();
    const nextProducts = snapshot?.products ?? [];
    setProducts(nextProducts);
    return nextProducts;
  };

  const refreshAssignmentsList = async () => {
    const snapshot = await refreshWorkspaceSnapshot();
    const nextAssignments = snapshot?.assignments ?? [];
    setAssignments(nextAssignments);
    setCurrentAssignments(snapshot?.currentAssignments ?? []);
    return nextAssignments;
  };

  const handleWorkspaceRefresh = async () => {
    if (!session) {
      return;
    }

    const refreshed = await runAction(
      "workspace",
      async () => {
        const snapshot = await refreshWorkspaceSnapshot();
        if (!snapshot?.currentUser) {
          throw new Error("We could not refresh your workspace.");
        }
      },
      "Workspace refreshed.",
    );

    if (refreshed === null) {
      return;
    }
  };

  const handleProfileUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session) {
      return;
    }

    const updatedUser = await runAction(
      "profile",
      async () => {
        const payload: UserDto = {
          fullName: requireText(profileForm.fullName, "Full name"),
          email: requireText(profileForm.email, "Email"),
          password: profileForm.password || null,
          role: currentUser?.role ?? profileForm.role,
          age: parseOptionalNumber(profileForm.age),
          organizationId: currentUser?.organizationId ?? null,
          assignmentIds: currentUser?.assignmentIds ?? [],
        };

        return apiRequest<UserDto>(`/auth/user/edit/${session.userId}`, {
          method: "PUT",
          json: payload,
        });
      },
      "Profile updated.",
    );

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
    const nextUsers = await runAction(
      "users",
      async () => {
        if (!currentUser) {
          return [];
        }

        if (currentUser.role === "ADMIN") {
          return apiRequest<UserDto[]>("/auth/users");
        }

        if (currentUser.role === "LEADER" && currentUser.organizationId != null) {
          return ensureUserIncluded(
            await apiRequest<UserDto[]>(`/auth/users/org/${currentUser.organizationId}`),
            currentUser,
          );
        }

        return [currentUser];
      },
      isAdmin ? "Users loaded." : isLeader ? "Your company teammates loaded." : "Your account is already in view.",
    );

    if (nextUsers) {
      setUsers(nextUsers);
      setSelectedUser((previous) => syncSelectedItem(nextUsers, previous) ?? currentUser);
    }
  };

  const handleLookupUser = async () => {
    const userId = parseRequiredNumber(userLookupId, "Teammate");
    if (!isAdmin && !accessibleUserIds.has(userId)) {
      setFeedback("users", {
        tone: "error",
        message: "You can only open teammates that belong to your allowed workspace scope.",
      });
      return;
    }

    const localUser = users.find((user) => user.id === userId);
    const user = await runAction(
      "users",
      () => (localUser && !isAdmin ? Promise.resolve(localUser) : apiRequest<UserDto>(`/auth/user/${userId}`)),
      "User loaded.",
    );

    if (user) {
      setSelectedUser(user);
    }
  };

  const handleDeleteUser = async () => {
    if (!canDeleteUsers) {
      setFeedback("users", { tone: "error", message: "Only admins can remove user accounts." });
      return;
    }

    const userId = parseRequiredNumber(deleteUserId, "Teammate");

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
      handleSignOut();
      return;
    }

    await refreshWorkspaceSnapshot();
  };

  const handleLookupOrganization = async () => {
    if (!canManageOrganizations) {
      setFeedback("organizations", { tone: "error", message: "Your role cannot open company-wide records." });
      return;
    }

    const organization = await runAction(
      "organizations",
      async () => {
        if (isLeader) {
          return allOrganizations.find((candidate) => candidate.id === currentUser?.organizationId) ?? leaderOrganization;
        }

        const leaderId = parseRequiredNumber(organizationLookupLeaderId, "Leader");
        return apiRequest<OrganizationDto>(`/org/leader/${leaderId}`);
      },
      "Organization loaded.",
    );

    if (organization) {
      setLeaderOrganization(organization);
      if (isAdmin) {
        const leaderId = parseRequiredNumber(organizationLookupLeaderId, "Leader");
        upsertOrganizationSummary(organization, leaderId);
      }
    }
  };

  const handleCreateOrganization = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canCreateOrganizations) {
      setFeedback("organizations", { tone: "error", message: "Only admins can create new companies." });
      return;
    }

    const leaderId = parseRequiredNumber(organizationCreateForm.leaderId, "Leader");
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
    await refreshWorkspaceSnapshot();
  };

  const handleJoinOrganization = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canManageOrganizationMembers) {
      setFeedback("organizations", {
        tone: "error",
        message: "Only admins can move teammates between companies from this workspace.",
      });
      return;
    }

    const userId = parseRequiredNumber(joinOrganizationForm.userId, "Teammate");
    const organizationId = parseRequiredNumber(joinOrganizationForm.organizationId, "Company");

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
    await refreshWorkspaceSnapshot();
  };

  const handleBecomeLeader = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canManageOrganizationMembers) {
      setFeedback("organizations", {
        tone: "error",
        message: "Only admins can assign company leadership from this workspace.",
      });
      return;
    }

    const userId = parseRequiredNumber(becomeLeaderForm.userId, "Teammate");
    const organizationId = parseRequiredNumber(becomeLeaderForm.organizationId, "Company");

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

    await refreshWorkspaceSnapshot();
    const organization = await apiRequest<OrganizationDto>(`/org/leader/${userId}`);
    setLeaderOrganization(organization);
    upsertOrganizationSummary(organization, userId);
  };

  const handleLoadOrganizationInventory = async () => {
    if (!canManageOrganizations) {
      setFeedback("organizations", { tone: "error", message: "Your role cannot open company inventory." });
      return;
    }

    const organizationId = parseRequiredNumber(inventoryOrgId, "Company");

    if (!isAdmin && organizationId !== currentUser?.organizationId) {
      setFeedback("organizations", {
        tone: "error",
        message: "Leaders can only load inventory for their own company.",
      });
      return;
    }

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
    organizationId: isLeader ? currentUser?.organizationId ?? null : parseOptionalNumber(productForm.organizationId),
  });

  const handleCreateProduct = async (legacy = false) => {
    if (!canManageProducts) {
      setFeedback("products", { tone: "error", message: "Your role can only view assets assigned to you." });
      return;
    }

    const endpoint = legacy ? "/product/add" : "/product";

    const product = await runAction(
      "products",
      () =>
        apiRequest<ProductDto>(endpoint, {
          method: "POST",
          json: buildProductPayload(),
        }),
      legacy ? "Product created in compatibility mode." : "Product created.",
    );

    if (!product) {
      return;
    }

    setSelectedProduct(product);
    await refreshProductsList();
  };

  const handleUpdateProduct = async () => {
    if (!canManageProducts) {
      setFeedback("products", { tone: "error", message: "Only admins and leaders can edit asset records." });
      return;
    }

    const productId = parseRequiredNumber(productForm.id, "Asset");

    if (!isAdmin && !accessibleProductIds.has(productId)) {
      setFeedback("products", { tone: "error", message: "You can only update assets inside your company scope." });
      return;
    }

    const payload = {
      productType: productForm.productType.trim() || undefined,
      productBrand: productForm.productBrand.trim() || undefined,
      productModel: productForm.productModel.trim() || undefined,
      assetTag: productForm.assetTag.trim() || undefined,
      organizationId: isLeader ? currentUser?.organizationId ?? null : parseOptionalNumber(productForm.organizationId),
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
    const nextProducts = await runAction(
      "products",
      async () => {
        if (!currentUser) {
          return [];
        }

        if (currentUser.role === "ADMIN") {
          return apiRequest<ProductDto[]>("/product/all");
        }

        if (currentUser.role === "LEADER" && currentUser.organizationId != null) {
          return apiRequest<ProductDto[]>(`/product/org/${currentUser.organizationId}`);
        }

        return products;
      },
      isAdmin ? "Products loaded." : isLeader ? "Company assets loaded." : "Your assigned assets are already in view.",
    );

    if (nextProducts) {
      setProducts(nextProducts);
    }
  };

  const handleLookupProduct = async () => {
    const productId = parseRequiredNumber(productLookupId, "Asset");

    if (!isAdmin && !accessibleProductIds.has(productId)) {
      setFeedback("products", {
        tone: "error",
        message: "You can only open assets that are already in your allowed workspace scope.",
      });
      return;
    }

    const localProduct = products.find((product) => product.id === productId);
    const product = await runAction(
      "products",
      () => (localProduct && !isAdmin ? Promise.resolve(localProduct) : apiRequest<ProductDto>(`/product/${productId}`)),
      "Product loaded.",
    );

    if (product) {
      setSelectedProduct(product);
    }
  };

  const handleSearchProductByAssetTag = async () => {
    const assetTag = requireText(productAssetTag, "Asset tag");
    const product = await runAction("products", async () => {
      if (isAdmin) {
        return apiRequest<ProductDto>(`/product/asset/${encodeURIComponent(assetTag)}`);
      }

      const match = products.find((candidate) => candidate.assetTag.toLowerCase() === assetTag.toLowerCase());
      if (!match) {
        throw new Error("No asset with that tag is visible in your current workspace scope.");
      }

      return match;
    }, "Asset tag search complete.");

    if (product) {
      setSelectedProduct(product);
    }
  };

  const handleSearchProductByType = async () => {
    const productType = requireText(productTypeQuery, "Product type");
    const result = await runAction("products", async () => {
      if (isAdmin) {
        return apiRequest<ProductDto[]>(`/product/search/type/${encodeURIComponent(productType)}`);
      }

      return products.filter((product) => product.productType.toLowerCase().includes(productType.toLowerCase()));
    }, "Type search complete.");

    if (result) {
      setProductTypeResults(result);
    }
  };

  const handleDeleteProduct = async () => {
    if (!canManageProducts) {
      setFeedback("products", { tone: "error", message: "Only admins and leaders can delete asset records." });
      return;
    }

    const productId = parseRequiredNumber(productLookupId || productForm.id, "Asset");

    if (!isAdmin && !accessibleProductIds.has(productId)) {
      setFeedback("products", { tone: "error", message: "You can only delete assets from your company scope." });
      return;
    }

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
    employeeId: parseRequiredNumber(assignmentForm.employeeId, "Teammate"),
    productId: parseRequiredNumber(assignmentForm.productId, "Asset"),
    dateAssigned: toIsoDateTime(assignmentForm.dateAssigned),
    dateReturned: toIsoDateTime(assignmentForm.dateReturned),
  });

  const handleCreateAssignment = async () => {
    if (!canManageAssignments) {
      setFeedback("assignments", {
        tone: "error",
        message: "Your role can only review assignments already linked to your account.",
      });
      return;
    }

    const payload = buildAssignmentPayload();

    if (!isAdmin && (!accessibleUserIds.has(payload.employeeId) || !accessibleProductIds.has(payload.productId))) {
      setFeedback("assignments", {
        tone: "error",
        message: "Leaders can only assign assets to teammates and products inside their company scope.",
      });
      return;
    }

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
    if (!canManageAssignments) {
      setFeedback("assignments", { tone: "error", message: "Only admins and leaders can edit assignments." });
      return;
    }

    const assignmentId = parseRequiredNumber(assignmentForm.id, "Assignment");

    if (!isAdmin && !accessibleAssignmentIds.has(assignmentId)) {
      setFeedback("assignments", {
        tone: "error",
        message: "You can only update assignments that belong to your company scope.",
      });
      return;
    }

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
    const assignmentId = parseRequiredNumber(assignmentLookupId, "Assignment");

    if (!isAdmin && !accessibleAssignmentIds.has(assignmentId)) {
      setFeedback("assignments", {
        tone: "error",
        message: "You can only open assignments that are already in your allowed workspace scope.",
      });
      return;
    }

    const localAssignment = assignments.find((assignment) => assignment.id === assignmentId);
    const assignment = await runAction(
      "assignments",
      () =>
        localAssignment && !isAdmin
          ? Promise.resolve(localAssignment)
          : apiRequest<AssignmentDto>(`/assignment/get/${assignmentId}`),
      "Assignment loaded.",
    );

    if (assignment) {
      setSelectedAssignment(assignment);
    }
  };

  const handleLoadAllAssignments = async () => {
    const nextAssignments = await runAction(
      "assignments",
      async () => {
        if (!currentUser) {
          return [];
        }

        if (currentUser.role === "ADMIN") {
          return apiRequest<AssignmentDto[]>("/assignment/all");
        }

        if (currentUser.role === "LEADER" && currentUser.organizationId != null) {
          return apiRequest<AssignmentDto[]>(`/assignment/org/${currentUser.organizationId}`);
        }

        if (typeof currentUser.id === "number") {
          return apiRequest<AssignmentDto[]>(`/assignment/user/${currentUser.id}`);
        }

        return [];
      },
      isAdmin ? "Assignments loaded." : isLeader ? "Company assignments loaded." : "Your assignments loaded.",
    );

    if (nextAssignments) {
      setAssignments(nextAssignments);
      if (isEmployee && currentUser?.id != null) {
        setUserAssignments(nextAssignments.filter((assignment) => assignment.employeeId === currentUser.id));
      }
    }
  };

  const handleLoadAssignmentsByUser = async () => {
    const userId = isEmployee && currentUser?.id != null ? currentUser.id : parseRequiredNumber(assignmentUserId, "Teammate");

    if (!isAdmin && !accessibleUserIds.has(userId)) {
      setFeedback("assignments", {
        tone: "error",
        message: "You can only review assignment history for teammates inside your allowed scope.",
      });
      return;
    }

    const result = await runAction(
      "assignments",
      () =>
        isAdmin
          ? apiRequest<AssignmentDto[]>(`/assignment/user/${userId}`)
          : Promise.resolve(assignments.filter((assignment) => assignment.employeeId === userId)),
      "User assignments loaded.",
    );

    if (result) {
      setUserAssignments(result);
    }
  };

  const handleLoadAssignmentsByProduct = async () => {
    const productId = parseRequiredNumber(assignmentProductId, "Asset");

    if (!isAdmin && !accessibleProductIds.has(productId)) {
      setFeedback("assignments", {
        tone: "error",
        message: "You can only review assignment history for assets inside your allowed scope.",
      });
      return;
    }

    const result = await runAction(
      "assignments",
      () =>
        isAdmin
          ? apiRequest<AssignmentDto[]>(`/assignment/product/${productId}`)
          : Promise.resolve(assignments.filter((assignment) => assignment.productId === productId)),
      "Product assignments loaded.",
    );

    if (result) {
      setProductAssignments(result);
    }
  };

  const handleLoadCurrentAssignments = async () => {
    const result = await runAction(
      "assignments",
      () =>
        isAdmin ? apiRequest<AssignmentDto[]>("/assignment/current") : Promise.resolve(assignments.filter((assignment) => !assignment.dateReturned)),
      "Current assignments loaded.",
    );

    if (result) {
      setCurrentAssignments(result);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!canManageAssignments) {
      setFeedback("assignments", { tone: "error", message: "Only admins and leaders can delete assignments." });
      return;
    }

    const assignmentId = parseRequiredNumber(assignmentLookupId || assignmentForm.id, "Assignment");

    if (!isAdmin && !accessibleAssignmentIds.has(assignmentId)) {
      setFeedback("assignments", {
        tone: "error",
        message: "You can only delete assignments from your company scope.",
      });
      return;
    }

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
    if (!canManageProtocols) {
      setFeedback("protocols", {
        tone: "error",
        message: "Protocol access is reserved for admins and leaders.",
      });
      return;
    }

    const protocolId = parseRequiredNumber(protocolLookupId, "Protocol");

    if (!isAdmin && !accessibleProtocolIds.has(protocolId)) {
      setFeedback("protocols", {
        tone: "error",
        message: "You can only open protocols that belong to your allowed company scope.",
      });
      return;
    }

    const localProtocol = protocols.find((protocol) => protocol.id === protocolId);
    const protocol = await runAction(
      "protocols",
      () =>
        localProtocol && !isAdmin
          ? Promise.resolve(localProtocol)
          : apiRequest<ProtocolDto>(`/protocol/${protocolId}`),
      "Protocol loaded.",
    );

    if (protocol) {
      setSelectedProtocol(protocol);
    }
  };

  const handleCreateProtocol = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canManageProtocols) {
      setFeedback("protocols", {
        tone: "error",
        message: "Protocol creation is reserved for admins and leaders.",
      });
      return;
    }

    const organizationId = isLeader
      ? currentUser?.organizationId ?? parseRequiredNumber(protocolCreateForm.organizationId, "Company")
      : parseRequiredNumber(protocolCreateForm.organizationId, "Company");
    const userId = parseRequiredNumber(protocolCreateForm.userId, "Teammate");

    if (!isAdmin && organizationId !== currentUser?.organizationId) {
      setFeedback("protocols", {
        tone: "error",
        message: "Leaders can only create protocols for their own company.",
      });
      return;
    }

    if (!isAdmin && !accessibleUserIds.has(userId)) {
      setFeedback("protocols", {
        tone: "error",
        message: "You can only create protocols for teammates inside your company scope.",
      });
      return;
    }

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
      await refreshWorkspaceSnapshot();
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

  return {
    aiPrompt,
    aiResult,
    allOrganizations,
    canCreateOrganizations,
    canDeleteUsers,
    canManageAssignments,
    canManageOrganizationMembers,
    canManageOrganizations,
    canManageProducts,
    canManageProtocols,
    canManageUsers,
    assignmentForm,
    assignmentLookupId,
    assignmentOptions,
    assignmentProductId,
    assignmentUserId,
    assignments,
    becomeLeaderForm,
    bootstrapError,
    bootstrapping,
    currentAssignments,
    currentUser,
    deleteUserId,
    employeeOptions,
    feedbackByKey,
    getOrganizationName,
    getProductName,
    getUserName,
    handleBecomeLeader,
    handleCreateAssignment,
    handleCreateOrganization,
    handleCreateProduct,
    handleCreateProtocol,
    handleDeleteAssignment,
    handleDeleteProduct,
    handleDeleteUser,
    handleGenerateAiResponse,
    handleJoinOrganization,
    handleLoadAllAssignments,
    handleLoadAllProducts,
    handleLoadAssignmentsByProduct,
    handleLoadAssignmentsByUser,
    handleLoadCurrentAssignments,
    handleLoadOrganizationInventory,
    handleLoadUsers,
    handleLookupAssignment,
    handleLookupOrganization,
    handleLookupProduct,
    handleLookupProtocol,
    handleLookupUser,
    handleProfileUpdate,
    handleSearchProductByAssetTag,
    handleSearchProductByType,
    handleSignOut,
    handleUpdateAssignment,
    handleUpdateProduct,
    handleWorkspaceRefresh,
    inventoryOrgId,
    isAdmin,
    isEmployee,
    isLeader,
    joinOrganizationForm,
    leaderOptions,
    leaderOrganization,
    myAssignmentsCount,
    organizationCreateForm,
    organizationInventory,
    organizationLookupLeaderId,
    organizationOptions,
    pendingByKey,
    productAssetTag,
    productAssignments,
    productForm,
    productLookupId,
    productOptions,
    productTypeQuery,
    productTypeResults,
    products,
    profileForm,
    protocolCreateForm,
    protocolLookupId,
    protocolOptions,
    protocols,
    protocolUserOptions,
    selectedAssignment,
    selectedProduct,
    selectedProtocol,
    selectedProtocolOrganizationId,
    selectedUser,
    session,
    sessionChecked,
    setAiPrompt,
    setAssignmentForm,
    setAssignmentLookupId,
    setAssignmentProductId,
    setAssignmentUserId,
    setBecomeLeaderForm,
    setDeleteUserId,
    setInventoryOrgId,
    setJoinOrganizationForm,
    setOrganizationCreateForm,
    setOrganizationLookupLeaderId,
    setProductAssetTag,
    setProductForm,
    setProductLookupId,
    setProductTypeQuery,
    setProfileForm,
    setProtocolCreateForm,
    setProtocolLookupId,
    setSelectedUser,
    setUserLookupId,
    userAssignments,
    userLookupId,
    userOptions,
    users,
    visibleSections,
    workspaceScopeLabel,
    workspaceSectionBadges,
    populateAssignmentForm,
    populateProductForm,
  };
}

export type AccountWorkspaceState = ReturnType<typeof useAccountWorkspace>;

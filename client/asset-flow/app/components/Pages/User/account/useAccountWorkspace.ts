"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { apiRequest, getErrorMessage } from "@/app/lib/api";
import { getRoleLabel, useTranslations } from "@/app/lib/i18n";
import {
  clearAuthSession,
  readAuthSession,
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

import { createOrganizationOperations } from "./operations/organizations";
import { createProductOperations } from "./operations/products";
import { createProtocolOperations } from "./operations/protocols";
import { createUserOperations } from "./operations/users";
import type {
  AssignmentFormState,
  BecomeLeaderFormState,
  Feedback,
  JoinOrganizationFormState,
  KnownOrganization,
  OrganizationCreateFormState,
  ProductFormState,
  ProfileFormState,
  ProtocolCreateFormState,
  SelectOption,
  WorkspaceSnapshot,
} from "./types";
import {
  getWorkspaceSections,
  parseOptionalNumber,
  parseRequiredNumber,
  requireText,
  toIsoDateTime,
  toLocalDateTime,
} from "./utils";
import {
  buildOrganizationPlaceholder,
  dedupeById,
  ensureUserIncluded,
  syncSelectedItem,
} from "./workspaceHelpers";

export function useAccountWorkspace() {
  const router = useRouter();
  const { t } = useTranslations();
  const seededIdsRef = React.useRef(false);

  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [sessionChecked, setSessionChecked] = React.useState(false);
  const [bootstrapping, setBootstrapping] = React.useState(true);
  const [bootstrapError, setBootstrapError] = React.useState<string | null>(null);

  const [feedbackByKey, setFeedbackByKey] = React.useState<Record<string, Feedback | undefined>>({});
  const [pendingByKey, setPendingByKey] = React.useState<Record<string, boolean>>({});

  const [currentUser, setCurrentUser] = React.useState<UserDto | null>(null);
  const [users, setUsers] = React.useState<UserDto[]>([]);
  const [directoryUsers, setDirectoryUsers] = React.useState<UserDto[]>([]);
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

  const [profileForm, setProfileForm] = React.useState<ProfileFormState>({
    fullName: "",
    email: "",
    password: "",
    role: "EMPLOYEE" as UserDto["role"],
    age: "",
  });

  const [userLookupId, setUserLookupId] = React.useState("");
  const [deleteUserId, setDeleteUserId] = React.useState("");

  const [organizationLookupLeaderId, setOrganizationLookupLeaderId] = React.useState("");
  const [organizationCreateForm, setOrganizationCreateForm] = React.useState<OrganizationCreateFormState>({
    leaderId: "",
    organizationName: "",
  });
  const [joinOrganizationForm, setJoinOrganizationForm] = React.useState<JoinOrganizationFormState>({
    userId: "",
    organizationId: "",
  });
  const [becomeLeaderForm, setBecomeLeaderForm] = React.useState<BecomeLeaderFormState>({
    userId: "",
    organizationId: "",
  });
  const [inventoryOrgId, setInventoryOrgId] = React.useState("");

  const [productForm, setProductForm] = React.useState<ProductFormState>({
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

  const [assignmentForm, setAssignmentForm] = React.useState<AssignmentFormState>({
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
  const [protocolCreateForm, setProtocolCreateForm] = React.useState<ProtocolCreateFormState>({
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
  const canManageOrganizationMembers = isAdmin || isLeader;
  const canCreateOrganizations = isLeader;
  //const canHireEmployees = isLeader;

  const workspaceScopeLabel = isAdmin
    ? t("workspace.scope.allCompanyData")
    : isLeader
      ? t("workspace.scope.yourCompanyOnly")
      : t("workspace.scope.yourRecordsOnly");
  const workspaceVisibilityLabel = isAdmin
    ? t("workspace.scope.allowedAdminData")
    : isLeader
      ? t("workspace.scope.yourCompany")
      : t("workspace.scope.yourOwnRecords");
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

  const requiredFieldMessage = React.useCallback(
    (fieldKey: string) => t("feedback.fieldRequired", { field: t(fieldKey) }),
    [t],
  );

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

    const loadAssignmentsByIds = async (assignmentIds: Array<number | null | undefined>) => {
      const normalizedIds = [...new Set(assignmentIds.filter((assignmentId): assignmentId is number => Number.isFinite(assignmentId)))];

      if (normalizedIds.length === 0) {
        return [];
      }

      const results = await Promise.allSettled(
        normalizedIds.map((assignmentId) => apiRequest<AssignmentDto>(`/assignment/get/${assignmentId}`)),
      );

      if (results.some((result) => result.status === "rejected")) {
        rememberError(t("feedback.assignments"));
      }

      return dedupeById(
        results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : [])),
      ).sort((left, right) => (right.id ?? 0) - (left.id ?? 0));
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
        rememberError(t("feedback.products"));
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
        rememberError(t("feedback.protocols"));
      }

      return dedupeById(
        results.flatMap((result) => (result.status === "fulfilled" ? result.value : [])),
      ).sort((left, right) => (right.id ?? 0) - (left.id ?? 0));
    };

    const nextCurrentUser = await loadOrFallback(
      t("feedback.currentUser"),
      () => apiRequest<UserDto>(`/auth/user/${activeSession.userId}`),
      null as UserDto | null,
    );

    if (!nextCurrentUser) {
      return {
        currentUser: null,
        users: [],
        directoryUsers: [],
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
            await loadOrFallback(t("feedback.users"), () => apiRequest<UserDto[]>("/auth/users"), []),
            nextCurrentUser,
          )
        : nextCurrentUser.role === "LEADER" && nextOrganizationId != null
          ? ensureUserIncluded(
              await loadOrFallback(
                t("feedback.users"),
                () => apiRequest<UserDto[]>(`/auth/users/org/${nextOrganizationId}`),
                [],
              ),
              nextCurrentUser,
            )
          : [nextCurrentUser];

    const nextDirectoryUsers =
      nextCurrentUser.role === "ADMIN"
        ? nextUsers
        : nextCurrentUser.role === "LEADER"
          ? ensureUserIncluded(
              await loadOrFallback(t("feedback.users"), () => apiRequest<UserDto[]>("/auth/users"), nextUsers),
              nextCurrentUser,
            )
          : [nextCurrentUser];

    const nextAssignments =
      nextCurrentUser.role === "ADMIN"
        ? await loadOrFallback(t("feedback.assignments"), () => apiRequest<AssignmentDto[]>("/assignment/all"), [])
        : nextCurrentUser.role === "LEADER" && nextOrganizationId != null
          ? await loadOrFallback(
              t("feedback.assignments"),
              () => apiRequest<AssignmentDto[]>(`/assignment/org/${nextOrganizationId}`),
              [],
            )
          : await (async () => {
              const assignmentDetails = await loadAssignmentsByIds(nextCurrentUser.assignmentIds ?? []);

              if (assignmentDetails.length > 0) {
                return assignmentDetails;
              }

              if (nextUserId == null) {
                return [];
              }

              return loadOrFallback(
                t("feedback.assignments"),
                () => apiRequest<AssignmentDto[]>(`/assignment/user/${nextUserId}`),
                [],
              );
            })();

    const nextCurrentAssignments =
      nextCurrentUser.role === "ADMIN"
        ? await loadOrFallback(t("feedback.currentAssignments"), () => apiRequest<AssignmentDto[]>("/assignment/current"), [])
        : nextAssignments.filter((assignment) => !assignment.dateReturned);

    const nextProducts =
      nextCurrentUser.role === "ADMIN"
        ? await loadOrFallback(t("feedback.products"), () => apiRequest<ProductDto[]>("/product/all"), [])
        : nextCurrentUser.role === "LEADER" && nextOrganizationId != null
          ? await loadOrFallback(
              t("feedback.products"),
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
          rememberError(t("feedback.organizations"));
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
            t("feedback.organizations"),
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
              t("fallback.currentCompany"),
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
            t("fallback.yourCompany"),
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
      directoryUsers: nextDirectoryUsers,
      organizations: nextOrganizations,
      leaderOrganization: nextLeaderOrganization,
      organizationInventory: nextCurrentUser.role === "LEADER" ? nextProducts : [],
      products: nextProducts,
      assignments: nextAssignments,
      currentAssignments: nextCurrentAssignments,
      protocols: nextProtocols,
      errors,
    };
  }, [t]);

  const applyWorkspaceSnapshot = React.useCallback((snapshot: WorkspaceSnapshot) => {
    if (!snapshot.currentUser) {
      setCurrentUser(null);
      setUsers([]);
      setDirectoryUsers([]);
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
    setDirectoryUsers(snapshot.directoryUsers);
    setOrganizations(snapshot.organizations);
    setLeaderOrganization(snapshot.leaderOrganization);
    setOrganizationInventory(snapshot.organizationInventory);
    setProducts(snapshot.products);
    setAssignments(snapshot.assignments);
    setCurrentAssignments(snapshot.currentAssignments);
    setProtocols(snapshot.protocols);

    setSelectedUser((previous) => syncSelectedItem(snapshot.directoryUsers, previous) ?? nextCurrentUser);
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
        directoryUsers: [],
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
        setBootstrapError(t("feedback.workspaceAccountLoadError"));
        setBootstrapping(false);
        return;
      }

      setBootstrapError(
        snapshot.errors.length > 0
          ? t("feedback.workspacePartialLoad", {
              items: snapshot.errors.join(", "),
              scope: workspaceVisibilityLabel,
            })
          : null,
      );
      setBootstrapping(false);
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [applyWorkspaceSnapshot, loadWorkspaceSnapshot, session, t, workspaceVisibilityLabel]);

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
    setJoinOrganizationForm((previous) => ({ ...previous, userId: isLeader ? "" : userIdValue }));
    setBecomeLeaderForm((previous) => ({ ...previous, userId: userIdValue }));
    setInventoryOrgId(organizationIdValue);
    setAssignmentForm((previous) => ({ ...previous, employeeId: userIdValue }));
    setAssignmentUserId(userIdValue);
    setProtocolCreateForm((previous) => ({ ...previous, userId: userIdValue, organizationId: organizationIdValue }));

    seededIdsRef.current = true;
  }, [currentUser, isLeader]);

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
      return t("common.notAssigned");
    }

    const user =
      directoryUsers.find((candidate) => candidate.id === userId) ??
      users.find((candidate) => candidate.id === userId) ??
      (currentUser?.id === userId ? currentUser : null);
    return user ? user.fullName : t("fallback.unknownTeammate");
  };

  const getUserOptionLabel = (user: UserDto) =>
    typeof user.id === "number" ? `${user.fullName}#${user.id}` : user.fullName;

  const getOrganizationName = (organizationId?: number | null) => {
    if (organizationId == null) {
      return t("common.notAssigned");
    }

    const organization = allOrganizations.find((candidate) => candidate.id === organizationId);
    if (organization) {
      return organization.organizationName;
    }

    if (organizationId === currentUser?.organizationId) {
      return isEmployee ? t("fallback.yourCompany") : t("fallback.currentCompany");
    }

    return t("fallback.unknownCompany");
  };

  const getOrganizationOptionLabel = (organization: KnownOrganization) =>
    organization.leaderName
      ? `${organization.organizationName} • ${t("organizations.leader")}: ${organization.leaderName}`
      : organization.organizationName;

  const getProductLabel = (product?: ProductDto | null) => {
    if (!product) {
      return t("fallback.unknownAsset");
    }

    return `${product.productBrand} ${product.productModel} • ${product.assetTag}`;
  };

  const getProductName = (productId?: number | null) => {
    if (productId == null) {
      return t("common.noAssetSelected");
    }

    const product = products.find((candidate) => candidate.id === productId);
    return product ? getProductLabel(product) : t("fallback.unknownAsset");
  };

  const leaderUsers = users.filter((user) => user.role === "LEADER" && typeof user.id === "number");
  const usersWithIds = users.filter((user) => typeof user.id === "number");
  const directoryUsersWithIds = directoryUsers.filter((user) => typeof user.id === "number");
  const employeeUsers = users.filter((user) => user.role === "EMPLOYEE" && typeof user.id === "number");
  const productsWithIds = products.filter((product) => typeof product.id === "number");
  const assignmentsWithIds = assignments.filter((assignment) => typeof assignment.id === "number");

  const userOptions: SelectOption[] = usersWithIds.map((user) => ({
    value: String(user.id),
    label: getUserOptionLabel(user),
  }));

  const directoryUserOptions: SelectOption[] = directoryUsersWithIds.map((user) => ({
    value: String(user.id),
    label: getUserOptionLabel(user),
  }));

  const joinOrganizationUserOptions: SelectOption[] = (isLeader
    ? directoryUsersWithIds.filter(
        (user) =>
          user.role === "EMPLOYEE" &&
          user.id !== currentUser?.id &&
          (currentUser?.organizationId == null || user.organizationId !== currentUser.organizationId),
      )
    : usersWithIds
  ).map((user) => ({
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
  const visibleUserIds = new Set(directoryUsersWithIds.map((user) => user.id as number));
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
    profile: getRoleLabel(currentUser?.role || session?.role, t),
    users: String(directoryUsers.length),
    organizations: String(allOrganizations.length),
    products: String(products.length),
    assignments: String(assignments.length),
    protocols: String(protocols.length),
    "ai-tools": aiResult ? t("workspace.status.ready") : t("workspace.status.live"),
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

  const reloadWorkspaceSnapshot = React.useCallback(async () => refreshWorkspaceSnapshot(), [refreshWorkspaceSnapshot]);

  const handleWorkspaceRefresh = async () => {
    if (!session) {
      return;
    }

    const refreshed = await runAction(
      "workspace",
      async () => {
        const snapshot = await refreshWorkspaceSnapshot();
        if (!snapshot?.currentUser) {
          throw new Error(t("feedback.workspaceRefreshError"));
        }
      },
      t("feedback.workspaceRefreshed"),
    );

    if (refreshed === null) {
      return;
    }
  };

  const {
    handleProfileUpdate,
    handleLoadUsers,
    handleLookupUser,
    handleDeleteUser,
  } = createUserOperations({
    session,
    currentUser,
    users,
    directoryUsers,
    profileForm,
    userLookupId,
    deleteUserId,
    isAdmin,
    isLeader,
    canDeleteUsers,
    visibleUserIds,
    runAction,
    setFeedback,
    requiredFieldMessage,
    setCurrentUser,
    setSelectedUser,
    setUsers,
    setDirectoryUsers,
    setProfileForm,
    handleSignOut,
    refreshWorkspaceSnapshot: reloadWorkspaceSnapshot,
    t,
  });

  const {
    handleLookupOrganization,
    handleCreateOrganization,
    handleJoinOrganization,
    handleBecomeLeader,
    handleLoadOrganizationInventory,
  } = createOrganizationOperations({
    session,
    currentUser,
    allOrganizations,
    leaderOrganization,
    organizationLookupLeaderId,
    organizationCreateForm,
    joinOrganizationForm,
    becomeLeaderForm,
    inventoryOrgId,
    isAdmin,
    isLeader,
    canManageOrganizations,
    canCreateOrganizations,
    canManageOrganizationMembers,
    runAction,
    setFeedback,
    requiredFieldMessage,
    setLeaderOrganization,
    setOrganizationInventory,
    refreshWorkspaceSnapshot: reloadWorkspaceSnapshot,
    refreshCurrentUserSnapshot,
    upsertOrganizationSummary,
    t,
  });

  const {
    handleCreateProduct,
    handleUpdateProduct,
    handleLoadAllProducts,
    handleLookupProduct,
    handleSearchProductByAssetTag,
    handleSearchProductByType,
    handleDeleteProduct,
  } = createProductOperations({
    currentUser,
    products,
    productForm,
    productLookupId,
    productAssetTag,
    productTypeQuery,
    isAdmin,
    isLeader,
    canManageProducts,
    accessibleProductIds,
    runAction,
    setFeedback,
    requiredFieldMessage,
    setSelectedProduct,
    setProducts,
    setProductTypeResults,
    setOrganizationInventory,
    refreshProductsList,
    getProductName,
    t,
  });

  const buildAssignmentPayload = () => ({
    employeeId: parseRequiredNumber(assignmentForm.employeeId, requiredFieldMessage("fields.teammate")),
    productId: parseRequiredNumber(assignmentForm.productId, requiredFieldMessage("fields.asset")),
    dateAssigned: toIsoDateTime(assignmentForm.dateAssigned),
    dateReturned: toIsoDateTime(assignmentForm.dateReturned),
  });

  const handleCreateAssignment = async () => {
    if (!canManageAssignments) {
      setFeedback("assignments", {
        tone: "error",
        message: t("feedback.restrictedAssignmentReview"),
      });
      return;
    }

    const payload = buildAssignmentPayload();

    if (!isAdmin && (!accessibleUserIds.has(payload.employeeId) || !accessibleProductIds.has(payload.productId))) {
      setFeedback("assignments", {
        tone: "error",
        message: t("feedback.leadersAssignWithinScope"),
      });
      return;
    }

    if (!payload.dateAssigned) {
      setFeedback("assignments", { tone: "error", message: t("feedback.assignedDateRequired") });
      return;
    }

    const assignment = await runAction(
      "assignments",
      () =>
        apiRequest<AssignmentDto>("/assignment/add", {
          method: "POST",
          json: payload,
        }),
      t("feedback.assignmentCreated"),
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
      setFeedback("assignments", { tone: "error", message: t("feedback.onlyAdminsLeadersEditAssignments") });
      return;
    }

    const assignmentId = parseRequiredNumber(assignmentForm.id, requiredFieldMessage("fields.assignment"));

    if (!isAdmin && !accessibleAssignmentIds.has(assignmentId)) {
      setFeedback("assignments", {
        tone: "error",
        message: t("feedback.onlyCompanyAssignmentsUpdate"),
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
      t("feedback.assignmentUpdated"),
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
    const assignmentId = parseRequiredNumber(assignmentLookupId, requiredFieldMessage("fields.assignment"));

    if (!isAdmin && !accessibleAssignmentIds.has(assignmentId)) {
      setFeedback("assignments", {
        tone: "error",
        message: t("feedback.onlyVisibleAssignmentsOpen"),
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
      t("feedback.assignmentLoaded"),
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

        if (currentUser.role === "EMPLOYEE") {
          const snapshot = await refreshWorkspaceSnapshot();
          return snapshot?.assignments ?? [];
        }

        if (typeof currentUser.id === "number") {
          return apiRequest<AssignmentDto[]>(`/assignment/user/${currentUser.id}`);
        }

        return [];
      },
      isAdmin ? t("feedback.assignmentsLoaded") : isLeader ? t("feedback.companyAssignmentsLoaded") : t("feedback.yourAssignmentsLoaded"),
    );

    if (nextAssignments) {
      setAssignments(nextAssignments);
      if (isEmployee && currentUser?.id != null) {
        setUserAssignments(nextAssignments.filter((assignment) => assignment.employeeId === currentUser.id));
      }
    }
  };

  const handleLoadAssignmentsByUser = async () => {
    const userId =
      isEmployee && currentUser?.id != null
        ? currentUser.id
        : parseRequiredNumber(assignmentUserId, requiredFieldMessage("fields.teammate"));

    if (!isAdmin && !accessibleUserIds.has(userId)) {
      setFeedback("assignments", {
        tone: "error",
        message: t("feedback.onlyScopeTeammateHistory"),
      });
      return;
    }

    const result = await runAction(
      "assignments",
      () =>
        isAdmin
          ? apiRequest<AssignmentDto[]>(`/assignment/user/${userId}`)
          : Promise.resolve(assignments.filter((assignment) => assignment.employeeId === userId)),
      t("feedback.userAssignmentsLoaded"),
    );

    if (result) {
      setUserAssignments(result);
    }
  };

  const handleLoadAssignmentsByProduct = async () => {
    const productId = parseRequiredNumber(assignmentProductId, requiredFieldMessage("fields.asset"));

    if (!isAdmin && !accessibleProductIds.has(productId)) {
      setFeedback("assignments", {
        tone: "error",
        message: t("feedback.onlyScopeAssetHistory"),
      });
      return;
    }

    const result = await runAction(
      "assignments",
      () =>
        isAdmin
          ? apiRequest<AssignmentDto[]>(`/assignment/product/${productId}`)
          : Promise.resolve(assignments.filter((assignment) => assignment.productId === productId)),
      t("feedback.productAssignmentsLoaded"),
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
      t("feedback.currentAssignmentsLoaded"),
    );

    if (result) {
      setCurrentAssignments(result);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!canManageAssignments) {
      setFeedback("assignments", { tone: "error", message: t("feedback.onlyAdminsLeadersDeleteAssignments") });
      return;
    }

    const assignmentId = parseRequiredNumber(
      assignmentLookupId || assignmentForm.id,
      requiredFieldMessage("fields.assignment"),
    );

    if (!isAdmin && !accessibleAssignmentIds.has(assignmentId)) {
      setFeedback("assignments", {
        tone: "error",
        message: t("feedback.onlyCompanyAssignmentsDelete"),
      });
      return;
    }

    if (!window.confirm(t("feedback.deleteAssignmentConfirm", { id: assignmentId }))) {
      return;
    }

    const result = await runAction(
      "assignments",
      () =>
        apiRequest<void>(`/assignment/delete/${assignmentId}`, {
          method: "DELETE",
        }),
      t("feedback.assignmentDeleted"),
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

  const { handleLookupProtocol, handleCreateProtocol } = createProtocolOperations({
    currentUser,
    protocols,
    protocolLookupId,
    protocolCreateForm,
    isAdmin,
    canManageProtocols,
    accessibleProtocolIds,
    accessibleUserIds,
    runAction,
    setFeedback,
    requiredFieldMessage,
    setSelectedProtocol,
    refreshWorkspaceSnapshot: reloadWorkspaceSnapshot,
    t,
  });

  const handleGenerateAiResponse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const prompt = requireText(aiPrompt, requiredFieldMessage("fields.prompt"));
    const response = await runAction(
      "ai",
      () =>
        apiRequest<AiResponseDto>("/ai/generate", {
          method: "POST",
          searchParams: { prompt },
        }),
      t("ai.generated"),
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
    directoryUserOptions,
    directoryUsers,
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
    joinOrganizationUserOptions,
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

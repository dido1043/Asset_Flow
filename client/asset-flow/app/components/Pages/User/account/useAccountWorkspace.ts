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
  parseOptionalNumber,
  parseRequiredNumber,
  requireText,
  toIsoDateTime,
  toLocalDateTime,
} from "./utils";

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
    return organization ? organization.organizationName : "Unknown company";
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
    protocols: selectedProtocol?.id ? `#${selectedProtocol.id}` : "PDF",
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

    const refreshed = await runAction(
      "workspace",
      async () => {
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
          role: profileForm.role,
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
    const nextUsers = await runAction("users", () => apiRequest<UserDto[]>("/auth/users"), "Users loaded.");
    if (nextUsers) {
      setUsers(nextUsers);
    }
  };

  const handleLookupUser = async () => {
    const userId = parseRequiredNumber(userLookupId, "Teammate");
    const user = await runAction("users", () => apiRequest<UserDto>(`/auth/user/${userId}`), "User loaded.");
    if (user) {
      setSelectedUser(user);
    }
  };

  const handleDeleteUser = async () => {
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
    }
  };

  const handleLookupOrganization = async () => {
    const leaderId = parseRequiredNumber(organizationLookupLeaderId, "Leader");
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
    if (session?.userId === leaderId) {
      await refreshCurrentUserSnapshot();
    }
    await refreshUsersList();
  };

  const handleJoinOrganization = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
    if (session?.userId === userId) {
      await refreshCurrentUserSnapshot();
    }
    await refreshUsersList();
  };

  const handleBecomeLeader = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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

    await refreshUsersList();
    const organization = await apiRequest<OrganizationDto>(`/org/leader/${userId}`);
    setLeaderOrganization(organization);
    upsertOrganizationSummary(organization, userId);
  };

  const handleLoadOrganizationInventory = async () => {
    const organizationId = parseRequiredNumber(inventoryOrgId, "Company");
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
      legacy ? "Product created in compatibility mode." : "Product created.",
    );

    if (!product) {
      return;
    }

    setSelectedProduct(product);
    await refreshProductsList();
  };

  const handleUpdateProduct = async () => {
    const productId = parseRequiredNumber(productForm.id, "Asset");

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
    const productId = parseRequiredNumber(productLookupId, "Asset");
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
    const productId = parseRequiredNumber(productLookupId || productForm.id, "Asset");

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
    const assignmentId = parseRequiredNumber(assignmentForm.id, "Assignment");

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
    const userId = parseRequiredNumber(assignmentUserId, "Teammate");
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
    const productId = parseRequiredNumber(assignmentProductId, "Asset");
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
    const assignmentId = parseRequiredNumber(assignmentLookupId || assignmentForm.id, "Assignment");

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
    const protocolId = parseRequiredNumber(protocolLookupId, "Protocol");
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

    const organizationId = parseRequiredNumber(protocolCreateForm.organizationId, "Company");
    const userId = parseRequiredNumber(protocolCreateForm.userId, "Teammate");

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

  return {
    aiPrompt,
    aiResult,
    allOrganizations,
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
    workspaceSectionBadges,
    populateAssignmentForm,
    populateProductForm,
  };
}

export type AccountWorkspaceState = ReturnType<typeof useAccountWorkspace>;

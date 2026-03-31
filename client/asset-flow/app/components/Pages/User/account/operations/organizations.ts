import type { FormEvent } from "react";

import { apiRequest } from "@/app/lib/api";
import { saveAuthSession } from "@/app/lib/session";
import type { AuthSession, OrganizationDto, ProductDto, UserDto } from "@/app/lib/types";

import type {
  BecomeLeaderFormState,
  JoinOrganizationFormState,
  KnownOrganization,
  OrganizationCreateFormState,
} from "../types";
import { parseRequiredNumber, requireText } from "../utils";
import type {
  RefreshCurrentUser,
  ReloadWorkspace,
  RequiredFieldMessage,
  RunAction,
  SetFeedback,
  StateSetter,
  Translate,
  UpsertOrganizationSummary,
} from "./shared";

type OrganizationOperationsParams = {
  session: AuthSession | null;
  currentUser: UserDto | null;
  allOrganizations: KnownOrganization[];
  leaderOrganization: OrganizationDto | null;
  organizationLookupLeaderId: string;
  organizationCreateForm: OrganizationCreateFormState;
  joinOrganizationForm: JoinOrganizationFormState;
  becomeLeaderForm: BecomeLeaderFormState;
  inventoryOrgId: string;
  isAdmin: boolean;
  isLeader: boolean;
  canManageOrganizations: boolean;
  canCreateOrganizations: boolean;
  canManageOrganizationMembers: boolean;
  runAction: RunAction;
  setFeedback: SetFeedback;
  requiredFieldMessage: RequiredFieldMessage;
  setLeaderOrganization: StateSetter<OrganizationDto | null>;
  setOrganizationInventory: StateSetter<ProductDto[]>;
  refreshWorkspaceSnapshot: ReloadWorkspace;
  refreshCurrentUserSnapshot: RefreshCurrentUser;
  upsertOrganizationSummary: UpsertOrganizationSummary;
  t: Translate;
};

export function createOrganizationOperations({
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
  refreshWorkspaceSnapshot,
  refreshCurrentUserSnapshot,
  upsertOrganizationSummary,
  t,
}: OrganizationOperationsParams) {
  const handleLookupOrganization = async () => {
    if (!canManageOrganizations) {
      setFeedback("organizations", { tone: "error", message: t("feedback.restrictedCompanyRecords") });
      return;
    }

    const organization = await runAction(
      "organizations",
      async () => {
        if (isLeader) {
          return allOrganizations.find((candidate) => candidate.id === currentUser?.organizationId) ?? leaderOrganization;
        }

        const leaderId = parseRequiredNumber(organizationLookupLeaderId, requiredFieldMessage("fields.leader"));
        return apiRequest<OrganizationDto>(`/org/leader/${leaderId}`);
      },
      t("feedback.organizationLoaded"),
    );

    if (organization) {
      setLeaderOrganization(organization);
      if (isAdmin) {
        const leaderId = parseRequiredNumber(organizationLookupLeaderId, requiredFieldMessage("fields.leader"));
        upsertOrganizationSummary(organization, leaderId);
      }
    }
  };

  const handleCreateOrganization = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canCreateOrganizations) {
      setFeedback("organizations", { tone: "error", message: t("feedback.onlyLeadersCanCreateCompanies") });
      return;
    }

    const leaderId = parseRequiredNumber(organizationCreateForm.leaderId, requiredFieldMessage("fields.leader"));
    const organizationName = requireText(
      organizationCreateForm.organizationName,
      requiredFieldMessage("fields.organizationName"),
    );

    const organization = await runAction(
      "organizations",
      () =>
        apiRequest<OrganizationDto>(`/org/create/${leaderId}`, {
          method: "POST",
          json: { organizationName },
        }),
      t("feedback.organizationCreated"),
    );

    if (!organization) {
      return;
    }

    setLeaderOrganization(organization);
    upsertOrganizationSummary(organization, leaderId);
    await refreshWorkspaceSnapshot();
  };

  const handleJoinOrganization = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canManageOrganizationMembers) {
      setFeedback("organizations", {
        tone: "error",
        message: t("feedback.onlyAdminsMoveUsers"),
      });
      return;
    }

    const userId = parseRequiredNumber(joinOrganizationForm.userId, requiredFieldMessage("fields.teammate"));
    const organizationId = parseRequiredNumber(joinOrganizationForm.organizationId, requiredFieldMessage("fields.company"));

    const organization = await runAction(
      "organizations",
      () =>
        apiRequest<OrganizationDto>(`/org/join/${userId}/${organizationId}`, {
          method: "POST",
        }),
      t("feedback.organizationJoined"),
    );

    if (!organization) {
      return;
    }

    setLeaderOrganization(organization);
    upsertOrganizationSummary(organization);
    await refreshWorkspaceSnapshot();
  };

  const handleBecomeLeader = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canManageOrganizationMembers) {
      setFeedback("organizations", {
        tone: "error",
        message: t("feedback.onlyAdminsAssignLeaders"),
      });
      return;
    }

    const userId = parseRequiredNumber(becomeLeaderForm.userId, requiredFieldMessage("fields.teammate"));
    const organizationId = parseRequiredNumber(becomeLeaderForm.organizationId, requiredFieldMessage("fields.company"));

    const result = await runAction(
      "organizations",
      () =>
        apiRequest<void>(`/org/becomeLeader/${userId}/${organizationId}`, {
          method: "POST",
        }),
      t("feedback.leaderUpdated"),
    );

    if (result === null) {
      return;
    }

    if (session?.userId === userId) {
      await refreshCurrentUserSnapshot();
      saveAuthSession({
        ...session,
        role: "LEADER",
        issuedAt: session.issuedAt,
      });
    }

    await refreshWorkspaceSnapshot();
    const organization = await apiRequest<OrganizationDto>(`/org/leader/${userId}`);
    setLeaderOrganization(organization);
    upsertOrganizationSummary(organization, userId);
  };

  const handleLoadOrganizationInventory = async () => {
    if (!canManageOrganizations) {
      setFeedback("organizations", { tone: "error", message: t("feedback.restrictedInventory") });
      return;
    }

    const organizationId = parseRequiredNumber(inventoryOrgId, requiredFieldMessage("fields.company"));

    if (!isAdmin && organizationId !== currentUser?.organizationId) {
      setFeedback("organizations", {
        tone: "error",
        message: t("feedback.leadersOwnInventoryOnly"),
      });
      return;
    }

    const inventory = await runAction(
      "organizations",
      () => apiRequest<ProductDto[]>(`/org/inventory/${organizationId}`),
      t("feedback.inventoryLoaded"),
    );

    if (inventory) {
      setOrganizationInventory(inventory);
    }
  };

  return {
    handleLookupOrganization,
    handleCreateOrganization,
    handleJoinOrganization,
    handleBecomeLeader,
    handleLoadOrganizationInventory,
  };
}

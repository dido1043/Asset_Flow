import type { FormEvent } from "react";

import { apiRequest } from "@/app/lib/api";
import type { ProtocolDto, UserDto } from "@/app/lib/types";

import type { ProtocolCreateFormState } from "../types";
import { parseRequiredNumber } from "../utils";
import type {
  ReloadWorkspace,
  RequiredFieldMessage,
  RunAction,
  SetFeedback,
  StateSetter,
  Translate,
} from "./shared";

type ProtocolOperationsParams = {
  currentUser: UserDto | null;
  protocols: ProtocolDto[];
  protocolLookupId: string;
  protocolCreateForm: ProtocolCreateFormState;
  isAdmin: boolean;
  canManageProtocols: boolean;
  accessibleProtocolIds: Set<number>;
  accessibleUserIds: Set<number>;
  runAction: RunAction;
  setFeedback: SetFeedback;
  requiredFieldMessage: RequiredFieldMessage;
  setSelectedProtocol: StateSetter<ProtocolDto | null>;
  refreshWorkspaceSnapshot: ReloadWorkspace;
  t: Translate;
};

export function createProtocolOperations({
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
  refreshWorkspaceSnapshot,
  t,
}: ProtocolOperationsParams) {
  const handleLookupProtocol = async () => {
    if (!canManageProtocols) {
      setFeedback("protocols", {
        tone: "error",
        message: t("feedback.protocolsAdminsLeadersOnly"),
      });
      return;
    }

    const protocolId = parseRequiredNumber(protocolLookupId, requiredFieldMessage("fields.protocol"));

    if (!isAdmin && !accessibleProtocolIds.has(protocolId)) {
      setFeedback("protocols", {
        tone: "error",
        message: t("feedback.onlyScopeProtocolsOpen"),
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
      t("feedback.protocolLoaded"),
    );

    if (protocol) {
      setSelectedProtocol(protocol);
    }
  };

  const handleCreateProtocol = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canManageProtocols) {
      setFeedback("protocols", {
        tone: "error",
        message: t("feedback.protocolCreationAdminsLeadersOnly"),
      });
      return;
    }

    const organizationId =
      currentUser?.role === "LEADER"
        ? currentUser.organizationId ??
          parseRequiredNumber(protocolCreateForm.organizationId, requiredFieldMessage("fields.company"))
        : parseRequiredNumber(protocolCreateForm.organizationId, requiredFieldMessage("fields.company"));
    const userId = parseRequiredNumber(protocolCreateForm.userId, requiredFieldMessage("fields.teammate"));

    if (!isAdmin && organizationId !== currentUser?.organizationId) {
      setFeedback("protocols", {
        tone: "error",
        message: t("feedback.leadersOwnProtocolsOnly"),
      });
      return;
    }

    if (!isAdmin && !accessibleUserIds.has(userId)) {
      setFeedback("protocols", {
        tone: "error",
        message: t("feedback.onlyScopeTeammateProtocols"),
      });
      return;
    }

    const protocol = await runAction(
      "protocols",
      () =>
        apiRequest<ProtocolDto>(`/protocol/create/${organizationId}/user/${userId}`, {
          method: "POST",
        }),
      t("feedback.protocolCreated"),
    );

    if (protocol) {
      setSelectedProtocol(protocol);
      await refreshWorkspaceSnapshot();
    }
  };

  return {
    handleLookupProtocol,
    handleCreateProtocol,
  };
}

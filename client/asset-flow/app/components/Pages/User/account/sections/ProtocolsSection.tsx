import { Button } from "@/app/components/shared/ui/Button";
import { Input } from "@/app/components/shared/ui/Input";
import { Label } from "@/app/components/shared/ui/Label";
import { buildApiUrl, getErrorMessage } from "@/app/lib/api";
import { useTranslations } from "@/app/lib/i18n";
import { readAuthSession } from "@/app/lib/session";
import type { ProtocolDto, ProtocolType } from "@/app/lib/types";
import React from "react";

import { FeedbackMessage, FieldHint, SectionCard, SelectField } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";

function normalizeProtocolType(type?: ProtocolDto["type"]): ProtocolType {
  return type === "ASSET_RETURN" ? "ASSET_RETURN" : "ASSET_ASSIGNMENT";
}

export function ProtocolsSection({ workspace }: { workspace: AccountWorkspaceState }) {
  const { t } = useTranslations();
  const {
    feedbackByKey,
    getOrganizationName,
    getUserName,
    handleCreateProtocol,
    isLeader,
    organizationOptions,
    pendingByKey,
    protocolCreateForm,
    protocols,
    protocolUserOptions,
    selectedProtocolOrganizationId,
    setProtocolCreateForm,
    currentUser,
    handleEditProtocol,
    isAdmin,
  } = workspace;

  const [editingProtocolId, setEditingProtocolId] = React.useState<number | null>(null);
  const [editContent, setEditContent] = React.useState("");
  const [expandedProtocolIds, setExpandedProtocolIds] = React.useState<Set<number>>(new Set());
  const [protocolTypeFilter, setProtocolTypeFilter] = React.useState<"" | ProtocolType>("");
  const [openError, setOpenError] = React.useState<string | null>(null);
  const [openingProtocolId, setOpeningProtocolId] = React.useState<number | null>(null);
  const protocolTypeOptions = React.useMemo(
    () => [
      { value: "ASSET_ASSIGNMENT", label: t("protocols.assignmentProtocol") },
      { value: "ASSET_RETURN", label: t("protocols.returnProtocol") },
    ],
    [t],
  );
  const protocolTypeFilterOptions = React.useMemo(
    () => [
      { value: "ASSET_ASSIGNMENT", label: t("protocols.assignmentProtocol") },
      { value: "ASSET_RETURN", label: t("protocols.returnProtocol") },
    ],
    [t],
  );
  const getProtocolTypeLabel = React.useCallback(
    (type: ProtocolType) => (type === "ASSET_RETURN" ? t("protocols.returnProtocol") : t("protocols.assignmentProtocol")),
    [t],
  );
  const visibleProtocols = React.useMemo(
    () =>
      protocols.filter(
        (protocol) => !protocolTypeFilter || normalizeProtocolType(protocol.type) === protocolTypeFilter,
      ),
    [protocolTypeFilter, protocols],
  );

  const canEditProtocol = (protocol: typeof protocols[0]) => {
    // Can edit if: user is the protocol owner OR user is admin OR user is leader in the same organization
    return (
      currentUser?.id === protocol.employeeId ||
      isAdmin ||
      (isLeader && protocol.organizationId === currentUser?.organizationId)
    );
  };

  const handleOpenEdit = (protocol: typeof protocols[0]) => {
    setEditingProtocolId(protocol.id ?? null);
    setEditContent(protocol.content ?? "");
  };

  const handleCloseEdit = () => {
    setEditingProtocolId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (protocolId: number) => {
    if (editContent.trim()) {
      await handleEditProtocol(protocolId, editContent);
      handleCloseEdit();
    }
  };

  const handleOpenProtocol = async (protocolId: number) => {
    setOpenError(null);
    setOpeningProtocolId(protocolId);

    const headers: HeadersInit = { Accept: "application/pdf" };
    const session = readAuthSession();
    if (session?.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }

    try {
      const response = await fetch(buildApiUrl(`/protocol/download/${protocolId}`), {
        headers,
        cache: "no-store",
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Request failed with ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      setOpenError(getErrorMessage(error));
    } finally {
      setOpeningProtocolId(null);
    }
  };

  const togglePreview = (protocolId: number) => {
    setExpandedProtocolIds((previous) => {
      const next = new Set(previous);
      if (next.has(protocolId)) {
        next.delete(protocolId);
      } else {
        next.add(protocolId);
      }
      return next;
    });
  };

  return (
    <SectionCard
      id="protocols"
      title={t("protocols.title")}
      description={
        isLeader
          ? t("protocols.descriptionLeader")
          : t("protocols.descriptionAdmin")
      }
    >
      <div className="space-y-5">
        <FeedbackMessage feedback={feedbackByKey.protocols} />
        {openError ? <FeedbackMessage feedback={{ tone: "error", message: openError }} /> : null}

        <form onSubmit={handleCreateProtocol} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">{t("protocols.createProtocol")}</p>
          <FieldHint>{t("protocols.hint")}</FieldHint>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField
              id="protocol-type"
              label={t("protocols.protocolType")}
              value={protocolCreateForm.type}
              onChange={(value) =>
                setProtocolCreateForm((previous) => ({
                  ...previous,
                  type: value === "ASSET_RETURN" ? "ASSET_RETURN" : "ASSET_ASSIGNMENT",
                }))
              }
              options={protocolTypeOptions}
              placeholder={t("protocols.selectProtocolType")}
            />
            {organizationOptions.length > 0 ? (
              <SelectField
                id="protocol-organization-id"
                label={t("common.company")}
                value={protocolCreateForm.organizationId}
                onChange={(value) =>
                  setProtocolCreateForm((previous) => ({
                    ...previous,
                    organizationId: value,
                  }))
                }
                options={organizationOptions}
                placeholder={t("registerForm.selectCompany")}
              />
            ) : (
              <div>
                <Label htmlFor="protocol-organization-id">{t("products.companyReference")}</Label>
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
                label={selectedProtocolOrganizationId == null ? t("common.teammate") : t("protocols.teammateInCompany")}
                value={protocolCreateForm.userId}
                onChange={(value) =>
                  setProtocolCreateForm((previous) => ({
                    ...previous,
                    userId: value,
                  }))
                }
                options={protocolUserOptions}
                placeholder={t("users.selectTeammate")}
              />
            ) : (
              <div>
                <Label htmlFor="protocol-user-id">{t("users.teammateReference")}</Label>
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
              {protocolCreateForm.type === "ASSET_RETURN"
                ? t("protocols.createReturnButton")
                : t("protocols.createButton")}
            </Button>
          </div>
        </form>

        {protocols.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-sm font-semibold text-slate-900">{isLeader ? t("protocols.companyProtocols") : t("protocols.visibleProtocols")}</p>
              <SelectField
                id="protocol-type-filter"
                label={t("protocols.filterByType")}
                value={protocolTypeFilter}
                onChange={(value) => setProtocolTypeFilter(value === "ASSET_RETURN" || value === "ASSET_ASSIGNMENT" ? value : "")}
                options={protocolTypeFilterOptions}
                placeholder={t("protocols.allProtocolTypes")}
                className="w-full sm:w-64"
              />
            </div>
            <div className="mt-4 grid gap-3">
              {visibleProtocols.length > 0 ? visibleProtocols.map((protocol) => {
                const protocolType = normalizeProtocolType(protocol.type);

                return (
                <div
                  key={protocol.id}
                  className={`rounded-2xl border border-slate-200 p-4 ${
                    editingProtocolId === protocol.id ? "bg-blue-50" : "bg-slate-50"
                  }`}
                >
                  {editingProtocolId === protocol.id ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-900">{t("protocols.editProtocol")}</p>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder={t("protocols.enterProtocolContent")}
                        className="w-full min-h-[28rem] rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 font-mono whitespace-pre"
                        rows={28}
                        spellCheck={false}
                        wrap="off"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveEdit(protocol.id ?? 0)}
                          disabled={!editContent.trim() || Boolean(pendingByKey.protocols)}
                        >
                          {t("common.save")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCloseEdit}
                          disabled={Boolean(pendingByKey.protocols)}
                        >
                          {t("common.cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{t("protocols.protocolLabel", { id: protocol.id ?? "" })}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {getUserName(protocol.employeeId)} • {getOrganizationName(protocol.organizationId)}
                          </p>
                          <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {getProtocolTypeLabel(protocolType)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => protocol.id != null && togglePreview(protocol.id)}
                          >
                            {protocol.id != null && expandedProtocolIds.has(protocol.id)
                              ? t("protocols.hidePreview")
                              : t("protocols.previewContent")}
                          </Button>
                          <Button
                            onClick={() => protocol.id != null && handleOpenProtocol(protocol.id)}
                            disabled={protocol.id == null || openingProtocolId === protocol.id}
                          >
                            {t("protocols.openProtocol")}
                          </Button>
                          {canEditProtocol(protocol) && (
                            <Button
                              variant="outline"
                              onClick={() => handleOpenEdit(protocol)}
                              disabled={Boolean(pendingByKey.protocols)}
                            >
                              {t("common.edit")}
                            </Button>
                          )}
                        </div>
                      </div>
                      {protocol.id != null && expandedProtocolIds.has(protocol.id) && (
                        <pre className="mt-4 max-h-[32rem] overflow-auto whitespace-pre rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 font-mono">
                          {protocol.content?.trim() ? protocol.content : t("protocols.noContent")}
                        </pre>
                      )}
                    </>
                  )}
                </div>
                );
              }) : (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  {t("protocols.noProtocolsForType")}
                </p>
              )}
            </div>
          </div>
        ) : null}

      </div>
    </SectionCard>
  );
}

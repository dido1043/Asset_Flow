import { Button } from "@/app/components/shared/ui/Button";
import { Input } from "@/app/components/shared/ui/Input";
import { Label } from "@/app/components/shared/ui/Label";
import { useTranslations } from "@/app/lib/i18n";
import React from "react";

import { FeedbackMessage, FieldHint, SectionCard, SelectField } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";

function getProtocolHref(protocolUri: string) {
  if (/^https?:\/\//i.test(protocolUri) || protocolUri.startsWith("/api/protocol-file")) {
    return protocolUri;
  }

  return `/api/protocol-file?path=${encodeURIComponent(protocolUri)}`;
}

function normalizeProtocolContentForEditing(content?: string | null) {
  if (!content) {
    return "";
  }

  let normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const trimmed = normalized.trim();

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "string") {
        normalized = parsed;
      }
    } catch {
      normalized = trimmed.slice(1, -1);
    }
  }

  normalized = normalized.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  while (/\\\\[nr]/.test(normalized)) {
    normalized = normalized.replace(/\\\\n/g, "\\n").replace(/\\\\r/g, "\\r");
  }

  normalized = normalized
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");

  return repairBareNewlineMarkers(normalized);
}

function repairBareNewlineMarkers(content: string) {
  return content
    .replace(/n(?=(?:[IVXLCDM]+|\d+)\.\s)/g, "\n")
    .replace(/([.)])n(?=[^\n:]{2,80}:\s*\.{4,})/g, "$1\n");
}

export function ProtocolsSection({ workspace }: { workspace: AccountWorkspaceState }) {
  const { t } = useTranslations();
  const {
    feedbackByKey,
    getOrganizationName,
    getUserName,
    canManageProtocols,
    handleCreateProtocol,
    isEmployee,
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
    setEditContent(normalizeProtocolContentForEditing(protocol.content));
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

  return (
    <SectionCard
      id="protocols"
      title={t("protocols.title")}
      description={
        isLeader
          ? t("protocols.descriptionLeader")
          : isEmployee
            ? t("protocols.descriptionEmployee")
            : t("protocols.descriptionAdmin")
      }
    >
      <div className="space-y-5">
        <FeedbackMessage feedback={feedbackByKey.protocols} />

        {canManageProtocols && (
          <form onSubmit={handleCreateProtocol} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">{t("protocols.createProtocol")}</p>
            <FieldHint>{t("protocols.hint")}</FieldHint>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                {t("protocols.createButton")}
              </Button>
            </div>
          </form>
        )}

        {protocols.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{isLeader ? t("protocols.companyProtocols") : t("protocols.visibleProtocols")}</p>
            <div className="mt-4 grid gap-3">
              {protocols.map((protocol) => (
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
                        className="w-full min-h-48 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 font-mono"
                        rows={10}
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
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={getProtocolHref(protocol.protocolUri)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 whitespace-nowrap"
                          >
                            {t("protocols.openProtocol")}
                          </a>
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
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-600">
              {isEmployee ? t("protocols.noEmployeeProtocols") : t("protocols.noSavedProtocols")}
            </p>
          </div>
        )}

      </div>
    </SectionCard>
  );
}

import { Button } from "@/app/components/shared/ui/Button";
import { Input } from "@/app/components/shared/ui/Input";
import { Label } from "@/app/components/shared/ui/Label";
import { useTranslations } from "@/app/lib/i18n";

import { EmptyState, FeedbackMessage, FieldHint, SectionCard, SelectField } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";

function getProtocolHref(protocolUri: string) {
  if (/^https?:\/\//i.test(protocolUri) || protocolUri.startsWith("/api/protocol-file")) {
    return protocolUri;
  }

  return `/api/protocol-file?path=${encodeURIComponent(protocolUri)}`;
}

export function ProtocolsSection({ workspace }: { workspace: AccountWorkspaceState }) {
  const { t } = useTranslations();
  const {
    feedbackByKey,
    getOrganizationName,
    getUserName,
    handleCreateProtocol,
    handleLookupProtocol,
    isAdmin,
    isLeader,
    organizationOptions,
    pendingByKey,
    protocolCreateForm,
    protocolLookupId,
    protocolOptions,
    protocols,
    protocolUserOptions,
    selectedProtocol,
    selectedProtocolOrganizationId,
    setProtocolCreateForm,
    setProtocolLookupId,
  } = workspace;

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

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">{t("protocols.openSaved")}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              {protocolOptions.length > 0 ? (
                <SelectField
                  id="protocol-lookup-id"
                  label={t("common.protocol")}
                  value={protocolLookupId}
                  onChange={setProtocolLookupId}
                  options={protocolOptions}
                  placeholder={t("protocols.selectProtocol")}
                />
              ) : isAdmin ? (
                <>
                  <Label htmlFor="protocol-lookup-id">{t("protocols.protocolReference")}</Label>
                  <Input
                    id="protocol-lookup-id"
                    type="number"
                    value={protocolLookupId}
                    onChange={(event) => setProtocolLookupId(event.target.value)}
                  />
                </>
              ) : (
                <p className="text-sm text-slate-600">
                  {t("protocols.noSavedProtocols")}
                </p>
              )}
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleLookupProtocol}
                disabled={Boolean(pendingByKey.protocols || (!isAdmin && protocolOptions.length === 0))}
              >
                {t("protocols.loadProtocol")}
              </Button>
            </div>
          </div>
        </div>

        {protocols.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{isLeader ? t("protocols.companyProtocols") : t("protocols.visibleProtocols")}</p>
            <div className="mt-4 grid gap-3">
              {protocols.map((protocol) => (
                <div key={protocol.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{t("protocols.protocolLabel", { id: protocol.id ?? "" })}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {getUserName(protocol.employeeId)} • {getOrganizationName(protocol.organizationId)}
                  </p>
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setProtocolLookupId(protocol.id?.toString() ?? "");
                      }}
                    >
                      {t("protocols.useInPanel")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {selectedProtocol ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{t("protocols.generatedProtocol")}</p>
            <dl className="mt-4 grid gap-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>{t("common.teammate")}</dt>
                <dd className="font-semibold text-slate-900">{getUserName(selectedProtocol.employeeId)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>{t("common.company")}</dt>
                <dd className="font-semibold text-slate-900">
                  {getOrganizationName(selectedProtocol.organizationId)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{t("protocols.protocolFile")}</p>
              <p className="mt-2">{t("protocols.protocolFileDescription")}</p>
              <div className="mt-4">
                <a
                  href={getProtocolHref(selectedProtocol.protocolUri)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  {t("protocols.openProtocol")}
                </a>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title={t("protocols.noSelectedTitle")}
            description={t("protocols.noSelectedDescription")}
          />
        )}
      </div>
    </SectionCard>
  );
}

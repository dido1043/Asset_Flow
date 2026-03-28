import { Button } from "@/app/components/shared/ui/Button";
import { Textarea } from "@/app/components/shared/ui/Textarea";
import { useTranslations } from "@/app/lib/i18n";

import { EmptyState, FeedbackMessage, SectionCard } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";
import { formatDateTime, formatDuration } from "../utils";

export function AiSection({ workspace }: { workspace: AccountWorkspaceState }) {
  const { locale, t } = useTranslations();
  const { aiPrompt, aiResult, feedbackByKey, handleGenerateAiResponse, pendingByKey, setAiPrompt } = workspace;

  return (
    <SectionCard
      id="ai-tools"
      title={t("ai.title")}
      description={t("ai.description")}
    >
      <div className="space-y-5">
        <FeedbackMessage feedback={feedbackByKey.ai} />

        <form onSubmit={handleGenerateAiResponse} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <label htmlFor="ai-prompt" className="text-sm font-medium text-slate-900">
            {t("ai.prompt")}
          </label>
          <Textarea
            id="ai-prompt"
            value={aiPrompt}
            placeholder={t("ai.promptPlaceholder")}
            onChange={(event) => setAiPrompt(event.target.value)}
          />
          <div className="mt-4">
            <Button type="submit" disabled={Boolean(pendingByKey.ai)}>
              {pendingByKey.ai ? t("ai.generating") : t("ai.generate")}
            </Button>
          </div>
        </form>

        {aiResult ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {aiResult.response || t("ai.emptyResponse")}
            </div>
            <dl className="mt-4 grid gap-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>{t("ai.created")}</dt>
                <dd className="font-semibold text-slate-900">{formatDateTime(aiResult.created_at, locale, t("common.notSet"))}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>{t("ai.duration")}</dt>
                <dd className="font-semibold text-slate-900">{formatDuration(aiResult.total_duration, t("common.notSet"))}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <EmptyState
            title={t("ai.noResponseTitle")}
            description={t("ai.noResponseDescription")}
          />
        )}
      </div>
    </SectionCard>
  );
}

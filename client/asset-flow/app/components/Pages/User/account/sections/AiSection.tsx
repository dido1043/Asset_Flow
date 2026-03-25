import { Button } from "@/app/components/shared/ui/Button";
import { Textarea } from "@/app/components/shared/ui/Textarea";

import { EmptyState, FeedbackMessage, SectionCard } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";
import { formatDateTime, formatDuration } from "../utils";

export function AiSection({ workspace }: { workspace: AccountWorkspaceState }) {
  const { aiPrompt, aiResult, feedbackByKey, handleGenerateAiResponse, pendingByKey, setAiPrompt } = workspace;

  return (
    <SectionCard
      id="ai-tools"
      title="AI"
      description="Generate drafting help and responses from the workspace assistant."
    >
      <div className="space-y-5">
        <FeedbackMessage feedback={feedbackByKey.ai} />

        <form onSubmit={handleGenerateAiResponse} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <label htmlFor="ai-prompt" className="text-sm font-medium text-slate-900">
            Prompt
          </label>
          <Textarea
            id="ai-prompt"
            value={aiPrompt}
            placeholder="Describe what you want the assistant to generate."
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
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {aiResult.response || "The assistant returned an empty response."}
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
            </dl>
          </div>
        ) : (
          <EmptyState
            title="No AI response yet"
            description="Submit a prompt to see the generated response here."
          />
        )}
      </div>
    </SectionCard>
  );
}

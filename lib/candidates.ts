import type { DateAvailabilitySummary, Idea, TopCandidate } from "./types";

// Pure ranking logic (no AI, no I/O): "who's free the most" combined with
// "what's the most wanted idea", per the MVP's simple priority order:
//   1. more people available
//   2. more people want to do it
//   3. sooner date

export function rankDateCandidates(
  summaries: DateAvailabilitySummary[]
): DateAvailabilitySummary[] {
  return [...summaries].sort((a, b) => {
    if (b.availableCount !== a.availableCount) return b.availableCount - a.availableCount;
    return a.date.localeCompare(b.date);
  });
}

export function rankIdeas(ideas: Idea[]): Idea[] {
  return [...ideas].sort((a, b) => {
    if (b.voteCount !== a.voteCount) return b.voteCount - a.voteCount;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function getTopCandidate(
  dateSummaries: DateAvailabilitySummary[],
  ideas: Idea[]
): TopCandidate | null {
  const [bestDate] = rankDateCandidates(dateSummaries);
  const [bestIdea] = rankIdeas(ideas);

  if (!bestDate && !bestIdea) return null;

  return {
    date: bestDate?.date ?? "",
    availableCount: bestDate?.availableCount ?? 0,
    totalMembers: bestDate?.totalMembers ?? 0,
    commonRanges: bestDate?.commonRanges ?? [],
    idea: bestIdea ? { id: bestIdea.id, title: bestIdea.title, voteCount: bestIdea.voteCount } : null,
  };
}

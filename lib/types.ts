export type Group = {
  id: string;
  name: string;
  shareToken: string;
  createdAt: string;
};

export type Member = {
  id: string;
  groupId: string;
  name: string;
  createdAt: string;
};

export type Availability = {
  id: string;
  groupId: string;
  memberId: string;
  memberName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  note: string | null;
  createdAt: string;
};

export type Idea = {
  id: string;
  groupId: string;
  memberId: string;
  memberName: string;
  title: string;
  createdAt: string;
  voteCount: number;
};

export type IdeaWithVotes = Idea & {
  voterIds: string[];
  voterNames: string[];
};

export type Plan = {
  id: string;
  groupId: string;
  ideaId: string | null;
  ideaTitle: string | null;
  date: string;
  startTime: string;
  endTime: string;
  location: string | null;
  note: string | null;
  createdAt: string;
};

export type TimeRange = {
  start: string; // HH:MM
  end: string; // HH:MM
};

export type DateAvailabilitySummary = {
  date: string;
  totalMembers: number;
  availableCount: number;
  availableMemberNames: string[];
  commonRanges: TimeRange[];
  entries: Availability[];
};

export type TopCandidate = {
  date: string;
  availableCount: number;
  totalMembers: number;
  commonRanges: TimeRange[];
  idea: { id: string; title: string; voteCount: number } | null;
};

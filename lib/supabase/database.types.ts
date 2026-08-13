// Hand-written types mirroring supabase/migrations/0001_init.sql.
// Kept minimal and in sync manually since this MVP doesn't run `supabase
// gen types` against a live project in this environment.

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: never[];
};

export type Database = {
  public: {
    Tables: {
      groups: Table<
        { id: string; name: string; share_token: string; created_at: string },
        { id?: string; name: string; share_token: string; created_at?: string }
      >;
      members: Table<
        { id: string; group_id: string; name: string; created_at: string },
        { id?: string; group_id: string; name: string; created_at?: string }
      >;
      availability: Table<
        {
          id: string;
          group_id: string;
          member_id: string;
          date: string;
          start_time: string;
          end_time: string;
          note: string | null;
          created_at: string;
        },
        {
          id?: string;
          group_id: string;
          member_id: string;
          date: string;
          start_time: string;
          end_time: string;
          note?: string | null;
          created_at?: string;
        }
      >;
      ideas: Table<
        {
          id: string;
          group_id: string;
          member_id: string;
          title: string;
          note: string | null;
          normalized_title: string;
          created_at: string;
        },
        {
          id?: string;
          group_id: string;
          member_id: string;
          title: string;
          note?: string | null;
          normalized_title: string;
          created_at?: string;
        }
      >;
      idea_votes: Table<
        { idea_id: string; member_id: string; created_at: string },
        { idea_id: string; member_id: string; created_at?: string }
      >;
      plans: Table<
        {
          id: string;
          group_id: string;
          idea_id: string | null;
          date: string;
          start_time: string;
          end_time: string;
          location: string | null;
          note: string | null;
          created_at: string;
        },
        {
          id?: string;
          group_id: string;
          idea_id?: string | null;
          date: string;
          start_time: string;
          end_time: string;
          location?: string | null;
          note?: string | null;
          created_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

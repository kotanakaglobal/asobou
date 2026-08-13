-- Adds an optional memo/description field to ideas, alongside the title.
alter table ideas add column if not exists note text;

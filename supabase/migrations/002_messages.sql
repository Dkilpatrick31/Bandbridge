-- ── Messaging tables ──────────────────────────────────────────────────────────
-- Run this migration in the Supabase SQL editor (Database > SQL Editor > New query).

CREATE TABLE IF NOT EXISTS conversations (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_two_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_text  text,
  last_message_at    timestamptz,
  created_at         timestamptz DEFAULT now(),
  UNIQUE(participant_one_id, participant_two_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         text        NOT NULL,
  read            boolean     DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;

-- conversations: participants can read their own threads
CREATE POLICY "Participants read own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

-- conversations: either participant can start the thread
CREATE POLICY "Participants create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

-- conversations: either participant can update (last_message_*)
CREATE POLICY "Participants update conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

-- messages: participants can read messages in their conversations
CREATE POLICY "Participants read messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.participant_one_id = auth.uid() OR c.participant_two_id = auth.uid())
    )
  );

-- messages: participants can send messages in their conversations
CREATE POLICY "Participants insert messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.participant_one_id = auth.uid() OR c.participant_two_id = auth.uid())
    )
  );

-- messages: recipients can mark messages as read
CREATE POLICY "Recipients update read status"
  ON messages FOR UPDATE
  USING (
    sender_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.participant_one_id = auth.uid() OR c.participant_two_id = auth.uid())
    )
  );

-- ── Realtime ──────────────────────────────────────────────────────────────────
-- Required for postgres_changes subscriptions.

ALTER TABLE messages      REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

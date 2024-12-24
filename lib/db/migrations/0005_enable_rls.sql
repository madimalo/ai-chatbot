-- Enable Row Level Security (RLS) on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Chat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Suggestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote" ENABLE ROW LEVEL SECURITY;

-- Create policies for User table
CREATE POLICY "Users can view their own profile"
    ON "User"
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON "User"
    FOR UPDATE
    USING (auth.uid() = id);

-- Create policies for Chat table
CREATE POLICY "Users can view their own chats"
    ON "Chat"
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own chats"
    ON "Chat"
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own chats"
    ON "Chat"
    FOR UPDATE
    USING (user_id = auth.uid());

-- Create policies for Document table
CREATE POLICY "Users can view their own documents"
    ON "Document"
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own documents"
    ON "Document"
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own documents"
    ON "Document"
    FOR UPDATE
    USING (user_id = auth.uid());

-- Create policies for Message table
CREATE POLICY "Users can view messages in their chats"
    ON "Message"
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM "Chat"
        WHERE "Chat".id = "Message".chat_id
        AND "Chat".user_id = auth.uid()
    ));

CREATE POLICY "Users can create messages in their chats"
    ON "Message"
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM "Chat"
        WHERE "Chat".id = "Message".chat_id
        AND "Chat".user_id = auth.uid()
    ));

-- Create policies for Suggestion table
CREATE POLICY "Users can view suggestions for their messages"
    ON "Suggestion"
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM "Message"
        JOIN "Chat" ON "Chat".id = "Message".chat_id
        WHERE "Message".id = "Suggestion".message_id
        AND "Chat".user_id = auth.uid()
    ));

CREATE POLICY "Users can create suggestions for their messages"
    ON "Suggestion"
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM "Message"
        JOIN "Chat" ON "Chat".id = "Message".chat_id
        WHERE "Message".id = "Suggestion".message_id
        AND "Chat".user_id = auth.uid()
    ));

-- Create policies for Vote table
CREATE POLICY "Users can view their own votes"
    ON "Vote"
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own votes"
    ON "Vote"
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own votes"
    ON "Vote"
    FOR UPDATE
    USING (user_id = auth.uid());

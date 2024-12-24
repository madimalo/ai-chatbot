import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { createClient } from '@supabase/supabase-js';

import {
  type User,
  type Suggestion,
  type Message,
} from './schema';
import { BlockKind } from '@/components/block';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('email', email);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get user from database');
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    const { error } = await supabase
      .from('User')
      .insert({ email, password: hash });
    
    if (error) throw error;
  } catch (error) {
    console.error('Failed to create user in database');
    throw error;
  }
}

export async function saveChat({
  id,
  title,
  userId,
  visibility = 'private',
}: {
  id: string;
  title: string;
  userId: string;
  visibility?: 'private' | 'public';
}) {
  try {
    const { error } = await supabase
      .from('Chat')
      .insert({ 
        id, 
        title, 
        userId, 
        visibility,
        createdAt: new Date().toISOString()
      });
    
    if (error) throw error;
  } catch (error) {
    console.error('Failed to save chat to database');
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await supabase
      .from('Vote')
      .delete()
      .eq('chatId', id);
    await supabase
      .from('Message')
      .delete()
      .eq('chatId', id);

    await supabase
      .from('Chat')
      .delete()
      .eq('id', id);
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    const { data, error } = await supabase
      .from('Chat')
      .select('*')
      .eq('userId', id)
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get chats from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const { data, error } = await supabase
      .from('Chat')
      .select('*')
      .eq('id', id);
    
    if (error) throw error;
    return data[0] || null;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({ messages }: { messages: Array<Message> }) {
  try {
    const { error } = await supabase
      .from('Message')
      .insert(messages);
    
    if (error) throw error;
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    const { data, error } = await supabase
      .from('Message')
      .select('*')
      .eq('chatId', id)
      .order('createdAt', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const { data, error } = await supabase
      .from('Vote')
      .select('*')
      .eq('messageId', messageId);
    
    if (error) throw error;
    if (data.length > 0) {
      await supabase
        .from('Vote')
        .update({ isUpvoted: type === 'up' })
        .eq('messageId', messageId);
    } else {
      await supabase
        .from('Vote')
        .insert({ chatId, messageId, isUpvoted: type === 'up' });
    }
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    const { data, error } = await supabase
      .from('Vote')
      .select('*')
      .eq('chatId', id);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: BlockKind;
  content: string;
  userId: string;
}) {
  try {
    const { error } = await supabase
      .from('Document')
      .insert({ id, title, kind, content, userId });
    
    if (error) throw error;
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const { data, error } = await supabase
      .from('Document')
      .select('*')
      .eq('id', id)
      .order('createdAt', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const { data, error } = await supabase
      .from('Document')
      .select('*')
      .eq('id', id)
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data[0] || null;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await supabase
      .from('Suggestion')
      .delete()
      .eq('documentId', id)
      .gt('documentCreatedAt', timestamp.toISOString());
    await supabase
      .from('Document')
      .delete()
      .eq('id', id)
      .gt('createdAt', timestamp.toISOString());
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    const { error } = await supabase
      .from('Suggestion')
      .insert(suggestions);
    
    if (error) throw error;
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    const { data, error } = await supabase
      .from('Suggestion')
      .select('*')
      .eq('documentId', documentId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    const { data, error } = await supabase
      .from('Message')
      .select('*')
      .eq('id', id);
    
    if (error) throw error;
    return data[0] || null;
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    await supabase
      .from('Message')
      .delete()
      .eq('chatId', chatId)
      .gte('createdAt', timestamp.toISOString());
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    await supabase
      .from('Chat')
      .update({ visibility })
      .eq('id', chatId);
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}

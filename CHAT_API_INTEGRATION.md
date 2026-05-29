# Chat API Integration - Persisted Sessions Update

## Overview
Updated the frontend chat API integration to support persisted chat sessions. The backend now automatically creates and manages chat sessions through a unified `/api/ask` endpoint.

## Key Changes

### 1. Chat Service (`src/app/services/chat.service.ts`)

#### Updated Interfaces
- **ChatMessage**: Now includes `chat_session_id`, `updated_at` fields matching backend structure
- **ChatSession**: Full session object with `user_id`, `messages` array, timestamps
- **AskRequest**: Request payload for `/api/ask` with optional `session_id` and `title`
- **AskResponse**: Response includes full session object with all messages
- **ChatSessionSummary**: Lightweight session summary for listing (no messages)

#### Updated Methods

**`ask(question: string, sessionId?: number, title?: string): Observable<AskResponse>`**
- Unified endpoint for creating new sessions and continuing existing ones
- **First message**: Call without `session_id` to create a new session
- **Subsequent messages**: Include `session_id` to continue the session
- **Optional title**: Provide when creating a new session
- Returns full `AskResponse` with session details and all messages
- Handles 404 errors when `session_id` doesn't belong to current user

**`getSessions(): Observable<ChatSessionSummary[]>`**
- Fetches all chat sessions for authenticated user
- Backend returns wrapped response: `{ sessions: [...] }`
- Service extracts and returns the sessions array
- Uses RxJS `map` operator to unwrap response

**`getSession(id: number): Observable<ChatSession>`**
- Loads a specific chat session with full message history
- Used when user clicks on a previous conversation

**`deleteSession(id: number): Observable<any>`**
- Deletes a chat session
- Requires authentication (handled by auth interceptor)

### 2. Chat Component (`src/app/chat/chat.ts`)

#### Updated Imports
- Changed `ChatSession` to `ChatSessionSummary` for session list
- Added `ChatMessage as ApiChatMessage` to distinguish from UI message model

#### Updated State Management
- `sessions` signal now uses `ChatSessionSummary[]` type
- `currentSessionId` tracks active session ID (null for new chats)

#### Updated Methods

**`loadSessions()`**
- Simplified to work with typed `ChatSessionSummary[]` response
- No longer needs response wrapper handling
- Populates constellation nodes from session list

**`selectNode(node: ConversationNode)`**
- Loads selected session with `getSession()`
- Maps API messages to UI message format
- Sets `currentSessionId` for subsequent messages

**`sendMessage(text?: string)`**
- **New session flow**: First message calls `ask()` without `session_id`
- **Existing session flow**: Subsequent messages include `session_id`
- Saves returned `session.id` to `currentSessionId` for new sessions
- Reloads sessions list after creating new session
- Handles 404 error (invalid session) by clearing session state
- Streams response using existing `streamResponse()` method

**Removed Methods**
- `askInSession()` - Replaced by unified `ask()` method
- `askOneOff()` - Replaced by unified `ask()` method

## API Flow

### Creating a New Chat Session
```
1. User sends first message
2. Component calls: chatService.ask(question)
3. Backend creates session, saves message, generates response
4. Response includes: { question, answer, session: { id, messages, ... } }
5. Component saves session.id to currentSessionId
6. Component reloads sessions list
```

### Continuing an Existing Chat
```
1. User sends message in existing session
2. Component calls: chatService.ask(question, sessionId)
3. Backend appends message to session, generates response
4. Response includes updated session with all messages
5. Component displays response
```

### Loading Previous Chat
```
1. User clicks constellation node
2. Component calls: chatService.getSession(sessionId)
3. Backend returns full session with all messages
4. Component renders message history
5. User can continue conversation from here
```

## Authentication
- All requests automatically include `Authorization: Bearer <token>` header
- Handled by existing `authInterceptor` in `app.config.ts`
- Token stored in `localStorage` as `auth_token`

## Error Handling
- **404 Response**: Session not found or doesn't belong to user
  - Component clears `currentSessionId` and `activeConvId`
  - Shows error message to user
- **Other Errors**: Generic error message displayed
  - User can retry or start new chat

## Response Wrapping
- `GET /api/chats` returns: `{ sessions: [...] }`
- `GET /api/chats/{id}` returns: Direct session object
- `POST /api/ask` returns: Direct response object
- Service handles unwrapping transparently

## Testing Checklist
- [ ] First message creates new session
- [ ] Session ID saved and used for subsequent messages
- [ ] Session list updates after new chat
- [ ] Previous chats load with full message history
- [ ] Continuing previous chat appends new messages
- [ ] Invalid session_id shows 404 error
- [ ] Delete session removes from list
- [ ] Auth token included in all requests
- [ ] Logout clears session state

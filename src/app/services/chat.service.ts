import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id: number;
  chat_session_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface AskRequest {
  question: string;
  session_id?: number;
  title?: string;
}

export interface AskResponse {
  question: string;
  answer: string;
  session: ChatSession;
}

export interface ChatSessionSummary {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Ask a question and create or continue a chat session.
   * For new sessions, omit session_id.
   * For continuing sessions, include session_id.
   * Optionally provide a title when creating a new session.
   */
  ask(question: string, sessionId?: number, title?: string): Observable<AskResponse> {
    const payload: AskRequest = { question };
    if (sessionId) {
      payload.session_id = sessionId;
    }
    if (title) {
      payload.title = title;
    }
    return this.http.post<AskResponse>(`${this.API}/ask`, payload);
  }

  /**
   * Get all chat sessions for the authenticated user.
   */
  getSessions(): Observable<ChatSessionSummary[]> {
    return this.http.get<{ sessions: ChatSessionSummary[] }>(`${this.API}/chats`).pipe(
      // Extract the sessions array from the response wrapper
      map(response => response.sessions || [])
    );
  }

  /**
   * Get a specific chat session with all its messages.
   */
  getSession(id: number): Observable<ChatSession> {
    return this.http.get<ChatSession>(`${this.API}/chats/${id}`);
  }

  /**
   * Delete a chat session.
   */
  deleteSession(id: number): Observable<any> {
    return this.http.delete(`${this.API}/chats/${id}`);
  }
}

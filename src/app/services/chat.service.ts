import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatSession {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatSessionDetail {
  id: number;
  title: string;
  messages: ChatMessage[];
  created_at: string;
}

export interface AskResponse {
  answer: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSessions(): Observable<ChatSession[]> {
    return this.http.get<ChatSession[]>(`${this.API}/chats`);
  }

  createSession(title?: string): Observable<ChatSession> {
    return this.http.post<ChatSession>(`${this.API}/chats`, { title });
  }

  getSession(id: number): Observable<ChatSessionDetail> {
    return this.http.get<ChatSessionDetail>(`${this.API}/chats/${id}`);
  }

  askInSession(id: number, question: string): Observable<AskResponse> {
    return this.http.post<AskResponse>(`${this.API}/chats/${id}/ask`, { question });
  }

  deleteSession(id: number): Observable<any> {
    return this.http.delete(`${this.API}/chats/${id}`);
  }

  askOneOff(question: string): Observable<AskResponse> {
    return this.http.post<AskResponse>(`${this.API}/ask`, { question });
  }
}

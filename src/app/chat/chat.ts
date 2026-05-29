import {
  Component, signal, computed, inject, ViewChild, ElementRef,
  OnInit, OnDestroy, HostListener, AfterViewInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatService, ChatSession } from '../services/chat.service';
import { AuthService } from '../services/auth.service';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isStreaming: boolean;
}

interface ConversationNode {
  id: string;
  title: string;
  preview: string;
  x: number;
  y: number;
  size: number;
  category: 'roi' | 'compare' | 'trends';
}

interface CarouselCard {
  text: string;
  district: string;
  icon: string;
}

@Component({
  selector: 'app-chat',
  imports: [FormsModule, RouterLink],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  private sanitizer = inject(DomSanitizer);
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentSessionId = signal<number | null>(null);
  sessions = signal<ChatSession[]>([]);

  // State
  messages = signal<ChatMessage[]>([]);
  inputText = signal('');
  isAiTyping = signal(false);
  pageLoaded = signal(false);
  irisOpen = signal(false);
  constellationOpen = signal(false);
  activeConvId = signal<string | null>(null);
  typewriterText = signal('');
  heroPhase = signal(0);
  parallaxX = signal(0);
  parallaxY = signal(0);
  carouselIndex = signal(0);
  inputFocused = signal(false);

  showEmptyState = computed(() => this.messages().length === 0);
  conversationActive = computed(() => this.messages().length > 0);

  // Constellation nodes (populated from API sessions)
  nodes = signal<ConversationNode[]>([]);

  // Carousel
  carouselCards: CarouselCard[] = [
    { text: 'إيه أفضل منطقة للاستثمار في القاهرة دلوقتي؟', district: 'القاهرة', icon: 'LOC' },
    { text: 'قارنلي بين التجمع الخامس والشيخ زايد', district: 'مقارنة', icon: 'VS' },
    { text: 'احسبلي الـ ROI لشقة بـ 2 مليون في مدينة نصر', district: 'ROI', icon: '%' },
    { text: 'إيه التوقعات لمنطقة العاصمة الإدارية؟', district: 'العاصمة', icon: '↗' },
    { text: 'أفضل وقت للبيع في الساحل الشمالي؟', district: 'الساحل', icon: '◷' },
  ];

  heroSentences = [
    ['قرارك', 'الجاي', 'يبدأ', 'من هنا.'],
    ['مليون سؤال', 'في السوق.', 'إنت عندك إجابة؟', 'SiteIntel', 'عنده.'],
  ];

  currentHeroWords = computed(() => this.heroSentences[this.heroPhase()]);

  // Hot zones for background
  hotZones = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 90 + 5,
    y: Math.random() * 90 + 5,
    delay: Math.random() * 8,
    duration: 4 + Math.random() * 4,
  }));

  floatingLabels = [
    { text: 'التجمع', x: 20, y: 25, delay: 0 },
    { text: 'زايد', x: 70, y: 35, delay: 2 },
    { text: 'العاصمة', x: 45, y: 70, delay: 4 },
    { text: 'المعادي', x: 80, y: 60, delay: 6 },
    { text: 'مدينتي', x: 30, y: 55, delay: 3 },
  ];

  private typewriterTimer: ReturnType<typeof setInterval> | null = null;
  private streamTimer: ReturnType<typeof setInterval> | null = null;
  private carouselTimer: ReturnType<typeof setInterval> | null = null;
  private heroToggleTimer: ReturnType<typeof setInterval> | null = null;
  private readonly heroText = 'السوق بيتكلم. إنت بتسمع؟';

  @ViewChild('chatScroll') chatScroll!: ElementRef<HTMLDivElement>;
  @ViewChild('msgInput') msgInput!: ElementRef<HTMLTextAreaElement>;

  ngOnInit() {
    this.runTypewriter();
    setTimeout(() => this.pageLoaded.set(true), 80);
    this.startCarouselAutoPlay();
    this.startHeroToggle();
    this.loadSessions();
  }

  private loadSessions() {
    this.chatService.getSessions().subscribe({
      next: (response: any) => {
        const sessions = Array.isArray(response) ? response : (response.data ?? []);
        this.sessions.set(sessions);
        const categories: Array<'roi' | 'compare' | 'trends'> = ['roi', 'compare', 'trends'];
        this.nodes.set(sessions.map((s: any, i: number) => ({
          id: String(s.id),
          title: s.title || `محادثة ${s.id}`,
          preview: '',
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          size: 10 + Math.random() * 6,
          category: categories[i % 3],
        })));
      },
      error: () => {},
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    if (this.streamTimer) clearInterval(this.streamTimer);
    if (this.carouselTimer) clearInterval(this.carouselTimer);
    if (this.heroToggleTimer) clearInterval(this.heroToggleTimer);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const x = (e.clientX / window.innerWidth - 0.5) * 12;
    const y = (e.clientY / window.innerHeight - 0.5) * 12;
    this.parallaxX.set(x);
    this.parallaxY.set(y);
  }

  private runTypewriter() {
    let i = 0;
    this.typewriterText.set('');
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    this.typewriterTimer = setInterval(() => {
      if (i <= this.heroText.length) {
        this.typewriterText.set(this.heroText.substring(0, i));
        i++;
      } else {
        if (this.typewriterTimer) clearInterval(this.typewriterTimer);
      }
    }, 75);
  }

  private startHeroToggle() {
    this.heroToggleTimer = setInterval(() => {
      if (this.showEmptyState()) {
        this.heroPhase.update(p => (p + 1) % this.heroSentences.length);
      }
    }, 6000);
  }

  private startCarouselAutoPlay() {
    this.carouselTimer = setInterval(() => {
      if (this.showEmptyState()) {
        this.carouselIndex.update(i => (i + 1) % this.carouselCards.length);
      }
    }, 4000);
  }

  // Iris input
  openIris() {
    this.irisOpen.set(true);
    setTimeout(() => {
      this.msgInput?.nativeElement?.focus();
    }, 500);
  }

  closeIris() {
    if (!this.inputText().trim() && !this.conversationActive()) {
      this.irisOpen.set(false);
    }
  }

  // Constellation
  toggleConstellation() {
    this.constellationOpen.update(v => !v);
  }

  selectNode(node: ConversationNode) {
    this.activeConvId.set(node.id);
    this.constellationOpen.set(false);
    this.currentSessionId.set(Number(node.id));
    // Load session messages
    this.chatService.getSession(Number(node.id)).subscribe({
      next: (response: any) => {
        const detail = response?.data ?? response;
        const messages = detail?.messages ?? [];
        const msgs: ChatMessage[] = messages.map((m: any) => ({
          id: String(m.id),
          role: m.role === 'assistant' ? 'ai' as const : 'user' as const,
          content: m.content,
          timestamp: new Date(m.created_at),
          isStreaming: false,
        }));
        this.messages.set(msgs);
        this.scrollToBottom();
      },
      error: () => {},
    });
  }

  getNodeColor(category: string): string {
    switch (category) {
      case 'roi': return '#C9A84C';
      case 'compare': return '#e8d5a3';
      case 'trends': return '#8a7230';
      default: return '#C9A84C';
    }
  }

  // Carousel navigation
  goToCard(index: number) {
    this.carouselIndex.set(index);
  }

  getCardTransform(i: number): string {
    const current = this.carouselIndex();
    const total = this.carouselCards.length;
    let diff = i - current;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    const translateX = diff * 280;
    const rotateY = diff * -15;
    const scale = diff === 0 ? 1 : 0.82;
    const z = diff === 0 ? 50 : 0;
    return `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale}) translateZ(${z}px)`;
  }

  getCardOpacity(i: number): number {
    const current = this.carouselIndex();
    const total = this.carouselCards.length;
    let diff = Math.abs(i - current);
    if (diff > total / 2) diff = total - diff;
    return diff === 0 ? 1 : diff === 1 ? 0.6 : 0.3;
  }

  getCardZIndex(i: number): number {
    const current = this.carouselIndex();
    const total = this.carouselCards.length;
    let diff = Math.abs(i - current);
    if (diff > total / 2) diff = total - diff;
    return 10 - diff;
  }

  // Messages
  sendMessage(text?: string) {
    const content = (text || this.inputText()).trim();
    if (!content || this.isAiTyping()) return;

    this.messages.update(msgs => [...msgs, {
      id: this.generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
      isStreaming: false,
    }]);

    this.inputText.set('');
    this.resetTextarea();
    this.scrollToBottom();

    this.isAiTyping.set(true);
    const aiId = this.generateId();
    this.messages.update(msgs => [...msgs, {
      id: aiId,
      role: 'ai',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }]);
    this.scrollToBottom();

    // If we have a session, ask within it; otherwise use the one-off endpoint
    if (this.currentSessionId()) {
      this.askInSession(this.currentSessionId()!, content, aiId);
    } else {
      this.chatService.askOneOff(content).subscribe({
        next: (response: any) => {
          const res = response?.data ?? response;
          const answer = res?.answer ?? res?.content ?? '';
          this.streamResponse(answer, aiId);
        },
        error: () => {
          this.handleAiError(aiId);
        },
      });
    }

    
  }

private generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
  private askInSession(sessionId: number, question: string, aiMsgId: string) {
    this.chatService.askInSession(sessionId, question).subscribe({
      next: (response: any) => {
        const res = response?.data ?? response;
        const answer = res?.answer ?? res?.content ?? '';
        this.streamResponse(answer, aiMsgId);
      },
      error: () => {
        this.handleAiError(aiMsgId);
      },
    });
  }

  private streamResponse(fullText: string, aiMsgId: string) {
    let charIdx = 0;
    this.streamTimer = setInterval(() => {
      if (charIdx < fullText.length) {
        charIdx = Math.min(charIdx + 3, fullText.length);
        this.messages.update(msgs =>
          msgs.map(m => m.id === aiMsgId ? { ...m, content: fullText.substring(0, charIdx) } : m)
        );
        this.scrollToBottom();
      } else {
        if (this.streamTimer) clearInterval(this.streamTimer);
        this.messages.update(msgs =>
          msgs.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m)
        );
        this.isAiTyping.set(false);
      }
    }, 18);
  }

  private handleAiError(aiMsgId: string) {
    this.messages.update(msgs =>
      msgs.map(m => m.id === aiMsgId ? { ...m, content: 'حصل خطأ، حاول تاني.', isStreaming: false } : m)
    );
    this.isAiTyping.set(false);
  }

  selectSuggestion(text: string) {
    this.irisOpen.set(true);
    setTimeout(() => this.sendMessage(text), 400);
  }

  newChat() {
    if (this.streamTimer) clearInterval(this.streamTimer);
    this.messages.set([]);
    this.activeConvId.set(null);
    this.currentSessionId.set(null);
    this.isAiTyping.set(false);
    this.irisOpen.set(false);
    this.constellationOpen.set(false);
    this.runTypewriter();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onInput(event: Event) {
    this.inputText.set((event.target as HTMLTextAreaElement).value);
    this.autoResize();
  }

  private autoResize() {
    setTimeout(() => {
      const el = this.msgInput?.nativeElement;
      if (el) {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
      }
    });
  }

  private resetTextarea() {
    setTimeout(() => {
      const el = this.msgInput?.nativeElement;
      if (el) el.style.height = 'auto';
    });
  }

  detectDir(text: string): string {
    if (!text) return 'rtl';
    const first = text.trim().charAt(0);
    return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(first) ? 'rtl' : 'ltr';
  }

  renderMarkdown(text: string): SafeHtml {
    if (!text) return this.sanitizer.bypassSecurityTrustHtml('');
    let html = this.escapeHtml(text);
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = this.processTables(html);
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/<br>\s*<table/g, '<table');
    html = html.replace(/<\/table>\s*<br>/g, '</table>');
    html = html.replace(/<br>\s*<thead/g, '<thead');
    html = html.replace(/<br>\s*<tbody/g, '<tbody');
    html = html.replace(/<\/thead>\s*<br>/g, '</thead>');
    html = html.replace(/<\/tr>\s*<br>/g, '</tr>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private processTables(html: string): string {
    const lines = html.split('\n');
    const result: string[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        let table = '<table>';
        const hCells = line.split('|').filter(c => c.trim());
        table += '<thead><tr>' + hCells.map(c => `<th>${c.trim()}</th>`).join('') + '</tr></thead>';
        i++;
        if (i < lines.length && lines[i].trim().includes('---')) i++;
        table += '<tbody>';
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          const cells = lines[i].trim().split('|').filter(c => c.trim());
          table += '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
          i++;
        }
        table += '</tbody></table>';
        result.push(table);
      } else {
        result.push(lines[i]);
        i++;
      }
    }
    return result.join('\n');
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.chatScroll?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 30);
  }

  trackById(_index: number, item: { id: string }) {
    return item.id;
  }

  trackByIndex(index: number) {
    return index;
  }
}

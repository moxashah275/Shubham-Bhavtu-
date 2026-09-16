import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  LucideArrowUp,
  LucideDownload,
  LucideLayoutTemplate,
  LucideLoaderCircle,
  LucideMessageSquare,
  LucideSquarePen,
  LucideX,
} from '@lucide/angular';
import { map } from 'rxjs';
import type { AuthUser } from '../../../../core/models/auth.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  aiSectionsToAbout,
  generateAiBiodataFromProfile,
} from '../../../../shared/biodata/ai-biodata-generator';
import { buildBiodataContent } from '../../../../shared/biodata/biodata-content';
import { BiodataDocumentComponent } from '../../../../shared/biodata/biodata-document.component';
import { BiodataTemplateCardComponent } from '../../../../shared/biodata/biodata-template-card.component';
import { userFromPrompt } from '../../../../shared/biodata/parse-ai-prompt';
import { PaginationComponent } from '../../../../shared/ui/pagination.component';
import {
  downloadBiodataSheetPdf,
  preloadBiodataPdfLibs,
} from '../../../../shared/biodata/biodata-pdf-export';
import {
  BIODATA_TEMPLATES,
  biodataTemplateById,
  biodataTemplateNumber,
} from '../../../../shared/biodata/biodata-templates';

const PAGE_SIZE = 8;

function field(label: string, value: string | undefined | null): string {
  return `${label} : ${(value ?? '').toString().trim()}`;
}

function section(title: string, lines: string[]): string {
  return `${title} :-\n${lines.join('\n')}`;
}

/** Default prompt filled from the member profile — user can edit every line. */
export function buildDefaultAiPrompt(user: AuthUser | null): string {
  const age =
    user?.age?.trim() && user.age !== 'below-18'
      ? `${user.age.trim()} years`
      : user?.age?.trim() === 'below-18'
        ? 'Below 18'
        : '';
  const partnerAge =
    user?.partnerAgeFrom?.trim() && user?.partnerAgeTo?.trim()
      ? `${user.partnerAgeFrom.trim()}–${user.partnerAgeTo.trim()}`
      : user?.partnerAgeFrom?.trim() || user?.partnerAgeTo?.trim() || '';

  return `Create a short, respectful Jain matrimonial biodata from my profile details.

${section('Personal details', [
  field('Personal name', user?.fullName),
  field('Age', age),
  field('Height', user?.height),
  field('Gender', user?.gender),
  field('Marital status', user?.maritalStatus),
  field('Date of birth', user?.dateOfBirth),
  field('City', user?.city),
  field('State', user?.state),
  field('Native place', user?.nativePlace),
])}

${section('Education details', [
  field('Education', user?.education || user?.educationSpec || user?.degree),
  field('Specialization', user?.specialization),
  field('University', user?.university),
])}

${section('Career details', [
  field('Occupation', user?.occupation),
  field('Designation', user?.designation),
  field('Company', user?.companyName),
  field('Employment status', user?.employmentStatus),
  field('Work experience', user?.workExperience),
  field('Income', user?.income),
])}

${section('Family details', [
  field('Family type', user?.familyType),
  field('Father name', user?.fatherName),
  field('Father occupation', user?.fatherOccupation),
  field('Mother name', user?.motherName),
  field('Mother occupation', user?.motherOccupation),
  field('Brothers', user?.brothers),
  field('Sisters', user?.sisters),
])}

${section('Jain values', [
  field('Religion', user?.religion),
  field('Jain sect', user?.jainSect),
  field('Caste', user?.jainCaste || user?.community),
  field('Sub caste', user?.subCaste),
  field('Gotra', user?.gotra),
  field('Diet', user?.diet),
  field('Manglik / Shani', user?.manglik),
])}

${section('Personality', [
  field('About me', user?.about),
  field('Hobbies', user?.hobbies),
  field('Languages known', user?.languagesKnown),
  field('Future goals', user?.futureGoals),
])}

${section('Partner expectations', [
  field('Preferred age', partnerAge),
  field('Preferred education', user?.partnerEducation),
  field('Preferred occupation', user?.partnerOccupation),
  field('Preferred city', user?.partnerCity),
  field('Preferred state', user?.partnerState),
  field('Preferred diet', user?.partnerDiet),
])}`;
}

type BiodataMode = 'default' | 'ai';

type AiChatEntry = {
  id: string;
  title: string;
  prompt: string;
  about: string;
  createdAt: number;
};

@Component({
  selector: 'app-biodata-page',
  host: {
    class: 'block min-h-0',
  },
  imports: [
    BiodataDocumentComponent,
    BiodataTemplateCardComponent,
    PaginationComponent,
    LucideArrowUp,
    LucideDownload,
    LucideLayoutTemplate,
    LucideLoaderCircle,
    LucideMessageSquare,
    LucideSquarePen,
    LucideX,
  ],
  templateUrl: './biodata.component.html',
})
export class BiodataPageComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly promptTouched = signal(false);
  private chatSeq = 0;

  private readonly modeFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => {
        const mode = params.get('mode');
        if (mode === 'ai') {
          return 'ai' as const;
        }
        if (mode === 'default') {
          return 'default' as const;
        }
        return null;
      }),
    ),
    { initialValue: null as BiodataMode | null },
  );

  readonly mode = signal<BiodataMode | null>(null);
  readonly prompt = signal(buildDefaultAiPrompt(this.auth.user()));
  readonly generating = signal(false);
  readonly aiAbout = signal('');
  readonly aiTemplateId = signal(BIODATA_TEMPLATES[0]?.id ?? '');
  readonly chatHistory = signal<AiChatEntry[]>([]);
  readonly activeChatId = signal<string | null>(null);
  readonly hasGenerated = signal(false);
  readonly pdfDownloading = signal(false);
  /** Prompt shown in the thread after Send (above generated biodata). */
  readonly sentPrompt = signal('');

  readonly page = signal(1);
  readonly totalPages = Math.max(1, Math.ceil(BIODATA_TEMPLATES.length / PAGE_SIZE));
  readonly pageTemplates = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return BIODATA_TEMPLATES.slice(start, start + PAGE_SIZE);
  });

  readonly selectedId = signal('');
  readonly selectedTemplate = computed(() => biodataTemplateById(this.selectedId()));
  readonly previewOpen = computed(() => Boolean(this.selectedId()));
  readonly defaultPdfSheet = viewChild<ElementRef<HTMLElement>>('defaultPdfSheet');

  readonly defaultContent = computed(() =>
    buildBiodataContent(this.auth.user(), {
      photoSrc: this.auth.user()?.profilePhoto,
    }),
  );

  /** Live sheet from whatever is currently in the prompt. */
  readonly aiPreviewContent = computed(() => {
    const promptText = this.prompt();
    const source = userFromPrompt(promptText, '');
    const polished = this.aiAbout().trim();
    const about =
      polished ||
      aiSectionsToAbout(generateAiBiodataFromProfile(source, promptText).sections) ||
      undefined;
    return buildBiodataContent(source, {
      aboutOverride: about,
      photoSrc: '',
    });
  });

  readonly aiTemplate = computed(() => biodataTemplateById(this.aiTemplateId()));

  readonly canDownloadAi = computed(() => {
    const name = userFromPrompt(this.prompt(), '').fullName.trim();
    return Boolean(name) || Boolean(this.aiAbout().trim());
  });

  readonly generatedName = computed(() => {
    const fromChat = this.activeChat()?.title?.replace(/^Biodata\s*·\s*/i, '').trim();
    if (fromChat && fromChat.toLowerCase() !== 'biodata') {
      return fromChat;
    }
    const fromPrompt = userFromPrompt(this.prompt(), '').fullName.trim();
    if (fromPrompt) {
      return fromPrompt;
    }
    return this.auth.fullName()?.trim() || 'Biodata';
  });

  readonly activeChat = computed(() => {
    const id = this.activeChatId();
    return this.chatHistory().find((item) => item.id === id) ?? null;
  });

  readonly todayChats = computed(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const stamp = start.getTime();
    return this.chatHistory().filter((item) => item.createdAt >= stamp);
  });

  readonly earlierChats = computed(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const stamp = start.getTime();
    return this.chatHistory().filter((item) => item.createdAt < stamp);
  });

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (this.promptTouched()) {
        return;
      }
      untracked(() => this.prompt.set(buildDefaultAiPrompt(user)));
    });

    effect(() => {
      const next = this.modeFromRoute();
      untracked(() => this.setMode(next));
    });

    effect(() => {
      const aiOpen = this.mode() === 'ai';
      untracked(() => {
        document.body.classList.toggle('biodata-ai-active', aiOpen);
      });
    });

    this.destroyRef.onDestroy(() => {
      document.body.classList.remove('biodata-ai-active');
    });

    void preloadBiodataPdfLibs();
  }

  setMode(mode: BiodataMode | null): void {
    this.mode.set(mode);
    if (mode === 'ai' && !this.promptTouched()) {
      this.prompt.set(buildDefaultAiPrompt(this.auth.user()));
    }
    if (mode === 'ai') {
      this.schedulePromptResize();
    }
  }

  openAiChat(id: string): void {
    const entry = this.chatHistory().find((item) => item.id === id);
    if (!entry) {
      return;
    }
    this.activeChatId.set(entry.id);
    this.prompt.set(entry.prompt);
    this.sentPrompt.set(entry.prompt);
    this.aiAbout.set(entry.about);
    this.promptTouched.set(true);
    this.hasGenerated.set(true);
    this.schedulePromptResize();
  }

  newAiChat(): void {
    this.activeChatId.set(null);
    this.hasGenerated.set(false);
    this.sentPrompt.set('');
    this.aiAbout.set('');
    this.promptTouched.set(false);
    this.prompt.set(buildDefaultAiPrompt(this.auth.user()));
    this.schedulePromptResize();
  }

  onPromptInput(event: Event): void {
    this.promptTouched.set(true);
    const el = event.target as HTMLTextAreaElement;
    this.prompt.set(el.value);
    this.resizePrompt(el);
  }

  onPromptKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void this.generateBiodata();
    }
  }

  private resizePrompt(el: HTMLTextAreaElement): void {
    el.style.height = '0px';
    const next = el.scrollHeight;
    const min = 44;
    const max = 220;
    el.style.height = `${Math.min(Math.max(next, min), max)}px`;
    el.style.overflowY = next > max ? 'auto' : 'hidden';
  }

  private schedulePromptResize(): void {
    window.setTimeout(() => {
      const el = document.querySelector('.biodata-ai-chat__textarea') as HTMLTextAreaElement | null;
      if (el) {
        this.resizePrompt(el);
      }
    }, 0);
  }

  private scrollThreadToTop(): void {
    window.setTimeout(() => {
      const thread = document.querySelector('.biodata-ai-chat__thread') as HTMLElement | null;
      if (thread) {
        thread.scrollTop = 0;
      }
    }, 0);
  }

  async generateBiodata(): Promise<void> {
    if (this.generating()) {
      return;
    }

    const fallback = buildDefaultAiPrompt(this.auth.user());
    const prompt = this.prompt().trim() || fallback;
    this.prompt.set(prompt);
    this.sentPrompt.set(prompt);
    this.promptTouched.set(true);
    this.generating.set(true);
    this.scrollThreadToTop();
    this.mode.set('ai');

    await this.wait(500);

    const sourceUser = userFromPrompt(prompt, '');
    const result = generateAiBiodataFromProfile(sourceUser, prompt);
    const about = aiSectionsToAbout(result.sections);
    this.generating.set(false);

    if (!about.trim() && !sourceUser.fullName.trim()) {
      this.aiAbout.set('');
      this.hasGenerated.set(false);
      this.toast.show('Add details in the prompt, then try again.');
      return;
    }

    const polished =
      about.trim() ||
      'A respectful matrimonial introduction prepared from the details in this prompt.';
    this.aiAbout.set(polished);
    this.aiTemplateId.set(BIODATA_TEMPLATES[0]?.id ?? '');
    this.hasGenerated.set(true);

    const title = this.chatTitle(prompt, sourceUser.fullName);
    const existingId = this.activeChatId();
    if (existingId) {
      this.chatHistory.update((items) =>
        items.map((item) =>
          item.id === existingId
            ? { ...item, title, prompt, about: polished, createdAt: Date.now() }
            : item,
        ),
      );
    } else {
      this.chatSeq += 1;
      const id = `chat-${this.chatSeq}-${Date.now()}`;
      this.chatHistory.update((items) => [
        { id, title, prompt, about: polished, createdAt: Date.now() },
        ...items,
      ]);
      this.activeChatId.set(id);
    }
  }

  templateNumber(id: string): string {
    return biodataTemplateNumber(id);
  }

  goToPage(page: number): void {
    this.page.set(Math.min(Math.max(page, 1), this.totalPages));
  }

  select(id: string): void {
    this.selectedId.set(id);
  }

  closePreview(): void {
    this.selectedId.set('');
  }

  keepOpen(event: Event): void {
    event.stopPropagation();
  }

  onDownloadPdfClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.downloadPdf();
  }

  downloadPdf(): void {
    if (this.mode() === 'ai') {
      if (!this.canDownloadAi() || !this.hasGenerated()) {
        this.toast.show('Generate biodata first.');
        return;
      }
      void this.exportBiodataPdf(`${this.generatedName()} biodata`);
      return;
    }

    if (!this.selectedId() || !this.previewOpen()) {
      this.toast.show('Open a biodata design first.');
      return;
    }

    const name = this.auth.fullName()?.trim() || 'Biodata';
    void this.exportBiodataPdf(`${name} biodata`);
  }

  private resolvePdfSheet(): HTMLElement | null {
    if (this.mode() === 'ai') {
      const aiSheet = document.querySelector('[data-biodata-pdf-sheet="ai"]');
      return aiSheet instanceof HTMLElement ? aiSheet : null;
    }

    const fromView = this.defaultPdfSheet()?.nativeElement;
    if (fromView instanceof HTMLElement) {
      return fromView;
    }

    const defaultSheet = document.querySelector('[data-biodata-pdf-sheet="default"]');
    return defaultSheet instanceof HTMLElement ? defaultSheet : null;
  }

  private async exportBiodataPdf(title: string): Promise<void> {
    if (this.pdfDownloading()) {
      return;
    }

    const sheet = this.resolvePdfSheet();
    if (!sheet) {
      this.toast.show('Biodata sheet not ready. Try again.');
      return;
    }

    this.pdfDownloading.set(true);
    try {
      await downloadBiodataSheetPdf(sheet, title);
    } catch {
      this.toast.show('Could not create PDF. Try again.');
    } finally {
      this.pdfDownloading.set(false);
    }
  }

  previewContent() {
    return this.mode() === 'ai' ? this.aiPreviewContent() : this.defaultContent();
  }

  private chatTitle(prompt: string, name: string): string {
    const fromName = name.trim();
    if (fromName) {
      const short = fromName.length > 22 ? `${fromName.slice(0, 22)}…` : fromName;
      return `Biodata · ${short}`;
    }

    const personal = prompt.match(/Personal name\s*:\s*(.+)/i)?.[1]?.trim();
    if (personal) {
      const short = personal.length > 22 ? `${personal.slice(0, 22)}…` : personal;
      return `Biodata · ${short}`;
    }

    const count = this.chatHistory().length + 1;
    return count <= 1 ? 'Biodata' : `Biodata ${count}`;
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

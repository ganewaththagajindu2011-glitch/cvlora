'use client';
import Link from 'next/link';
import {
  useDeferredValue,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { CvDocument } from '@cvlora/shared';
import {
  blankCv,
  draftKey,
  editorCvSchema,
  encodeDraft,
  editorTemplates,
  parseDraft,
  sampleCv,
} from '@cvlora/shared/editor';
import { CvPreview } from './cv-preview';
type History = {
  current: CvDocument;
  past: CvDocument[];
  future: CvDocument[];
};
type Action =
  | { type: 'edit'; change: (cv: CvDocument) => CvDocument }
  | { type: 'replace'; document: CvDocument }
  | { type: 'undo' }
  | { type: 'redo' };
function reducer(state: History, action: Action): History {
  if (action.type === 'undo') {
    const previous = state.past.at(-1);
    return previous
      ? {
          current: previous,
          past: state.past.slice(0, -1),
          future: [state.current, ...state.future],
        }
      : state;
  }
  if (action.type === 'redo') {
    const next = state.future[0];
    return next
      ? {
          current: next,
          past: [...state.past, state.current].slice(-60),
          future: state.future.slice(1),
        }
      : state;
  }
  const current =
    action.type === 'replace' ? action.document : action.change(state.current);
  return {
    current,
    past: [...state.past, state.current].slice(-60),
    future: [],
  };
}
type Section = CvDocument['sections'][number];
const kinds: { kind: Section['kind']; title: string }[] = [
  { kind: 'experience', title: 'Experience' },
  { kind: 'education', title: 'Education' },
  { kind: 'skills', title: 'Skills' },
  { kind: 'projects', title: 'Projects' },
  { kind: 'certifications', title: 'Certifications' },
  { kind: 'languages', title: 'Languages' },
  { kind: 'references', title: 'References' },
  { kind: 'custom', title: 'Custom section' },
];
function Field({
  label,
  value,
  onChange,
  multiline = false,
  maxLength = 200,
  type = 'text',
  placeholder = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  maxLength?: number;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}
export default function Editor() {
  const [history, dispatch] = useReducer(reducer, {
    current: blankCv(),
    past: [],
    future: [],
  });
  const document = history.current;
  const preview = useDeferredValue(document);
  const [printSnapshot, setPrintSnapshot] = useState<CvDocument | null>(null);
  const [saveOnDevice, setSaveOnDevice] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [message, setMessage] = useState('Your CV stays in this browser.');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [newKind, setNewKind] = useState<Section['kind']>('experience');
  const importInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const enabled = localStorage.getItem(`${draftKey}.enabled`) === 'true';
        const raw = enabled ? localStorage.getItem(draftKey) : null;
        if (raw) dispatch({ type: 'replace', document: parseDraft(raw) });
        else {
          const template = new URLSearchParams(window.location.search).get(
            'template',
          );
          if (
            editorTemplates.includes(
              template as (typeof editorTemplates)[number],
            )
          )
            dispatch({
              type: 'replace',
              document: blankCv(template as (typeof editorTemplates)[number]),
            });
        }
        setSaveOnDevice(enabled);
        if (raw) setMessage('Saved draft restored from this device.');
      } catch {
        setMessage(
          'Saved draft could not be loaded. Device saving is off; the stored file has been preserved.',
        );
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (!hydrated || !saveOnDevice) return;
    const timer = setTimeout(() => {
      if (!editorCvSchema.safeParse(document).success) {
        setMessage(
          'Complete your document title and a valid email before saving the device draft.',
        );
        return;
      }
      try {
        const raw = encodeDraft(document);
        localStorage.setItem(draftKey, raw);
        localStorage.setItem(`${draftKey}.enabled`, 'true');
        setMessage('Draft saved on this device.');
      } catch {
        setMessage(
          'Device storage is unavailable or full. Download your draft to keep a copy.',
        );
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [document, saveOnDevice, hydrated]);
  function edit(change: (cv: CvDocument) => CvDocument) {
    dispatch({ type: 'edit', change });
  }
  function personal(field: keyof CvDocument['personal'], value: string) {
    edit((cv) => ({ ...cv, personal: { ...cv.personal, [field]: value } }));
  }
  function updateSection(id: string, change: (section: Section) => Section) {
    edit((cv) => ({
      ...cv,
      sections: cv.sections.map((section) =>
        section.id === id ? change(section) : section,
      ),
    }));
  }
  function moveSection(index: number, direction: number) {
    edit((cv) => {
      const sections = [...cv.sections];
      const moved = sections.splice(index, 1)[0];
      if (moved) sections.splice(index + direction, 0, moved);
      return { ...cv, sections };
    });
  }
  function addSection() {
    if (document.sections.length >= 20) return;
    const title =
      kinds.find((item) => item.kind === newKind)?.title ?? 'Section';
    edit((cv) => ({
      ...cv,
      sections: [
        ...cv.sections,
        {
          id: crypto.randomUUID(),
          kind: newKind,
          title,
          items: [
            {
              id: crypto.randomUUID(),
              heading: '',
              subheading: '',
              period: '',
              description: '',
            },
          ],
        },
      ],
    }));
    setMessage(`${title} section added.`);
  }
  function toggleSaving(enabled: boolean) {
    if (!enabled) {
      try {
        localStorage.removeItem(draftKey);
        localStorage.removeItem(`${draftKey}.enabled`);
        setMessage(
          'Device copy removed. Keep a downloaded draft before closing.',
        );
      } catch {
        setMessage(
          'Could not remove the saved copy. Clear this site’s storage in browser settings.',
        );
      }
    }
    setSaveOnDevice(enabled);
  }
  function downloadDraft() {
    if (!editorCvSchema.safeParse(document).success) {
      setMessage('Check your email address and fields before downloading.');
      return;
    }
    let raw: string;
    try {
      raw = encodeDraft(document);
    } catch {
      setMessage(
        'Draft exceeds the 256 KB limit. Shorten your content before downloading a draft.',
      );
      return;
    }
    const url = URL.createObjectURL(
      new Blob([raw], {
        type: 'application/json',
      }),
    );
    const link = window.document.createElement('a');
    link.href = url;
    link.download = 'cvlora-draft.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(
      'Draft downloaded. Keep it private; it contains your CV details.',
    );
  }
  async function importDraft(file: File | undefined) {
    if (!file) return;
    if (file.size > 262144) {
      setMessage('Choose a CVLora JSON draft smaller than 256 KB.');
      return;
    }
    try {
      const cv = parseDraft(await file.text());
      dispatch({ type: 'replace', document: cv });
      setMessage('Draft imported. Review your details before printing.');
    } catch {
      setMessage(
        'This is not a valid CVLora draft. Your current CV has been kept.',
      );
    }
  }
  function printCv() {
    if (!document.personal.name.trim()) {
      setMessage('Enter your full name before printing.');
      setMobileTab('edit');
      return;
    }
    if (!editorCvSchema.safeParse(document).success) {
      setMessage('Check your email address and fields before printing.');
      return;
    }
    setMessage(
      'In the print dialog choose Save as PDF, A4 paper, and turn off headers and footers.',
    );
    // Wait for the committed/deferred preview before opening the native print dialog.
    setPrintSnapshot(document);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        try {
          window.print();
        } finally {
          setPrintSnapshot(null);
        }
      }),
    );
  }
  function startOver(sample: boolean) {
    if (
      (document.personal.name ||
        document.summary ||
        document.sections.length) &&
      !window.confirm(
        'Replace this CV? Download your draft first if you want to keep it.',
      )
    )
      return;
    dispatch({ type: 'replace', document: sample ? sampleCv() : blankCv() });
    setMessage(
      sample
        ? 'Sample loaded. Replace the sample details with your own.'
        : 'New blank CV started.',
    );
  }
  return (
    <>
      <header className="site-header editor-header">
        <Link prefetch={false} href="/" className="brand">
          cvlora<span className="brand-dot">.</span>
        </Link>
        <div className="editor-header-actions">
          <button
            type="button"
            className="editor-secondary"
            onClick={() => startOver(true)}
          >
            Try sample
          </button>
          <button type="button" className="button" onClick={printCv}>
            Print / Save PDF
          </button>
        </div>
      </header>
      <main id="main" className="editor-main" data-mobile-tab={mobileTab}>
        <div className="editor-intro">
          <div>
            <div className="eyebrow">MAKE YOUR NEXT MOVE</div>
            <h1>Let’s make your CV.</h1>
            <p>
              Fill in your details, choose a style, and save a PDF. No account
              needed.
            </p>
          </div>
          <div className="editor-history">
            <button
              type="button"
              onClick={() => dispatch({ type: 'undo' })}
              disabled={!history.past.length}
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'redo' })}
              disabled={!history.future.length}
            >
              Redo
            </button>
          </div>
        </div>
        <div className="editor-status" role="status" aria-live="polite">
          {message}
        </div>
        <div className="editor-layout">
          <aside className="editor-tools" aria-label="CV tools">
            <h2>Your CV</h2>
            <Field
              label="Document title"
              value={document.title}
              onChange={(value) => edit((cv) => ({ ...cv, title: value }))}
            />
            <label className="editor-field">
              <span>Template</span>
              <select
                value={document.templateId}
                onChange={(event) =>
                  edit((cv) => ({ ...cv, templateId: event.target.value }))
                }
              >
                {editorTemplates.map((template) => (
                  <option key={template} value={template}>
                    {template.charAt(0).toUpperCase() + template.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label className="editor-field">
              <span>CV language</span>
              <select
                value={document.locale}
                onChange={(event) =>
                  edit((cv) => ({
                    ...cv,
                    locale: event.target.value as CvDocument['locale'],
                  }))
                }
              >
                <option value="en">English</option>
                <option value="si">සිංහල</option>
                <option value="ta">தமிழ்</option>
              </select>
            </label>
            <label className="editor-field">
              <span>Text size</span>
              <select
                value={document.theme.fontSize}
                onChange={(event) =>
                  edit((cv) => ({
                    ...cv,
                    theme: {
                      ...cv.theme,
                      fontSize: Number(event.target.value),
                    },
                  }))
                }
              >
                {[9, 10, 11, 12, 13, 14, 15, 16].map((size) => (
                  <option key={size} value={size}>
                    {size} pt
                  </option>
                ))}
              </select>
            </label>
            <label className="editor-field">
              <span>Spacing</span>
              <select
                value={document.theme.spacing}
                onChange={(event) =>
                  edit((cv) => ({
                    ...cv,
                    theme: {
                      ...cv.theme,
                      spacing: event.target
                        .value as CvDocument['theme']['spacing'],
                    },
                  }))
                }
              >
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
                <option value="spacious">Spacious</option>
              </select>
            </label>
            <div className="editor-storage">
              <label>
                <input
                  type="checkbox"
                  checked={saveOnDevice}
                  disabled={!hydrated}
                  onChange={(event) => toggleSaving(event.target.checked)}
                />{' '}
                Remember on this device
              </label>
              <p>
                Your details are never sent to our server. Device saving stores
                an unencrypted copy in this browser. Leave it off on shared
                devices.
              </p>
            </div>
            <button
              type="button"
              className="editor-secondary"
              onClick={downloadDraft}
            >
              Download draft
            </button>
            <button
              type="button"
              className="editor-secondary"
              onClick={() => importInput.current?.click()}
            >
              Import draft
            </button>
            <input
              ref={importInput}
              type="file"
              accept="application/json,.json"
              className="editor-file-input"
              aria-label="Import CVLora draft file"
              onChange={(event) => {
                void importDraft(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
            <button
              type="button"
              className="editor-secondary"
              onClick={() => startOver(false)}
            >
              New blank CV
            </button>
          </aside>
          <div className="editor-form" aria-label="CV details">
            <section className="editor-panel">
              <h2>Personal details</h2>
              <Field
                label="Full name"
                value={document.personal.name}
                onChange={(value) => personal('name', value)}
                placeholder="e.g. Nethmi Perera"
              />
              <Field
                label="Professional title"
                value={document.personal.headline}
                onChange={(value) => personal('headline', value)}
                placeholder="e.g. Software Engineer"
              />
              <Field
                label="Email"
                value={document.personal.email}
                onChange={(value) => personal('email', value)}
                type="email"
              />
              <Field
                label="Phone"
                value={document.personal.phone}
                onChange={(value) => personal('phone', value)}
                maxLength={40}
                type="tel"
              />
              <Field
                label="Location"
                value={document.personal.location}
                onChange={(value) => personal('location', value)}
                placeholder="Colombo, Sri Lanka"
              />
              <Field
                label="Professional summary"
                value={document.summary}
                onChange={(value) => edit((cv) => ({ ...cv, summary: value }))}
                multiline
                maxLength={5000}
                placeholder="Introduce your experience, strengths and the role you’re looking for."
              />
            </section>
            {document.sections.map((section, index) => (
              <section
                className="editor-panel"
                key={section.id}
                aria-label={`${section.title || 'Untitled'} section`}
              >
                <div className="editor-section-bar">
                  <h2>{section.title || 'Untitled section'}</h2>
                  <div>
                    <button
                      type="button"
                      disabled={index === 0}
                      aria-label={`Move ${section.title} up`}
                      onClick={() => moveSection(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === document.sections.length - 1}
                      aria-label={`Move ${section.title} down`}
                      onClick={() => moveSection(index, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${section.title} section`}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Remove ${section.title}? You can undo this change.`,
                          )
                        )
                          edit((cv) => ({
                            ...cv,
                            sections: cv.sections.filter(
                              (item) => item.id !== section.id,
                            ),
                          }));
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <Field
                  label="Section title"
                  value={section.title}
                  onChange={(value) =>
                    updateSection(section.id, (item) => ({
                      ...item,
                      title: value,
                    }))
                  }
                />
                {section.items.map((item, itemIndex) => (
                  <fieldset className="editor-entry" key={item.id}>
                    <legend>Entry {itemIndex + 1}</legend>
                    {(
                      [
                        'heading',
                        'subheading',
                        'period',
                        'description',
                      ] as const
                    ).map((field) => (
                      <Field
                        key={field}
                        label={
                          field === 'heading'
                            ? 'Role, qualification or skill'
                            : field === 'subheading'
                              ? 'Organisation or institution'
                              : field === 'period'
                                ? 'Dates'
                                : 'Details'
                        }
                        value={item[field]}
                        multiline={field === 'description'}
                        maxLength={
                          field === 'description'
                            ? 5000
                            : field === 'period'
                              ? 100
                              : 200
                        }
                        onChange={(value) =>
                          updateSection(section.id, (current) => ({
                            ...current,
                            items: current.items.map((entry) =>
                              entry.id === item.id
                                ? { ...entry, [field]: value }
                                : entry,
                            ),
                          }))
                        }
                      />
                    ))}
                    <button
                      type="button"
                      className="editor-secondary"
                      aria-label={`Remove entry ${itemIndex + 1} from ${section.title}`}
                      onClick={() =>
                        updateSection(section.id, (current) => ({
                          ...current,
                          items: current.items.filter(
                            (entry) => entry.id !== item.id,
                          ),
                        }))
                      }
                    >
                      Remove entry
                    </button>
                  </fieldset>
                ))}
                <button
                  type="button"
                  className="editor-secondary"
                  disabled={section.items.length >= 50}
                  onClick={() =>
                    updateSection(section.id, (current) => ({
                      ...current,
                      items: [
                        ...current.items,
                        {
                          id: crypto.randomUUID(),
                          heading: '',
                          subheading: '',
                          period: '',
                          description: '',
                        },
                      ],
                    }))
                  }
                >
                  Add entry
                </button>
              </section>
            ))}
            <section className="editor-panel editor-add-section">
              <h2>Add a section</h2>
              <label className="editor-field">
                <span>Section type</span>
                <select
                  value={newKind}
                  onChange={(event) =>
                    setNewKind(event.target.value as Section['kind'])
                  }
                >
                  {kinds.map((item) => (
                    <option key={item.kind} value={item.kind}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="button"
                onClick={addSection}
                disabled={document.sections.length >= 20}
              >
                Add section
              </button>
            </section>
          </div>
          <div className="editor-preview">
            <div className="editor-preview-caption">
              <h2>Live preview</h2>
              <span>A4 · flows onto more pages when printed</span>
            </div>
            <CvPreview document={printSnapshot ?? preview} />
            <p className="editor-print-tip">
              Choose “Save as PDF” in the print dialog. Set paper to A4 and turn
              off browser headers and footers. Long CVs flow onto additional
              pages.
            </p>
          </div>
        </div>
      </main>
      <nav className="editor-mobile-tabs" aria-label="Editor views">
        <button
          type="button"
          aria-pressed={mobileTab === 'edit'}
          onClick={() => setMobileTab('edit')}
        >
          Edit
        </button>
        <button
          type="button"
          aria-pressed={mobileTab === 'preview'}
          onClick={() => setMobileTab('preview')}
        >
          Preview
        </button>
        <button type="button" onClick={printCv}>
          Save PDF
        </button>
      </nav>
    </>
  );
}

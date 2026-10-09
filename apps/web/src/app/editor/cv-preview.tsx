import type { CvDocument } from '@cvlora/shared';
export function CvPreview({ document }: { document: CvDocument }) {
  const { personal, sections, summary, theme } = document;
  return (
    <article
      id="cv-document"
      className={`cv-document template-${document.templateId} spacing-${theme.spacing} font-${theme.font}`}
      data-font-size={theme.fontSize}
      lang={document.locale}
      aria-label="Your CV preview"
    >
      <header className="cv-heading">
        <h1>{personal.name || 'Your name'}</h1>
        {personal.headline && (
          <p className="cv-headline">{personal.headline}</p>
        )}
        <p className="cv-contact">
          {[personal.email, personal.phone, personal.location]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </header>
      {summary && (
        <section className="cv-section">
          <h2>
            {document.locale === 'si'
              ? 'හැඳින්වීම'
              : document.locale === 'ta'
                ? 'சுயவிவரம்'
                : 'Profile'}
          </h2>
          <p className="cv-paragraph">{summary}</p>
        </section>
      )}
      {sections.map((section) => (
        <section className="cv-section" key={section.id}>
          <h2>{section.title}</h2>
          {section.items.map((item) => (
            <div className="cv-item" key={item.id}>
              <div className="cv-item-heading">
                <h3>{item.heading}</h3>
                <span>{item.period}</span>
              </div>
              {item.subheading && (
                <p className="cv-subheading">{item.subheading}</p>
              )}
              {item.description && (
                <p className="cv-paragraph">{item.description}</p>
              )}
            </div>
          ))}
        </section>
      ))}
    </article>
  );
}

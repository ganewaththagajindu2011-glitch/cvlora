export function FoundationResume() {
  return (
    <article className="resume" aria-label="Sample CV: Nethmi Perera">
      <header>
        <div className="resume-monogram" aria-hidden="true">
          NP
        </div>
        <div>
          <h2>Nethmi Perera</h2>
          <p className="resume-role">PRODUCT DESIGNER</p>
          <p className="resume-contact">
            Colombo, Sri Lanka · nethmi@example.com
          </p>
        </div>
      </header>
      <section>
        <h3>PROFILE</h3>
        <p>
          Thoughtful product designer turning complex problems into simple,
          inclusive experiences. Bringing curiosity, clarity, and care to every
          project.
        </p>
      </section>
      <section>
        <h3>EXPERIENCE</h3>
        <div className="resume-entry">
          <strong>Senior Product Designer</strong>
          <span>2022 — PRESENT</span>
        </div>
        <p className="resume-company">Studio Collective · Colombo</p>
        <ul>
          <li>Led end-to-end design for products used by 40,000 people.</li>
          <li>Built an accessible design system across three platforms.</li>
          <li>Partnered with engineering to improve onboarding.</li>
        </ul>
      </section>
      <section>
        <h3>EDUCATION</h3>
        <div className="resume-entry">
          <strong>BDes, Integrated Design</strong>
          <span>2016 — 2020</span>
        </div>
        <p className="resume-company">University of Moratuwa</p>
      </section>
      <section>
        <h3>SKILLS</h3>
        <p>
          Product strategy · UX research · Interaction design · Figma
          <br />
          Design systems · Prototyping · Accessibility
        </p>
      </section>
      <footer>REFERENCES AVAILABLE ON REQUEST</footer>
    </article>
  );
}

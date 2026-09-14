import { PageHero } from '../components/layout/PageHero';
import { Button } from '../components/ui/Button';
import { Photo } from '../components/ui/Photo';
import { Reveal } from '../components/ui/Reveal';
import { Eyebrow } from '../components/ui/SectionHeading';
import { Note } from '../components/ui/Note';
import { CtaSection } from '../components/sections/CtaSection';
import { media } from '../data/media';
import { JOIN_LABEL, JOIN_PATH } from '../data/nav';
import { useSeo } from '../lib/seo';
import './ForBusinesses.css';

const SUPPLY_STEPS = [
  {
    title: 'List what you have',
    body: 'Put the material on the platform with a clear description of what it actually is.',
  },
  {
    title: 'Describe the specification',
    body: 'Grade, dimensions, material type and anything a buyer would need to know before saying yes.',
  },
  {
    title: 'Add quantities',
    body: 'How much there is now, and whether more follows. Volume changes who it suits.',
  },
  {
    title: 'Add availability',
    body: 'One-off batch, occasional surplus or a steady weekly output from a production run.',
  },
  {
    title: 'Add location',
    body: 'Where the material sits, and what collection would involve at your end.',
  },
  {
    title: 'Upload photographs',
    body: 'Pictures of the material as it stands. They answer more questions than a description can.',
  },
  {
    title: 'Find businesses that can use it',
    body: 'See which businesses have a stated need that lines up with what you have available.',
  },
];

const DEMAND_STEPS = [
  {
    title: 'Describe what you need',
    body: 'The material, the grade and the form it needs to arrive in.',
  },
  {
    title: 'Specify quantities',
    body: 'Minimums, maximums and whether you want a one-off or a regular supply.',
  },
  {
    title: 'Set location preferences',
    body: 'How far you are willing to travel, and whether you can collect.',
  },
  {
    title: 'Explain requirements',
    body: 'Condition, cleanliness, packaging, tolerance, certification. Anything that decides suitability.',
  },
  {
    title: 'Discover available materials',
    body: 'Search what is listed, and record a standing requirement so new listings reach you.',
  },
  {
    title: 'Connect with potential suppliers',
    body: 'Contact the business directly and work out whether the material does the job.',
  },
];

export default function ForBusinesses() {
  useSeo({
    title: 'For Businesses | ConnectCymru',
    description:
      'Two ways to use ConnectCymru: list the surplus materials your business has available, or tell us what materials you are looking for.',
    path: '/for-businesses',
  });

  return (
    <>
      <PageHero
        eyebrow="For businesses"
        title="Two ways in."
        lead="Most businesses are on both sides of this. You have material leaving the building, and you buy material coming in."
        image={media.warehouseAisle}
      />

      <section className="section section--ruled">
        <div className="container paths">
          {/* ------------------------------------------------------- Supply */}
          <article className="path" id="surplus">
            <Reveal className="path__media">
              <Photo media={media.joinery} ratio="16 / 10" />
            </Reveal>

            <Reveal className="path__text" delay={1}>
              <Eyebrow>Path one</Eyebrow>
              <h2 className="path__title">I have surplus materials.</h2>
              <p className="path__lead">
                Your process produces something useful that currently leaves as waste. The
                point of listing it is to find out whether it is worth more to somebody
                else than it costs you to get rid of.
              </p>

              <ol className="path__steps">
                {SUPPLY_STEPS.map((step, index) => (
                  <li key={step.title} className="path-step">
                    <span className="path-step__num" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="path-step__title">{step.title}</h3>
                      <p className="path-step__body">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="btn-row path__actions">
                <Button to={JOIN_PATH} variant="accent" arrow>
                  {JOIN_LABEL}
                </Button>
              </div>
            </Reveal>
          </article>

          {/* ------------------------------------------------------- Demand */}
          <article className="path path--reverse" id="looking">
            <Reveal className="path__media">
              <Photo media={media.metalStock} ratio="16 / 10" />
            </Reveal>

            <Reveal className="path__text" delay={1}>
              <Eyebrow>Path two</Eyebrow>
              <h2 className="path__title">I am looking for materials.</h2>
              <p className="path__lead">
                You need material that is awkward to source, expensive in small quantities,
                or simply worth buying closer to home. Telling the platform what you are
                after is how the right listing reaches you.
              </p>

              <ol className="path__steps">
                {DEMAND_STEPS.map((step, index) => (
                  <li key={step.title} className="path-step">
                    <span className="path-step__num" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="path-step__title">{step.title}</h3>
                      <p className="path-step__body">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="btn-row path__actions">
                <Button to={JOIN_PATH} variant="accent" arrow>
                  Register Your Interest
                </Button>
              </div>
            </Reveal>
          </article>
        </div>
      </section>

      <section className="section section--ruled">
        <div className="container container--narrow">
          <Note>
            <p>
              None of this is live yet. ConnectCymru is in build, so the listing and search
              tools described above are what the platform is being designed to do rather
              than something you can use today.
            </p>
            <p>
              Businesses remain responsible for confirming suitability and meeting any
              applicable requirements before material changes hands.
            </p>
          </Note>
        </div>
      </section>

      <CtaSection
        eyebrow="Founding network"
        title="Tell us which side you are on."
        body="Whether you have material going out, need material coming in, or both, registering now means the platform is built with your case in mind."
        secondary={{ label: 'See the materials', to: '/materials' }}
      />
    </>
  );
}

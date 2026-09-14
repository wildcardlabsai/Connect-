import { PageHero } from '../components/layout/PageHero';
import { Photo } from '../components/ui/Photo';
import { Reveal } from '../components/ui/Reveal';
import { Note } from '../components/ui/Note';
import { CtaSection } from '../components/sections/CtaSection';
import { SplitSection } from '../components/sections/SplitSection';
import { materialCategories, otherCategory } from '../data/materials';
import { useSeo } from '../lib/seo';
import './Materials.css';

const allCategories = [...materialCategories, otherCategory];

export default function Materials() {
  useSeo({
    title: 'Materials | ConnectCymru',
    description:
      'Timber, metals, plastics, textiles, packaging and manufacturing surplus. The material categories ConnectCymru is being built around, and what suitability depends on.',
    path: '/materials',
  });

  return (
    <>
      <PageHero
        eyebrow="Materials"
        title="What could be moving around Wales?"
        lead="A directory of the categories ConnectCymru is being built around. Every one of them leaves Welsh production sites in usable condition every week."
      />

      <section className="section">
        <div className="container">
          {/* Jump list: quick access on a long page. */}
          <Reveal className="mat-index" as="nav" aria-label="Material categories">
            <ul className="mat-index__list">
              {allCategories.map((category) => (
                <li key={category.id}>
                  <a className="mat-index__link" href={`#${category.id}`}>
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="mat-list">
            {allCategories.map((category, index) => (
              <Reveal
                as="article"
                key={category.id}
                id={category.id}
                className="mat-entry"
                delay={index % 2}
              >
                <div className="mat-entry__media">
                  <Photo media={category.image} ratio="4 / 3" />
                </div>

                <div className="mat-entry__text">
                  <p className="mat-entry__index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h2 className="mat-entry__name">{category.name}</h2>
                  <p className="mat-entry__detail">{category.detail}</p>
                  <div className="mat-entry__examples">
                    <h3 className="mat-entry__examples-title">Typically includes</h3>
                    <ul>
                      {category.examples.map((example) => (
                        <li key={example}>{example}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SplitSection
        eyebrow="Suitability"
        title="A category is a starting point, not a guarantee."
        lead="Two loads of the same material can be completely different propositions depending on how they have been handled."
      >
        <p>
          If you are not sure whether something belongs here, it is still worth telling us
          about it. Part of what we are working out before launch is which materials
          genuinely move and which ones do not.
        </p>

        <Note>
          <p>
            Not every material will be suitable for reuse or exchange. Suitability depends
            on the material, its condition, intended use and any applicable requirements.
          </p>
          <p>
            Some materials are controlled, some are contaminated, and some are simply not
            worth moving. Listing a material on ConnectCymru does not make it suitable for
            a given use, and businesses remain responsible for that judgement.
          </p>
        </Note>
      </SplitSection>

      <CtaSection
        eyebrow="Founding network"
        title="What does your business have?"
        body="Tell us which of these categories you produce, which you buy, and what you would want to see in a listing before you picked up the phone."
        secondary={{ label: 'How it works', to: '/how-it-works' }}
      />
    </>
  );
}

import { PageHero } from '../components/layout/PageHero';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Photo } from '../components/ui/Photo';
import { CtaSection } from '../components/sections/CtaSection';
import { SplitSection } from '../components/sections/SplitSection';
import { values } from '../data/benefits';
import { media } from '../data/media';
import { useSeo } from '../lib/seo';
import './About.css';

export default function About() {
  useSeo({
    title: 'About | ConnectCymru',
    description:
      'ConnectCymru exists to make it easier for Welsh businesses to discover opportunities around surplus materials and industrial by-products.',
    path: '/about',
  });

  return (
    <>
      <PageHero
        eyebrow="About"
        title="Built in Wales. Designed to connect Welsh industry."
        lead="ConnectCymru exists to make it easier for Welsh businesses to discover opportunities around surplus materials and industrial by-products."
      />

      <section className="section">
        <div className="container about__top">
          <Reveal className="about__prose">
            <p className="about__statement">The long-term idea is simple.</p>
            <p className="about__statement about__statement--accent">
              One business has something useful. Another business needs it. ConnectCymru
              helps them find each other.
            </p>
            <p>
              Wales is a good place to try this. It is a country with real industry in it,
              and it is small enough that a business in Wrexham and a business in Bridgend
              are not an unreasonable distance apart. Plenty of useful material currently
              leaves those sites as waste because finding the business that wants it takes
              more time than anyone has.
            </p>
            <p>
              We are building the thing that does that finding. A place to say what you
              have, a place to say what you need, and a way of putting those two together
              without either side having to go looking.
            </p>
            <p>
              The platform is not live yet. We are designing it now, which is exactly the
              point at which it is worth talking to the businesses who would use it.
            </p>
          </Reveal>

          <Reveal className="about__media" delay={1}>
            <Photo media={media.fabrication} ratio="3 / 4" />
          </Reveal>
        </div>
      </section>

      <section className="section section--ruled">
        <div className="container">
          <SectionHeading eyebrow="Values" title="What we are building around." />
          <ul className="values">
            {values.map((value, index) => (
              <Reveal as="li" key={value.title} className="value" delay={index}>
                <h3 className="value__title">{value.title}</h3>
                <p className="value__body">{value.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <SplitSection eyebrow="Where we are" title="Honest about the stage we are at.">
        <p>
          ConnectCymru is preparing for launch. There is no live platform, no listings and
          no network yet. What there is, is a clear idea of the problem and a plan for how
          to solve it.
        </p>
        <p>
          The founding network is how that plan gets tested against reality. If your
          business has surplus material, needs material, or just has an opinion about what
          would make this worth using, we would like to hear it before the product is
          finished rather than after.
        </p>
      </SplitSection>

      <CtaSection
        eyebrow="Founding network"
        title="Help shape what gets built."
        body="We would rather design this with Welsh businesses than for them."
        secondary={{ label: 'Contact us', to: '/contact' }}
      />
    </>
  );
}

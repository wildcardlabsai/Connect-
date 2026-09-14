import { PageHero } from '../components/layout/PageHero';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Reveal } from '../components/ui/Reveal';
import { Note } from '../components/ui/Note';
import { StageList } from '../components/cards/StageList';
import { CtaSection } from '../components/sections/CtaSection';
import { SplitSection } from '../components/sections/SplitSection';
import { matchCriteria, stages } from '../data/stages';
import { media } from '../data/media';
import { useSeo } from '../lib/seo';
import './HowItWorks.css';

export default function HowItWorks() {
  useSeo({
    title: 'How It Works | ConnectCymru',
    description:
      'List a material, discover what is available, see potential matches and connect. How ConnectCymru will help Welsh businesses move surplus materials to businesses that can use them.',
    path: '/how-it-works',
  });

  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="List. Discover. Match. Connect."
        lead="Four stages. The platform does the finding; the businesses do the deciding."
        image={media.productionLine}
      >
        <p>
          ConnectCymru is not a skip, a broker or a waste contract. It is a way for two
          businesses to find out that one has something the other can use, and then take it
          from there themselves.
        </p>
      </PageHero>

      <section className="section section--ruled">
        <div className="container">
          <SectionHeading
            eyebrow="The four stages"
            title="What actually happens."
            lead="Each stage depends on good information. The more precisely a material is described, the more useful the result."
          />
          <StageList stages={stages} layout="rows" />
        </div>
      </section>

      <section className="section section--ruled">
        <div className="container">
          <SectionHeading
            eyebrow="Matching"
            title="What a potential match is based on."
            lead="A match is a suggestion worth a look. It is drawn from what both businesses have told the platform."
          />
          <ul className="criteria">
            {matchCriteria.map((criterion, index) => (
              <Reveal as="li" key={criterion.title} className="criterion" delay={index % 3}>
                <h3 className="criterion__title">{criterion.title}</h3>
                <p className="criterion__body">{criterion.body}</p>
              </Reveal>
            ))}
          </ul>

          <Reveal className="criteria__aside" delay={1}>
            <p>
              Some of this work will be done automatically. Over time the platform may help
              classify a material, read a specification from a document or photograph,
              improve a listing and explain why two listings look like a fit. Some of that
              will use AI, working behind the listing rather than being the point of it. It
              is there to save people typing and to surface things they would otherwise
              miss. The judgement stays with the businesses.
            </p>
          </Reveal>
        </div>
      </section>

      <SplitSection
        eyebrow="Responsibility"
        title="Who is responsible for what."
        lead="ConnectCymru introduces businesses to each other. It does not sign off what happens next."
      >
        <p>
          Businesses remain responsible for confirming that materials are suitable for
          their intended use, and for satisfying any applicable regulatory, safety,
          transport or waste requirements that apply to the material and to the way it
          moves between sites.
        </p>
        <p>
          That includes checking specification and condition, handling and storage, duty of
          care and documentation where it applies, and anything specific to the sector
          either business works in.
        </p>

        <Note>
          <p>
            Potential matches are not automatic approvals. Businesses remain responsible
            for confirming suitability and meeting any applicable requirements.
          </p>
          <p>
            ConnectCymru does not provide legal approval, compliance certification or any
            form of regulatory clearance.
          </p>
        </Note>
      </SplitSection>

      <CtaSection
        eyebrow="Founding network"
        title="Help us get the detail right."
        body="We are working out what a listing needs to contain and what makes a match genuinely useful. If you handle materials day to day, your view is worth more than ours."
        secondary={{ label: 'For Businesses', to: '/for-businesses' }}
      />
    </>
  );
}

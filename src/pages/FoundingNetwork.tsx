import { Reveal } from '../components/ui/Reveal';
import { Eyebrow } from '../components/ui/SectionHeading';
import { InterestForm } from '../components/forms/InterestForm';
import { useSeo } from '../lib/seo';
import './FoundingNetwork.css';

const WHAT_WE_ASK = [
  {
    title: 'What you have',
    body: 'The materials that leave your site, how much of them and how often.',
  },
  {
    title: 'What you need',
    body: 'The materials you buy in, and the ones that are awkward to source locally.',
  },
  {
    title: 'What would make this useful',
    body: 'What you would need to see in a listing before it was worth a phone call.',
  },
];

export default function FoundingNetwork() {
  useSeo({
    title: 'Founding Network | ConnectCymru',
    description:
      'Help shape ConnectCymru before it launches. Register your interest if your business has surplus materials, needs materials, or wants to know more.',
    path: '/founding-network',
  });

  return (
    <>
      <section className="fn-hero is-inverted">
        <div className="container fn-hero__inner">
          <div className="fn-hero__text">
            <Eyebrow>Founding network</Eyebrow>
            <h1 className="fn-hero__title">Help shape ConnectCymru before it launches.</h1>
            <p className="fn-hero__lead">
              We are building ConnectCymru around the needs of Welsh businesses. If your
              company has surplus materials, regularly needs particular materials, or simply
              wants to explore what the platform could offer, we would like to hear from you.
            </p>
          </div>

          <ul className="fn-hero__points">
            {WHAT_WE_ASK.map((item, index) => (
              <Reveal as="li" key={item.title} className="fn-point" delay={index}>
                <span className="fn-point__num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="fn-point__title">{item.title}</h2>
                <p className="fn-point__body">{item.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section fn-form-section">
        <div className="container fn-form-section__inner">
          <div className="fn-form-section__aside">
            <Reveal>
              <h2 className="fn-form-section__aside-title">What happens next</h2>
              <ol className="fn-steps">
                <li>
                  <span className="fn-steps__label">Now</span>
                  You register your interest and tell us roughly what your business handles.
                </li>
                <li>
                  <span className="fn-steps__label">Before launch</span>
                  We may come back with a few questions while the platform is being designed.
                </li>
                <li>
                  <span className="fn-steps__label">At launch</span>
                  Founding network businesses are the first on the platform.
                </li>
              </ol>
              <p className="fn-form-section__small">
                There is nothing to pay and nothing to commit to. If it turns out not to be
                useful for your business, that is a useful thing for us to know too.
              </p>
            </Reveal>
          </div>

          <Reveal className="fn-form-section__form" delay={1}>
            <h2 className="fn-form-section__form-title">Register your interest</h2>
            <InterestForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}

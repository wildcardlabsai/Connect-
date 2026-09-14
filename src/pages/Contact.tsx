import { Link } from 'react-router-dom';
import { PageHero } from '../components/layout/PageHero';
import { Reveal } from '../components/ui/Reveal';
import { ContactForm } from '../components/forms/ContactForm';
import { useSeo } from '../lib/seo';
import './Contact.css';

export default function Contact() {
  useSeo({
    title: 'Contact | ConnectCymru',
    description:
      'Get in touch with ConnectCymru about surplus materials, sourcing, partnerships or anything else to do with the platform.',
    path: '/contact',
  });

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>Let’s connect.</>}
        lead="If your business handles materials, buys materials, or works with the companies that do, we would like to hear from you."
      />

      <section className="section contact">
        <div className="container contact__inner">
          <div className="contact__aside">
            <Reveal>
              <h2 className="contact__aside-title">What to get in touch about</h2>
              <ul className="contact__reasons">
                <li>
                  <h3>Surplus materials</h3>
                  <p>You have material leaving your site that somebody else could use.</p>
                </li>
                <li>
                  <h3>Sourcing</h3>
                  <p>You are after a material that is awkward or expensive to buy locally.</p>
                </li>
                <li>
                  <h3>Working together</h3>
                  <p>
                    You work with Welsh manufacturers and think this is worth a
                    conversation.
                  </p>
                </li>
                <li>
                  <h3>Anything else</h3>
                  <p>Questions about the platform, the timeline or how it will work.</p>
                </li>
              </ul>
              <p className="contact__note">
                If you would rather register for the founding network,{' '}
                <Link to="/founding-network">use the longer form</Link>. It asks a few more
                questions about the materials your business handles.
              </p>
            </Reveal>
          </div>

          <Reveal className="contact__form" delay={1}>
            <h2 className="contact__form-title">Send us a message</h2>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}

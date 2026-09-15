import { PageHero } from '../../components/layout/PageHero';
import { Note } from '../../components/ui/Note';
import { useSeo } from '../../lib/seo';

export default function Terms() {
  useSeo({
    title: 'Terms of Use | ConnectCymru',
    description: 'Terms of use for the ConnectCymru platform.',
    path: '/terms',
  });

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of use."
        lead="The rules for using ConnectCymru to list, browse and message other businesses."
      />
      <section className="section container container--narrow">
        <div style={{ marginBottom: '2rem' }}>
          <Note label="Placeholder">
            This page is a placeholder. It needs to be replaced with terms of use reviewed by a
            solicitor before the platform accepts real registrations &mdash; we haven&rsquo;t
            written (or fabricated) real legal terms here, since getting this wrong has real
            consequences for both ConnectCymru and the businesses using it.
          </Note>
        </div>
        <p className="lead" style={{ marginBottom: '1.5rem' }}>
          At a minimum, terms of use for a platform like this should cover:
        </p>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          <li>Who can register an account, and what happens during the approval review.</li>
          <li>What businesses may and may not list or message about (e.g. no prohibited materials).</li>
          <li>That ConnectCymru is an introduction service, not a party to any resulting sale or contract.</li>
          <li>How accounts can be suspended or removed, and by whom.</li>
          <li>Liability limits, and which law and courts any dispute falls under.</li>
        </ul>
        <p className="lead">
          Get in touch with your solicitor or legal adviser to draft the real version of this
          page.
        </p>
      </section>
    </>
  );
}

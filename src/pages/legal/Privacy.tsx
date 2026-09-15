import { PageHero } from '../../components/layout/PageHero';
import { Note } from '../../components/ui/Note';
import { useSeo } from '../../lib/seo';

export default function Privacy() {
  useSeo({
    title: 'Privacy Policy | ConnectCymru',
    description: 'Privacy policy for the ConnectCymru platform.',
    path: '/privacy',
  });

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy."
        lead="How ConnectCymru handles the information businesses give it."
      />
      <section className="section container container--narrow">
        <div style={{ marginBottom: '2rem' }}>
          <Note label="Placeholder">
            This page is a placeholder. Registration collects real company and contact details,
            so this needs to be a proper UK GDPR-compliant privacy notice before the platform
            accepts real registrations &mdash; we haven&rsquo;t written (or fabricated) real
            policy text here.
          </Note>
        </div>
        <p className="lead" style={{ marginBottom: '1.5rem' }}>
          At a minimum, a real privacy policy for this platform should cover:
        </p>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          <li>What&rsquo;s collected at registration (company and legal details, contact information) and why.</li>
          <li>Who can see it &mdash; ConnectCymru&rsquo;s reviewers, other businesses (only what&rsquo;s shown on a listing), nobody else.</li>
          <li>How long it&rsquo;s kept, and how a business can ask for its data to be corrected or deleted.</li>
          <li>Where data is stored and processed (naming the actual hosting/database provider once one is live).</li>
          <li>Contact details for a data protection query, and how to complain to the ICO.</li>
        </ul>
        <p className="lead">
          Get in touch with your solicitor or legal adviser to draft the real version of this
          page.
        </p>
      </section>
    </>
  );
}

import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Photo } from '../components/ui/Photo';
import { Reveal } from '../components/ui/Reveal';
import { Eyebrow, SectionHeading } from '../components/ui/SectionHeading';
import { MaterialCard } from '../components/cards/MaterialCard';
import { StageList } from '../components/cards/StageList';
import { CtaSection } from '../components/sections/CtaSection';
import { WalesMap } from '../components/map/WalesMap';
import { materialCategories } from '../data/materials';
import { stages } from '../data/stages';
import { benefits } from '../data/benefits';
import { media } from '../data/media';
import { JOIN_LABEL, JOIN_PATH } from '../data/nav';
import { useSeo } from '../lib/seo';
import './Home.css';

export default function Home() {
  useSeo({
    title: 'ConnectCymru | Connecting Welsh Industry',
    description:
      'ConnectCymru is building a network that helps Welsh businesses connect surplus materials with businesses that may be able to use them.',
    path: '/',
  });

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="hero is-inverted">
        <div className="container hero__inner">
          <div className="hero__text">
            <Eyebrow>A network for Welsh industry</Eyebrow>
            <h1 className="hero__title">
              Connecting Welsh industry<span className="hero__dot">.</span>
            </h1>
            <p className="hero__lead">
              ConnectCymru is building a better way for Welsh businesses to find value in
              surplus materials, production offcuts and industrial by-products.
            </p>
            <p className="hero__support">
              We are creating a network where businesses with useful materials can connect
              with businesses that need them, helping keep more resources in circulation
              across Wales.
            </p>
            <div className="btn-row hero__actions">
              <Button to={JOIN_PATH} variant="accent" size="lg" arrow>
                {JOIN_LABEL}
              </Button>
              <Button to="/how-it-works" variant="outline" size="lg">
                See How It Works
              </Button>
            </div>
          </div>

          <div className="hero__media">
            <Photo media={media.heroWorkshop} ratio="4 / 5" priority />
          </div>
        </div>

        <div className="container">
          <ul className="hero__strip">
            {materialCategories.map((category) => (
              <li key={category.id} className="hero__strip-item">
                {category.name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------- Problem */}
      <section className="section problem">
        <div className="container problem__inner">
          <Reveal className="problem__media">
            <Photo media={media.palletStack} ratio="3 / 4" />
          </Reveal>

          <div className="problem__text">
            <SectionHeading
              eyebrow="The problem"
              title={<>Useful materials should not automatically become waste.</>}
            />
            <Reveal className="problem__body" delay={1}>
              <p>
                A manufacturer may have timber offcuts, plastic surplus, packaging
                materials, metal offcuts or production by-products that currently cost
                money to dispose of.
              </p>
              <p>
                Another Welsh business may have a genuine use for exactly those materials.
                It might need smaller pieces than a mill will sell, or a grade that is
                awkward to source, or simply a steady supply of something close by.
              </p>
              <p className="problem__emphasis">
                The problem is often simply that the two businesses do not know each other
                exists.
              </p>
              <p>
                ConnectCymru is designed to make those connections easier to find.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- How it works */}
      <section className="section section--ruled">
        <div className="container">
          <SectionHeading
            eyebrow="How it works"
            title="From surplus to supply."
            lead="Four stages, from the moment a material is listed to the moment two businesses are talking."
            action={
              <Button to="/how-it-works" variant="link" arrow>
                The detail
              </Button>
            }
          />
          <StageList stages={stages} />
        </div>
      </section>

      {/* ----------------------------------------------------------- Materials */}
      <section className="section section--ruled">
        <div className="container">
          <SectionHeading
            eyebrow="Materials"
            title="What could be moving around Wales?"
            lead="Six broad categories to start with. Suitability always depends on the material, its condition and the use it is intended for."
            action={
              <Button to="/materials" variant="link" arrow>
                All categories
              </Button>
            }
          />
          <div className="material-grid">
            {materialCategories.map((category, index) => (
              <MaterialCard
                key={category.id}
                category={category}
                to={`/materials#${category.id}`}
                delay={index % 3}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- Wales */}
      <section className="section wales-section is-inverted">
        <div className="container wales-section__inner">
          <div className="wales-section__text">
            <SectionHeading
              eyebrow="Wales"
              title="Built around Welsh industry."
              lead="Wales has a dense industrial map: fabrication in the south east, manufacturing along the M4, timber and engineering in the north. Most of it sits within a short drive of somewhere the material could be used again."
            />
            <Reveal delay={1}>
              <p className="wales-section__note">
                The map is a picture of the network we are setting out to build. The points
                mark towns and cities across Wales, not businesses, listings or users.
              </p>
            </Reveal>
          </div>

          <Reveal className="wales-section__map" delay={1}>
            <WalesMap />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ Benefits */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Why ConnectCymru"
            title="A better way to find value in what you already have."
          />
          <ul className="benefits">
            {benefits.map((benefit, index) => (
              <Reveal as="li" key={benefit.title} className="benefit" delay={index}>
                <span className="benefit__index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="benefit__title">{benefit.title}</h3>
                <p className="benefit__body">{benefit.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------- Founding network */}
      <section className="founding">
        <div className="container founding__inner">
          <Reveal className="founding__media">
            <Photo media={media.fabrication} ratio="1 / 1" />
          </Reveal>

          <Reveal className="founding__text" delay={1}>
            <Eyebrow>Founding network</Eyebrow>
            <h2 className="founding__title">Be part of the beginning.</h2>
            <p className="founding__body">
              ConnectCymru is currently being built, and we are looking for Welsh businesses
              to help shape the network before launch.
            </p>
            <div className="btn-row founding__actions">
              <Button to={JOIN_PATH} variant="accent" size="lg" arrow>
                {JOIN_LABEL}
              </Button>
            </div>
            <p className="founding__note">
              Tell us what your business has, what it needs, or simply register your
              interest. It takes a couple of minutes and there is nothing to commit to.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------- Final CTA */}
      <CtaSection
        scale="xl"
        title="What could your business connect?"
        body={
          <>
            Have surplus materials? Looking for something specific? ConnectCymru is being
            built to help Welsh businesses find the opportunity in between.
          </>
        }
        secondary={{ label: 'For Businesses', to: '/for-businesses' }}
        note={
          <>
            Not ready to register? <Link to="/how-it-works">Read how it works</Link> first.
          </>
        }
      />
    </>
  );
}

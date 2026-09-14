import { Reveal } from '../ui/Reveal';
import type { Stage } from '../../data/stages';
import './StageList.css';

type StageListProps = {
  stages: Stage[];
  /** `grid` for the home page summary, `rows` for the detailed page. */
  layout?: 'grid' | 'rows';
};

export function StageList({ stages, layout = 'grid' }: StageListProps) {
  if (layout === 'rows') {
    return (
      <ol className="stages stages--rows">
        {stages.map((stage, index) => (
          <Reveal as="li" key={stage.number} className="stage-row" delay={index}>
            <div className="stage-row__head">
              <span className="stage-row__number" aria-hidden="true">
                {stage.number}
              </span>
              <h3 className="stage-row__title">{stage.title}</h3>
            </div>
            <div className="stage-row__body">
              <p className="stage-row__detail">{stage.detail}</p>
              <ul className="stage-row__points">
                {stage.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </ol>
    );
  }

  return (
    <ol className="stages stages--grid">
      {stages.map((stage, index) => (
        <Reveal as="li" key={stage.number} className="stage" delay={index}>
          <span className="stage__number" aria-hidden="true">
            {stage.number}
          </span>
          <h3 className="stage__title">{stage.title}</h3>
          <p className="stage__summary">{stage.summary}</p>
        </Reveal>
      ))}
    </ol>
  );
}

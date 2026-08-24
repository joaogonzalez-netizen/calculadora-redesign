import type { Insight } from '../../lib/dashboardMock';

export default function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div className="insight-card">
      <h4>{insight.titulo}</h4>
      <p>
        {/* partes alternam entre texto normal (índice par) e negrito (ímpar) */}
        {insight.partes.map((parte, i) => (
          i % 2 === 0 ? <span key={i}>{parte}</span> : <b key={i}>{parte}</b>
        ))}
      </p>
    </div>
  );
}

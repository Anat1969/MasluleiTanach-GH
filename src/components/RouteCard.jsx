import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { colorOf, periodOf } from '../data/routes.js';
import { yearLabel } from '../lib/bible.js';
import Photo from './Photo.jsx';

export default function RouteCard({ r, i, visited, onHover, focused }) {
  const done = r.stations.filter((s) => visited.has(s.id)).length;
  return (
    <motion.article
      className={`card ${focused ? 'focused' : ''}`}
      style={{ '--c': colorOf(r) }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
      onMouseEnter={() => onHover?.(r.id)}
    >
      <Link to={`/route/${r.id}`} className="card-link">
        <Photo wiki={r.stations[0].wiki} name={r.stations[0].name} en={r.placeEn} color={colorOf(r)} />
        <div className="card-body">
          <div className="mono card-meta">{periodOf(r.period).name} · {yearLabel(r.year)}</div>
          <h3>{r.title}</h3>
          <p className="card-place">{r.place}</p>
          <p className="card-lead">{r.lead}</p>
          <div className="facts mono">
            <span>{r.stations.length} תחנות</span>
            <span>{r.km} ק״מ</span>
            <span>{r.mode}</span>
            <span>{r.level}</span>
          </div>
          <div className="progress" aria-label={`ביקרתם ב־${done} מתוך ${r.stations.length} תחנות`}>
            <i style={{ width: `${(done / r.stations.length) * 100}%` }} />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

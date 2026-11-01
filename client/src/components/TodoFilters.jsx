import { motion } from 'motion/react';
import { FILTERS } from '../utils/filters.js';

export default function TodoFilters({ value, onChange, counts }) {
  return (
    <div className="filters" role="tablist" aria-label="Filter todos">
      {Object.entries(FILTERS).map(([key, { label }]) => {
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`filters__tab ${selected ? 'filters__tab--active' : ''}`}
            onClick={() => onChange(key)}
          >
            {selected && (
              <motion.span
                layoutId="filter-pill"
                className="filters__pill"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="filters__label">
              {label} <span className="filters__count">{counts[key]}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

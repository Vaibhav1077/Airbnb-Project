import './CategoryFilter.css';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'trending', label: 'Trending' },
  { value: 'beach', label: 'Beach' },
  { value: 'mountain', label: 'Mountain' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'budget', label: 'Budget' },
  { value: 'rooms', label: 'Rooms' },
  { value: 'iconic_cities', label: 'Iconic Cities' },
  { value: 'castles', label: 'Castles' },
  { value: 'pools', label: 'Pools' },
  { value: 'camping', label: 'Camping' },
  { value: 'farm', label: 'Farm' },
  { value: 'desert', label: 'Desert' },
  { value: 'forest', label: 'Forest' },
  { value: 'villa', label: 'Villa' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'cottage', label: 'Cottage' },
];

export default function CategoryFilter({ selected, onChange }) {
  return (
    <div className="category-filter">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          className={`category-btn ${selected === cat.value ? 'active' : ''}`}
          onClick={() => onChange(cat.value)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

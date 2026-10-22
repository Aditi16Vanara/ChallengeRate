import React from 'react';

const categories = [
  'All',
  'Supari & Agro',
  'Agro & Fertilizer',
  'Textiles',
  'Chemicals & Polymers',
  'Industrial Electronics'
];

export default function CategoryBar({ activeCategory, setActiveCategory }) {
  return (
    <div className="category-bar">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
          onClick={() => setActiveCategory(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

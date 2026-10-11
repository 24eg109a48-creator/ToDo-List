import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';

/**
 * Text box that tells the parent about the new text 400 ms after the user stops typing,
 * so we do not call the API on every single keystroke.
 */
export default function SearchBar({ onSearch, placeholder = 'Search by title or description' }) {
  const [text, setText] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => onSearch(text.trim()), 400);
    return () => clearTimeout(timer);
  }, [text, onSearch]);

  return (
    <div className="search-bar">
      <span className="search-icon">
        <Icon name="search" size={18} />
      </span>
      <input
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        aria-label="Search tasks"
      />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';

interface Option {
  id: string;
  label: string;
}

interface AutocompleteProps {
  options: Option[];
  onSelect: (option: Option) => void;
  placeholder?: string;
  label?: string;
  value?: string;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({ options, onSelect, placeholder, label, value }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.length > 0) {
      const filtered = options.filter(opt => 
        opt.label.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredOptions(filtered);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectOption = (option: Option) => {
    setInputValue(option.label);
    onSelect(option);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (inputValue.length > 0) {
        setIsOpen(true);
    } else {
        // Show all options if input is empty on focus? 
        // Or at least filter with empty string if we want to show all.
        // For now let's just show all if empty on focus
        setFilteredOptions(options);
        setIsOpen(true);
    }
  }

  return (
    <div className="relative mb-4" ref={wrapperRef}>
      {label && <label className="block text-gray-700 text-sm font-bold mb-2">{label}</label>}
      <input
        type="text"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto rounded shadow-lg">
          {filteredOptions.map(option => (
            <li
              key={option.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectOption(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

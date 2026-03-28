import React, { useState, useRef } from 'react';
import { Input } from './Input';

export function EmailInput({ value, onChange, placeholder = "Email", className = "", ...props }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  const domains = ['gmail.com', 'icloud.com', 'hotmail.com', 'yahoo.com.br', 'outlook.com'];

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(e);
    
    if (val.includes('@') && !val.split('@')[1].includes('.')) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectDomain = (domain) => {
    const prefix = value.split('@')[0];
    const newValue = `${prefix}@${domain}`;
    onChange({ target: { value: newValue } });
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        type="email"
        value={value}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // delay to allow click
        placeholder={placeholder}
        className={className}
        {...props}
      />
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {domains.map(domain => {
             const prefix = value.split('@')[0];
             return (
              <div 
                key={domain}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                onClick={() => handleSelectDomain(domain)}
              >
                {prefix}@<strong>{domain}</strong>
              </div>
             )
          })}
        </div>
      )}
    </div>
  );
}

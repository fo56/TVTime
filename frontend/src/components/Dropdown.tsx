'use client';

import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  prefix?: string;
}

export default function Dropdown({ value, options, onChange, prefix }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = prefix ? `${prefix}: ${value}` : value;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        className="pricing-tab" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <span>{displayValue}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div 
          className="hide-scrollbar"
          style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          backgroundColor: 'var(--colors-canvas)',
          border: '1px solid var(--colors-hairline)',
          borderRadius: 'var(--rounded-md)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 1000,
          minWidth: '100%',
          maxHeight: '300px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {options.map(opt => (
            <button
              key={opt}
              style={{
                padding: '10px 16px',
                textAlign: 'left',
                backgroundColor: opt === value ? 'var(--colors-surface-soft)' : 'transparent',
                border: 'none',
                color: 'var(--colors-ink)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--typography-body-sm)',
                whiteSpace: 'nowrap',
                transition: 'background-color 0.1s ease'
              }}
              onMouseEnter={(e) => { if (opt !== value) e.currentTarget.style.backgroundColor = 'var(--colors-surface-soft)' }}
              onMouseLeave={(e) => { if (opt !== value) e.currentTarget.style.backgroundColor = 'transparent' }}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

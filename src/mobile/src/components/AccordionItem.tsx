import React from 'react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

export const AccordionItem = ({ title, children, isOpen, onClick }: AccordionItemProps) => {
  return (
    <div className="border-b border-border">
      <button
        className="flex w-full items-center justify-between p-5 text-left font-medium text-text-dark transition-all hover:bg-bg-page"
        onClick={onClick}
      >
        <span>{title}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="p-5 pt-0 text-text-dark/80">
          {children}
        </div>
      )}
    </div>
  );
};

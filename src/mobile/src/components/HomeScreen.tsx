import React from 'react';

interface HomeScreenProps {
  onStartChat: () => void;
}

export const HomeScreen = ({ onStartChat }: HomeScreenProps) => {
  return (
    <div className="flex flex-col h-full items-center justify-center overflow-hidden p-8 text-center bg-white">
      <div className="flex flex-grow flex-col items-center justify-center">
        <div className="mb-6 h-36 w-36 rounded-full bg-primary flex items-center justify-center text-6xl text-white font-bold animate-float shadow-lg">
          V
        </div>
        <h1 className="mb-2 text-3xl font-bold text-text-dark">
          Vérinha
        </h1>
        <p className="mb-8 text-lg text-text-dark/70 font-light">
          Olá! Sou sua assistente virtual do COTIL. Como posso te ajudar hoje?
        </p>
        <button
          onClick={onStartChat}
          className="rounded-xl bg-black px-10 py-4 text-lg font-semibold text-text-light shadow-md transition-transform duration-200 hover:scale-105"
        >
          Começar conversa
        </button>
      </div>
    </div>
  );
};

import React from 'react';

// --- MUDANÇA IMPORTANTE ---
// A linha de 'import' da imagem foi REMOVIDA.
// Em vez disso, vamos usar a pasta 'public'.

interface HomeScreenProps {
  onStartChat: () => void;
}

export const HomeScreen = ({ onStartChat }: HomeScreenProps) => {
  return (
    <div className="flex flex-col h-full items-center justify-center overflow-hidden p-8 text-center bg-white">
      <div className="flex flex-grow flex-col items-center justify-center">
        
        {/* 2. Removemos o 'bg-primary' para a imagem aparecer */}
        <div className="mb-6 h-36 w-36 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
          {/* 3. MUDANÇA AQUI:
            Agora usamos um caminho de texto absoluto (começando com '/').
            Isso funcionará se você MOVER sua imagem para a pasta 'verinha-mobile/public/'.
            O nome do arquivo deve ser exato (usei 's' minúsculo).
          */}
          <img 
            src="/VerinhaSemFundo.png" 
            alt="Vérinha" 
            className="w-full h-full object-cover" // Faz a imagem preencher o círculo
          />
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
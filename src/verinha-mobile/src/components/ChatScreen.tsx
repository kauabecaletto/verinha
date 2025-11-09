import React, { useState, useEffect, useRef } from 'react';
// 1. Importe o ícone 'Home'
import { Info, Send, Home } from 'lucide-react';
// IMPORTA A FUNÇÃO DE API QUE CRIAMOS
import { sendChatMessage } from '../services/api';

// Interface da Mensagem
interface Message {
  id: string;
  user: 'user' | 'bot';
  text: string;
}

// Props do Componente
interface ChatScreenProps {
  onGoToAbout: () => void;
  onGoToHome: () => void; // 2. Adicione a nova prop para 'ir para home'
}

export const ChatScreen = ({ onGoToAbout, onGoToHome }: ChatScreenProps) => { // 3. Receba a nova prop aqui
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Efeito para a mensagem de boas-vindas
  useEffect(() => {
    setMessages([
      { id: 'welcome', user: 'bot', text: 'Olá! Sou a Vérinha, sua assistente virtual do COTIL. Como posso ajudar?' }
    ]);
  }, []);

  // Efeito para rolar para a última mensagem
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // CORREÇÃO:
  // Define o tipo do evento 'e' como React.FormEvent
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = inputText.trim();
    if (messageText === '' || isLoading) return;

    // 1. Formata o histórico de conversa para a API
    const apiHistory = messages.map((msg) => ({
      role: msg.user === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.text,
    }));

    const newUserMessage = { id: Date.now().toString(), user: 'user' as const, text: messageText };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);

    // 2. CHAMA A FUNÇÃO DA API
    const data = await sendChatMessage(messageText, apiHistory);

    // 3. Processa a resposta
    if (data.response) {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        user: 'bot' as const,
        text: data.response, // O backend já formata para HTML
      };
      setMessages((prev) => [...prev, botMessage]);
    } else {
      // 4. Adiciona uma mensagem de erro ao chat
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        user: 'bot' as const,
        text: `Desculpe, tive um problema. (Erro: ${data.error || 'Erro desconhecido'})`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  // Início do JSX
  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex-shrink-0 flex w-full items-center justify-between p-4 border-b border-border">
        <button onClick={onGoToAbout} className="rounded-full p-2 text-text-dark/60 transition-colors hover:bg-bg-page hover:text-text-dark">
          <Info size={22} />
        </button>
        <h1 className="text-lg font-semibold text-text-dark">Vérinha Chat</h1>
        {/* 4. Substituímos o 'div' vazio pelo novo botão Home */}
        <button onClick={onGoToHome} className="rounded-full p-2 text-text-dark/60 transition-colors hover:bg-bg-page hover:text-text-dark">
          <Home size={22} />
        </button>
      </header>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.user === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] p-3 px-4 shadow-sm ${msg.user === 'user'
                ? 'bg-black text-text-light rounded-lg rounded-tr-sm'
                // Aqui estava o erro de sintaxe anterior, também corrigido
                : 'bg-primary text-text-light rounded-lg rounded-tl-sm'
                }`}
            >
              {/* Renderiza HTML para o bot, texto puro para o usuário */}
              {msg.user === 'user' ? (
                msg.text
              ) : (
                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 px-4 text-text-dark/60">... digitando</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex-shrink-0 p-4 border-t border-border flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          // CORREÇÃO:
          // Era 'e.g.target.value', agora é 'e.target.value'
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Digite sua dúvida..."
          className="flex-grow p-3 border border-border rounded-xl text-sm text-text-dark placeholder-text-dark/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          type="submit"
          className="w-12 h-12 rounded-full bg-black text-text-light flex-shrink-0 flex items-center justify-center transition-transform hover:scale-105"
          disabled={isLoading}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
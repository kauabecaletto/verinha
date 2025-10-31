import React, { useState, useEffect, useRef } from 'react';
import { Info, Send } from 'lucide-react';

interface Message {
  id: string;
  user: 'user' | 'bot';
  text: string;
}

interface ChatScreenProps {
  onGoToAbout: () => void;
}

export const ChatScreen = ({ onGoToAbout }: ChatScreenProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { id: 'welcome', user: 'bot', text: 'Olá! Sou a Vérinha, sua assistente virtual do COTIL. Como posso ajudar?' }
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = inputText.trim();
    if (messageText === '' || isLoading) return;

    const newUserMessage = { id: Date.now().toString(), user: 'user' as const, text: messageText };
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        user: 'bot' as const,
        text: 'Desculpe, minha conexão com o back-end ainda não foi configurada!'
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex-shrink-0 flex w-full items-center justify-between p-4 border-b border-border">
        <button onClick={onGoToAbout} className="rounded-full p-2 text-text-dark/60 transition-colors hover:bg-bg-page hover:text-text-dark">
          <Info size={22} />
        </button>
        <h1 className="text-lg font-semibold text-text-dark">Vérinha Chat</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.user === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] p-3 px-4 shadow-sm ${msg.user === 'user'
                ? 'bg-black text-text-light rounded-lg rounded-tr-sm'
                : 'bg-primary text-text-light rounded-lg rounded-tl-sm'
                }`}
            >
              {msg.text}
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

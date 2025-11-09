import React, { useState } from 'react';
import { ArrowLeft, Code, Brain } from 'lucide-react';
// Corrigindo o caminho de importação, adicionando a extensão .tsx
// (Isso assume que AccordionItem.tsx está na mesma pasta 'components')
import { AccordionItem } from './AccordionItem.tsx'; 

interface AboutScreenProps {
  onGoBack: () => void;
}

export const AboutScreen = ({ onGoBack }: AboutScreenProps) => {
  const [openAccordion, setOpenAccordion] = useState('inspiracao');
  const handleAccordionClick = (id: string) => setOpenAccordion(openAccordion === id ? '' : id);

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex-shrink-0 flex w-full items-center justify-between p-4 border-b border-border">
        <button onClick={onGoBack} className="rounded-full p-2 text-text-dark/60 transition-colors hover:bg-bg-page hover:text-text-dark">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold text-text-dark">Sobre a Vérinha</h1>
        <div className="w-10"></div>
      </header>

      {/* Aumentei o padding inferior (pb-16) para dar mais espaço de rolagem */}
      <div className="flex-grow overflow-y-auto pb-16">
        <section className="flex flex-col items-center p-8 text-center">
          
          {/* Aumentei a margem inferior (mb-6) */}
          <div className="mb-6 h-24 w-24 rounded-full shadow-lg overflow-hidden">
            <img 
              src="/VerinhaSemFundo.png" // O nome exato do arquivo na pasta 'public'
              alt="Vérinha" 
              className="w-full h-full object-cover" 
            />
          </div>

          <h2 className="text-2xl font-semibold text-text-dark">Conheça a Vérinha</h2>
          {/* Aumentei a margem superior (mt-4) */}
          <p className="mt-4 text-text-dark/80 text-lg font-light">
            Sua assistente virtual inteligente, criada para tirar suas dúvidas sobre o nosso colégio.
          </p>
        </section>

        {/* Aumentei o padding inferior (pb-8) */}
        <section className="px-5 pb-8">
          {/* Aumentei a margem inferior (mb-5) */}
          <h2 className="mb-5 text-lg font-semibold text-center text-text-dark">Nosso Propósito</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <AccordionItem title="Inspiração" isOpen={openAccordion === 'inspiracao'} onClick={() => handleAccordionClick('inspiracao')}>
              <p>A ideia surgiu de uma palestra de Satya Nadella (CEO da Microsoft), que destacou o potencial dos copilotos de IA em otimizar tarefas.</p>
            </AccordionItem>
            <AccordionItem title="Problemática" isOpen={openAccordion === 'problematica'} onClick={() => handleAccordionClick('problematica')}>
              <p>Identificamos a sobrecarga da secretaria do COTIL durante o processo seletivo, com muitas perguntas repetidas de candidatos.</p>
            </AccordionItem>
            <AccordionItem title="Solução" isOpen={openAccordion === 'solucao'} onClick={() => handleAccordionClick('solucao')}>
              <p>A Vérinha automatiza esse atendimento com respostas rápidas e precisas, reduzindo a carga de trabalho e melhorando a experiência.</p>
            </AccordionItem>
          </div>
        </section>

        {/* Aumentei o padding inferior (pb-8) */}
        <section className="px-5 pb-8">
          {/* Aumentei a margem inferior (mb-5) */}
          <h2 className="mb-5 text-lg font-semibold text-center text-text-dark">Tecnologias</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 rounded-lg bg-bg-page p-4">
              <Code size={20} className="text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-text-dark">React & TailwindCSS</p>
                <p className="text-sm text-text-dark/70">Interface moderna e responsiva</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-bg-page p-4">
              <Brain size={20} className="text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-text-dark">OpenAI API (via Flask)</p>
                <p className="text-sm text-text-dark/70">Inteligência artificial generativa</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
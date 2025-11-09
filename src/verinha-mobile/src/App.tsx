import { useState } from 'react';
// Corrigindo os caminhos de importação (removendo a extensão .tsx)
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { AboutScreen } from './components/AboutScreen';

type ScreenType = 'home' | 'chat' | 'about';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');

  const goToChat = () => setCurrentScreen('chat');
  const goToAbout = () => setCurrentScreen('about');
  const goBack = () => setCurrentScreen('chat');
  // 1. Adicionamos a função para voltar à tela inicial
  const goToHome = () => setCurrentScreen('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onStartChat={goToChat} />;
      case 'chat':
        // 2. Passamos a nova função 'goToHome' para o ChatScreen
        return <ChatScreen onGoToAbout={goToAbout} onGoToHome={goToHome} />;
      case 'about':
        return <AboutScreen onGoBack={goBack} />;
      default:
        return <HomeScreen onStartChat={goToChat} />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-bg-page flex items-center justify-center p-4 font-sans">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-lg flex flex-col overflow-hidden"
        style={{ height: '95vh', maxHeight: '800px' }}
      >
        {renderScreen()}
      </div>
    </div>
  );
}

export default App;
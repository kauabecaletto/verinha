import { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { AboutScreen } from './components/AboutScreen';

type ScreenType = 'home' | 'chat' | 'about';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');

  const goToChat = () => setCurrentScreen('chat');
  const goToAbout = () => setCurrentScreen('about');
  const goBack = () => setCurrentScreen('chat');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onStartChat={goToChat} />;
      case 'chat':
        return <ChatScreen onGoToAbout={goToAbout} />;
      case 'about':
        return <AboutScreen onGoBack={goBack} />;
      default:
        return <HomeScreen onStartChat={goToChat} />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-bg-page flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg flex flex-col overflow-hidden" style={{ height: '95vh', maxHeight: '800px' }}>
        {renderScreen()}
      </div>
    </div>
  );
}

export default App;

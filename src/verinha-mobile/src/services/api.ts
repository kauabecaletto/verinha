// Define a URL do seu backend Flask
const API_URL = 'http://127.0.0.1:5000'; // Ou 'http://localhost:5000'

// Define a interface para o histórico (para type safety)
// Isso deve corresponder ao que o backend espera
interface ApiHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

// Define a interface para a resposta da API
interface ApiResponse {
  response?: string;
  status?: string;
  error?: string;
}

/**
 * Envia uma mensagem para o endpoint /chat do backend Flask.
 * @param message A nova mensagem do usuário.
 * @param conversation_history O histórico da conversa.
 * @returns Uma promessa que resolve com a resposta da API.
 */
export const sendChatMessage = async (
  message: string,
  conversation_history: ApiHistoryItem[]
): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        conversation_history: conversation_history,
      }),
    });

    if (!response.ok) {
      // Tenta pegar o erro do corpo da resposta, senão usa o status
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }

    return (await response.json()) as ApiResponse;
  } catch (error) {
    console.error('Erro ao chamar a API de chat:', error);
    // Retorna um objeto de erro padronizado
    return { error: (error as Error).message || 'Erro de conexão com o servidor.' };
  }
};
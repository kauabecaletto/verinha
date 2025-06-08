document.addEventListener("DOMContentLoaded", function () {
    // === VARIÁVEIS GLOBAIS ===
    let conversationHistory = [];
    let hasTransitioned = false;
    let isProcessing = false;
    let messageCounter = 0;
    
// === FUNCIONALIDADE DO ACORDEÃO ===
const accordions = document.querySelectorAll('.accordion');

accordions.forEach(accordion => {
    const headers = accordion.querySelectorAll('.accordion-header');

    headers.forEach(header => {
        header.addEventListener('click', function () {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            if (!isExpanded) {
                headers.forEach(h => {
                    h.setAttribute('aria-expanded', 'false');
                    h.nextElementSibling.style.display = 'none';
                });

                this.setAttribute('aria-expanded', 'true');
                this.nextElementSibling.style.display = 'block';
            }
        });
    });

    let hasOpen = false;
    headers.forEach(header => {
        if (header.getAttribute('aria-expanded') === 'true') {
            header.nextElementSibling.style.display = 'block';
            hasOpen = true;
        }
    });
    if (!hasOpen && headers.length > 0) {
        headers[0].setAttribute('aria-expanded', 'true');
        headers[0].nextElementSibling.style.display = 'block';
    }
});

// === ELEMENTOS DA INTERFACE ===
const welcomeContainer = document.getElementById("welcome-container");
const welcomeForm = document.getElementById("welcome-form");
const welcomeInput = document.getElementById("welcome-input");

const chatContainer = document.getElementById("chat-container");
const chatLayout = document.getElementById("chat-layout");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");

const questionBtns = document.querySelectorAll(".question-btn");

console.log('Elementos encontrados:', {
    welcomeContainer: !!welcomeContainer,
    chatForm: !!chatForm,
    userInput: !!userInput,
    questionBtns: questionBtns.length
});

// === FUNÇÃO PRINCIPAL DE PROCESSAMENTO (CORRIGIDA) ===
function processMessage(message, source = 'unknown') {
    messageCounter++;
    const currentId = messageCounter;
    
    console.log(`[${currentId}] processMessage chamada:`, { message, source, isProcessing });
    
    // Validação rigorosa para evitar duplicação
    if (isProcessing) {
        console.log(`[${currentId}] Mensagem bloqueada - já processando`);
        return false;
    }
    
    if (!message || message.trim() === "") {
        console.log(`[${currentId}] Mensagem vazia ignorada`);
        return false;
    }
    
    const trimmedMessage = message.trim();
    
    // Verificação para evitar mensagens duplicadas consecutivas
    const lastUserMessage = conversationHistory
        .slice()
        .reverse()
        .find(msg => msg.role === 'user');
        
    if (lastUserMessage && lastUserMessage.content === trimmedMessage) {
        const timeDiff = new Date() - new Date(lastUserMessage.timestamp);
        if (timeDiff < 2000) { // Menos de 2 segundos
            console.log(`[${currentId}] Mensagem duplicada detectada e ignorada (${timeDiff}ms)`);
            return false;
        }
    }
    
    isProcessing = true;
    console.log(`[${currentId}] Iniciando processamento`);
    
    try {
        addUserMessage(trimmedMessage);
        
        // Limpa input APENAS se a fonte for um campo de entrada específico
        if (source === 'welcome-form' && welcomeInput) {
            welcomeInput.value = "";
        } else if (source === 'chat-form' && userInput) {
            userInput.value = "";
        }
        
        sendMessageToAPI(trimmedMessage)
            .finally(() => {
                setTimeout(() => {
                    isProcessing = false;
                    console.log(`[${currentId}] Processamento liberado`);
                }, 500);
            });
            
        console.log(`[${currentId}] Processamento iniciado`);
        return true;
        
    } catch (error) {
        console.error(`[${currentId}] Erro no processamento:`, error);
        isProcessing = false;
        return false;
    }
}

// === INICIALIZAÇÃO ===
if (welcomeForm) {
    welcomeForm.addEventListener("submit", function(event) {
        event.preventDefault();
        
        if (!hasTransitioned && welcomeInput && !isProcessing) {
            const initialMessage = welcomeInput.value.trim();
            if (initialMessage) {
                hasTransitioned = true; // Marca antes de mostrar a interface
                showChatInterface(initialMessage);
            }
        }
    });
} else {
    // Se não tem welcomeContainer, já exibe chat direto
    if (chatContainer) {
        chatContainer.style.display = "flex";
        chatContainer.classList.add("fade-in");
    }
    if (chatLayout) {
        chatLayout.style.display = "flex";
        chatLayout.classList.add("fade-in");
    }
}

// === EVENT LISTENERS CORRIGIDOS ===

// Chat form submit
if (chatForm) {
    console.log('Configurando chat form');
    chatForm.addEventListener("submit", function(event) {
        event.preventDefault();
        
        const message = userInput ? userInput.value.trim() : "";
        console.log('Chat form submetido:', message);
        if (message && !isProcessing) {
            processMessage(message, 'chat-form');
        }
    });
}

// Botões de perguntas frequentes
questionBtns.forEach((btn, index) => {
    console.log(`Configurando botão ${index}`);
    btn.addEventListener("click", function(event) {
        event.preventDefault();
        
        const question = this.getAttribute("data-question");
        console.log('Botão clicado:', question);
        if (question && !isProcessing) {
            processMessage(question, 'button');
        }
    });
});

// === FUNÇÕES DE INTERFACE ===

function showChatInterface(initialMessage = "") {
    if (!welcomeContainer || !initialMessage) return;
    
    console.log('Mostrando interface de chat:', initialMessage);
    welcomeContainer.classList.add("welcome-exit");
    
    setTimeout(() => {
        welcomeContainer.style.display = "none";
        
        const targetElement = chatLayout || chatContainer;
        if (targetElement) {
            targetElement.style.display = "flex";
            
            setTimeout(() => {
                targetElement.classList.add("fade-in");
                
                // CORRIGIDO: Processa a mensagem inicial apenas uma vez
                if (initialMessage.trim() !== "") {
                    console.log('Enviando mensagem inicial:', initialMessage);
                    processMessage(initialMessage, 'initial');
                }
                
                if (userInput) {
                    userInput.focus();
                }
            }, 50);
        }
    }, 500);
}

function addUserMessage(message) {
    if (!chatMessages) {
        console.error('chatMessages não encontrado');
        return;
    }
    
    console.log('Adicionando mensagem do usuário:', message);
    
    const messageDiv = document.createElement("div");
    messageDiv.className = "message user-message";
    
    const avatarDiv = document.createElement("div");
    avatarDiv.className = "message-avatar";
    avatarDiv.innerText = "EU";
    
    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    
    const paragraph = document.createElement("p");
    paragraph.innerText = message;
    
    contentDiv.appendChild(paragraph);
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(avatarDiv);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    // Adiciona a mensagem do usuário ao histórico
    conversationHistory.push({
        role: "user",
        content: message,
        timestamp: new Date().toISOString()
    });
    
    console.log('Mensagem adicionada. Total no histórico:', conversationHistory.length);
}

function addBotMessage(message) {
    if (!chatMessages) return;
    
    console.log('Adicionando mensagem do bot');
    
    const messageDiv = document.createElement("div");
    messageDiv.className = "message bot-message";
    
    const avatarDiv = document.createElement("div");
    avatarDiv.className = "message-avatar";
    
    const avatarImg = document.createElement("img");
    avatarImg.src = "/src/front-end/assents/logos/VerinhaSemFundo.png";
    avatarImg.alt = "Vérinha";
    
    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    
    const paragraph = document.createElement("p");
    paragraph.innerHTML = formatBotMessage(message);
    
    avatarDiv.appendChild(avatarImg);
    contentDiv.appendChild(paragraph);
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    // Adiciona a resposta do bot ao histórico
    conversationHistory.push({
        role: "assistant",
        content: message,
        timestamp: new Date().toISOString()
    });
    
    // Limita o histórico a 20 mensagens para não sobrecarregar
    if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
    }
}

function formatBotMessage(message) {
    return message.replace(/\n/g, "<br>");
}

function showTypingIndicator() {
    if (!chatMessages) return;
    
    const typingDiv = document.createElement("div");
    typingDiv.className = "typing-indicator";
    typingDiv.id = "typing-indicator";
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span");
        typingDiv.appendChild(dot);
    }
    
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function scrollToBottom() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// === API COMMUNICATION ===
async function sendMessageToAPI(message) {
    console.log('Enviando para API:', message);
    
    try {
        showTypingIndicator();
        
        const requestData = {
            message: message,
            conversation_history: conversationHistory.filter(msg => msg.role !== undefined)
        };
        
        const response = await fetch("http://localhost:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        removeTypingIndicator();
        addBotMessage(data.response);
        
        console.log('Resposta da API recebida');
        
    } catch (error) {
        console.error("Erro na API:", error);
        removeTypingIndicator();
        addBotMessage("Desculpe, estou com dificuldades para me comunicar com o servidor. Por favor, tente novamente mais tarde. 😔");
    }
}

// === FUNÇÕES UTILITÁRIAS ===

function addWelcomeMessage() {
    setTimeout(() => {
        addBotMessage("Olá! Sou a Vérinha, sua assistente virtual do COTIL. Como posso ajudar? 😊");
    }, 500);
}

function clearConversationHistory() {
    conversationHistory = [];
    messageCounter = 0;
    isProcessing = false;
    hasTransitioned = false;
    if (chatMessages) {
        chatMessages.innerHTML = '';
    }
    addWelcomeMessage();
}

// === INICIALIZAÇÃO FINAL ===

// Adicionar mensagem de boas-vindas se necessário
const shouldShowWelcome = (!welcomeContainer && chatContainer && chatContainer.style.display !== "none") ||
                            (!welcomeContainer && chatLayout && chatLayout.style.display !== "none");

if (shouldShowWelcome) {
    addWelcomeMessage();
}

// Focar no campo apropriado
setTimeout(() => {
    if (welcomeContainer && welcomeContainer.style.display !== "none" && welcomeInput) {
        welcomeInput.focus();
    } else if (userInput) {
        userInput.focus();
    }
}, 100);

// Expor funções para debug
window.clearChat = clearConversationHistory;
window.debugChat = () => {
    console.log('Estado atual:', {
        isProcessing,
        messageCounter,
        conversationHistory: conversationHistory.length,
        hasTransitioned
    });
};
});
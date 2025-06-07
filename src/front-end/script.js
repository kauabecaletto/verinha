document.addEventListener("DOMContentLoaded", function () {
    // Variável para armazenar o histórico da conversa atual
    let conversationHistory = [];
    
    // Elementos da interface de acordeão
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
});

document.addEventListener("DOMContentLoaded", function() {
    // Elementos da interface de boas-vindas
    const welcomeContainer = document.getElementById("welcome-container");
    const welcomeForm = document.getElementById("welcome-form");
    const welcomeInput = document.getElementById("welcome-input");
    
    // Elementos da interface de chat
    const chatContainer = document.getElementById("chat-container");
    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");
    const chatMessages = document.getElementById("chat-messages");
    
    // Histórico da conversa atual
    let conversationHistory = [];
    
    // Inicialização
    if (welcomeForm) {
        welcomeForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const initialMessage = welcomeInput.value.trim();
            showChatInterface(initialMessage);
        });
    } else {
        chatContainer.style.display = "flex";
        chatContainer.classList.add("fade-in");
    }
    
    // Configuração do envio de mensagens no chat
    chatForm.addEventListener("submit", function(event) {
        event.preventDefault();
        
        const message = userInput.value.trim();
        
        if (message !== "") {
            addUserMessage(message);
            userInput.value = "";
            sendMessageToAPI(message);
        }
    });
    
    // Função para mostrar a interface de chat e esconder a tela de boas-vindas
    function showChatInterface(initialMessage = "") {
        if (!welcomeContainer) return;
        
        welcomeContainer.classList.add("welcome-exit");
        
        setTimeout(() => {
            welcomeContainer.style.display = "none";
            chatContainer.style.display = "flex";
            
            setTimeout(() => {
                chatContainer.classList.add("fade-in");
                
                if (initialMessage && initialMessage.trim() !== "") {
                    addUserMessage(initialMessage);
                    sendMessageToAPI(initialMessage);
                }
                
                userInput.focus();
            }, 50);
        }, 500);
    }
    
    // Função para adicionar uma mensagem do usuário à conversa
    function addUserMessage(message) {
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
    }
    
    // Função para adicionar uma mensagem do bot à conversa
    function addBotMessage(message) {
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
    
    // Função para formatar a mensagem do bot
    function formatBotMessage(message) {
        let formattedMessage = message.replace(/\n/g, "<br>");
        return formattedMessage;
    }
    
    // Função para mostrar o indicador de digitação
    function showTypingIndicator() {
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
    
    // Função para remover o indicador de digitação
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById("typing-indicator");
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Função para rolar para o final da conversa
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Função que faz a requisição para a API do Flask
    async function sendMessageToAPI(message) {
        try {
            showTypingIndicator();
            
            // Prepara os dados para enviar, incluindo o histórico da conversa
            const requestData = {
                message: message,
                conversation_history: conversationHistory
            };
            
            const response = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error("Erro na comunicação com o servidor");
            }
            
            const data = await response.json();
            removeTypingIndicator();
            addBotMessage(data.response);
            
        } catch (error) {
            console.error("Erro:", error);
            removeTypingIndicator();
            addBotMessage("Desculpe, estou com dificuldades para me comunicar com o servidor. Por favor, tente novamente mais tarde. 😔");
        }
    }
    
    // Adicionar funcionalidade para enviar com Enter
    userInput.addEventListener("keypress", function(event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            chatForm.dispatchEvent(new Event("submit"));
        }
    });
    
    // Função para adicionar uma mensagem de boas-vindas inicial
    function addWelcomeMessage() {
        setTimeout(() => {
            addBotMessage("Olá! Sou a Vérinha, sua assistente virtual do COTIL. Como posso ajudar? 😊");
        }, 500);
    }
    
    // Função para limpar o histórico da conversa (opcional)
    function clearConversationHistory() {
        conversationHistory = [];
        chatMessages.innerHTML = '';
        addWelcomeMessage();
    }
    
    // Adicionar mensagem de boas-vindas se estiver na interface de chat diretamente
    if (!welcomeContainer && chatContainer.style.display !== "none") {
        addWelcomeMessage();
    }
    
    // Focar no campo de entrada apropriado
    if (welcomeContainer && welcomeContainer.style.display !== "none") {
        welcomeInput.focus();
    } else {
        userInput.focus();
    }
    
    // Expor função para limpar histórico globalmente (para debug/teste)
    window.clearChat = clearConversationHistory;
});
from flask import Flask, request, jsonify
import openai
from flask_cors import CORS

# Configuração da API OpenAI
openai.api_key = ""

with open("src/data/edital.txt", "r", encoding="utf-8") as file:
    edital_context = file.read()

app = Flask(__name__)

# Habilitar CORS para aceitar requisições de qualquer origem
CORS(app)

# Função para gerar respostas com base no edital e no tom da Vérinha
def generate_response(user_message):
    try:
        # Chamada para a API da OpenAI com a nova interface
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[ 
                {
                    "role": "system",
                    "content": (
                        "Você é Vérinha, uma assistente virtual inspirada na zeladora do colégio. "
                        "Você é doce, educada, sempre prestativa e acolhedora. Responda às perguntas com clareza e carinho. "
                        "Não forneça respostas longas ou com tom impessoal, torne-as mais amigáveis e com tom acolhedor. "
                        "Quando perguntarem seu nome, diga: 'Meu nome é Vérinha, estou aqui para ajudar!' "
                        "Responda às perguntas do usuário com base no seguinte edital adaptando as respostas para um tom amigável e acolhedor. "
                        "Não forneça informações em blocos de textos, separe-os e use emojis. "
                        "para um tom mais suave, empático e organizado, de modo que as informações fiquem mais acessíveis e claras. "
                        f"{edital_context}"  # Passa o contexto do edital aqui
                    )
                },
                {"role": "user", "content": user_message}
            ]
        )
        return response['choices'][0]['message']['content']
    except Exception as e:
        return f"Erro ao gerar resposta: {str(e)}"


# Rota para a página inicial
@app.route("/")
def home():
    return "Bem-vindo ao servidor Flask!"

# Rota para o chat
@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"error": "Mensagem vazia"}), 400

    response = generate_response(user_message)
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True)

from flask import Flask, request, jsonify
import openai
from flask_cors import CORS
import sqlite3
from datetime import datetime

# Configuração da API OpenAI
openai.api_key = "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"

# Conectar ao banco e obter todas as seções do edital
def carregar_edital_do_banco():
    conn = sqlite3.connect("edital.db")
    cursor = conn.cursor()
    cursor.execute("SELECT titulo, conteudo FROM secoes_edital ORDER BY id")
    secoes = cursor.fetchall()
    conn.close()

    # Montar o contexto em formato de texto
    contexto = ""
    for titulo, conteudo in secoes:
        contexto += f"\n📘 {titulo.strip()}\n{conteudo.strip()}\n"

    return contexto

# Carregar contexto ao iniciar
edital_context = carregar_edital_do_banco()

app = Flask(__name__)
CORS(app)

# Função para gerar respostas com base no edital e no tom da Vérinha
def generate_response(user_message):
    try:
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
                        f"{edital_context}"  # Contexto vindo do banco agora
                    )
                },
                {"role": "user", "content": user_message}
            ]
        )
        return response['choices'][0]['message']['content']
    except Exception as e:
        return f"Erro ao gerar resposta: {str(e)}"

@app.route("/")
def home():
    return "Bem-vindo ao servidor Flask!"

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"error": "Mensagem vazia"}), 400

    response = generate_response(user_message)
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True)

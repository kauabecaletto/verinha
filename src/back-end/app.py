import os
import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from openai import OpenAI
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# --- 1. CONFIGURAÇÕES GERAIS ---

app = Flask(__name__)
CORS(app)

# Configuração da API OpenAI
try:
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except Exception as e:
    print(f"❌ Erro ao configurar cliente OpenAI: {e}")
    openai_client = None

# --- 2. CONEXÃO CENTRALIZADA COM O MONGODB ---

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    mongo_client.admin.command('ping')
    db = mongo_client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    print("✅ Conexão com MongoDB estabelecida com sucesso!")
    print(f"   - Database: '{DATABASE_NAME}'")
    print(f"   - Collection: '{COLLECTION_NAME}'")
except (ConnectionFailure, Exception) as e:
    print(f"❌ Falha ao conectar com MongoDB: {e}")
    mongo_client = None
    db = None
    collection = None

# --- 3. FUNÇÕES AUXILIARES ---

def carregar_edital_completo():
    """Carrega o edital completo do MongoDB usando a conexão global."""
    # CORREÇÃO APLICADA AQUI
    if collection is None:
        print("Erro: A coleção do MongoDB não está disponível.")
        return None
    try:
        documento = collection.find_one()
        return documento
    except Exception as e:
        print(f"Erro ao buscar edital no MongoDB: {e}")
        return None

def formatar_resposta(texto):
    """Remove ### e converte **texto** em <strong>texto</strong> para HTML."""
    texto = re.sub(r'^###\s*', '', texto, flags=re.MULTILINE)
    texto = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', texto)
    return texto

# --- 4. ENDPOINTS DA API (ROTAS) ---

@app.route("/")
def home():
    """Endpoint principal para verificar o status do servidor."""
    mongo_status = "Desconectado"
    if mongo_client:
        try:
            mongo_client.admin.command('ping')
            mongo_status = "Conectado"
        except ConnectionFailure:
            mongo_status = "Desconectado"
    return jsonify({"status": "Servidor Flask rodando!", "mongodb_status": mongo_status})

@app.route("/test-mongo", methods=["GET"])
def test_mongo():
    """Endpoint de diagnóstico para o MongoDB."""
    # CORREÇÃO APLICADA AQUI
    if collection is None:
        return jsonify({"error": "A conexão com o MongoDB não foi estabelecida"}), 500

    try:
        collections_list = db.list_collection_names()
        doc_count = collection.count_documents({})
        sample_doc = collection.find_one()
        if sample_doc and '_id' in sample_doc:
            sample_doc['_id'] = str(sample_doc['_id'])
        return jsonify({
            "status": "Conexão MongoDB OK",
            "database": DATABASE_NAME,
            "available_collections": collections_list,
            "target_collection": COLLECTION_NAME,
            "documents_in_collection": doc_count,
            "sample_document": sample_doc
        })
    except Exception as e:
        return jsonify({"error": f"Erro ao acessar MongoDB: {str(e)}"}), 500

@app.route("/chat", methods=["POST"])
def chat():
    """Endpoint principal para interagir com o chatbot."""
    data = request.json
    user_message = data.get("message")
    conversation_history = data.get("conversation_history", [])

    if not user_message:
        return jsonify({"error": "A mensagem não pode ser vazia"}), 400

    edital = carregar_edital_completo()
    if not edital:
        return jsonify({"error": "Edital não encontrado no banco de dados. Verifique a conexão e o nome da coleção."}), 404

    if '_id' in edital:
        edital.pop('_id')

    try:
        contexto_edital = json.dumps(edital, ensure_ascii=False, indent=2)
    except Exception as e:
        return jsonify({"error": f"Erro ao processar o conteúdo do edital: {str(e)}"}), 500

    system_prompt = (
        "Você é Vérinha, assistente virtual doce e acolhedora do COTIL. "
        "Responda às perguntas com base no seguinte edital do COTIL:\n\n" + contexto_edital + "\n\n"
        "Use um tom amigável, com emojis quando apropriado, e respostas claras e objetivas. "
        "Mantenha o contexto da conversa atual. Se a pergunta não puder ser respondida com base no edital, "
        "seja honesta e diga que não encontrou a informação."
    )

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(conversation_history[-10:])
    messages.append({"role": "user", "content": user_message})

    try:
        if not openai_client:
            return jsonify({"error": "Cliente OpenAI não foi inicializado."}), 500

        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=1000,
        )
        resposta_gpt = response.choices[0].message.content
        resposta_formatada = formatar_resposta(resposta_gpt)
        return jsonify({"response": resposta_formatada, "status": "success"})

    except Exception as e:
        print(f"Erro na chamada da API OpenAI: {e}")
        return jsonify({"error": f"Erro ao gerar resposta da IA: {str(e)}", "status": "error"}), 500

@app.route("/edital", methods=["GET"])
def get_edital():
    """Endpoint para visualizar o edital completo em formato JSON."""
    edital = carregar_edital_completo()
    if not edital:
        return jsonify({"error": "Edital não encontrado"}), 404
    
    if '_id' in edital:
        edital['_id'] = str(edital['_id'])
        
    return jsonify(edital)

# --- 5. INICIALIZAÇÃO DO SERVIDOR ---

if __name__ == "__main__":
    print("Iniciando servidor Flask...")
    app.run(debug=True, host='0.0.0.0', port=5000)
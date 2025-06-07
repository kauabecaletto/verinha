from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import openai
import json
import os
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv
load_dotenv()  # carrega o .env


# Configuração da API OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app)

# Configurações do MongoDB
MONGO_URI = os.getenv("MONGO_URI")  # String de conexão do Atlas no .env
DATABASE_NAME = os.getenv("DATABASE_NAME", "verinha_bd")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "verinha_bd")

def get_mongo_client():
    """Cria uma conexão com o MongoDB"""
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        return client
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"Erro ao conectar com MongoDB: {e}")
        return None

def carregar_edital_completo():
    """Carrega o edital completo do MongoDB"""
    client = get_mongo_client()
    if not client:
        return None
    
    try:
        db = client[DATABASE_NAME]
        colecao = db[COLLECTION_NAME]
        
        documento = colecao.find_one({"id": "cotil_edital_2025"})
        
        if not documento:
            documento = colecao.find_one()
            
        return documento
    
    except Exception as e:
        print(f"Erro ao buscar edital: {e}")
        return None
    
    finally:
        client.close()

def testar_conexao_mongodb():
    """Testa a conexão com o MongoDB"""
    client = get_mongo_client()
    if client:
        try:
            db = client[DATABASE_NAME]
            colecoes = db.list_collection_names()
            print(f"Conexão MongoDB OK. Coleções disponíveis: {colecoes}")
            return True
        except Exception as e:
            print(f"Erro ao listar coleções: {e}")
            return False
        finally:
            client.close()
    return False

@app.route("/")
def home():
    return jsonify({
        "status": "Servidor Flask rodando!",
        "mongodb_status": "Conectado" if testar_conexao_mongodb() else "Desconectado"
    })

@app.route("/test-mongo", methods=["GET"])
def test_mongo():
    """Endpoint para testar a conexão com MongoDB"""
    client = get_mongo_client()
    if not client:
        return jsonify({"error": "Não foi possível conectar ao MongoDB"}), 500
    
    try:
        db = client[DATABASE_NAME]
        colecoes = db.list_collection_names()
        
        colecao = db[COLLECTION_NAME]
        documentos_count = colecao.count_documents({})
        
        exemplo_doc = colecao.find_one()
        
        return jsonify({
            "status": "Conexão MongoDB OK",
            "database": DATABASE_NAME,
            "collections": colecoes,
            "documents_count": documentos_count,
            "sample_document_keys": list(exemplo_doc.keys()) if exemplo_doc else None
        })
    
    except Exception as e:
        return jsonify({"error": f"Erro ao acessar MongoDB: {str(e)}"}), 500
    
    finally:
        client.close()

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message")
    conversation_history = data.get("conversation_history", [])  # Histórico da conversa atual
    
    if not user_message:
        return jsonify({"error": "Mensagem vazia"}), 400
    
    # Carrega o edital do MongoDB
    edital = carregar_edital_completo()
    if not edital:
        return jsonify({"error": "Edital não encontrado no banco de dados"}), 404
    
    # Remove o _id do MongoDB para evitar problemas de serialização
    if '_id' in edital:
        del edital['_id']
    
    # Convertendo o edital inteiro para string JSON
    try:
        contexto_edital = json.dumps(edital, ensure_ascii=False, indent=2)
    except Exception as e:
        return jsonify({"error": f"Erro ao processar edital: {str(e)}"}), 500
    
    # Prompt do sistema com contexto do edital
    system_prompt = (
        "Você é Vérinha, assistente virtual doce e acolhedora do COTIL. "
        "Responda às perguntas com base no seguinte edital do COTIL:\n\n" + contexto_edital + "\n\n"
        "Use um tom amigável, com emojis quando apropriado, e respostas claras e objetivas. "
        "Mantenha o contexto da conversa atual para dar continuidade às perguntas do usuário. "
        "Se uma pergunta se referir a algo mencionado anteriormente na conversa, use esse contexto para dar uma resposta mais precisa. "
        "Se a pergunta não puder ser respondida com base no edital, seja honesta sobre isso."
    )
    
    try:
        # Constrói o histórico de mensagens para a API
        messages = [{"role": "system", "content": system_prompt}]
        
        # Adiciona o histórico da conversa atual
        for msg in conversation_history[-10:]:  # Limita a 10 mensagens anteriores para não exceder o limite
            if msg.get("role") in ["user", "assistant"]:
                messages.append({
                    "role": msg["role"], 
                    "content": msg["content"]
                })
        
        # Adiciona a mensagem atual do usuário
        messages.append({"role": "user", "content": user_message})
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=1000,
        )
        
        resposta = response['choices'][0]['message']['content']
        
        return jsonify({
            "response": resposta,
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Erro ao gerar resposta: {str(e)}",
            "status": "error"
        }), 500

@app.route("/edital", methods=["GET"])
def get_edital():
    """Endpoint para visualizar o edital armazenado"""
    edital = carregar_edital_completo()
    if not edital:
        return jsonify({"error": "Edital não encontrado"}), 404
    
    if '_id' in edital:
        del edital['_id']
    
    return jsonify(edital)

if __name__ == "__main__":
    print("Iniciando servidor Flask...")
    print(f"MongoDB URI: {MONGO_URI}")
    print(f"Database: {DATABASE_NAME}")
    print(f"Collection: {COLLECTION_NAME}")
    
    if testar_conexao_mongodb():
        print("✅ Conexão com MongoDB estabelecida com sucesso!")
    else:
        print("❌ Problema na conexão com MongoDB")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
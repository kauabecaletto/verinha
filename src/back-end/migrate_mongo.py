from pymongo import MongoClient
import json
from dotenv import load_dotenv
import os

load_dotenv()

# Configurações
MONGO_LOCAL = "mongodb://localhost:27017/"
MONGO_CLOUD = os.getenv("MONGO_URI")  # Sua string do Atlas no .env
DATABASE_NAME = os.getenv("DATABASE_NAME", "verinha_bd")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "verinha_bd")

def migrar_dados():
    """Migra dados do MongoDB local para o Atlas"""
    
    print("🔄 Iniciando migração de dados...")
    
    # Conectar ao MongoDB local
    try:
        client_local = MongoClient(MONGO_LOCAL, serverSelectionTimeoutMS=5000)
        client_local.admin.command('ping')
        print("✅ Conectado ao MongoDB local")
    except Exception as e:
        print(f"❌ Erro ao conectar MongoDB local: {e}")
        return False
    
    # Conectar ao MongoDB Atlas
    try:
        client_cloud = MongoClient(MONGO_CLOUD, serverSelectionTimeoutMS=5000)
        client_cloud.admin.command('ping')
        print("✅ Conectado ao MongoDB Atlas")
    except Exception as e:
        print(f"❌ Erro ao conectar MongoDB Atlas: {e}")
        return False
    
    try:
        # Acessar coleções
        db_local = client_local[DATABASE_NAME]
        colecao_local = db_local[COLLECTION_NAME]
        
        db_cloud = client_cloud[DATABASE_NAME]
        colecao_cloud = db_cloud[COLLECTION_NAME]
        
        # Contar documentos locais
        total_docs = colecao_local.count_documents({})
        print(f"📊 Total de documentos para migrar: {total_docs}")
        
        if total_docs == 0:
            print("⚠️  Nenhum documento encontrado no MongoDB local")
            return True
        
        # Migrar documentos
        documentos = list(colecao_local.find({}))
        
        # Limpar coleção cloud (opcional)
        colecao_cloud.delete_many({})
        print("🗑️  Coleção cloud limpa")
        
        # Inserir documentos
        resultado = colecao_cloud.insert_many(documentos)
        print(f"✅ {len(resultado.inserted_ids)} documentos migrados com sucesso!")
        
        # Verificar migração
        total_cloud = colecao_cloud.count_documents({})
        print(f"📊 Total de documentos no Atlas: {total_cloud}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro durante migração: {e}")
        return False
    
    finally:
        client_local.close()
        client_cloud.close()

def verificar_dados_cloud():
    """Verifica se os dados estão no Atlas"""
    
    try:
        client = MongoClient(MONGO_CLOUD, serverSelectionTimeoutMS=5000)
        db = client[DATABASE_NAME]
        colecao = db[COLLECTION_NAME]
        
        total = colecao.count_documents({})
        print(f"📊 Documentos no Atlas: {total}")
        
        if total > 0:
            # Mostrar um documento de exemplo
            exemplo = colecao.find_one()
            if exemplo and '_id' in exemplo:
                del exemplo['_id']
            
            print("📄 Exemplo de documento:")
            print(json.dumps(exemplo, ensure_ascii=False, indent=2)[:500] + "...")
        
        client.close()
        return total > 0
        
    except Exception as e:
        print(f"❌ Erro ao verificar dados: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Script de Migração MongoDB")
    print("=" * 40)
    
    if not MONGO_CLOUD:
        print("❌ MONGO_URI não configurado no .env")
        exit(1)
    
    print(f"Local:  {MONGO_LOCAL}")
    print(f"Cloud:  {MONGO_CLOUD[:50]}...")
    print(f"DB:     {DATABASE_NAME}")
    print(f"Coll:   {COLLECTION_NAME}")
    print("=" * 40)
    
    # Verificar se já existem dados no cloud
    if verificar_dados_cloud():
        resposta = input("⚠️  Já existem dados no Atlas. Deseja sobrescrever? (s/N): ")
        if resposta.lower() != 's':
            print("❌ Migração cancelada")
            exit(0)
    
    # Executar migração
    if migrar_dados():
        print("🎉 Migração concluída com sucesso!")
        verificar_dados_cloud()
    else:
        print("❌ Falha na migração")
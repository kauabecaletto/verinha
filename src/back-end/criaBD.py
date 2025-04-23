import sqlite3
import re
from datetime import datetime

# 1. Ler o conteúdo do edital
with open("src/data/edital.txt", "r", encoding="utf-8") as file:
    texto = file.read()

# 2. Separar por seções (assumindo que os títulos estão em MAIÚSCULAS com quebra de linha)
padrao_secoes = re.findall(r'\n([A-Z\sÁÉÍÓÚÂÊÔÇ]+)\n(.*?)(?=\n[A-Z\sÁÉÍÓÚÂÊÔÇ]+\n|\Z)', texto, re.DOTALL)

# 3. Conectar ao banco SQLite
conn = sqlite3.connect('chatbot_edital.db')
cursor = conn.cursor()

# 4. Criar tabela
cursor.execute('''
    CREATE TABLE IF NOT EXISTS secoes_edital (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        conteudo TEXT NOT NULL,
        data_upload DATETIME NOT NULL
    )
''')

# 5. Inserir os dados
data_upload = datetime.now()
for titulo, conteudo in padrao_secoes:
    cursor.execute('''
        INSERT INTO secoes_edital (titulo, conteudo, data_upload)
        VALUES (?, ?, ?)
    ''', (titulo.strip(), conteudo.strip(), data_upload))

conn.commit()
conn.close()

print(f"Inserção concluída com {len(padrao_secoes)} seções.")

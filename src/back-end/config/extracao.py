from PyPDF2 import PdfReader

# Caminho para o arquivo PDF
pdf_path = "edital_completo.pdf"

# Lendo o PDF
reader = PdfReader(pdf_path)
text = ""

# Extraindo texto de todas as páginas
for page in reader.pages:
    text += page.extract_text()

# Salvando ou exibindo o texto extraído
print("Texto do PDF:")
print(text)

# Opcional: salvar em um arquivo de texto
with open("edital-completo.txt", "w", encoding="utf-8") as file:
    file.write(text)

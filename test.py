from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings

embeddings = OllamaEmbeddings(model="nomic-embed-text")
db = Chroma(
    persist_directory="data/chroma_db",
    embedding_function=embeddings,
    collection_name="court_navigator",
)
print("total chunks:", db._collection.count())

# test a query
results = db.similarity_search("what is the punishment for theft in pakistan", k=3)
for r in results:
    print("---")
    print("source:", r.metadata.get("source"))
    print("preview:", r.page_content[:200])

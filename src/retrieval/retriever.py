from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_ollama import OllamaEmbeddings

CHROMA_DIR = "data/chroma_db"
COLLECTION_NAME = "court_navigator"


def get_retriever(k: int = 5):
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    db = Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings,
        collection_name=COLLECTION_NAME,
    )
    return db.as_retriever(search_kwargs={"k": k})


def retrieve(query: str, k: int = 5) -> list[Document]:
    retriever = get_retriever(k)
    results = retriever.invoke(query)
    return results


if __name__ == "__main__":
    query = "what is the punishment for theft in pakistan"
    print(f"query: {query}\n")
    results = retrieve(query)
    for i, doc in enumerate(results):
        print(f"--- result {i + 1} ---")
        print(f"source: {doc.metadata.get('source')}")
        print(f"preview: {doc.page_content[:300]}")
        print()

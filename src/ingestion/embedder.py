import os

from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

CHROMA_DIR = "data/chroma_db"
COLLECTION_NAME = "court_navigator"


def get_embeddings():
    return OllamaEmbeddings(model="nomic-embed-text")


def chunk_documents(docs: list[Document]) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
    )
    chunks = splitter.split_documents(docs)
    # filter out empty or too large chunks
    chunks = [c for c in chunks if len(c.page_content.strip()) > 20]
    print(f"split into {len(chunks)} chunks")
    return chunks


def embed_and_store(docs: list[Document]):
    chunks = chunk_documents(docs)
    embeddings = get_embeddings()

    print("storing in chroma...")

    batch_size = 25

    db = None
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        print(f"processing chunks {i} to {i + len(batch)} of {len(chunks)}...")

        # try each chunk individually if batch fails
        valid_batch = []
        for chunk in batch:
            try:
                embeddings.embed_query(chunk.page_content)
                valid_batch.append(chunk)
            except Exception as e:
                print(f"  skipping bad chunk: {chunk.page_content[:50]}... ({e})")

        if not valid_batch:
            continue

        try:
            if db is None:
                db = Chroma.from_documents(
                    documents=valid_batch,
                    embedding=embeddings,
                    persist_directory=CHROMA_DIR,
                    collection_name=COLLECTION_NAME,
                )
            else:
                db.add_documents(valid_batch)
        except Exception as e:
            print(f"  batch failed: {e}")

    print(f"done. {db._collection.count()} chunks stored in chroma")
    return db


def load_chroma():
    embeddings = get_embeddings()
    return Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings,
        collection_name=COLLECTION_NAME,
    )


if __name__ == "__main__":
    from hf_loader import load_hf_judgments
    from pdf_loader import load_pdfs

    print("=== loading data ===")
    hf_docs = load_hf_judgments()
    pdf_docs = load_pdfs()
    all_docs = hf_docs + pdf_docs
    print(f"total documents: {len(all_docs)}")

    print("\n=== embedding and storing ===")
    embed_and_store(all_docs)

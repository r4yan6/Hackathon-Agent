import os

from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document


def load_pdfs(pdf_dir: str = "data/pdfs") -> list[Document]:
    docs = []
    pdf_files = [f for f in os.listdir(pdf_dir) if f.endswith(".pdf")]

    if not pdf_files:
        print("no PDFs found in data/pdfs/")
        return docs

    for filename in pdf_files:
        path = os.path.join(pdf_dir, filename)
        print(f"loading: {filename}")
        try:
            loader = PyPDFLoader(path)
            pages = loader.load()
            for page in pages:
                page.metadata["source"] = filename
            docs.extend(pages)
            print(f"  → {len(pages)} pages loaded")
        except Exception as e:
            print(f"  → failed: {e}")

    print(f"\ntotal pages loaded: {len(docs)}")
    return docs


if __name__ == "__main__":
    docs = load_pdfs()
    print(f"\nsample:")
    print(f"source: {docs[0].metadata['source']}")
    print(f"preview: {docs[0].page_content[:200]}")

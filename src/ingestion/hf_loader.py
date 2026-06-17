from datasets import load_dataset
from langchain_core.documents import Document


def load_hf_judgments() -> list[Document]:
    print("loading dataset from huggingface...")
    ds = load_dataset("Ibtehaj10/supreme-court-of-pak-judgments", split="train")

    docs = []
    for row in ds:
        text = row["text"]
        if not text or len(text.strip()) < 50:
            continue

        # citation_number is a string like "{'id': 'C.A.10_2021.pdf', 'url': ''}"
        # just extract the id part cleanly
        citation = row["citation_number"]
        if isinstance(citation, str) and "'id'" in citation:
            citation = citation.split("'id': '")[1].split("'")[0]

        doc = Document(
            page_content=text,
            metadata={
                "source": "supreme_court",
                "citation": citation,
            },
        )
        docs.append(doc)

    print(f"loaded {len(docs)} judgments")
    return docs


if __name__ == "__main__":
    docs = load_hf_judgments()
    print(f"\nsample:")
    print(f"citation: {docs[0].metadata['citation']}")
    print(f"preview: {docs[0].page_content[:200]}")

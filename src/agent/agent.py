import os
import sys

from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from retrieval.retriever import retrieve

load_dotenv()


def format_docs(docs):
    return "\n\n".join(
        [
            f"[Source: {doc.metadata.get('source', 'unknown')}]\n{doc.page_content}"
            for doc in docs
        ]
    )


def build_chain():
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.2,
    )
    prompt = ChatPromptTemplate.from_template("""
You are a legal assistant specialized in Pakistani law. Your job is to help ordinary
people understand their legal rights and situation based on Pakistani laws and court judgments.

Use the following legal context to answer the question. Always:
1. Cite the relevant law or section number if available
2. Explain in simple, clear language
3. Mention relevant court precedents if available
4. End with: "Please consult a qualified lawyer before taking any legal action."

Context:
{context}

Question: {question}

Answer:
""")

    chain = (
        {
            "context": lambda x: format_docs(retrieve(x["question"], k=10)),
            "question": RunnablePassthrough() | (lambda x: x["question"]),
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain


def ask(question: str) -> str:
    chain = build_chain()
    return chain.invoke({"question": question})


if __name__ == "__main__":
    questions = [
        "what is the punishment for theft in pakistan",
        "my landlord won't return my deposit, what can I do",
        "what are my rights if I am wrongfully terminated from my job",
    ]

    for q in questions:
        print(f"\n{'=' * 60}")
        print(f"Q: {q}")
        print(f"{'=' * 60}")
        print(ask(q))

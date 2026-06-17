# Court Navigator 🏛️

An agentic RAG-powered legal assistant for Pakistani law. Helps ordinary people 
understand their legal rights, relevant laws, and court precedents in plain language.

## Features
- Q&A over Pakistani law using RAG (Retrieval Augmented Generation)
- Sources: Supreme Court judgments + key Pakistani legislation
- Powered by local embeddings (Ollama) and free LLM (OpenRouter)

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/your-username/court-navigator
cd court-navigator
```

### 2. Install dependencies
```bash
uv sync
```

### 3. Install and start Ollama
```bash
brew install ollama
brew services start ollama
ollama pull nomic-embed-text
```

### 4. Set up environment variables
Create a `.env` file in the root:

Get a free key at openrouter.ai/keys

### 5. Download the legal PDFs
Download the following PDFs and place them in `data/pdfs/`:

| Document | Source |
|----------|--------|
| Pakistan Penal Code (PPC) | pakistancode.gov.pk |
| Code of Criminal Procedure (CrPC) | pakistancode.gov.pk |
| Family Laws Ordinance | pakistancode.gov.pk |
| Rent Restriction Ordinance | pakistancode.gov.pk |
| Labour Laws | pakistancode.gov.pk |

### 6. Build the vector database
This will download the Supreme Court judgments dataset from HuggingFace 
and embed all documents into ChromaDB. Takes a few hours — run overnight.

```bash
caffeinate -i uv run src/ingestion/embedder.py
```

This creates a `data/chroma_db/` directory (~500MB) with 80k+ chunks from:
- 1,414 Supreme Court of Pakistan judgments (HuggingFace: `Ibtehaj10/supreme-court-of-pak-judgments`)
- 5 key Pakistani law PDFs (~738 pages total)

### 7. Run the agent
```bash
uv run src/agent/agent.py
```

## Project Structure
court-navigator/

├── src/

│   ├── ingestion/

│   │   ├── hf_loader.py      # loads HuggingFace judgments dataset

│   │   ├── pdf_loader.py     # loads local PDF legislation

│   │   └── embedder.py       # chunks, embeds, stores in ChromaDB

│   ├── retrieval/

│   │   └── retriever.py      # queries ChromaDB for relevant chunks

│   ├── agent/

│   │   ├── tools.py          # agent tools

│   │   └── agent.py          # main RAG chain

│   └── ui/

│       └── app.py            # Streamlit frontend

├── data/

│   ├── chroma_db/            # generated — not in repo

│   └── pdfs/                 # not in repo, download manually

└── .env                      # not in repo, create manually
## Disclaimer
This tool is for informational purposes only. Always consult a qualified lawyer 
before taking any legal action.

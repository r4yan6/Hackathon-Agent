# Court Navigator — Project Context

## What We're Building
An agentic RAG-powered legal assistant for Pakistani law. Helps ordinary people
understand their legal rights, relevant laws, and court precedents in plain language.
Built for a hackathon focused on agentic AI and RAG, targeting Track 5 (Open Innovation).

## Tech Stack
- **Embeddings**: Ollama (nomic-embed-text) — runs locally, no API key
- **Vector DB**: ChromaDB — persists locally at `data/chroma_db/` (~500MB, 80,891 chunks)
- **LLM**: Llama 3.3 70B via Groq API (free tier)
- **Framework**: LangChain (langchain-core, langchain-groq, langchain-chroma, langchain-ollama)
- **Backend**: FastAPI (built, running on port 8000)
- **Frontend**: React + Vite (built, running on port 5173)
- **Package Manager**: uv (on macOS)
- **Python**: 3.14

## Data Sources
1. **HuggingFace Dataset**: `Ibtehaj10/supreme-court-of-pak-judgments`
   - 1,414 Supreme Court of Pakistan judgments
   - Fields: `text`, `case_details`, `citation_number`, `embeddings`
   - Citation parsed from string like `"{'id': 'C.A.10_2021.pdf', 'url': ''}"`

2. **Local PDFs** (stored in `data/pdfs/`, not in repo):
   - Pakistan Penal Code (PPC) — 218 pages
   - Code of Criminal Procedure (CrPC) — 307 pages
   - Rent Law — 14 pages
   - Family Law — 13 pages
   - Labour Laws — 186 pages
   - Total: 738 pages

## Project Structure
```
court-navigator/
├── src/
│   ├── ingestion/
│   │   ├── hf_loader.py      # loads HuggingFace judgments dataset
│   │   ├── pdf_loader.py     # loads local PDF legislation
│   │   └── embedder.py       # chunks, embeds, stores in ChromaDB
│   ├── retrieval/
│   │   └── retriever.py      # queries ChromaDB, returns top-k chunks
│   ├── agent/
│   │   ├── tools.py          # agent tools
│   │   └── agent.py          # main RAG chain
├── frontend/                 # React + Vite frontend
├── data/
│   ├── chroma_db/            # generated, not in repo (too large)
│   └── pdfs/                 # not in repo, download manually
├── .env                      # not in repo
├── .gitignore
├── README.md
└── pyproject.toml
```

## Key Implementation Details

### hf_loader.py
- Loads dataset with `load_dataset("Ibtehaj10/supreme-court-of-pak-judgments", split="train")`
- Skips rows with text shorter than 50 chars
- Parses citation from string using split on `'id': '`
- Returns list of `langchain_core.documents.Document`

### pdf_loader.py
- Uses `PyPDFLoader` from `langchain_community`
- Walks `data/pdfs/` directory, loads all `.pdf` files
- Sets `source` metadata to filename
- Returns list of Documents (one per page)

### embedder.py
- Chunks with `RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)`
- Filters chunks shorter than 20 chars
- Embeds using `OllamaEmbeddings(model="nomic-embed-text")`
- Stores in ChromaDB at `data/chroma_db/`, collection `court_navigator`
- Processes in batches of 100
- Total: 80,891 chunks stored
- Ran overnight using `caffeinate -i uv run src/ingestion/embedder.py`
- `load_chroma()` function for loading existing DB without re-embedding

### retriever.py
- Loads existing ChromaDB with `OllamaEmbeddings`
- `get_retriever(k=5)` returns a LangChain retriever
- `retrieve(query, k=5)` returns list of Documents

### agent.py
- Uses `ChatGroq(model="llama-3.3-70b-versatile")`
- RAG chain: retrieve (k=10) → format docs with source → prompt → LLM → parse
- Prompt instructs model to cite law sections, explain simply, reference precedents
- Always ends with disclaimer to consult a lawyer
- `ask(question)` is the main public function
- Tested on 3 questions, output quality is excellent with proper citations

## Environment Variables
```
GROQ_API_KEY=your_key_here
```

## APIs Tried
- Gemini (quota exceeded on free tier)
- OpenRouter / Nemotron 3 Ultra 550B (worked but switched)
- Groq / Llama 3.3 70B (current, working well)
- Ollama locally for embeddings (working, no rate limits)

## Known Issues / Notes
- `langchain-community` shows deprecation warning for PyPDFLoader (harmless)
- PDF "wrong pointing object" warnings are harmless
- `.env` was accidentally committed early — keys were rotated and history purged
- `data/chroma_db/` excluded from git (too large: ~500MB)
- `data/pdfs/` excluded from git (copyrighted)
- Used `git filter-branch` to purge secrets and large files from history

## Next Steps
- Build FastAPI backend to expose `ask()` as an endpoint
- Build React frontend with chat UI
- Add more PDFs (FIR procedure, court fee schedules, jurisdiction guides)
- Add `draft_complaint()` tool for agentic behavior

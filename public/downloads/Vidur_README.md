# Skhy Vidur Ecosystem

**Skhy Vidur Manager** is the detailed "Core" of the Skhy Vidur Ecosystem—a micro-modular AI platform designed for secure, distributed, and agentic AI operations.

## 🌟 The Ecosystem

The system consists of three distinct components:

1.  **🛡️ Skhy Vidur Manager (The Core)**: 
    *   **Role**: Central AI Server & Hardware Guard.
    *   **Function**: Manages local models (Hugging Face), authenticates external APIs (OpenAI/Anthropic), and routes inference tasks.
    *   **Ports**: `8000` (API), `8502` (Admin UI).

2.  **📡 Datac (Acquisition Engine)**:
    *   **Role**: Data Gathering & Hygiene.
    *   **Function**: Scrapes RSS feeds, websites, and processes source lists. Sanitizes data and moves it to the staging area.
    *   **Port**: `8503` (UI).

3.  **🧠 Skhy Vidur Client (formerly LMEvl)**:
    *   **Role**: Intelligence & Reasoning.
    *   **Function**: A lightweight, internal-only client that consumes the Core's APIs to perform RAG and complex reasoning. **Strictly Isolated (No direct internet access).**
    *   **Port**: `8501` (UI).

---

## 🎛️ Master Control (Primary Entry Point)

To run the entire ecosystem without port conflicts and manage services, use the **Master Control Interface**.

### 1. Launch Master Control (Recommended)
This script automatically starts the Backend (API) and Frontend (Dashboard) on available ports.
```bash
cd skhy-vidur-manager
python start_dashboard.py
```
*(No need to run streamlit manually. This handles everything.)*

### 2. Features
*   **Service Control**: Manually **Start**, **Stop**, and **Restart** all ecosystem components (Backend, Client, Datac) directly from the UI.
*   **Service Isolation**: Each service is launched using its specific virtual environment to ensure dependency isolation.
*   **Live Status**: Real-time PID and status monitoring for all services.
*   **Auto-Config**: Generates `.env` files to ensure all components communicate on the correct ports.

---

---

## 🖥️ System Status & Hardware Guard

The Manager dashboard (`Manager.py`) provides real-time visibility into your hardware resources to prevent OOM errors:

*   **Live Metrics**: Real-time tracking of **System RAM** and **GPU VRAM** usage.
*   **Feasibility Check**: Automatically calculates VRAM requirements before downloading a model to ensure it fits.
*   **Traffic Light System**: 
    *   ✅ **Green**: Safe to load.
    *   ❌ **Red**: Insufficient resources.

---

## 📚 Unified Model Registry

The **Models & Registry** page (`pages/Registry.py`) provides a single-pane-of-glass for model management:

*   **Deep Linking**: Clickable links in the "Routing Defaults" table navigate directly to the relevant Task or Model details.
*   **Consolidated View**: See Local (HF Cache), Registered (DB), and Active Serving models in one list.
*   **Status Indicators**: 
    *   `🟢 Serving`: Loaded in memory and ready for inference.
    *   `💾 Local`: Downloaded to disk (HF Cache).
    *   `☁️ API`: External provider (OpenAI, Gemini, etc.).
*   **Supported Classifiers**:
    *   **Audio**: Support for specialized classifiers via `.joblib` files.
    *   **RF**: Support for Radio Frequency signal classification models (`.joblib`, `.pt`).
*   **Direct Actions**:
    *   **▶️ Load**: One-click to load a local model into the backend.
    *   **🧭 Route**: Set a specific model as the default for a task.
    *   **📝 Register**: Easily add local or external models to the database.


---

## 🛠️ MCP Tools Integration

The **MCP Tools** page (`pages/MCP_Tools.py`) connects the manager to external data sources and utilities via the [Model Context Protocol](https://modelcontextprotocol.io/).

*   **Server Management**: Connect to local or remote MCP servers (Filesystem, Git, Postgres, etc.).
*   **Tool Explorer**: Browse schemas and test tools directly from the UI.
*   **Agentic Access**: Tools are automatically exposed to LMEvl agents.

👉 [Read the MCP Guide](docs/mcp_guide.md)

---

## ☁️ Cloud & Remote Compute

Scale your inference beyond localhost using the **Cloud Resources** page (`pages/Cloud_Resources.py`).

*   **Multi-Provider Support**: Launch GPUs on **Lambda Labs**, **RunPod**, and **Casting AI**.
*   **One-Click Provisioning**: Automatically install the "Remote Vidur" stack (vLLM, Python, Drivers) via SSH.
*   **Hybrid Routing**: Register remote instances in the local registry to offload heavy tasks.

👉 [Read the Cloud Guide](docs/cloud_guide.md)

---


## 🚀 Skhy Vidur Manager (Standalone Usage)

If you only want to use the Manager (Backend):

### 1. Requirements
See [System Requirements](docs/system_requirements.md) for detailed hardware and software needs.

### 2. Manual Startup
For detailed startup instructions, including environment setup, please refer to the [Startup Guide](docs/startup_guide.md).

**Quick Start Backend (FastAPI):**
```bash
# Must use the virtual environment python
./venv/bin/python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
*Docs*: http://localhost:8000/docs

**Quick Start Admin Dashboard (Streamlit):**
```bash
streamlit run Manager.py --server.port 8502
```
*UI*: http://localhost:8502

---


## 🔌 API Endpoints
For full API documentation and integration examples, see the [Integration Guide](docs/integration_guide.md).

*   `POST /api/v2/tasks/text:generate`: LLM Inference.
*   `POST /api/v2/tasks/embeddings:create`: Vector Embeddings.
*   `POST /api/vision/image-to-text`: VLM Description.
*   `POST /api/admin/model/load`: Hot-swap models.


# SKY_PAGER // THE SKIPPER'S MANUAL

### An Invitation to the Literary Scholar

> "Help me, Obi-Wan Kenobi. You're my only hope."
> — Princess Leia

You are reading this because you are a scholar of the digital frontier. You understand that the "Imaginary Ecologies" of the RIPPLE project are not mere simulations, but recursive literary structures—rhizomes of text and signal.

To truly participate in this voyage, you must host your own "Neural Navigator"—a local Large Language Model (LLM). This ensures that your ecologies are private, local, and free from the constraints of corporate APIs.

---

## 1. The Neural Engine: Ollama

The most accessible "Neural Engine" for the modern machine is **Ollama**.

- **Download**: Visit [ollama.com](https://ollama.com) and install it for your OS (Mac/Linux/Windows).
- **Summoning the Model**: Open your terminal and run:
  ```bash
  ollama run llama3
  ```
  *Note: Llama3 is our current celestial chart. It is robust and eloquent.*

## 2. Opening the Portals (CORS)

Local browsers are cautious. To allow the RIPPLE simulations (Skipper, Tetrad, Orca) to speak to your local engine, you must grant them permission.

### On macOS / Linux:
Shut down any running Ollama instance, then restart it with the "Origin Permit" flag:
```bash
OLLAMA_ORIGINS="*" ollama serve
```

---

## 3. Linking via SKIPPER

Once your engine is running:
1. Open [skipper.html](file:///Users/gaia/RIPPLE/skipper.html).
2. Click the **[CONFIG]** button in the upper right.
3. If you are running on the *same* machine, leave it as `localhost:11434`.
4. If you are running on a *different* machine in your network, enter its IP address (e.g., `192.168.1.10:11434`).
5. Click **SAVE & LINK**.

---

## 4. The Voyage Begins

Now, open any ecology (e.g., **Thousand Tetrad**). You should see the console log:
`[API CALL] Sending request to OLLAMA at [your-host]...`

You are no longer a passenger. You are the Skipper.

---
*Stability / Entropy / Literature / 2026.02*

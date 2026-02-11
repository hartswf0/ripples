# RIPPLE API Manifest

The following files in the RIPPLE project are equipped to use a Google Cloud API Key (Gemini/Imagen).

To enable AI features, open these files and insert your API key into the `const apiKey = ""` or `const API_KEY = ""` variable found in the source code.

| File | API Model | Variable Name | Line Number (Approx) |
|------|-----------|---------------|----------------------|
| [6.html](6.html) | Gemini 2.5 Flash | `apiKey` | 53 |
| [9.html](9.html) | Gemini 2.5 Flash | `apiKey` | ~50 |
| [12.html](12.html) | Gemini 2.5 Flash / Imagen 4.0 | `apiKey` | 60 |
| [13.html](13.html) | Gemini 2.5 Flash | `apiKey` | 152 |
| [66.html](66.html) | Gemini 2.5 Flash | `API_KEY` | 445 |
| [orca-shield-17.html](orca-shield-17.html) | Imagen 3.0 | `apiKey` | ~1060 |

## Local LLM Support (Ollama / LM Studio)
Files `6.html`, `9.html`, `12.html`, `13.html`, and `66.html` have been upgraded to support local OpenAI-compatible endpoints (like Ollama or LM Studio).

To usage a local LLM:
1. Open the file in a code editor.
2. Search for the `AI_CONFIG` object.
3. Set `useLocalLLM: true`.
4. (Optional) Update `local.endpoint` and `local.model` if you are not using the default Ollama settings (`http://localhost:11434/v1/chat/completions`, `llama3`).

| File | Supports Local LLM? | Config Object |
|------|---------------------|---------------|
| [6.html](6.html) | ✅ Yes | `AI_CONFIG` |
| [9.html](9.html) | ✅ Yes | `AI_CONFIG` |
| [12.html](12.html) | ✅ Yes | `AI_CONFIG` |
| [13.html](13.html) | ✅ Yes | `AI_CONFIG` |
| [66.html](66.html) | ✅ Yes | `AI_CONFIG` |
| [orca-shield-17.html](orca-shield-17.html) | ✅ Yes (Text Scanning) | `AI_CONFIG` |
| [orca-08.html](orca-08.html) | ✅ Yes | `AI_CONFIG` |
| [orca-moss-16.html](orca-moss-16.html) | ✅ Yes | `AI_CONFIG` |
| [orca-moss-1616.html](orca-moss-1616.html) | ✅ Yes | `AI_CONFIG` |

## Notes
- `ripple-12.html` contains references to an API key but currently relies on mock data.
- Most files default to a "Mock/Simulation" mode if no API key is present or if the local LLM is unreachable.

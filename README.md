# Learn Orthodox (Tewahedo Education Platform)

<div align="center">
  <img src="public/glasswindow.png" alt="Learn Orthodox Logo" width="160" style="margin-bottom: 20px; filter: drop-shadow(0px 8px 16px rgba(0,0,0,0.1));" />
  
  <h3>Ancient Wisdom. Sacred Tradition. Modern AI Assistance.</h3>
  <p>
    An interactive, trilingual educational portal dedicated to preserving and exploring the rich liturgical heritage, catechism, patristics, and sacred chanting of the Ethiopian Orthodox Tewahedo Church.
  </p>

 
</div>

---


**Learn Orthodox** is a modern Web application designed for diaspora communities, theological students, and curious learners worldwide. It serves as an accessible bridge to the ancient Ge'ez and Amharic liturgical traditions by pairing authentic texts with side-by-side English translations and an interactive AI commentary layer.

### Core Features

1. **Trilingual Parallel Reader**
   * Experience the **Divine Liturgy of St. Dioscoros** in its original **Ge'ez (ግዕዝ)**, **Amharic (አማርኛ)** translation, and **English** translation.
   * Customize view preferences (display all languages in parallel, or focus only on specific ones).
   * Visual role indicators distinguishing parts spoken by the Priest, Assistant Priest, Deacon, Congregation, Cantor, and Rubrics.

2. **AI-Powered Theological Explainer**
   * Click any liturgical verse to consult a real-time, multi-provider AI commentary layer.
   * Delivers structured, objective, and reverent breakdowns containing **Theological Core**, **Liturgical Context**, and **Symbolism**.
   * Supports Google Gemini, OpenAI GPT, and Anthropic Claude out-of-the-box.

3. **Hybrid Online/Offline Architecture**
   * Uses **Supabase** as its primary cloud data store.
   * Automatically falls back to a local filesystem JSON database (`content/liturgy/`) if network connectivity is interrupted or Supabase is unconfigured, ensuring 100% uptime.

4. **Semantic Search Readiness**
   * Features a pre-configured `pgvector` database schema and similarity-search SQL helper function, enabling future vector-based semantic retrieval.

---
## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository.
2. Create a branch named `feature/your-feature-name`.
3. Submit a Pull Request detailing the changes and benefits.

---

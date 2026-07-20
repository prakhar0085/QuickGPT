# 🤖 QuickGPT

> An intelligent AI assistant web app — a ChatGPT-inspired clone built with the MERN stack, featuring real-time text & image generation, secure authentication, and a credit-based subscription system.

🔗 **Live Demo:** [quick-gpt-cyan.vercel.app](https://quick-gpt-cyan.vercel.app/)

---

## ✨ Features

- 🔐 **Secure Authentication** — JWT-based login & signup with bcrypt password hashing
- 💬 **AI Text Chat** — Powered by Groq 
- 🎨 **AI Image Generation** — On-the-fly image creation using ImageKit's AI transformation
- 🖼️ **Community Gallery** — Users can publish their generated images for others to explore
- 💳 **Credit-Based Subscription** — Razorpay-powered plans (Basic, Pro, Premium) to purchase credits
- 🌗 **Dark / Light Mode** — Seamless theme toggle for comfortable viewing
- 💾 **Persistent Chat History** — Conversations are saved and retrievable per user
- 📱 **Fully Responsive UI** — Built with Tailwind CSS for a smooth experience across devices

---

## 🛠️ Tech Stack

**Frontend**
- React.js (Vite)
- Tailwind CSS
- React Router DOM
- Axios
- React Hot Toast
- React Markdown + Prism.js (for formatted AI responses)

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT (JSON Web Tokens) for authentication
- bcryptjs for password hashing

**Integrations**
- 🧠 GROQ API (OpenAI-compatible endpoint) — AI text generation
- 🖼️ ImageKit — AI image generation & media storage
- 💳 Razorpay — Payment gateway for credit purchases
- ☁️ Vercel — Deployment (both client & server)

---

## 📁 Folder Structure

```
QuickGPT/
├── client/                    # React frontend
│   ├── src/
│   │   ├── assets/            # Images, icons & static data
│   │   ├── components/        # Reusable UI components (ChatBox, Sidebar, Message)
│   │   ├── context/           # Global state management (AppContext)
│   │   ├── pages/             # Route-level pages (Login, Credits, Community, Loading)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                    # Express backend
    ├── configs/                # DB, ImageKit & OpenAI(Gemini) configs
    ├── controllers/             # Route logic (chat, credit, message, user)
    ├── middlewares/              # Auth middleware (JWT verification)
    ├── models/                   # Mongoose schemas (User, Chat, Transaction)
    ├── routes/                   # API route definitions
    ├── server.js
    ├── vercel.json
    └── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `server/` directory with the following keys:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
GROQ_API_KEY=your_groq_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

And inside the `client/` directory:

```env
VITE_SERVER_URL=your_deployed_backend_url
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/sanyogitasinghbgm-spec/QuickGPT.git
cd QuickGPT
```

### 2. Setup the Server
```bash
cd server
npm install
npm run server
```

### 3. Setup the Client
```bash
cd client
npm install
npm run dev
```

The app will be running locally — visit the URL shown in your terminal (typically `http://localhost:5173`).

---

## 💳 Credit Plans

| Plan | Price | Credits | Highlights |
|------|-------|---------|------------|
| Basic | $10 | 100 | 100 text + 50 image generations |
| Pro | $20 | 500 | 500 text + 200 image generations, priority support |
| Premium | $30 | 1000 | 1000 text + 500 image generations, dedicated support |

---

## 📌 Roadmap

- [ ] Add voice-based chat input
- [ ] Multi-language support
- [ ] Export chat as PDF
- [ ] Admin dashboard for analytics

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👩‍💻 Author

**App Development and Documentation — Sanyogita Singh**

---

<p align="center">Made with 💜 and a lot of debugging</p>

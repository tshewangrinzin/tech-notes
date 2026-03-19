# Technology Notes

A modern, comprehensive documentation site for Computer Science, Web Development, and Emerging Technologies. Built with [Fumadocs](https://fumadocs.dev) and [Next.js](https://nextjs.org).

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm/yarn

### local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/tshewangrinzin/tech-notes.git
    cd tech-notes
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    ```

3.  **Run development server**:
    ```bash
    pnpm dev
    ```

4.  **Open the site**:
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Documentation**: [Fumadocs](https://fumadocs.dev)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/) with [OpenRouter](https://openrouter.ai/)
- **Linting & Formatting**: [Biome](https://biomejs.dev/)

## 📚 Key Topics Covered

The documentation covers a wide range of technical subjects, including:

- **Terminal**: Master the command line basics and advanced workflows.
- **Git & GitHub**: Effective version control and collaboration.
- **IDEs**: Setting up and optimizing your development environment.
- **Computer Science Fundamentals**: Number systems, data representation, memory management, and algorithms.
- **Web Development**: JavaScript, SQL, Database Management, and Web Integration.
- **Emerging Tech**: AI, Robotics, and Cybersecurity.

## 💬 AI Chat Assistant

This project includes an integrated AI Chat Assistant to help you navigate and understand the documentation. To enable it locally, configure the following environment variables:

Create a `.env.local` file in the project root:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=minimax/minimax-m2.5:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

## 📂 Project Structure

- `content/docs`: Markdown/MDX files for the documentation.
- `app/api/chat`: Route handler for the AI Chat Assistant.
- `components`: Custom UI components used across the site.
- `lib`: Shared utilities and data fetching logic.

## 📄 License

This project is licensed under the MIT License.

# InsightForge

InsightForge is a Next.js application that uses AI to generate detailed reports on various topics. It features in-place editing, PDF export, and a query history.

## Features

-   **AI-Powered Report Generation**: Leverages the Gemini Pro API via Genkit to create structured reports.
-   **In-Place Editing**: Modify any section of the generated report.
-   **PDF Export**: Save your final report as a text-selectable PDF.
-   **Query History**: Access previously generated reports using local storage.
-   **Light/Dark Mode**: Switch between themes for your viewing comfort.

## Tech Stack

-   [Next.js](https://nextjs.org/) (App Router)
-   [React](https://react.dev/)
-   [TypeScript](https://www.typescriptlang.org/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [ShadCN UI](https://ui.shadcn.com/)
-   [Genkit](https://firebase.google.com/docs/genkit) for AI integration

## Running Locally

To run InsightForge on your local machine, follow these steps:

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (version 20 or later recommended)
-   [npm](https://www.npmjs.com/) (or another package manager like yarn or pnpm)
-   [Git](https://git-scm.com/) for version control

### 2. Clone the Repository

To get the app's code on your local machine, you'll need to clone its source code repository.

1.  Open your terminal or command prompt.
2.  Run the following command (replace the placeholder with your repository's actual URL):
    ```bash
    git clone <YOUR_REPOSITORY_URL_HERE>
    ```
3.  Navigate into the newly created project directory:
    ```bash
    cd InsightForge
    ```

After cloning, you can proceed to the next steps.

### 3. Install Dependencies

Install the necessary project dependencies using npm:

```bash
npm install
```

### 4. Set Up Environment Variables

The application requires a Google AI API key to function.

1.  Create a `.env` file by copying the example:
    ```bash
    cp .env.example .env
    ```
2.  Open the newly created `.env` file in your editor.
3.  Obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4.  Add your key to the `.env` file:
    ```
    GOOGLE_API_KEY="YOUR_API_KEY_HERE"
    ```

### 5. Run the Development Servers

You need to run two separate processes in two different terminal windows: the Genkit AI server and the Next.js web server.

-   **Terminal 1: Start the Genkit server**
    This server handles the communication with the AI model. The `--watch` flag will automatically restart it when you make changes to your AI flows.

    ```bash
    npm run genkit:watch
    ```

-   **Terminal 2: Start the Next.js server**
    This server runs the user interface.

    ```bash
    npm run dev
    ```

### 6. Open the App

Once both servers are running, open your web browser and navigate to:

[http://localhost:3000](http://localhost:3000)

You should now be able to use the InsightForge application locally!

## Publishing to GitHub

If you have the project code locally and want to publish it to your own new repository on GitHub, follow these instructions.

1.  **Create a Repository on GitHub:**
    -   Go to [github.com](https://github.com), log in, and click the `+` icon in the top-right to select **New repository**.
    -   Choose a name for your repository (e.g., `insightforge-app`).
    -   **Important:** Leave the "Initialize this repository with:" options unchecked. Your project already has a `README.md` and other necessary files.
    -   Click **Create repository**.

2.  **Push Your Local Code:**
    -   In your terminal, navigate to the project's root directory.
    -   Initialize Git, add your files, and make your first commit:
        ```bash
        git init -b main
        git add .
        git commit -m "Initial commit"
        ```
    -   Link your local repository to the remote one on GitHub. **Replace the URL** with the one provided by GitHub:
        ```bash
        git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
        ```
    -   Push your code to GitHub:
        ```bash
        git push -u origin main
        ```

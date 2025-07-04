# **App Name**: InsightForge

## Core Features:

- AI-Powered Report Generation: Generate a structured report on a user-defined topic, broken down into standard sections (introduction, history, benefits, challenges, current trends, future scope), leveraging the Gemini Pro API as a tool for research.
- Structured Report Display: Display the AI-generated report in a modern, responsive web layout, including clear section headings and expandable/collapsible sections.
- In-Place Editing: Enable users to directly edit any section of the generated report using a rich text editor (like Quill.js or TipTap), for customization and refinement.
- PDF Export: Allow users to export the finalized report as a styled PDF document for sharing and archival.
- Theme Switching: Implement a toggle to switch between dark and light mode to cater to user preferences and viewing conditions.
- Query History: Store the previous research queries or topic titles using local storage, enabling users to quickly access their previously generated reports.

## Style Guidelines:

- Background: #0f0f0f (deep black)
- Cards/Containers: #1a1a1a or #1e1e1e
- Borders: #2a2a2a (subtle grey)
- Text (primary): #f5f5f5
- Text (secondary): #a0a0a0
- Accent/Highlight: #6366f1 (cool indigo), #14b8a6 (teal) or #eab308 (warm gold)
- Font: Use modern fonts like Inter, Poppins, or Roboto
- Headings: Larger and bolder (text-2xl, font-semibold)
- Paragraphs: text-base or text-sm with relaxed line spacing
- Use flex/grid layout
- Keep generous padding (p-6, p-8)
- Central focus: content area + sidebar (if needed)
- Use minimalist, line-based icons to represent different sections and functionalities, ensuring clarity and a modern aesthetic.
- Incorporate smooth loading animations and transitions during report generation to enhance user experience and convey progress.
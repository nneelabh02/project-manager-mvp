# Project Manager MVP

A modern project management application built with Next.js, Supabase, and OpenAI integration.

## Architecture

```mermaid
graph TD
    subgraph Frontend
        A[Next.js App] --> B[Pages]
        B --> C[Dashboard]
        B --> D[Project Details]
        B --> E[Task Management]
        B --> F[Authentication]
        
        A --> G[Components]
        G --> H[TaskCard]
        G --> I[TaskForm]
        G --> J[AIFeatures]
        G --> K[AuthForm]
        
        A --> L[Contexts]
        L --> M[AuthContext]
    end

    subgraph Backend Services
        N[Supabase] --> O[Authentication]
        N --> P[Database]
        P --> Q[Projects Table]
        P --> R[Tasks Table]
        
        S[OpenAI API] --> T[AI Features]
        T --> U[Task Suggestions]
        T --> V[Project Summaries]
        T --> W[Task Prioritization]
    end

    subgraph Data Flow
        Frontend --> Backend Services
        AuthContext --> Supabase
        AIFeatures --> OpenAI API
    end

    style Frontend fill:#f9f,stroke:#333,stroke-width:2px
    style Backend Services fill:#bbf,stroke:#333,stroke-width:2px
    style Data Flow fill:#dfd,stroke:#333,stroke-width:2px
```

### Architecture Components

#### Frontend
- **Next.js App**: The main application framework
  - **Pages**: 
    - Dashboard: Main project overview
    - Project Details: Individual project view
    - Task Management: Task creation and editing
    - Authentication: Login and signup
  - **Components**:
    - TaskCard: Display individual tasks
    - TaskForm: Create and edit tasks
    - AIFeatures: AI-powered task suggestions and summaries
    - AuthForm: User authentication forms
  - **Contexts**:
    - AuthContext: Manages authentication state

#### Backend Services
- **Supabase**:
  - Authentication: User management and security
  - Database: 
    - Projects Table: Stores project information
    - Tasks Table: Stores task details and relationships
- **OpenAI API**:
  - Task Suggestions: AI-generated task recommendations
  - Project Summaries: Automated project progress summaries
  - Task Prioritization: AI-assisted task ordering

#### Data Flow
- Frontend components communicate with backend services
- Authentication state is managed through AuthContext
- AI features are integrated through OpenAI API calls

## Features
- User authentication and authorization
- Project and task management
- Drag-and-drop task organization
- AI-powered task suggestions
- Project progress summaries
- Task prioritization
- Responsive design

## Tech Stack
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **AI Integration**: OpenAI API
- **Styling**: Tailwind CSS
- **State Management**: React Context API

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - Create `.env.local` file
   - Add your Supabase and OpenAI API keys
4. Run the development server: `npm run dev`

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## Database Schema
### Projects Table
- id: UUID (Primary Key)
- title: String
- description: Text
- created_at: Timestamp
- user_id: UUID (Foreign Key)

### Tasks Table
- id: UUID (Primary Key)
- title: String
- description: Text
- status: Enum ('todo', 'in_progress', 'done')
- due_date: Timestamp
- project_id: UUID (Foreign Key)
- user_id: UUID (Foreign Key)
- order: Integer

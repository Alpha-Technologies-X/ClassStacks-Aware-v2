# ClassStacks Aware

ClassStacks Aware is a browser-based classroom monitoring and management dashboard built with React.  
It is designed for teachers, IT administrators, and school administrators to manage classes, monitor student activity, and enforce classroom focus rules in real time.

This project is a **front-end prototype / proof of concept**. All data is stored using a browser-based storage API (`window.storage`) and does **not** currently include a real backend or authentication server.

---

## Features

### Authentication & Roles
- Login and signup flow
- Supported roles:
  - Teacher
  - IT Admin
  - School Admin
- School Admins can generate school codes
- Teachers and IT Admins must join using a valid school code

### Class Management
- Create and manage multiple classes
- Auto-generated class join codes
- Start and end class sessions
- View class status (active / inactive)

### Student Management
- Add students to a class
- Auto-generate student extension codes
- View student status (online / offline)
- Track:
  - Current website
  - Last activity time
  - Screen lock state
  - Internet pause state

### Classroom Controls
- Pause or resume student internet access
- Lock or unlock student screens
- Send direct messages to students
- Reward students with temporary free browsing (UI simulation)

### Focus & Rules
- Focus Mode (allowed sites only)
- Blocked site list (default includes YouTube, TikTok, Instagram, etc.)
- Allowed site list
- Open a URL on all student devices (simulated)

### Monitoring UI
- Real-time student grid
- Distraction detection based on blocked domains
- Visual indicators for:
  - Distracted students
  - Screen-locked students
  - Online status
- Screen view modal (placeholder for real extension support)

---

## Tech Stack

- **React** (functional components + hooks)
- **Tailwind CSS** (utility-first styling)
- **lucide-react** (icon set)
- **Browser storage API** (`window.storage`)
- No backend (frontend-only)

---

## Project Structure

This repository currently consists of a single main React component:


# COOUCONNECT

COOUCONNECT is a comprehensive student and staff portal for **Chukwuemeka Odumegwu Ojukwu University (COOU)**.  
It centralizes campus news, events, academic schedules, and communication tools into a single platform.  
With COOUCONNECT, students and school staff can stay updated on the latest announcements, manage class timetables, explore courses and departments, participate in community forums, and more—all through an intuitive web interface.

## Key Features

- **Announcements & News:** A public home page features hero banners, notifications, and featured sections (blogs, courses, events, resources) to keep everyone informed of university news. It also includes a live clock and quick links to important campus resources.

- **Academic Information:** Browse academic data such as faculties, departments, and courses. Pages list all university departments and programs. Specialized pages like **Course Updates** and **Exam Updates** show current course offerings and upcoming exam schedules, helping students track their academic calendar.

- **Timetable Manager:** A built-in public timetable viewer lets users filter and view class schedules for both the Uli and Igbariam campuses. A protected **Timetable** page (after login) allows students to manage their personal class schedule. Administrators can manage overall timetables and lecture assignments through the admin interface.

- **Student Tools:** Tools for students include a **Resume Builder** (create and download a professional CV) and placeholders for upcoming utilities. (The **Tools** page notes that additional student utilities are coming soon.)

- **Community & Communication:**
  - **Community Directory** – A page to “Join Our Academic Community” listing student organizations or members to foster networking.
  - **Lost & Found** – Users can post lost items or view found items, helping reunite students with their belongings.
  - **Anonymous Messaging** – Students can send anonymous feedback or messages to administration or peers while preserving privacy.
  - **User Messaging** – A personal **Messages** center lets logged-in users manage direct communications (including the anonymous message system).

- **Events & Ticketing:** An **Events** page lists upcoming university events. Students can fund a wallet and pay for event tickets through integrated payment gateways. (A **Ticket Payments** page shows payment history.) Administrators can create and manage events, set pricing, and track tickets.

- **Blog & Resources:** The platform supports a **blog system** for publishing articles or announcements. Featured blog posts and resource links (e.g. external learning materials) are highlighted on the home page.

- **User Accounts:** Built-in authentication allows students to sign up for accounts, log in, and manage their profile under **User Settings**. Password reset functionality (forgot/reset password) is included.

- **Admin & Staff Portal:** A secure admin interface provides comprehensive management tools for staff:
  - **User & Role Management** – Create/approve users, assign roles (student, faculty, moderator, etc.), and manage permissions.
  - **Faculty & Department Management** – CRUD pages for adding academic faculties and departments.
  - **Course/Lecture/Exam Management** – Administrators can schedule lectures, courses, and exams, and update related timetables.
  - **Event & Alert Management** – Create events (free or paid), send campus-wide alerts/notifications, and moderate community posts.
  - **Blog & Community Moderation** – Manage blog posts and community content.
  - **Payments & Wallet Settings** – Configure payment gateways (Paystack, Flutterwave, Korapay) and view transaction records.
  - **Analytics & Reporting** – Dashboards show usage stats; Google Analytics integration and system reports help staff track platform usage.
  - **System Settings** – Panels for site-wide settings (SEO, security audit, maintenance mode, etc.).

## Technology Stack

COOUCONNECT is built with modern web technologies:

- **Frontend:** React with TypeScript, bundled by Vite for fast development. Styling is done with Tailwind CSS and components from **ShadCN UI** (Radix UI primitives and custom UI components).
- **State & UI Libraries:** Uses React Router for navigation, TanStack React Query for data fetching, Zod for schema validation, React Hook Form for forms, and Lucide icons.
- **Backend (BaaS):** Powered by **Supabase** (PostgreSQL database and serverless functions) for authentication, data storage, and real-time updates. The project includes database migrations and Supabase Edge Functions for the academic system and security checks.
- **Payments:** Integrates with Paystack, Flutterwave, and Korapay for wallet funding and paid event ticketing.
- **Notifications:** Uses Sonner for toast notifications and has an in-app notification system.
- **Theming & Utilities:** Supports light/dark (coming soon) mode with next-themes, and includes UI helpers like tabs, tables, alerts, etc.

## Live Demo

A live demonstration of COOUCONNECT can be found at: [https://coouconnect.online](https://coouconnect.online)

## Future Plans

Some features are marked for future improvement or expansion:

- **Enhanced Paid Events & Wallet:** The architecture supports paid events and user wallets, but the UI for creating paid events and funding wallets is still being refined. Future updates will finalize a seamless paid-event creation workflow and wallet management (as outlined in the “Paid Events Management Plan”).
- **Additional Student Tools:** The “Tools” section will grow to include more student utilities (e.g. calculators, form generators, etc.).
- **Mobile Responsiveness:** While the design is responsive, a dedicated mobile app or PWA support could be added for better accessibility.
- **Multi-language Support:** Internationalization support may be added to serve a diverse student body.
- **Further Admin Panels:** Additional admin features (fine-tuned analytics, audit logs, role-based settings) are planned to give staff even more control.

**More Updates coming soon!**

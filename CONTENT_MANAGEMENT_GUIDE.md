# LMS Content Management System - Implementation Guide

## Overview
A complete content management system has been implemented with role-based access control for Admin, Faculty, and Student users.

## Key Features Implemented

### 1. **Role-Based Access Control**
- **Admin**: Full control over all content management
- **Faculty**: Can create and manage their content
- **Student**: Read-only access to content

### 2. **Database Models**
Created MongoDB models for:
- **Course** (`src/data/models/course.ts`) - Course management
- **Video** (`src/data/models/video.ts`) - Video content
- **Recording** (`src/data/models/recording.ts`) - Class recordings
- **Note** (`src/data/models/note.ts`) - Study notes
- **Discussion** (`src/data/models/discussion.ts`) - Course discussions

### 3. **API Endpoints**

#### Course Management
- `POST /api/courses` - Create course (Admin only)
- `GET /api/courses` - List all courses
- `PUT /api/courses` - Update course (Admin only)
- `DELETE /api/courses` - Delete course (Admin only)

#### Video Management
- `POST /api/content/videos` - Create video (Admin/Faculty)
- `GET /api/content/videos` - List videos
- `PUT /api/content/videos` - Update video (Admin/Faculty)
- `DELETE /api/content/videos` - Delete video (Admin/Faculty)

#### Recording Management
- `POST /api/content/recordings` - Create recording (Admin/Faculty)
- `GET /api/content/recordings` - List recordings
- `PUT /api/content/recordings` - Update recording (Admin/Faculty)
- `DELETE /api/content/recordings` - Delete recording (Admin/Faculty)

#### Note Management
- `POST /api/content/notes` - Create note (Admin/Faculty)
- `GET /api/content/notes` - List notes
- `PUT /api/content/notes` - Update note (Admin/Faculty)
- `DELETE /api/content/notes` - Delete note (Admin/Faculty)

#### Discussion Management
- `POST /api/content/discussions` - Create discussion (Admin/Faculty)
- `GET /api/content/discussions` - List discussions
- `PUT /api/content/discussions` - Update discussion
- `DELETE /api/content/discussions` - Delete discussion

### 4. **Admin Pages**
- **Admin Content Manager** (`/admin-content`) - Centralized management dashboard
  - Manage courses with full CRUD operations
  - Upload and manage videos
  - Upload and manage recordings
  - Create and manage study notes
  - Tab-based interface for easy navigation
  - Modal forms for creating new content

### 5. **Faculty Pages**
- **Faculty Content Creation** (`/faculty-content`) - Create and manage course content
  - Upload videos with metadata (title, duration, description)
  - Upload recordings with metadata
  - Create study notes with topic organization
  - Course selection dropdown populated from database
  - Professional form interface with proper labels and validation

### 6. **Student Pages**
- **Student Videos** (`/student-videos`) - View videos and recordings
  - Browse all available videos and recordings
  - Filter by course
  - Search functionality
  - View duration and description
  - Responsive grid layout with video thumbnails
  
- **Student Notes** (`/student-notes`) - Access study materials
  - Browse and read notes
  - Filter by course
  - Search notes and content
  - Detailed note view with full content
  - Topic organization
  - Date display for each note

### 7. **Navigation Updates**
Updated Sidebar with role-specific menu items:
- **Admin**: Added "Content Manager" link
- **Faculty**: Added "Create Content" link
- **Student**: Updated to "Videos" and "Notes" for accessing content

### 8. **Bug Fixes**
- **Role Case Mismatch Fixed**: Normalized role values from backend (lowercase) to frontend format (Capitalized)
  - Backend stores: 'admin', 'user', 'guest'
  - Frontend receives: 'Admin', 'Faculty', 'Student'
  - Mapping implemented in login API

### 9. **API Utilities**
Created `src/utils/api.ts` with helper functions:
- Automatic addition of user role and email headers
- Functions for all CRUD operations
- Consistent error handling
- LocalStorage integration for user context

## How to Use

### For Admins
1. Navigate to **Content Manager** from sidebar
2. Click on appropriate tab (Courses, Videos, Recordings, Notes)
3. Click **Create** button to add new content
4. Fill in the form and submit
5. Manage existing content (view, edit, delete)

### For Faculty
1. Navigate to **Create Content** from sidebar
2. Select content type (Videos, Recordings, Notes)
3. Fill in the form with content details
4. Select course from dropdown
5. Submit to make content available to students

### For Students
1. Navigate to **Videos** to watch videos and recordings
2. Navigate to **Notes** to read study materials
3. Use search and filter options to find specific content
4. Click on content to view details

## Technical Stack
- **Framework**: Next.js with TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: Custom role-based auth with localStorage
- **Styling**: Tailwind CSS
- **UI Icons**: Lucide React
- **State Management**: React hooks (useState, useEffect)

## Security Features
- Role-based access control at API level
- User authentication required (ProtectedRoute wrapper)
- Endpoint-level authorization checks
- User context passed via headers (x-user-role, x-user-email)

## File Structure
```
lms_enkonix-main/
├── pages/
│   ├── admin-content.tsx          # Admin content management
│   ├── faculty-content.tsx         # Faculty content creation
│   ├── student-videos.tsx          # Student video viewer
│   ├── student-notes.tsx           # Student notes viewer
│   ├── api/
│   │   ├── courses.ts             # Course API
│   │   └── content/
│   │       ├── videos.ts          # Video API
│   │       ├── recordings.ts      # Recording API
│   │       ├── notes.ts           # Note API
│   │       └── discussions.ts     # Discussion API
│   └── auth/
│       └── login.ts               # Updated with role mapping
├── src/
│   ├── data/models/
│   │   ├── course.ts
│   │   ├── video.ts
│   │   ├── recording.ts
│   │   ├── note.ts
│   │   └── discussion.ts
│   ├── utils/
│   │   └── api.ts                # API utility functions
│   └── components/
│       └── Sidebar.tsx           # Updated with new menu items
```

## Next Steps (Optional Enhancements)
1. Add file upload functionality for video/recording URLs
2. Implement streaming for videos
3. Add comments/discussions to content
4. Email notifications for new content
5. Progress tracking for students
6. Content recommendations based on course
7. Advanced search and filtering
8. Content export functionality

## Database Connection
Ensure your `.env` file has:
```
MONGODB_URI=your_mongodb_connection_string
```

## Testing
The application has been built with full role-based separation:
- **Admin** can manage all content types
- **Faculty** can create content for their courses
- **Students** can only view content
- All API endpoints enforce these restrictions

---
Created: January 2026
For any questions or issues, please refer to the code comments in each file.

Okay, here is a Product Requirements Document (PRD) based on the provided server code, incorporating the use of Fly.io and Bun.

## Product Requirements Document: Rollup AI Server

**1. Introduction**

This document outlines the requirements for the Rollup AI server application. The server provides the backend functionality for a video processing and management platform. It handles user authentication, video uploads, complex video processing pipelines (including AI-driven analysis, transcription, captioning, and B-roll insertion), feedback collection, and user onboarding. The application is built using Hono on the Bun runtime and is designed for deployment on Fly.io. It utilizes various cloud services for storage, AI processing, and background job management.

**2. Goals**

* Provide a robust API for client applications to interact with backend services.
* Manage user accounts and authentication securely.
* Process uploaded videos efficiently through a multi-step pipeline.
* Leverage AI for video transcription and content analysis (keywords, topics).
* Optionally enhance videos with automatically generated captions and relevant B-roll footage.
* Store video assets and associated metadata reliably using cloud storage (Cloudflare R2).
* Manage background tasks asynchronously using a queue system (BullMQ with Redis).
* Collect user feedback and manage onboarding processes.
* Ensure reliable logging and error handling.
* Deploy and operate effectively on the Fly.io platform.

**3. User Stories / Features**

* **Authentication:**
    * Users can sign up using email/password or Google.
    * Users receive an email OTP for email verification upon signup.
    * Users can log in using their credentials or Google account.
    * Users can request a password reset via email OTP.
    * API requests are authorized based on valid user sessions.
* **User Management:**
    * User profiles (name, email, image) are stored.
    * API endpoints exist to fetch user details by ID or verify email existence.
* **Onboarding & Feedback:**
    * New users can complete an onboarding survey.
    * Users can skip the onboarding survey.
    * The system tracks whether a user needs to see the survey or welcome tour.
    * Users can submit feedback with ratings and comments.
* **Video Submission:**
    * Users can upload video files via the API.
    * Video title, description, category, and tags are submitted along with the file.
    * Users can specify whether to auto-generate captions and B-roll during submission.
    * Uploaded original videos are stored in Cloudflare R2.
* **Video Processing Pipeline (Background Job - BullMQ Flow):**
    * **Initiation:** An API endpoint triggers the processing flow for a submitted video.
    * **Job Tracking:** A database record is created to track the processing job status.
    * **Progress Streaming:** Job progress can be streamed to the client via Server-Sent Events (SSE).
    * **Step 1: Initial Video Processing:**
        * Download original video from R2.
        * Optimize video for web playback (using ffmpeg).
        * Extract technical metadata (resolution, duration, codecs, etc.).
        * Generate a thumbnail from the video.
        * Extract audio track.
        * Generate SRT and plain text transcripts using OpenAI Whisper.
        * Store intermediate files and metadata temporarily.
    * **Step 2: B-Roll Generation (Optional):**
        * Analyze SRT transcript using OpenAI GPT to identify topics, keywords, and timestamps.
        * Search Pexels API for relevant stock videos based on keywords.
        * Download suitable Pexels videos.
        * Overlay downloaded B-roll onto the main video during relevant topic segments using ffmpeg.
    * **Step 3: Caption Burning (Optional):**
        * Burn the generated SRT transcript into the video as captions using ffmpeg.
    * **Step 4: Finalization:**
        * Upload final processed video assets (optimized, captioned, B-roll versions) to designated R2 buckets.
        * Upload generated transcripts (SRT, plain) to R2.
        * Upload generated thumbnail to Cloudflare Images.
        * Create corresponding database entries for all generated assets (linking them to the original submission).
        * Clean up all temporary files from the local filesystem.
* **API Structure:**
    * RESTful API built with Hono.
    * Routes organized by feature (Auth, Users, Videos, Queues, Feedback, Onboarding).
    * Uses Zod for request validation.
    * Includes CORS configuration.
    * Centralized error handling.
    * Logging middleware for request/response tracking.

**4. Technical Requirements**

* **Runtime:** Bun
* **Web Framework:** Hono
* **Database:** PostgreSQL (compatible, e.g., Neon)
* **ORM:** Drizzle ORM
* **Authentication:** Better Auth library with Email/Password, Google OAuth, Email OTP.
* **Background Jobs:** BullMQ with Redis backend.
* **Object Storage:** Cloudflare R2
* **Image Storage:** Cloudflare Images (for thumbnails)
* **AI Services:** OpenAI API (Whisper for transcription, GPT models for analysis)
* **Stock Video:** Pexels API
* **Email Service:** Resend
* **Video Processing:** Fluent-ffmpeg library (Node.js wrapper for ffmpeg)
* **Deployment Platform:** Fly.io (as specified by user)
* **Logging:** Winston
* **Configuration:** Environment variables (`dotenv`, `drizzle.config.ts`)

**5. Non-Functional Requirements**

* **Scalability:** The architecture should support scaling, particularly the background workers and API instances, leveraging Fly.io's capabilities. Redis/BullMQ supports distributed workers. Neon DB is serverless.
* **Reliability:** The video processing pipeline must be robust, with error handling and potential retries managed by BullMQ. Database and storage services should be highly available.
* **Performance:** API response times should be fast. Video processing time will depend on video length and complexity but should be optimized where possible (e.g., `ffmpeg` presets).
* **Security:** Secure handling of credentials, API keys, and user data. Implementation of standard security practices (input validation, secure cookies, dependency management). Authentication and authorization enforced on relevant endpoints.
* **Maintainability:** Code organized into logical modules (routes, services, db models, queues, lib). Consistent coding style and use of TypeScript for type safety.
* **Monitoring:** Comprehensive logging for requests, errors, and background job progress. Integration with Fly.io monitoring tools.

**6. Future Considerations**

* Implement webhook handling for Polar payment events.
* Add more social login providers.
* Expand video editing features beyond B-roll/captions.
* Implement detailed analytics tracking.
* Introduce user roles and permissions.
* Develop an admin interface for managing users and content.
* Refine AI analysis (e.g., sentiment analysis, object detection).
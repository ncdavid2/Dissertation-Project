export interface User {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password: string;
    bio: string;
    notes: string;
    profileImage: string;
    role: string;
  }
  
export interface Course {
    id: string;
    title: string;
    description: string;
    image: string;
    averageRating: number;
    pages: Page[];
    comments?: Comment[];
}
  
export interface CourseRef {
    id: string;
    title: string;
    pages: PageRef[];
}
  
export interface PageRef {
    id: string;
    title: string;
}
  
export interface Page {
    id: string;
    title: string;
    type: string;
    videoUrl?: string;
    questions?: Question[];
    steps?: Step[];
    course?: CourseRef;
}

export interface Question {
    question: string;
    answers: string[];
    correctAnswerIndex: number;
}
  
export interface QuestionInput {
    question: string;
    answers: string[];
    correctAnswerIndex: number;
}
  
export interface Step {
    image: string;
    explanation: string;
}
  
export interface Comment {
    user: User;
    text: string;
    createdAt: string;
}
  
export interface AuthPayload {
    token: string;
    user: User;
}
  
export interface CreateUserInput {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password: string;
    role: string;
}
  
export interface LoginInput {
    email: string;
    password: string;
}
  
export interface UpdateUserInput {
    id: string;
    username?: string;
    password?: string;
    bio?: string;
    notes?: string;
    profileImage?: string;
}
  
export interface CreateCourseInput {
    title: string;
    description: string;
    image?: string;
}
  
export interface AddVideoPageInput {
    courseId: string;
    videoUrl: string;
    questions: QuestionInput[];
}
  
export interface AddPageInput {
    courseId: string;
    image?: string;
    explanation: string;
}
  
export interface UpdateCourseInput {
    id: string;
    title?: string;
    description?: string;
    image?: string;
}
  
export interface RateCourseInput {
    courseId: string;
    value: number;
}
  
export interface AddCommentInput {
    courseId: string;
    text: string;
}
  
export interface UpdatePageInput {
    pageId: string;
    image?: string;
    explanation: string;
}
  
export interface UpdateVideoPageInput {
    pageId: string;
    videoUrl?: string;
    questions: QuestionInput[];
}
  
export interface MarkPageCompleteInput {
    courseId: string;
    pageId: string;
}
  
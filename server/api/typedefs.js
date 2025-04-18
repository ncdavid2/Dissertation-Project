const typeDefs = `
  type Query {
    getUsers: [User]
    getUserByID(id: ID!): User
    getCourses: [Course]
    course(id: ID!): Course
    page(id: ID!): Page
    getRandomQuestion: Question
  }

  type Mutation {
    createUser(
      first_name: String!
      last_name: String!
      username: String!
      email: String!
      password: String!
      role: String!
    ): User

    login(email: String!, password: String!): AuthPayload

    updateUser(
      id: ID!
      username: String
      password: String
      bio: String
      notes: String
      profileImage: String
    ): User

    createCourse(
      title: String!
      description: String!
      image: String
    ): Course

    addVideoPageToCourse(
      courseId: ID!
      videoUrl: String!
      questions: [QuestionInput!]!
    ): Course

    addPageToCourse(
      courseId: ID!
      image: String
      explanation: String!
    ): Course

    updateCourse(
      id: ID!
      title: String
      description: String
      image: String
    ): Course
  }

  type AuthPayload {
    token: String
    user: User
  }

  type User {
    id: ID
    first_name: String
    last_name: String
    username: String
    email: String
    password: String
    bio: String
    notes: String
    profileImage: String
    role: String
  }

  type Course {
    id: ID
    title: String
    description: String
    image: String
    averageRating: Float
    pages: [Page]
  }

  type Question {
    question: String
    answers: [String]
    correctAnswerIndex: Int
  }

  type Page {
    id: ID
    title: String
    type: String
    videoUrl: String
    questions: [Question]
    steps: [Step]
    course: CourseRef
  }

  type CourseRef {
    id: ID
    title: String
    pages: [PageRef]
  }

  type PageRef {
    id: ID
    title: String
  }

  type Step {
    image: String
    explanation: String
  }

  input QuestionInput {
    question: String!
    answers: [String!]!
    correctAnswerIndex: Int!
  }

  type Mutation {
    rateCourse(courseId: ID!, value: Int!): Course
  }

  extend type Course {
    averageRating: Float
  }

  type Comment {
    user: User
    text: String
    createdAt: String
  }

  extend type Course {
    comments: [Comment]
  }

  extend type Mutation {
    addComment(courseId: ID!, text: String!): Course
  }

  extend type Mutation {
    updatePage(pageId: ID!, image: String, explanation: String!): Page
  }

  extend type Mutation {
    updateVideoPage(pageId: ID!, videoUrl: String, questions: [QuestionInput!]!): Page
  }

  extend type Query {
    getUserProgress(courseId: ID!): [ID!]
  }

  extend type Mutation {
    markPageComplete(courseId: ID!, pageId: ID!): Boolean
  }`
;
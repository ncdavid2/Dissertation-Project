const resolvers = {
  Query: {
    getUsers: async () => await User.find(),
    getUserByID: async (_, args) => await User.findById(args.id),
    getCourses: async () => await Course.find(),
    course: async (_, { id }) => await Course.findById(id),

    page: async (_, { id }) => {
      const objectId = new mongoose.Types.ObjectId(id);
    
      const course = await Course.findOne({ "pages._id": objectId });
      if (!course) throw new Error("Page not found");
    
      const page = course.pages.id(objectId); 
      if (!page) throw new Error("Page not found in course");
    
      return {
        ...page.toObject(),
        id: page._id.toString(),
        course: {
          id: course._id.toString(),
          title: course.title,
          pages: course.pages.map((p) => ({
            id: p._id.toString(),
            title: p.title || "Untitled"
          })),
        },
      };
    },
    getRandomQuestion: async () => {
      const courses = await Course.find({ "pages.questions.0": { $exists: true } });

      const allQuestions = courses.flatMap(course =>
        course.pages
          .filter(page => page.questions && page.questions.length)
          .flatMap(page => page.questions)
      );

      if (allQuestions.length === 0) throw new Error("No questions available");

      const randomIndex = Math.floor(Math.random() * allQuestions.length);
      return allQuestions[randomIndex];
    },
    getUserProgress: async (_, { courseId }, { userId }) => {
      if (!userId) throw new Error("Authentication required");
    
      const user = await User.findById(userId);
      const progress = user.progress.find(
        (p) => p.courseId.toString() === courseId
      );
    
      return progress ? progress.completedPages.map(id => id.toString()) : [];
    },    
  },

  Course: {
    averageRating: (course) => {
      if (!course.ratings || course.ratings.length === 0) return 0;
      const sum = course.ratings.reduce((acc, r) => acc + r.value, 0);
      return sum / course.ratings.length;
    },
    comments: async (course) => {
      const populated = await course.populate("comments.userId");
      return populated.comments.map((comment) => ({
        user: comment.userId,
        text: comment.text,
        createdAt: comment.createdAt.toISOString(),
      }));
    },
  },

  Mutation: {
    createUser: async (_, { first_name, last_name, username, email, password, role }) => {
      if (!first_name || !last_name || !username || !email || !password || !role) {
        throw new Error("All fields are required");
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists with this email");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        first_name,
        last_name,
        username,
        email,
        password: hashedPassword,
        role: role === "teacher" ? "teacher" : "student"
      });

      await newUser.save();
      return newUser;
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("User not found");
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return { token, user };
    },

    updateUser: async (_, { id, username, password, bio, notes, profileImage }, { userId }) => {
      if (!userId) {
        throw new Error("Not authenticated");
      }
      
      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }
    
      if (userId !== user.id.toString()) {
        throw new Error("Unauthorized");
      }
    
      let updateFields = {};
      if (username) updateFields.username = username;
      if (password) updateFields.password = await bcrypt.hash(password, 10);
      if (bio) updateFields.bio = bio;
      if (notes) updateFields.notes = notes;
      if (profileImage) updateFields.profileImage = profileImage;
    
      return await User.findByIdAndUpdate(id, updateFields, { new: true });
    },

    createCourse: async (_, { title, description, image }) => {
      const newCourse = new Course({
        title,
        description,
        image,
      });
      await newCourse.save();
      return newCourse;
    },

    addVideoPageToCourse: async (_, { courseId, videoUrl, questions }) => {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
    
      const newPage = {
        type: "video",
        title: "Video Page",
        videoUrl,
        questions
      };
    
      course.pages.push(newPage);
      await course.save();
      return course;
    },

    updateVideoPage: async (_, { pageId, videoUrl, questions }) => {
      const objectId = new mongoose.Types.ObjectId(pageId);
      const course = await Course.findOne({ "pages._id": objectId });
      if (!course) throw new Error("Course not found");
    
      const page = course.pages.id(objectId);
      if (!page) throw new Error("Page not found");
    
      if (videoUrl) page.videoUrl = videoUrl;
      page.questions = questions;
    
      await course.save();
    
      return {
        ...page.toObject(),
        id: page._id.toString(),
      };
    },    

    addPageToCourse: async (_, { courseId, image, explanation }) => {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
    
      const newPage = {
        type: "text",
        title: "Step-by-Step",
        steps: [
          {
            image,
            explanation
          }
        ]
      };      
    
      course.pages.push(newPage);
      await course.save();
      return course;
    },

    updatePage: async (_, { pageId, image, explanation }) => {
      const objectId = new mongoose.Types.ObjectId(pageId);
    
      const course = await Course.findOne({ "pages._id": objectId });
      if (!course) throw new Error("Page not found");
    
      const page = course.pages.id(objectId);
      if (!page) throw new Error("Page not found in course");
    
      page.steps = [{ image, explanation }]; 
      await course.save();
    
      return {
        ...page.toObject(),
        id: page._id.toString(),
      };
    },

    updateCourse: async (_, { id, title, description, image }) => {
      const course = await Course.findById(id);
      if (!course) throw new Error("Course not found");
    
      if (title !== undefined) course.title = title;
      if (description !== undefined) course.description = description;
      if (image !== undefined) course.image = image;
    
      await course.save();
      return course;
    },    

    rateCourse: async (_, { courseId, value }, { userId }) => {
      if (!userId) throw new Error("Authentication required");

      const course = await Course.findById(courseId);
      if (!course) throw new Error("Course not found");

      const existing = course.ratings.find((r) => r.userId.toString() === userId);
      if (existing) {
        existing.value = value;
      } else {
        course.ratings.push({ userId, value });
      }

      await course.save();
      return course;
    },

    addComment: async (_, { courseId, text }, { userId }) => {
      if (!userId) throw new Error("Authentication required");
    
      const course = await Course.findById(courseId);
      if (!course) throw new Error("Course not found");
    
      course.comments.push({ userId, text });
      await course.save();
    
      return course;
    },    

    markPageComplete: async (_, { courseId, pageId }, { userId }) => {
      if (!userId) throw new Error("Authentication required");
    
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");
    
      let courseProgress = user.progress.find(
        (p) => p.courseId.toString() === courseId
      );
    
      if (!courseProgress) {
        courseProgress = { courseId, completedPages: [pageId] };
        user.progress.push(courseProgress);
      } else if (!courseProgress.completedPages.includes(pageId)) {
        courseProgress.completedPages.push(pageId);
      }
    
      await user.save();
      return true;
    },    
  },
};
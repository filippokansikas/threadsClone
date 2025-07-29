const sequelize = require('./models/sequelize');
const User = require('./models/User');
const Post = require('./models/Post');

const samplePosts = [
  {
    userId: 1, // curry
    content: "Just finished an amazing workout! 💪 The energy today was incredible. Remember, consistency beats perfection every time."
  },
  {
    userId: 1,
    content: "Coffee and coding - the perfect morning combo ☕️ Working on some exciting new features today!"
  },
  {
    userId: 2, // gigi
    content: "Had the most beautiful sunset walk today 🌅 Sometimes the simplest moments are the most meaningful."
  },
  {
    userId: 2,
    content: "New recipe experiment in the kitchen today! 🍳 Cooking is my therapy. What's your favorite comfort food?"
  },
  {
    userId: 3, // ortodisara
    content: "Reading session with my favorite book 📚 There's nothing like getting lost in a good story. Any book recommendations?"
  },
  {
    userId: 3,
    content: "Music studio session today 🎵 Working on some new tracks. The creative flow is real!"
  },
  {
    userId: 4, // morgan
    content: "Adventure time! 🏔️ Hiking in the mountains today. The views are absolutely breathtaking."
  },
  {
    userId: 4,
    content: "Tech meetup tonight! 🤖 Always excited to connect with fellow developers and share knowledge."
  },
  {
    userId: 5, // curry123
    content: "Basketball game tonight! 🏀 Nothing like the energy of a good game. Let's go team!"
  },
  {
    userId: 5,
    content: "Learning a new programming language today 💻 Always good to expand your skillset. What are you learning?"
  },
  {
    userId: 6, // sara
    content: "Art studio day! 🎨 Working on a new painting. Creativity flows best when you're in the zone."
  },
  {
    userId: 6,
    content: "Yoga session this morning 🧘‍♀️ Starting the day with mindfulness and intention. Namaste!"
  },
  {
    userId: 1,
    content: "Late night coding session 🌙 Sometimes the best ideas come when the world is quiet."
  },
  {
    userId: 2,
    content: "Photography walk in the city 📸 Capturing moments, one frame at a time."
  },
  {
    userId: 3,
    content: "Writing session today ✍️ Working on my novel. Every word brings the story to life."
  },
  {
    userId: 4,
    content: "Volunteering at the local shelter today ❤️ Giving back to the community feels amazing."
  },
  {
    userId: 5,
    content: "Gym session complete! 💪 Consistency is key to progress. What's your fitness goal?"
  },
  {
    userId: 6,
    content: "Baking day! 🍪 The house smells amazing. Homemade cookies are the best therapy."
  }
];

async function seedPosts() {
  try {
    await sequelize.sync();
    
    console.log('Starting to seed posts...');
    
    // Clear existing posts first
    await Post.destroy({ where: {} });
    console.log('Cleared existing posts');
    
    // Create new posts
    const createdPosts = await Post.bulkCreate(samplePosts);
    console.log(`Successfully created ${createdPosts.length} posts`);
    
    // Display the created posts
    const postsWithUsers = await Post.findAll({
      include: [{
        model: User,
        attributes: ['username']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log('\nCreated posts:');
    postsWithUsers.forEach(post => {
      console.log(`- ${post.User.username}: "${post.content}"`);
    });
    
    console.log('\nDatabase seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding posts:', error);
  } finally {
    await sequelize.close();
  }
}

seedPosts(); 
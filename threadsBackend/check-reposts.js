const sequelize = require('./models/sequelize');
const { Repost, Post } = require('./models/associations');

async function checkReposts() {
  try {
    await sequelize.sync();
    
    const reposts = await Repost.findAll({
      include: [{ model: Post, as: 'originalPost' }]
    });
    
    console.log('Reposts found:', reposts.length);
    reposts.forEach(repost => {
      console.log(`Repost ID: ${repost.id}, OriginalPost ID: ${repost.originalPostId}, Has OriginalPost: ${!!repost.originalPost}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkReposts(); 
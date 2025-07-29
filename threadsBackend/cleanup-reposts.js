const sequelize = require('./models/sequelize');
const { Repost } = require('./models/associations');

async function cleanupReposts() {
  try {
    await sequelize.sync();
    
    console.log('Cleaning up orphaned reposts...');
    
    // Delete reposts where originalPostId is null
    const deletedCount = await Repost.destroy({
      where: {
        originalPostId: null
      }
    });
    
    console.log(`Deleted ${deletedCount} orphaned reposts`);
    
    // Check remaining reposts
    const remainingReposts = await Repost.findAll();
    console.log(`Remaining reposts: ${remainingReposts.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

cleanupReposts(); 
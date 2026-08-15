const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Expense = require('../models/Expense');

dotenv.config({ path: __dirname + '/../.env' });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense_tracker';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing test user if any
    const testEmail = 'demo@expensetracker.com';
    let user = await User.findOne({ email: testEmail });
    if (user) {
      await Expense.deleteMany({ userId: user._id });
      await User.deleteOne({ _id: user._id });
      console.log('🧹 Cleaned previous demo user data');
    }

    // Create demo user
    user = await User.create({
      name: 'Alex Morgan',
      email: testEmail,
      password: 'password123',
    });
    console.log(`👤 Created Demo User: ${user.email} (Password: password123)`);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const sampleExpenses = [
      // Current Month expenses
      { amount: 145.50, category: 'Food', description: 'Weekly Whole Foods grocery run', daysAgo: 1 },
      { amount: 35.00, category: 'Food', description: 'Italian dinner with team', daysAgo: 2 },
      { amount: 12.80, category: 'Food', description: 'Morning artisan coffee & bagel', daysAgo: 4 },
      { amount: 89.00, category: 'Shopping', description: 'Noise cancelling headphones', daysAgo: 5 },
      { amount: 45.00, category: 'Travel', description: 'Uber rides across downtown', daysAgo: 6 },
      { amount: 120.00, category: 'Bills', description: 'High-speed Fiber Internet bill', daysAgo: 8 },
      { amount: 75.00, category: 'Health', description: 'Monthly gym & fitness membership', daysAgo: 10 },
      { amount: 28.50, category: 'Other', description: 'Bookstore novel & journal', daysAgo: 12 },
      { amount: 64.20, category: 'Food', description: 'Farmers Market fresh produce', daysAgo: 13 },
      { amount: 210.00, category: 'Bills', description: 'Electricity & heating utility', daysAgo: 15 },
      { amount: 55.00, category: 'Shopping', description: 'Ergonomic mouse & desk mat', daysAgo: 18 },
      { amount: 38.00, category: 'Travel', description: 'Gas station fuel fill-up', daysAgo: 20 },
      { amount: 95.00, category: 'Health', description: 'Dental cleaning checkup copay', daysAgo: 22 },

      // Month - 1 expenses
      { amount: 420.00, category: 'Bills', description: 'Monthly utilities & streaming', monthsAgo: 1, day: 5 },
      { amount: 280.00, category: 'Food', description: 'Monthly groceries & dining', monthsAgo: 1, day: 12 },
      { amount: 160.00, category: 'Shopping', description: 'Winter jacket & shoes', monthsAgo: 1, day: 18 },
      { amount: 90.00, category: 'Travel', description: 'Train tickets & transit passes', monthsAgo: 1, day: 22 },

      // Month - 2 expenses
      { amount: 380.00, category: 'Bills', description: 'Utility bills & cloud storage', monthsAgo: 2, day: 4 },
      { amount: 310.00, category: 'Food', description: 'Family dinners & groceries', monthsAgo: 2, day: 15 },
      { amount: 110.00, category: 'Health', description: 'Annual health physical lab tests', monthsAgo: 2, day: 20 },
      { amount: 75.00, category: 'Shopping', description: 'Home decor & lighting', monthsAgo: 2, day: 25 },

      // Month - 3 expenses
      { amount: 395.00, category: 'Bills', description: 'Electricity & internet', monthsAgo: 3, day: 2 },
      { amount: 290.00, category: 'Food', description: 'Grocery shopping', monthsAgo: 3, day: 14 },
      { amount: 220.00, category: 'Travel', description: 'Weekend getaway fuel & lodging', monthsAgo: 3, day: 19 },

      // Month - 4 expenses
      { amount: 360.00, category: 'Bills', description: 'Utility bills', monthsAgo: 4, day: 3 },
      { amount: 240.00, category: 'Food', description: 'Dining out & groceries', monthsAgo: 4, day: 16 },
      { amount: 130.00, category: 'Shopping', description: 'Kitchen cookware set', monthsAgo: 4, day: 21 },

      // Month - 5 expenses
      { amount: 340.00, category: 'Bills', description: 'Monthly subscriptions & power', monthsAgo: 5, day: 5 },
      { amount: 225.00, category: 'Food', description: 'Supermarket supplies', monthsAgo: 5, day: 18 },
      { amount: 85.00, category: 'Travel', description: 'Commuter pass', monthsAgo: 5, day: 24 },
    ];

    const expenseDocuments = sampleExpenses.map((exp) => {
      let expenseDate;
      if (exp.daysAgo !== undefined) {
        expenseDate = new Date(now.getTime() - exp.daysAgo * 24 * 60 * 60 * 1000);
      } else if (exp.monthsAgo !== undefined) {
        expenseDate = new Date(currentYear, currentMonth - exp.monthsAgo, exp.day || 10, 12, 0, 0);
      } else {
        expenseDate = new Date();
      }

      return {
        userId: user._id,
        amount: exp.amount,
        category: exp.category,
        description: exp.description,
        date: expenseDate,
      };
    });

    await Expense.insertMany(expenseDocuments);
    console.log(`🎉 Successfully seeded ${expenseDocuments.length} expenses for demo user!`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedData();

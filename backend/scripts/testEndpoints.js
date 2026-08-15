const http = require('http');

const PORT = 5001; // Use test port for isolated verification
process.env.PORT = PORT;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_123';

const app = require('../server');

const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (data) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (data) req.write(postData);
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Starting Backend API Automated Tests...\n');
  let token = '';
  let createdExpenseId = '';

  try {
    // 1. Health check
    const health = await request('/api/health');
    console.log(`1. Health Check: Status ${health.status} - ${health.body.app}`);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Register
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const regRes = await request('/api/auth/register', 'POST', {
      name: 'Integration Test User',
      email: uniqueEmail,
      password: 'password123',
    });
    console.log(`2. Register: Status ${regRes.status} - User: ${regRes.body?.user?.email}`);
    if (regRes.status !== 201 || !regRes.body.token) throw new Error('Register failed');
    token = regRes.body.token;

    // 3. Login
    const loginRes = await request('/api/auth/login', 'POST', {
      email: uniqueEmail,
      password: 'password123',
    });
    console.log(`3. Login: Status ${loginRes.status} - Token issued: ${!!loginRes.body.token}`);
    if (loginRes.status !== 200) throw new Error('Login failed');

    // 4. Get Current User Profile
    const meRes = await request('/api/auth/me', 'GET', null, token);
    console.log(`4. Get Me Profile: Status ${meRes.status} - ${meRes.body?.user?.name}`);
    if (meRes.status !== 200) throw new Error('Get Me failed');

    // 5. Add Expenses
    const exp1 = await request('/api/expenses', 'POST', {
      amount: 45.5,
      category: 'Food',
      description: 'Supermarket Groceries',
      date: new Date().toISOString(),
    }, token);
    console.log(`5. Add Expense 1 (Food): Status ${exp1.status} - ID: ${exp1.body?.expense?._id}`);
    createdExpenseId = exp1.body.expense._id;

    await request('/api/expenses', 'POST', {
      amount: 120.0,
      category: 'Bills',
      description: 'Internet Fiber Bill',
      date: new Date().toISOString(),
    }, token);

    await request('/api/expenses', 'POST', {
      amount: 32.0,
      category: 'Travel',
      description: 'Downtown Taxi',
      date: new Date().toISOString(),
    }, token);

    // 6. Get Expenses with pagination & search
    const getRes = await request('/api/expenses?page=1&limit=10&search=Groceries', 'GET', null, token);
    console.log(`6. Get Expenses Filtered: Status ${getRes.status} - Count: ${getRes.body?.expenses?.length} / Total: ${getRes.body?.pagination?.total}`);
    if (getRes.status !== 200 || getRes.body.expenses.length !== 1) throw new Error('Expense search/filter failed');

    // 7. Update Expense
    const updateRes = await request(`/api/expenses/${createdExpenseId}`, 'PUT', {
      amount: 55.0,
      description: 'Updated Organic Supermarket Groceries',
    }, token);
    console.log(`7. Update Expense: Status ${updateRes.status} - New Amount: $${updateRes.body?.expense?.amount}`);
    if (updateRes.status !== 200 || updateRes.body.expense.amount !== 55.0) throw new Error('Update expense failed');

    // 8. Analytics Aggregation Summary
    const analyticsRes = await request('/api/analytics/summary', 'GET', null, token);
    console.log(`8. Analytics Summary: Status ${analyticsRes.status} - Current Month Total: $${analyticsRes.body?.data?.currentMonth?.totalSpend}`);
    console.log(`   Categories aggregated: ${analyticsRes.body?.data?.categoryBreakdown?.map(c => `${c.category}: $${c.totalAmount}`).join(', ')}`);
    console.log(`   6-Month Trend Points: ${analyticsRes.body?.data?.monthlyTrends?.length} months`);
    if (analyticsRes.status !== 200 || !analyticsRes.body?.data?.categoryBreakdown) throw new Error('Analytics aggregation failed');

    // 9. AI Chatbot
    const chatRes = await request('/api/chat', 'POST', {
      message: 'How much did I spend on Food this month?',
    }, token);
    console.log(`9. AI Chatbot Question: Status ${chatRes.status} - Source: ${chatRes.body?.source}`);
    console.log(`   AI Reply Preview:\n${chatRes.body?.reply?.slice(0, 150)}...\n`);
    if (chatRes.status !== 200 || !chatRes.body.reply) throw new Error('Chatbot failed');

    // 10. Delete Expense
    const delRes = await request(`/api/expenses/${createdExpenseId}`, 'DELETE', null, token);
    console.log(`10. Delete Expense: Status ${delRes.status} - Deleted ID: ${delRes.body?.id}`);
    if (delRes.status !== 200) throw new Error('Delete expense failed');

    console.log('\n🎉 ALL 10 BACKEND INTEGRATION TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  }
};

// Wait for database connection before running tests
setTimeout(runTests, 1500);

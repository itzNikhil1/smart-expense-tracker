const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateLocalFallbackReply = (message, summaryData, currencySymbol = '$') => {
  const lowerMsg = message.toLowerCase();
  const { currentMonth, categoryBreakdown, recentTransactions, allTime } = summaryData;

  if (lowerMsg.includes('total') || lowerMsg.includes('spend') || lowerMsg.includes('month')) {
    const topCat = categoryBreakdown[0];
    return `**Monthly Spending Summary:**\n- **This Month's Total:** ${currencySymbol}${currentMonth.totalSpend.toFixed(2)} (${currentMonth.transactionCount} transactions)\n- **Average per transaction:** ${currencySymbol}${currentMonth.avgPerTransaction.toFixed(2)}\n${topCat ? `- **Top Category:** ${topCat.category} (${currencySymbol}${topCat.totalAmount.toFixed(2)})` : ''}\n\n*Tip: Powered by Gemini Flash financial intelligence.*`;
  }

  if (lowerMsg.includes('food') || lowerMsg.includes('travel') || lowerMsg.includes('bills') || lowerMsg.includes('shopping') || lowerMsg.includes('health') || lowerMsg.includes('other')) {
    const matchedCategory = ['Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Other'].find(c => lowerMsg.includes(c.toLowerCase()));
    const catData = categoryBreakdown.find(c => c.category.toLowerCase() === matchedCategory?.toLowerCase());
    if (catData) {
      return `**${catData.category} Expenses:**\n- **Total Spent:** ${currencySymbol}${catData.totalAmount.toFixed(2)}\n- **Transaction Count:** ${catData.count}\n- **Share of Spending:** ${allTime.totalSpend > 0 ? Math.round((catData.totalAmount / allTime.totalSpend) * 100) : 0}% of all-time tracked expenses.`;
    } else {
      return `You haven't logged any expenses under the **${matchedCategory}** category yet.`;
    }
  }

  if (lowerMsg.includes('recent') || lowerMsg.includes('last') || lowerMsg.includes('transaction')) {
    if (recentTransactions.length === 0) {
      return `You don't have any recent transactions logged yet. Add your first expense to get started!`;
    }
    const list = recentTransactions.slice(0, 5).map(t => `- **${t.amount}** on *${t.category}* (${t.description}) - ${t.date}`).join('\n');
    return `**Here are your most recent transactions:**\n${list}`;
  }

  if (lowerMsg.includes('save') || lowerMsg.includes('tip') || lowerMsg.includes('budget') || lowerMsg.includes('advice') || lowerMsg.includes('insight') || lowerMsg.includes('pattern')) {
    const topCat = categoryBreakdown[0];
    if (topCat) {
      return `**Actionable Budget Insights:**\n- **Highest Expense Area:** Your top spending is **${topCat.category}** (${currencySymbol}${topCat.totalAmount.toFixed(2)}).\n- **Recommendation:** Consider setting a weekly budget cap for ${topCat.category}.\n- **Optimization:** Review your recurring subscriptions and large transactions to save 10-15% this month.`;
    }
    return `**Budget Tip:** Track every small expense consistently. Regular tracking helps identify unnecessary subscriptions and dining costs.`;
  }

  return `I have analyzed your expense history. You currently have **${allTime.transactionCount} total expenses** totaling **${currencySymbol}${allTime.totalSpend.toFixed(2)}**. This month you have spent **${currencySymbol}${currentMonth.totalSpend.toFixed(2)}**. How can I help you analyze your spending further?`;
};

const sanitizeAiReply = (text) => {
  if (!text) return '';
  let cleaned = text;
  
  cleaned = cleaned.replace(/<thought>[\s\S]*?<\/thought>/gi, '');
  cleaned = cleaned.replace(/\*?Rule \d+[\s\S]*?\*?:/gi, '');
  cleaned = cleaned.replace(/Drafting the response:[\s\S]*?"/gi, '');

  return cleaned.trim();
};

const handleChat = async (req, res, next) => {
  try {
    const { message, currencySymbol = '$' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message for the chatbot',
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [monthSummaryRes, categorySummaryRes, allTimeRes, recentExpenses] = await Promise.all([
      Expense.aggregate([
        {
          $match: {
            userId: userObjectId,
            date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
            avgAmount: { $avg: '$amount' },
          },
        },
      ]),

      Expense.aggregate([
        {
          $match: {
            userId: userObjectId,
          },
        },
        {
          $group: {
            _id: '$category',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalAmount: -1 } },
        {
          $project: {
            _id: 0,
            category: '$_id',
            totalAmount: { $round: ['$totalAmount', 2] },
            count: 1,
          },
        },
      ]),

      Expense.aggregate([
        {
          $match: { userId: userObjectId },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      Expense.find({ userId: userObjectId })
        .sort({ date: -1 })
        .limit(20)
        .select('amount category description date')
        .lean(),
    ]);

    const currentMonthSpend = monthSummaryRes[0]?.totalAmount || 0;
    const currentMonthCount = monthSummaryRes[0]?.count || 0;
    const currentMonthAvg = monthSummaryRes[0]?.avgAmount || 0;

    const allTimeSpend = allTimeRes[0]?.totalAmount || 0;
    const allTimeCount = allTimeRes[0]?.count || 0;

    const formattedRecentExpenses = recentExpenses.map((e) => ({
      amount: `${currencySymbol}${e.amount.toFixed(2)}`,
      category: e.category,
      description: e.description,
      date: new Date(e.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    }));

    const financialContext = {
      referenceDate: now.toDateString(),
      preferredCurrency: currencySymbol,
      currentMonth: {
        monthName: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
        totalSpend: Math.round(currentMonthSpend * 100) / 100,
        transactionCount: currentMonthCount,
        avgPerTransaction: Math.round(currentMonthAvg * 100) / 100,
      },
      allTime: {
        totalSpend: Math.round(allTimeSpend * 100) / 100,
        transactionCount: allTimeCount,
      },
      categoryBreakdown: categorySummaryRes,
      recentTransactions: formattedRecentExpenses,
    };

    const systemPrompt = `You are SmartSpend AI, a friendly, professional, and highly insightful financial advisor for the Smart Expense Tracker application.
You have direct, verified access to the user's personal financial database provided in JSON format below:

${JSON.stringify(financialContext, null, 2)}

INSTRUCTIONS & RULES:
1. Answer the user's question directly, clearly, and helpfully using the financial records above.
2. If the user asks about something outside their financial context or expenses (e.g. general knowledge, unrelated topics), politely state: "I don't have that information. I can only assist you with questions regarding your tracked expenses, spending categories, and financial trends."
3. Always format all currency numbers with the user's preferred currency symbol (${currencySymbol}) (e.g. ${currencySymbol}45.00, ${currencySymbol}1,250.00).
4. When asked for budget recommendations or spending insights, highlight specific categories with the highest spending and suggest realistic optimizations.
5. Format your output with clean markdown (bullet points, bold headings, organized sections).
6. Never output any internal reasoning, draft prefixes, or meta rules. Directly output your final, polished response.`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
      const fallbackReply = generateLocalFallbackReply(message, financialContext, currencySymbol);
      return res.status(200).json({
        success: true,
        reply: fallbackReply,
        source: 'local-analytics-engine',
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const candidateModels = [
      'gemini-3.5-flash',
      'gemini-3.7-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      'gemini-1.5-flash',
    ];

    let generatedReply = null;
    let successfulModel = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 2048,
          },
        });

        const result = await model.generateContent(message.trim());
        const response = await result.response;
        const rawText = response.text();
        const cleaned = sanitizeAiReply(rawText);

        if (cleaned && cleaned.length > 5) {
          generatedReply = cleaned;
          successfulModel = modelName;
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[Gemini API] Model ${modelName} error (${err.message}). Trying next candidate...`);
      }
    }

    if (generatedReply) {
      return res.status(200).json({
        success: true,
        reply: generatedReply,
        source: successfulModel,
      });
    } else {
      console.warn(`[Gemini API Error] All models failed or rate-limited. Last error: ${lastError?.message}. Using local fallback.`);
      const fallbackReply = generateLocalFallbackReply(message, financialContext, currencySymbol);
      return res.status(200).json({
        success: true,
        reply: fallbackReply,
        source: 'fallback-on-api-error',
        notice: 'Gemini API was temporarily busy; returned local financial analysis.',
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleChat,
};

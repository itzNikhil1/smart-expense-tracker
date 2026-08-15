const mongoose = require('mongoose');
const Expense = require('../models/Expense');

/**
 * @desc    Get aggregated analytics summary (current month total, category breakdown, 6-month trend)
 * @route   GET /api/analytics/summary
 * @access  Private
 * 
 * NOTE: All financial metrics are computed strictly using MongoDB Aggregation Pipelines
 * ($match, $group, $sort, $project) on the database level rather than fetching all records.
 */
const getAnalyticsSummary = async (req, res, next) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    // Calculate boundary dates
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Calculate previous month boundaries for comparison
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // 6 months ago boundary
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);

    // -------------------------------------------------------------
    // Pipeline 1: Current Month Spend & Stats ($match -> $group)
    // -------------------------------------------------------------
    const currentMonthPipeline = [
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
          maxAmount: { $max: '$amount' },
        },
      },
    ];

    // -------------------------------------------------------------
    // Pipeline 2: Previous Month Spend (for MoM comparison)
    // -------------------------------------------------------------
    const prevMonthPipeline = [
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ];

    // -------------------------------------------------------------
    // Pipeline 3: Category-Wise Breakdown ($match -> $group -> $sort)
    // -------------------------------------------------------------
    const categoryBreakdownPipeline = [
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
      {
        $sort: { totalAmount: -1 },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalAmount: { $round: ['$totalAmount', 2] },
          count: 1,
        },
      },
    ];

    // Category breakdown for Current Month specifically
    const currentMonthCategoryPipeline = [
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalAmount: { $round: ['$totalAmount', 2] },
          count: 1,
        },
      },
    ];

    // -------------------------------------------------------------
    // Pipeline 4: Monthly Trend for Last 6 Months ($match -> $group -> $sort)
    // -------------------------------------------------------------
    const monthlyTrendPipeline = [
      {
        $match: {
          userId: userObjectId,
          date: { $gte: sixMonthsAgo, $lte: endOfCurrentMonth },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ];

    // -------------------------------------------------------------
    // Pipeline 5: All-time overview totals
    // -------------------------------------------------------------
    const allTimePipeline = [
      {
        $match: {
          userId: userObjectId,
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
    ];

    // Execute aggregation pipelines concurrently
    const [
      currentMonthRes,
      prevMonthRes,
      categoryBreakdownRes,
      currentMonthCategoryRes,
      monthlyTrendRes,
      allTimeRes,
    ] = await Promise.all([
      Expense.aggregate(currentMonthPipeline),
      Expense.aggregate(prevMonthPipeline),
      Expense.aggregate(categoryBreakdownPipeline),
      Expense.aggregate(currentMonthCategoryPipeline),
      Expense.aggregate(monthlyTrendPipeline),
      Expense.aggregate(allTimePipeline),
    ]);

    // Format Current & Prev Month stats
    const currentMonthSpend = currentMonthRes[0]?.totalAmount || 0;
    const currentMonthCount = currentMonthRes[0]?.count || 0;
    const currentMonthAvg = currentMonthRes[0]?.avgAmount || 0;
    const prevMonthSpend = prevMonthRes[0]?.totalAmount || 0;

    // Month-over-Month percentage change
    let momPercentage = 0;
    if (prevMonthSpend > 0) {
      momPercentage = Math.round(((currentMonthSpend - prevMonthSpend) / prevMonthSpend) * 100);
    } else if (currentMonthSpend > 0) {
      momPercentage = 100;
    }

    // Format 6-Month Continuous Timeline
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const monthLabel = `${monthNames[d.getMonth()]} ${y}`;

      const matchedRecord = monthlyTrendRes.find(
        (item) => item._id.year === y && item._id.month === m
      );

      monthlyTrends.push({
        month: monthLabel,
        year: y,
        monthIndex: m,
        totalAmount: matchedRecord ? Math.round(matchedRecord.totalAmount * 100) / 100 : 0,
        count: matchedRecord ? matchedRecord.count : 0,
      });
    }

    const allTimeSpend = allTimeRes[0]?.totalAmount || 0;
    const allTimeCount = allTimeRes[0]?.count || 0;
    const allTimeAvg = allTimeRes[0]?.avgAmount || 0;

    res.status(200).json({
      success: true,
      data: {
        currentMonth: {
          totalSpend: Math.round(currentMonthSpend * 100) / 100,
          transactionCount: currentMonthCount,
          avgPerTransaction: Math.round(currentMonthAvg * 100) / 100,
          momPercentage,
          prevMonthSpend: Math.round(prevMonthSpend * 100) / 100,
        },
        allTime: {
          totalSpend: Math.round(allTimeSpend * 100) / 100,
          transactionCount: allTimeCount,
          avgPerTransaction: Math.round(allTimeAvg * 100) / 100,
        },
        categoryBreakdown: categoryBreakdownRes,
        currentMonthCategoryBreakdown: currentMonthCategoryRes,
        monthlyTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyticsSummary,
};

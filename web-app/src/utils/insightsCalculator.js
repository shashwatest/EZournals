/**
 * Calculate various insights and patterns from journal entries
 * Web-specific version
 */

export const calculateMoodTrends = (entries, days = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentEntries = entries.filter(entry => new Date(entry.date) >= cutoffDate);
  
  const moodCounts = {};
  const moodsByDate = {};
  
  recentEntries.forEach(entry => {
    const dateKey = new Date(entry.date).toISOString().split('T')[0];
    
    if (!moodsByDate[dateKey]) {
      moodsByDate[dateKey] = [];
    }
    
    (entry.tags || []).forEach(tag => {
      moodCounts[tag] = (moodCounts[tag] || 0) + 1;
      moodsByDate[dateKey].push(tag);
    });
  });
  
  const topMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / recentEntries.length) * 100)
    }));
  
  return {
    moodCounts,
    moodsByDate,
    topMoods,
    totalEntries: recentEntries.length
  };
};

export const calculateWritingPatterns = (entries) => {
  if (entries.length === 0) {
    return {
      entriesPerWeek: 0,
      currentStreak: 0,
      longestStreak: 0,
      bestDay: null,
      bestTime: null,
      dayDistribution: {},
      hourDistribution: {}
    };
  }
  
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = sortedEntries.length - 1; i >= 0; i--) {
    const entryDate = new Date(sortedEntries[i].date);
    entryDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === currentStreak) {
      currentStreak++;
    } else if (daysDiff > currentStreak) {
      break;
    }
  }
  
  for (let i = 1; i < sortedEntries.length; i++) {
    const prevDate = new Date(sortedEntries[i - 1].date);
    const currDate = new Date(sortedEntries[i].date);
    prevDate.setHours(0, 0, 0, 0);
    currDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  
  const dayDistribution = {};
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  entries.forEach(entry => {
    const day = new Date(entry.date).getDay();
    const dayName = dayNames[day];
    dayDistribution[dayName] = (dayDistribution[dayName] || 0) + 1;
  });
  
  const bestDay = Object.entries(dayDistribution)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  
  const hourDistribution = {};
  entries.forEach(entry => {
    const hour = new Date(entry.date).getHours();
    hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
  });
  
  const bestHour = Object.entries(hourDistribution)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  
  let bestTime = null;
  if (bestHour !== null) {
    const hour = parseInt(bestHour);
    if (hour >= 5 && hour < 12) bestTime = 'Morning';
    else if (hour >= 12 && hour < 17) bestTime = 'Afternoon';
    else if (hour >= 17 && hour < 21) bestTime = 'Evening';
    else bestTime = 'Night';
  }
  
  const oldestEntry = new Date(sortedEntries[0].date);
  const newestEntry = new Date(sortedEntries[sortedEntries.length - 1].date);
  const weeksDiff = Math.max(1, (newestEntry - oldestEntry) / (1000 * 60 * 60 * 24 * 7));
  const entriesPerWeek = (entries.length / weeksDiff).toFixed(1);
  
  return {
    entriesPerWeek: parseFloat(entriesPerWeek),
    currentStreak,
    longestStreak: Math.max(longestStreak, 1),
    bestDay,
    bestTime,
    dayDistribution,
    hourDistribution
  };
};

export const calculateTimePatterns = (entries) => {
  const timeSlots = {
    'Early Morning (5-8 AM)': 0,
    'Morning (8-12 PM)': 0,
    'Afternoon (12-5 PM)': 0,
    'Evening (5-9 PM)': 0,
    'Night (9 PM-5 AM)': 0
  };
  
  entries.forEach(entry => {
    const hour = new Date(entry.date).getHours();
    
    if (hour >= 5 && hour < 8) timeSlots['Early Morning (5-8 AM)']++;
    else if (hour >= 8 && hour < 12) timeSlots['Morning (8-12 PM)']++;
    else if (hour >= 12 && hour < 17) timeSlots['Afternoon (12-5 PM)']++;
    else if (hour >= 17 && hour < 21) timeSlots['Evening (5-9 PM)']++;
    else timeSlots['Night (9 PM-5 AM)']++;
  });
  
  const mostActiveTime = Object.entries(timeSlots)
    .sort((a, b) => b[1] - a[1])[0];
  
  return {
    timeSlots,
    mostActiveTime: mostActiveTime ? mostActiveTime[0] : null,
    mostActiveCount: mostActiveTime ? mostActiveTime[1] : 0
  };
};

export const calculateWordStats = (entries) => {
  if (entries.length === 0) {
    return {
      avgWordsPerEntry: 0,
      totalWords: 0,
      shortestEntry: 0,
      longestEntry: 0
    };
  }
  
  const wordCounts = entries.map(entry => {
    const words = (entry.content || '').trim().split(/\s+/).filter(w => w.length > 0);
    return words.length;
  });
  
  const totalWords = wordCounts.reduce((sum, count) => sum + count, 0);
  const avgWordsPerEntry = Math.round(totalWords / entries.length);
  const shortestEntry = Math.min(...wordCounts);
  const longestEntry = Math.max(...wordCounts);
  
  return {
    avgWordsPerEntry,
    totalWords,
    shortestEntry,
    longestEntry
  };
};

export const getComprehensiveInsights = (entries, days = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentEntries = entries.filter(entry => new Date(entry.date) >= cutoffDate);
  
  const moodTrends = calculateMoodTrends(entries, days);
  const writingPatterns = calculateWritingPatterns(recentEntries);
  const timePatterns = calculateTimePatterns(recentEntries);
  const wordStats = calculateWordStats(recentEntries);
  
  return {
    timeRange: `Last ${days} days`,
    totalEntries: recentEntries.length,
    moodTrends,
    writingPatterns,
    timePatterns,
    wordStats
  };
};

import { getCachedMoodTags, getCachedMoodTagColor } from '../../backend/utils/moodTags';

export const getPredefinedTags = () => getCachedMoodTags();

export const getTagColor = (tagName) => getCachedMoodTagColor(tagName);

export const sortEntries = (entries, sortBy) => {
  switch (sortBy) {
    case 'oldest':
      return [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    case 'alphabetical':
      return [...entries].sort((a, b) => (a.content || '').localeCompare(b.content || ''));
    case 'newest':
    default:
      return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  }
};

export const countWords = (text) => {
  if (!text) return 0;
  return text.split(/\s+/).filter(w => w.length > 0).length;
};

export const formatDate = (dateString, options) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options || {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const calculateStats = (entries, timeRange, customStartDate, customEndDate) => {
  const now = new Date();
  let startDate, endDate;

  switch (timeRange) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = now;
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = now;
      break;
    case 'custom':
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      break;
    default:
      startDate = new Date(0);
      endDate = now;
  }

  const filtered = entries.filter(entry => {
    const d = new Date(entry.date);
    return d >= startDate && d <= endDate;
  });

  const moodCounts = {};
  getPredefinedTags().forEach(({ name, color }) => {
    moodCounts[name] = { count: 0, color };
  });

  filtered.forEach(entry => {
    (entry.tags || []).forEach(tag => {
      if (moodCounts[tag]) moodCounts[tag].count++;
    });
  });

  const totalEntries = filtered.length;
  const totalWords = filtered.reduce((sum, e) => sum + countWords(e.content), 0);

  return {
    totalEntries,
    totalWords,
    moodCounts,
    avgWordsPerEntry: totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0,
  };
};

export const formatSyncTime = (timestamp) => {
  if (!timestamp) return 'Never';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

/**
 * Returns a locale-independent date key (YYYY-MM-DD) for grouping entries.
 */
export const getDateKey = (dateString) => {
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Groups entries visually by date if the date is in mergedDates.
 * Returns an array of standard entries and grouped virtual entries.
 */
export const groupEntriesByDate = (entries, mergedDatesArray = []) => {
  if (!entries || entries.length === 0) return [];
  
  const groups = {};
  const result = [];
  
  // First, group by datekey
  entries.forEach(entry => {
    const key = getDateKey(entry.date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });
  
  // Then format result
  Object.keys(groups).forEach(key => {
    const dayEntries = groups[key];
    
    if (mergedDatesArray.includes(key) && dayEntries.length > 1) {
      // Create a virtual grouped entry
      const sorted = [...dayEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
      const allTags = [...new Set(sorted.flatMap(e => e.tags || []))];
      
      // We combine the first 300 chars for preview purposes on the home screen
      const combinedTextPreview = sorted.map(e => {
        const time = new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${time}\n\n${e.content}`;
      }).join('\n\n').substring(0, 300) + '...';

      // Use the first entry's main props as a baseline, but tag it as a group
      result.push({
        ...sorted[0],
        id: `grouped-${key}`,
        isMergedGroup: true,
        subEntries: sorted,
        content: combinedTextPreview,
        tags: allTags,
        // Calculate total words for stats display
        _totalWords: sorted.reduce((sum, e) => sum + countWords(e.content), 0)
      });
    } else {
      // Just push individual entries
      dayEntries.forEach(e => result.push(e));
    }
  });
  
  // Grouping messes up the master sort order, so re-sort by date
  return result.sort((a, b) => new Date(b.date) - new Date(a.date));
};

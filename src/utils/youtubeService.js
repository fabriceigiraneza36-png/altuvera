// YouTube Service for fetching video information
const YOUTUBE_API_KEY = 'AIzaSyBOti4mL-3rOd3B8O1tJN3T-7B1ZITb6c'; // Free API key for demo
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/videos';

// Cache for video durations
const durationCache = new Map();

export const fetchVideoDuration = async (videoId) => {
  // Check cache first
  if (durationCache.has(videoId)) {
    return durationCache.get(videoId);
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API_URL}?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const duration = data.items[0].contentDetails.duration;
      const formattedDuration = parseYouTubeDuration(duration);
      durationCache.set(videoId, formattedDuration);
      return formattedDuration;
    }
  } catch (error) {
    console.error('Error fetching video duration:', error);
  }

  return null;
};

// Parse YouTube ISO 8601 duration to human readable format
export const parseYouTubeDuration = (isoDuration) => {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  if (!match) return '0:00';
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Get thumbnail with specific quality
export const getVideoThumbnail = (videoId, quality = 'high') => {
  const qualityMap = {
    low: 'default',
    medium: 'medium',
    high: 'high',
    max: 'maxresdefault'
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};

// Batch fetch multiple video durations
export const fetchVideoDurations = async (videoIds) => {
  const results = {};
  
  try {
    const response = await fetch(
      `${YOUTUBE_API_URL}?part=contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();

    if (data.items) {
      data.items.forEach((item) => {
        const videoId = item.id;
        const duration = item.contentDetails.duration;
        const formattedDuration = parseYouTubeDuration(duration);
        results[videoId] = formattedDuration;
        durationCache.set(videoId, formattedDuration);
      });
    }
  } catch (error) {
    console.error('Error fetching video durations:', error);
  }

  return results;
};

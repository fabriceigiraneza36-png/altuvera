import React, { useState, useRef, useEffect } from "react";
import { FiPlay, FiX, FiMaximize2, FiMinimize2 } from "react-icons/fi";

const MiniVideoPlayer = ({ videos = [], title = "Destination Video" }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  const currentVideo = videos[activeIndex];
  const videoId = currentVideo?.youtubeId || extractYouTubeId(currentVideo?.url || "");

  useEffect(() => {
    if (!isExpanded && isPlaying) {
      setIsPlaying(false);
    }
  }, [isExpanded]);

  const handlePlay = (index) => {
    setActiveIndex(index);
    setIsPlaying(true);
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setIsPlaying(false);
  };

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
    setIsPlaying(true);
  };

  if (!videos.length) return null;

  return (
    <div className="dd-mini-video-player" ref={containerRef}>
      <div className="dd-mini-video-player__header">
        <div className="dd-mini-video-player__title-wrap">
          <div className="dd-mini-video-player__icon">
            <FiPlay />
          </div>
          <h3 className="dd-mini-video-player__title">{title}</h3>
          <span className="dd-mini-video-player__count">{videos.length} video{videos.length > 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className={`dd-mini-video-player__content${isExpanded ? " dd-mini-video-player__content--expanded" : ""}`}>
        <div className="dd-mini-video-player__main">
          {isPlaying && videoId ? (
            <div className="dd-mini-video-player__iframe-wrap">
              <iframe
                ref={iframeRef}
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
                title={currentVideo?.title || "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="dd-mini-video-player__iframe"
              />
              <button className="dd-mini-video-player__close-btn" onClick={handleClose}>
                <FiX />
              </button>
            </div>
          ) : (
            <div className="dd-mini-video-player__preview" onClick={() => handlePlay(activeIndex)}>
              <img
                src={`https://i.ytimg.com/vi/${videoId || "dQw4w9WgXcQ"}/hqdefault.jpg`}
                alt={currentVideo?.title || "Video thumbnail"}
                className="dd-mini-video-player__thumbnail"
              />
              <div className="dd-mini-video-player__overlay" />
              <div className="dd-mini-video-player__play-btn">
                <FiPlay size={24} />
              </div>
              <div className="dd-mini-video-player__preview-label">
                {currentVideo?.title || "Click to play"}
              </div>
            </div>
          )}
        </div>

        {videos.length > 1 && (
          <div className="dd-mini-video-player__thumbnails">
            {videos.map((video, index) => {
              const vId = video.youtubeId || extractYouTubeId(video.url || "");
              return (
                <button
                  key={index}
                  className={`dd-mini-video-player__thumb${index === activeIndex ? " dd-mini-video-player__thumb--active" : ""}`}
                  onClick={() => handlePlay(index)}
                >
                  <img
                    src={`https://i.ytimg.com/vi/${vId || "dQw4w9WgXcQ"}/mqdefault.jpg`}
                    alt={video.title || `Video ${index + 1}`}
                    className="dd-mini-video-player__thumb-img"
                  />
                  {index === activeIndex && isPlaying && (
                    <div className="dd-mini-video-player__thumb-indicator">
                      <FiPlay size={12} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {isPlaying && (
          <div className="dd-mini-video-player__controls">
            <button className="dd-mini-video-player__control-btn" onClick={handlePrevious}>
              ⏮
            </button>
            <button
              className="dd-mini-video-player__control-btn dd-mini-video-player__control-btn--primary"
              onClick={handleClose}
            >
              {isExpanded ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
            </button>
            <button className="dd-mini-video-player__control-btn" onClick={handleNext}>
              ⏭
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function extractYouTubeId(url) {
  if (!url) return "";
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : "";
}

export default MiniVideoPlayer;

import React, { useState } from 'react';

export const ActivityFeed = () => {
  const [activities] = useState([
    { id: '1', message: 'Document created', timestamp: Date.now() },
  ]);

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="info-card">
      <h3 className="info-card-title">Recent Activity</h3>
      <div className="activity-list">
        {activities.map(activity => (
          <div key={activity.id} className="activity-item">
            <div>{activity.message}</div>
            <div className="activity-time">{formatTimeAgo(activity.timestamp)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

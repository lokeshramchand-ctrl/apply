'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Briefcase, CalendarDays, Percent, Send } from 'lucide-react';

// --- MOCK DATA ---
const generateHeatmapData = () => {
  return Array.from({ length: 119 }, (_, i) => ({ // 17 weeks
    id: i,
    count: Math.floor(Math.random() * 8), 
  }));
};

export default function ApplyTrack() {
  const [heatmapData, setHeatmapData] = useState<{id: number, count: number}[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHeatmapData(generateHeatmapData());
    setMounted(true);
  }, []);

  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring' as const, stiffness: 260, damping: 30 } 
    },
  };

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'var(--color-level-0)';
    if (count <= 2) return 'var(--color-level-1)';
    if (count <= 4) return 'var(--color-level-2)';
    if (count <= 6) return 'var(--color-level-3)';
    return 'var(--color-level-4)';
  };

  if (!mounted) return null; 

  return (
    <div className="dashboard-container">
      {/* INJECTED VANILLA CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@400;500;700&display=swap');

        :root {
          /* Matte & Muted Base Colors */
          --bg-main: #0c0c0c;
          --bg-card: #151515;
          --border-color: #262626;
          --text-main: #e0e0e0;
          --text-muted: #737373;
          --accent-glow: rgba(67, 118, 84, 0.1);
          
          /* Refined Sage / Moss Greens */
          --color-level-0: #1a1a1a;
          --color-level-1: #25382b;
          --color-level-2: #2f543d;
          --color-level-3: #437d57;
          --color-level-4: #5cb57a;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Inter', sans-serif;
        }

        .dashboard-container {
          min-height: 100vh;
          background-color: var(--bg-main);
          color: var(--text-main);
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          selection: background: var(--color-level-3);
        }

        .content-wrapper {
          max-width: 900px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 3.5rem;
        }

        /* HEADER SECTION */
        .header {
          text-align: center;
          margin-bottom: 0.5rem;
        }
        .header-title {
          font-family: 'Outfit', sans-serif;
          font-size: 2.75rem;
          font-weight: 700;
          letter-spacing: -0.04em;
          color: var(--text-main);
        }
        .header-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.25em;
          margin-top: 0.5rem;
          font-weight: 500;
        }

        /* STATS SECTION */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
        .stat-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.75rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .stat-card:hover {
          border-color: #333333;
          box-shadow: 0 10px 40px var(--accent-glow);
          transform: translateY(-3px);
        }
        .stat-icon {
          padding: 0.8rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          color: var(--color-level-4);
        }
        .stat-info {
          display: flex;
          flex-direction: column;
        }
        .stat-value {
          font-family: 'Outfit', sans-serif;
          font-size: 1.75rem;
          font-weight: 500;
          color: #ffffff;
          line-height: 1.2;
        }
        .stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 400;
        }

        /* HEATMAP SECTION */
        .heatmap-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 1.25rem;
        }
        .section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
          font-weight: 500;
          color: #ffffff;
        }
        .heatmap-container {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .heatmap-scroll-wrapper {
          width: 100%;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }
        .heatmap-scroll-wrapper::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        .heatmap-grid {
          display: grid;
          grid-template-rows: repeat(7, 1fr);
          grid-auto-flow: column;
          gap: 3px; /* Dense, tight matrix */
          width: max-content;
          margin: 0 auto;
        }
        .heatmap-cell {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-radius 0.15s ease;
        }
        .heatmap-cell:hover {
          transform: translateY(-2px) scale(1.15);
          border-radius: 3px;
          box-shadow: 0 4px 12px rgba(92, 181, 122, 0.3);
          z-index: 10;
        }
        .heatmap-legend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          align-self: flex-end;
        }
        .legend-squares {
          display: flex;
          gap: 3px;
        }
        .legend-cell {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        /* LOG FORM SECTION */
        .log-form-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 2rem;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .input-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .custom-input {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 0.85rem 1rem;
          border-radius: 8px;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s ease;
        }
        .custom-input::placeholder {
          color: #404040;
        }
        .custom-input:focus {
          border-color: var(--color-level-3);
          box-shadow: 0 0 0 1px var(--color-level-3);
        }
        .submit-btn {
          margin-top: 2rem;
          width: 100%;
          background: var(--color-level-3);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }
        .submit-btn:hover {
          background: var(--color-level-4);
        }
        .submit-btn:active {
          transform: scale(0.99);
        }
      `}} />

      <motion.div 
        className="content-wrapper"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* 1. Header Section */}
        <motion.header className="header" variants={itemVariants}>
          <h1 className="header-title">ApplyTrack</h1>
          <p className="header-subtitle">Consistency Dashboard</p>
        </motion.header>

        {/* 2. Stats Section */}
        <motion.section className="stats-grid">
          {[
            { label: 'Current Streak', value: '14 Days', icon: <Flame size={20} strokeWidth={2.5} /> },
            { label: 'Total Applications', value: '286', icon: <Briefcase size={20} strokeWidth={2.5} /> },
            { label: 'Active Days This Month', value: '21', icon: <CalendarDays size={20} strokeWidth={2.5} /> },
            { label: 'Response Rate', value: '12%', icon: <Percent size={20} strokeWidth={2.5} /> },
          ].map((stat, idx) => (
            <motion.div key={idx} className="stat-card" variants={itemVariants}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* 3. Heatmap Section */}
        <motion.section variants={itemVariants}>
          <div className="heatmap-header">
            <h2 className="section-title">Consistency Map</h2>
          </div>
          <div className="heatmap-container">
            <div className="heatmap-scroll-wrapper">
              <div className="heatmap-grid">
                {heatmapData.map((day) => (
                  <motion.div
                    key={day.id}
                    className="heatmap-cell"
                    style={{ backgroundColor: getHeatmapColor(day.count) }}
                    title={`${day.count} applications`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.random() * 0.3, duration: 0.3, ease: "easeOut" }}
                  />
                ))}
              </div>
            </div>
            
            {/* Legend */}
            <div className="heatmap-legend">
              <span>Less</span>
              <div className="legend-squares">
                {[0, 2, 4, 6, 8].map((level, i) => (
                  <div 
                    key={i} 
                    className="legend-cell" 
                    style={{ backgroundColor: getHeatmapColor(level) }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </motion.section>

        {/* 4. Log Form Section */}
        <motion.section variants={itemVariants}>
          <h2 className="section-title">Log Today's Effort</h2>
          <div className="log-form-card">
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Applications Today *</label>
                <input type="number" min="0" className="custom-input" placeholder="e.g., 5" />
              </div>
              <div className="input-group">
                <label className="input-label">Responses Received</label>
                <input type="number" min="0" className="custom-input" placeholder="e.g., 1" />
              </div>
              <div className="input-group">
                <label className="input-label">Interviews Scheduled</label>
                <input type="number" min="0" className="custom-input" placeholder="e.g., 0" />
              </div>
            </div>
            
            <motion.button 
              className="submit-btn"
              whileTap={{ scale: 0.98 }}
            >
              <Send size={16} strokeWidth={2.5} />
              Save Progress
            </motion.button>
          </div>
        </motion.section>

      </motion.div>
    </div>
  );
}
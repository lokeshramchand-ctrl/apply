'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Briefcase, CalendarDays, Percent, Send } from 'lucide-react';

// --- MOCK DATA ---
const generateHeatmapData = () => {
  return Array.from({ length: 98 }, (_, i) => ({
    id: i,
    count: Math.floor(Math.random() * 8), // 0 to 7 applications
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
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'var(--color-level-0)';
    if (count <= 2) return 'var(--color-level-1)';
    if (count <= 4) return 'var(--color-level-2)';
    if (count <= 6) return 'var(--color-level-3)';
    return 'var(--color-level-4)';
  };

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <div className="dashboard-container">
      {/* INJECTED VANILLA CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg-main: #0a0a0a;
          --bg-card: #141414;
          --border-color: rgba(255, 255, 255, 0.08);
          --text-main: #ffffff;
          --text-muted: #888888;
          --accent-glow: rgba(34, 197, 94, 0.15);
          
          /* Heatmap Greens */
          --color-level-0: #1f1f22;
          --color-level-1: #0e4429;
          --color-level-2: #006d32;
          --color-level-3: #26a641;
          --color-level-4: #39d353;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .dashboard-container {
          min-height: 100vh;
          background-color: var(--bg-main);
          color: var(--text-main);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .content-wrapper {
          max-width: 900px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        /* HEADER SECTION */
        .header {
          text-align: center;
          margin-bottom: 1rem;
        }
        .header-title {
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.05em;
          background: linear-gradient(to right, #ffffff, #888888);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .header-subtitle {
          font-size: 0.9rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-top: 0.5rem;
        }

        /* STATS SECTION */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
        .stat-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .stat-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 30px var(--accent-glow);
          transform: translateY(-2px);
        }
        .stat-icon {
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          color: var(--color-level-3);
        }
        .stat-info {
          display: flex;
          flex-direction: column;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
        }
        .stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        /* HEATMAP SECTION */
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-main);
        }
        .heatmap-container {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 1.5rem;
        }
        .heatmap-grid {
          display: grid;
          grid-template-rows: repeat(7, 1fr);
          grid-auto-flow: column;
          gap: 4px;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }
        .heatmap-cell {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .heatmap-cell:hover {
          transform: scale(1.4);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
          z-index: 10;
        }

        /* LOG FORM SECTION */
        .log-form-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 2rem;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
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
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .custom-input {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          outline: none;
          transition: all 0.2s ease;
        }
        .custom-input:focus {
          border-color: var(--color-level-3);
          box-shadow: 0 0 0 2px rgba(38, 166, 65, 0.2);
        }
        .submit-btn {
          margin-top: 1.5rem;
          width: 100%;
          background: linear-gradient(135deg, var(--color-level-3), var(--color-level-2));
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }
        .submit-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(38, 166, 65, 0.3);
        }
        .submit-btn:active {
          transform: translateY(1px);
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
            { label: 'Current Streak', value: '14 Days', icon: <Flame size={24} /> },
            { label: 'Total Applications', value: '286', icon: <Briefcase size={24} /> },
            { label: 'Active Days This Month', value: '21', icon: <CalendarDays size={24} /> },
            { label: 'Response Rate', value: '12%', icon: <Percent size={24} /> },
          ].map((stat, idx) => (
            <motion.div key={idx} className="stat-card" variants={itemVariants} whileHover={{ scale: 1.02 }}>
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
          <h2 className="section-title">Consistency Map</h2>
          <div className="heatmap-container">
            <div className="heatmap-grid">
              {heatmapData.map((day) => (
                <motion.div
                  key={day.id}
                  className="heatmap-cell"
                  style={{ backgroundColor: getHeatmapColor(day.count) }}
                  title={`${day.count} applications`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.random() * 0.5, duration: 0.3 }}
                />
              ))}
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
                <label className="input-label">Responses Received (Optional)</label>
                <input type="number" min="0" className="custom-input" placeholder="e.g., 1" />
              </div>
              <div className="input-group">
                <label className="input-label">Interviews Scheduled (Optional)</label>
                <input type="number" min="0" className="custom-input" placeholder="e.g., 0" />
              </div>
            </div>
            
            <motion.button 
              className="submit-btn"
              whileTap={{ scale: 0.98 }}
            >
              <Send size={18} />
              Save Progress
            </motion.button>
          </div>
        </motion.section>

      </motion.div>
    </div>
  );
}
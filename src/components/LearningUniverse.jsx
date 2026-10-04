import React from "react";

export default function LearningUniverse() {
  const worlds = [
    { name: "Physics", icon: "⚛️", status: "WORLD" },
    { name: "Chemistry", icon: "🧪", status: "WORLD" },
    { name: "Mathematics", icon: "📐", status: "WORLD" },
  ];

  return (
    <section className="learning-universe">
      <div className="universe-header">
        <div>
          <p className="universe-label">LEARNING UNIVERSE</p>
          <h2>Choose your world</h2>
          <p>Every subject is a new world. Every concept is a level.</p>
        </div>
        <div className="universe-xp">⚡ 0 XP</div>
      </div>

      <div className="world-grid">
        {worlds.map((world) => (
          <button className="world-card" key={world.name}>
            <span className="world-icon">{world.icon}</span>
            <span className="world-status">{world.status}</span>
            <strong>{world.name}</strong>
            <span className="world-progress">Your journey begins here</span>
          </button>
        ))}
      </div>
    </section>
  );
}

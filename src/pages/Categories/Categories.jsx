import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, doc, setDoc, deleteDoc } from "firebase/firestore";
import "./Categories.css";

export default function Categories({ expenses, currency, categories }) {
  const [modalType, setModalType] = useState(null); // "add" or "edit" or null
  const [activeCatId, setActiveCatId] = useState(null);

  const [catName, setCatName] = useState("");
  const [catEmoji, setCatEmoji] = useState("🏷️");
  const [catColor, setCatColor] = useState("#4318FF");
  const [saving, setSaving] = useState(false);

  const popularEmojis = [
    "🍕",
    "🎮",
    "✈️",
    "💊",
    "📚",
    "🏋️",
    "💻",
    "☕",
    "🎁",
    "🐶",
    "👗",
    "🚗",
  ];
  const popularColors = [
    "#4318FF",
    "#39B8FF",
    "#05CD99",
    "#FFB547",
    "#EE5D50",
    "#868CFF",
    "#E02424",
    "#0E9F6E",
  ];

  const totalAll = expenses.reduce((a, b) => a + b.amount, 0);

  const openCreateModal = () => {
    setActiveCatId(null);
    setCatName("");
    setCatEmoji("🏷️");
    setCatColor("#4318FF");
    setModalType("add");
  };

  const openEditModal = (cat) => {
    setActiveCatId(cat.id || cat.name); 
    setCatName(cat.name);
    setCatEmoji(cat.icon);
    setCatColor(cat.color);
    setModalType("edit");
  };

  const closeModal = () => {
    setModalType(null);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setSaving(true);
    try {
      if (modalType === "add") {
        const newCatRef = doc(collection(db, "custom_categories"));
        await setDoc(newCatRef, {
          name: catName.trim(),
          icon: catEmoji || "🏷️",
          color: catColor || "#4318FF",
          createdAt: new Date(),
        });
      } else if (modalType === "edit") {
        await setDoc(
          doc(db, "custom_categories", String(activeCatId)),
          {
            name: catName.trim(),
            icon: catEmoji,
            color: catColor,
            updatedAt: new Date(),
          },
          { merge: true },
        );
      }
      closeModal();
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Failed to save category. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (
      window.confirm(`Are you sure you want to delete or reset "${cat.name}"?`)
    ) {
      try {
        await deleteDoc(
          doc(db, "custom_categories", String(cat.id || cat.name)),
        );
      } catch (err) {
        console.error("Error deleting:", err);
      }
    }
  };

  return (
    <div className="page-wrapper">
      <div className="top-nav">
        <div className="top-nav-left">
          <h2>Categories Directory</h2>
          <p>Organize, create and track spending across all verticals</p>
        </div>
        <button className="btn-primary-add" onClick={openCreateModal}>
          + Create Category
        </button>
      </div>

      <div className="categories-grid">
        {categories.map((cat) => {
          const spent = expenses
            .filter((e) => e.category === cat.name)
            .reduce((a, b) => a + b.amount, 0);
          const count = expenses.filter((e) => e.category === cat.name).length;
          const share =
            totalAll > 0 ? ((spent / totalAll) * 100).toFixed(1) : 0;

          return (
            <div className="cat-card" key={cat.id || cat.name}>
              <div className="cat-header">
                <div className="cat-badge-wrap">
                  <div
                    className="cat-badge"
                    style={{ background: `${cat.color}15`, color: cat.color }}
                  >
                    {cat.icon}
                  </div>
                  <span className="cat-share-badge">{share}%</span>
                </div>

                {/* 🆕 EDIT & DELETE BUTTONS FOR ALL CATEGORIES */}
                <div className="cat-action-btns">
                  <button
                    className="btn-edit-cat"
                    onClick={() => openEditModal(cat)}
                    title="Edit Category"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-delete-cat"
                    onClick={() => handleDelete(cat)}
                    title="Delete / Reset"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <h3 className="cat-title">{cat.name}</h3>
              <p className="cat-count">{count} Transactions recorded</p>

              <div className="cat-footer">
                <span>Total Spent</span>
                <h4>
                  {currency}
                  {spent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h4>
              </div>
            </div>
          );
        })}
      </div>

      {modalType && (
        <div className="cat-modal-backdrop" onClick={closeModal}>
          <div className="cat-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="cat-modal-header">
              <div>
                <h3>
                  {modalType === "add"
                    ? "Create Custom Category"
                    : "Edit Category"}
                </h3>
                <p>Pick an emoji avatar and theme color</p>
              </div>
              <button className="btn-close-cat" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="cat-modal-form">
              <div className="emoji-preview-center">
                <div
                  className="emoji-avatar-bubble"
                  style={{ background: `${catColor}20`, borderColor: catColor }}
                >
                  {catEmoji}
                </div>
                <input
                  type="text"
                  maxLength="2"
                  value={catEmoji}
                  onChange={(e) => setCatEmoji(e.target.value)}
                  className="emoji-direct-input"
                  title="Type custom emoji"
                />
              </div>

              <div className="picker-section">
                <label>Quick Emoji Picks</label>
                <div className="emoji-choices-row">
                  {popularEmojis.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      className={`emoji-pick-btn ${catEmoji === emoji ? "selected" : ""}`}
                      onClick={() => setCatEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>Category Name</label>
                <input
                  type="text"
                  placeholder="e.g., Gym & Fitness, Gaming, Pet Care"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="picker-section">
                <label>Theme Color & Custom Picker</label>
                <div className="color-choices-row">
                  {popularColors.map((color) => (
                    <button
                      type="button"
                      key={color}
                      className={`color-pick-circle ${catColor === color ? "selected" : ""}`}
                      style={{ background: color }}
                      onClick={() => setCatColor(color)}
                    />
                  ))}

                  <div className="custom-color-wrap" title="Pick Custom Color">
                    <input
                      type="color"
                      className="native-color-picker"
                      value={catColor}
                      onChange={(e) => setCatColor(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="cat-modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={saving}>
                  {saving ? "Saving..." : "✓ Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

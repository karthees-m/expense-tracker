import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, doc, setDoc, deleteDoc } from "firebase/firestore";
import * as Icons from "lucide-react";
import "./Categories.css";

const renderIcon = (iconName, size = 20) => {
  const IconCmp = Icons[iconName] || Icons.Tag;
  return <IconCmp size={size} />;
};

export default function Categories({ expenses, currency, categories }) {
  const [modalType, setModalType] = useState(null);
  const [activeCatId, setActiveCatId] = useState(null);

  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState("Tag");
  const [catColor, setCatColor] = useState("#4318FF");
  const [saving, setSaving] = useState(false);

  const popularIcons = [
    "Utensils",
    "Gamepad2",
    "Plane",
    "Pill",
    "BookOpen",
    "Dumbbell",
    "Laptop",
    "Coffee",
    "Gift",
    "Dog",
    "Shirt",
    "Car",
    "ShoppingBag",
    "Zap",
    "Film",
    "Users",
    "Box",
    "Home",
    "Music",
    "Smartphone",
    "Heart",
    "Camera",
    "Briefcase",
    "Scissors",
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
    setCatIcon("Tag");
    setCatColor("#4318FF");
    setModalType("add");
  };

  const openEditModal = (cat) => {
    setActiveCatId(cat.id || cat.name);
    setCatName(cat.name);
    setCatIcon(cat.icon || "Tag");
    setCatColor(cat.color);
    setModalType("edit");
  };

  const closeModal = () => setModalType(null);

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSaving(true);
    try {
      if (modalType === "add") {
        const newCatRef = doc(collection(db, "custom_categories"));
        await setDoc(newCatRef, {
          name: catName.trim(),
          icon: catIcon || "Tag",
          color: catColor || "#4318FF",
          createdAt: new Date(),
        });
      } else if (modalType === "edit") {
        await setDoc(
          doc(db, "custom_categories", String(activeCatId)),
          {
            name: catName.trim(),
            icon: catIcon,
            color: catColor,
            updatedAt: new Date(),
          },
          { merge: true },
        );
      }
      closeModal();
    } catch (err) {
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
        <button
          className="btn-primary-add"
          onClick={openCreateModal}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Icons.Plus size={18} /> Create Category
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
                    {renderIcon(cat.icon, 24)}
                  </div>
                  <span className="cat-share-badge">{share}%</span>
                </div>
                <div className="cat-action-btns">
                  <button
                    className="btn-edit-cat"
                    onClick={() => openEditModal(cat)}
                    title="Edit Category"
                  >
                    <Icons.Edit2 size={16} />
                  </button>
                  <button
                    className="btn-delete-cat"
                    onClick={() => handleDelete(cat)}
                    title="Delete / Reset"
                  >
                    <Icons.Trash2 size={16} />
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
                <p>Pick an icon and theme color</p>
              </div>
              <button className="btn-close-cat" onClick={closeModal}>
                <Icons.X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="cat-modal-form">
              <div className="emoji-preview-center">
                <div
                  className="emoji-avatar-bubble"
                  style={{
                    background: `${catColor}20`,
                    borderColor: catColor,
                    color: catColor,
                  }}
                >
                  {renderIcon(catIcon, 32)}
                </div>
              </div>

              <div className="picker-section">
                <label>Select Icon</label>
                <div
                  className="emoji-choices-row"
                  style={{
                    maxHeight: "140px",
                    overflowY: "auto",
                    padding: "4px",
                  }}
                >
                  {popularIcons.map((iconName) => (
                    <button
                      type="button"
                      key={iconName}
                      className={`emoji-pick-btn ${catIcon === iconName ? "selected" : ""}`}
                      onClick={() => setCatIcon(iconName)}
                    >
                      {renderIcon(iconName, 20)}
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
                <label>Theme Color</label>
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
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={saving}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "center",
                  }}
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Icons.Check size={18} /> Save Category
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

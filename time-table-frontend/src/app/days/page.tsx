"use client";

import React, { useState, FormEvent } from "react";
import { useDayMutations, useDays } from "./hooks/useDays";
import { Day } from "./days.type";

// This is the type for the 'name' property
type DayName =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Friday"
  | "Saturday"
  | "Sunday";

// The available options for the 'name' field
const dayNameOptions: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DaysManagementPage: React.FC = () => {
  const { data: days, isLoading, isError, error } = useDays();

  const {
    createDay: createDayMutation,
    isCreating,
    updateDay: updateDayMutation,
    isUpdating,
    deleteDay: deleteDayMutation,
    isDeleting,
  } = useDayMutations();

  const [newDayName, setNewDayName] = useState<DayName>(dayNameOptions[0]);
  const [editingDay, setEditingDay] = useState<Day | null>(null);

  const handleCreateDay = (e: FormEvent) => {
    e.preventDefault();
    createDayMutation(newDayName);
  };

  const handleDeleteDay = (id: string) => {
    if (window.confirm("Are you sure you want to delete this day?")) {
      deleteDayMutation(id);
    }
  };

  const handleStartEdit = (day: any) => {
    setEditingDay({ ...day });
  };

  const handleCancelEdit = () => {
    setEditingDay(null);
  };

  const handleUpdateDay = (e: FormEvent) => {
    e.preventDefault();
    if (editingDay) {
      updateDayMutation(editingDay);
      setEditingDay(null);
    }
  };

  if (isLoading) return <p>Loading days... ⏳</p>;
  if (isError && error) return <p>Error fetching days: {error.message} ❌</p>;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "700px",
        margin: "auto",
        padding: "20px",
      }}
    >
      <h1>🗓️ Manage Days</h1>

      <hr style={{ margin: "20px 0" }} />

      {/* Create Day Form */}
      <section>
        <h2>✨ Add New Day</h2>
        <form
          onSubmit={handleCreateDay}
          style={{
            marginBottom: "25px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <label htmlFor="newDayName" style={{ marginRight: "5px" }}>
            Day Name:
          </label>
          <select
            id="newDayName"
            value={newDayName}
            onChange={(e) => setNewDayName(e.target.value as DayName)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            {dayNameOptions.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isCreating}
            style={{
              padding: "8px 15px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#007bff",
              color: "white",
              cursor: "pointer",
            }}
          >
            {isCreating ? "Adding..." : "➕ Add Day"}
          </button>
        </form>
      </section>

      <hr style={{ margin: "20px 0" }} />

      {/* Edit Day Form */}
      {editingDay && (
        <section
          style={{
            marginTop: "20px",
            marginBottom: "25px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h2>
            ✏️ Edit Day: {editingDay.name}{" "}
            <span style={{ fontSize: "0.8em", color: "#555" }}>
              (ID: {editingDay._id})
            </span>
          </h2>
          <form
            onSubmit={handleUpdateDay}
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >
            <label htmlFor="editDayName" style={{ marginRight: "5px" }}>
              New Name:
            </label>
            <select
              id="editDayName"
              value={editingDay.name}
              onChange={(e) =>
                setEditingDay({
                  ...editingDay,
                  name: e.target.value as DayName,
                })
              }
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              {dayNameOptions.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={isUpdating}
              style={{
                padding: "8px 15px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "#28a745",
                color: "white",
                cursor: "pointer",
              }}
            >
              {isUpdating ? "Saving..." : "💾 Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isUpdating}
              style={{
                padding: "8px 15px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </form>
        </section>
      )}
      <hr style={{ margin: "20px 0" }} />

      {/* List of Days */}
      <section>
        <h2>📋 Current Days</h2>
        {(!days || days.length === 0) && !isLoading && (
          <p>No days found. Feel free to add one using the form above! 👍</p>
        )}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {days?.map((day, index) => (
            <li
              key={index}
              style={{
                padding: "12px 15px",
                border: "1px solid #eee",
                marginBottom: "10px",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor:
                  editingDay?._id === day._id ? "#e9ecef" : "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <span style={{ fontSize: "1.1em" }}>
                {day.name}{" "}
                <small style={{ color: "#777", fontSize: "0.8em" }}>
                  (ID: {day._id})
                </small>
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleStartEdit(day)}
                  style={{
                    padding: "6px 10px",
                    cursor: "pointer",
                    border: "1px solid #007bff",
                    color: "#007bff",
                    backgroundColor: "white",
                    borderRadius: "4px",
                  }}
                  disabled={isUpdating || isDeleting || !!editingDay}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteDay(day._id)}
                  style={{
                    padding: "6px 10px",
                    cursor: "pointer",
                    border: "1px solid #dc3545",
                    color: "#dc3545",
                    backgroundColor: "white",
                    borderRadius: "4px",
                  }}
                  // disabled={
                  //   isDeleting || isUpdating || editingDay?.id === day.id
                  // }
                >
                  🗑️ Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default DaysManagementPage;

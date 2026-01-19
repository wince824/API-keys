import React from "react";

export default function SelectField({ placeholder, id, options, onSelect, value }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onSelect(e.target.value)}
      className="select-field"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
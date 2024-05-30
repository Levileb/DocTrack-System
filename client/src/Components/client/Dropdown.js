import React from "react";

const Dropdown = ({ data, label, selectedValue, onSelect }) => {
  const handleSelect = (event) => {
    const value = event.target.value;
    onSelect(value);
  };

  return (
    <div className="new-input">
      <label htmlFor={label}>
        {label}:<br />
      </label>
      <select
        className="dropdown"
        id={label}
        value={selectedValue}
        onChange={handleSelect}
      >
        <option value="" disabled hidden>
          Select a {label}
        </option>{" "}
        {/* Default option */}
        {data.map((item) => (
          <option key={item.id} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;

import React from "react";
import { IoSearch } from "react-icons/io5";

const ThinHeader = () => {
  return (
    <>
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="PanelHeader">
            <div className="filter">
              <p>Filter By Date</p>
            </div>
            <div className="search">
              <div className="search-border">
                <IoSearch className="searchIcon" />
                <input
                  type="text"
                  placeholder="Search.."
                  className="search-bar"
                ></input>
              </div>
            </div>
          </div>
          <div className="contents">
            <p>Contents will be displayed here.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThinHeader;

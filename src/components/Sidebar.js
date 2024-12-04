import React from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.css"

function Sidebar() {
  return (
    <div className="d-flex flex-column vh-100 bg-light border-end">
      <h4 className="text-center my-4">Menu</h4>
      <ul className="nav flex-column px-2">
        <li className="nav-item">
          <Link to="/orders" className="nav-link">
            Ordenes
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/shipments" className="nav-link">
            Surtidos
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;

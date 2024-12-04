import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import OrdersPage from "./pages/OrdersPage";
import ShipmentsPage from "./pages/ShipmentsPage";
import OrdersPageDetail from "./pages/OrdersPageDetail";
import ShipmentDetail from "./pages/ShipmentDetail";

import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <Router>
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1 p-4">
          <Routes>
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/shipments" element={<ShipmentsPage />} />
            <Route path="/OrderDetail/:id" element={<OrdersPageDetail />} />
            <Route path="/ShipmentsDetail/:id" element={<ShipmentDetail />} />
          </Routes>
          <ToastContainer />
        </div>
      </div>
    </Router>
  );
}

export default App;

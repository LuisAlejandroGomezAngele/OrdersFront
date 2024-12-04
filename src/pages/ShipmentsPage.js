import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ShipmentsPage() {
  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5146/api/Shipments/getOrdersInProcess"
        );
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Hubo un problema al cargar las órdenes.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Cargando Surtidos...</div>;

  if (error) return <div>{error}</div>;

  const handleViewOrder = (orderId) => {
    navigate(`/ShipmentsDetail/${orderId}`);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Surtidos</h1>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Surtido</th>
            <th>Almacén</th>
            <th>Estatus</th>
            <th>Fecha de Registro</th>
            <th>Tiempo de Surtido</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId}>
              <td>
                {order.status === "Surtido finalizado"
                  ? `Surtido #${order.orderId}`
                  : "Surtido"}
              </td>{" "}
              <td>{order.warehouseName}</td>
              <td>{order.status}</td>
              <td>{order.formattedDate}</td>
              <td>{order.tiempoSurtido}</td>
              <td>
                <div className="dropdown">
                  <button
                    className="btn btn-secondary dropdown-toggle"
                    type="button"
                    id={`dropdownMenuButton-${order.orderId}`}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    ...
                  </button>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby={`dropdownMenuButton-${order.orderId}`}
                  >
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleViewOrder(order.orderId)}
                      >
                        Visualizar
                      </button>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ShipmentsPage;

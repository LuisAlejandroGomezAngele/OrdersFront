import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function OrdersPage() {
  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5146/api/Orders/getOrdersWithWarehouse"
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

  if (loading) return <div>Cargando órdenes...</div>;

  if (error) return <div>{error}</div>;


  const handleNewOrder = async () => {
    const newOrderData = {
      motion: "Order",
      status: "Cotizacion",
      warehouseID: 1,
    };

    try {
      const response = await axios.post(
        "http://localhost:5146/api/Orders",
        newOrderData
      );

      if (response.status === 200) {
        const createdId = response.data[0]?.id;

        navigate(`/OrderDetail/${createdId}`);
      } else {
        console.error("Error creating the order:", response.status);
        alert("Hubo un problema al crear la orden.");
      }
    } catch (error) {
      console.error("Error creating the order:", error);
      alert("Hubo un error al realizar la petición.");
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/OrderDetail/${orderId}`);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Órdenes</h1>
        <button className="btn btn-primary" onClick={handleNewOrder}>
          Nueva Orden
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Orden</th>
            <th>Almacén</th>
            <th>Estatus</th>
            <th>Fecha de Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId}>
              <td>
                {order.status === "Surtido finalizado"
                  ? `${order.order} #${order.orderId}`
                  : order.order}
              </td>
              <td>{order.warehouseName}</td>
              <td>{order.status}</td>
              <td>{order.formattedDate}</td>
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

export default OrdersPage;

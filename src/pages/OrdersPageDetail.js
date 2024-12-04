import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";

function OrdersPageDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPageProducts, setCurrentPageProducts] = useState(1);
  const [currentPageDetails, setCurrentPageDetails] = useState(1);
  const itemsPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reolad, setReload] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderResponse = await axios.get(
          `http://localhost:5146/api/Orders/${id}`
        );
        setOrder(orderResponse.data);

        const productsResponse = await axios.get(
          `http://localhost:5146/api/Orders/${id}/inventory`
        );
        setProducts(productsResponse.data);

        const detailsResponse = await axios.get(
          `http://localhost:5146/api/Orders/orderDetail/${id}`
        );
        setOrderDetails(detailsResponse.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Hubo un problema al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    setReload(false);
  }, [id, reolad]);

  const handleAddOrEditProduct = async () => {
    if (!selectedProduct && !selectedDetail) {
      console.error("No se ha seleccionado ningún producto o detalle.");
      return;
    }

    if (quantity <= 0) {
      console.error("La cantidad debe ser mayor a 0.");
      return;
    }

    const detail = {
      sale_ID: id,
      code: selectedProduct ? selectedProduct.code : selectedDetail.code,
      price: selectedProduct ? selectedProduct.price : selectedDetail.price,
      barcode: selectedProduct
        ? selectedProduct.barcode
        : selectedDetail.barcode,
      amount: quantity,
    };

    try {
      const response = await axios.post(
        "http://localhost:5146/api/Orders/createSalesDetail",
        detail
      );

      setShowModal(false);
      setQuantity(1);

      const detailsResponse = await axios.get(
        `http://localhost:5146/api/Orders/orderDetail/${id}`
      );
      setOrderDetails(detailsResponse.data || []);

      toast.success(response.data.message);
      setReload(true);
    } catch (error) {
      console.error("Error al guardar el producto o detalle:", error);
      toast.error("¡Error al guardar el producto o detalle!");
    }
  };

  const handleDeleteDetail = async (ID) => {
    try {
      await axios.delete(
        `http://localhost:5146/api/Orders/deleteOrderDetail/${ID}`
      );

      const detailsResponse = await axios.get(
        `http://localhost:5146/api/Orders/orderDetail/${id}`
      );
      setOrderDetails(detailsResponse.data || []);
      setReload(true);
    } catch (error) {
      console.error("Error deleting detail:", error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(`http://localhost:5146/api/Orders/${order.id}/status`, {
        status: newStatus,
      });

      setOrder((prevOrder) => ({
        ...prevOrder,
        status: newStatus,
      }));
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const indexOfLastProduct = currentPageProducts * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const indexOfLastDetail = currentPageDetails * itemsPerPage;
  const indexOfFirstDetail = indexOfLastDetail - itemsPerPage;
  const currentDetails = orderDetails.slice(
    indexOfFirstDetail,
    indexOfLastDetail
  );

  const shouldShowActions =
    order &&
    order.status !== "En surtido" &&
    order.status !== "En Pausa" &&
    order.status !== "Surtido finalizado";

  if (loading) return <div>Cargando detalles de la orden...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Detalles de la Orden</h2>
        <button
          className="btn btn-secondary d-flex align-items-center"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="me-2" /> Regresar
        </button>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Detalle de la Orden</h5>
          {order && (
            <div className="row align-items-center">
              <div className="col-md-6">
                <p>
                  <strong>Orden ID:</strong> {order.id}
                </p>
                <p>
                  <strong>Almacén:</strong> {order.warehouseId}
                </p>
                <p>
                  <strong>Fecha Creación:</strong> {order.registrationDate}
                </p>
              </div>
              <div className="col-md-6 d-flex align-items-center justify-content-between">
                <div>
                  <p>
                    <strong>Total:</strong>{" "}
                    {new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    }).format(order.total)}
                  </p>

                  <p>
                    <strong>Estatus:</strong>{" "}
                    <span className="badge bg-primary">{order.status}</span>
                  </p>
                </div>
                {(order.status === "Cotizacion" ||
                  order.status === "Autorización") && (
                  <div className="dropdown">
                    <button
                      className="btn btn-secondary dropdown-toggle"
                      type="button"
                      id="statusOptions"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      ...
                    </button>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby="statusOptions"
                    >
                      {order.status === "Cotizacion" && (
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleStatusChange("Autorización")}
                          >
                            Autorización
                          </button>
                        </li>
                      )}
                      {order.status === "Autorización" && (
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleStatusChange("En surtido")}
                          >
                            En surtido
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Productos Disponibles */}
      <div className="mb-4">
        <h5>Productos Disponibles</h5>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Clave</th>
              <th>Descripción</th>
              <th>Disponible</th>
              <th>Precio</th>
              {shouldShowActions && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product) => (
              <tr key={product.code}>
                <td>{product.code}</td>
                <td>{product.name}</td>
                <td>{product.stock}</td>
                <td>${product.price.toFixed(2)}</td>
                {shouldShowActions && (
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedProduct(product);
                        setSelectedDetail(null);
                        setShowModal(true);
                      }}
                    >
                      Agregar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detalles de la Orden */}
      <div>
        <h5>Detalles de la Orden</h5>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Clave</th>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Precio Total</th>
              {shouldShowActions && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {currentDetails.map((detail) => (
              <tr key={detail.code}>
                <td>{detail.code}</td>
                <td>{detail.productName}</td>
                <td>{detail.amount}</td>
                <td>${detail.price.toFixed(2)}</td>
                <td>${(detail.price * detail.amount).toFixed(2)}</td>
                {shouldShowActions && (
                  <td>
                    <button
                      className="btn btn-secondary btn-sm me-2"
                      onClick={() => {
                        setSelectedDetail(detail);
                        setSelectedProduct(null);
                        setQuantity(detail.amount);
                        setShowModal(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteDetail(detail.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedDetail ? "Editar Producto" : "Agregar Producto"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formQuantity">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAddOrEditProduct}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default OrdersPageDetail;

import React, { useEffect, useState } from "react";
import "../styles/ShipmentDetail.css";
import { FaRedo, FaBarcode, FaArrowLeft } from "react-icons/fa"; // Iconos
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";

function ShipmentDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtiene el ID de la ruta
  const [items, setItems] = useState([]); // Estado para los datos de los artículos
  const [loading, setLoading] = useState(true); // Indicador de carga
  const [error, setError] = useState(null); // Estado para errores
  const [showModal, setShowModal] = useState(false); // Estado para mostrar/ocultar el modal de escaneo
  const [showQuantityModal, setShowQuantityModal] = useState(false); // Estado para mostrar/ocultar el modal de cantidad
  const [barcode, setBarcode] = useState(""); // Estado para el código de barras ingresado
  const [scanningError, setScanningError] = useState(null); // Estado para errores al escanear
  const [scannedItem, setScannedItem] = useState(null); // Estado para el artículo escaneado
  const [quantity, setQuantity] = useState(1); // Estado para la cantidad ingresada
  const [status, setStatus] = useState(""); // Estado del estatus del surtido

  // Calcula si todos los pendientes son 0
  const allCompleted = items.every((item) => item.pending === 0);

  // Realizar la petición al cargar el componente
  useEffect(() => {
    const fetchShipmentDetails = async () => {
      try {
        const [detailsResponse, statusResponse] = await Promise.all([
          axios.get(
            `http://localhost:5146/api/Shipments/${id}/shipmentDetails`
          ),
          axios.get(`http://localhost:5146/api/Shipments/${id}/status`),
        ]);

        setItems(detailsResponse.data); // Establece los datos en el estado
        setStatus(statusResponse.data.status); // Establece el estado del surtido
      } catch (err) {
        console.error("Error fetching shipment details:", err);
        setError("Hubo un problema al cargar los detalles del surtido.");
      } finally {
        setLoading(false);
      }
    };

    fetchShipmentDetails();
  }, [id]);

  const handleScan = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5146/api/Shipments/${id}/validateBarcode`,
        { barcode }
      );

      if (response.data.ok === 0) {
        setScannedItem(barcode);
        setShowQuantityModal(true);
        setShowModal(false);
      } else {
        toast.error(response.data.message);
        setShowModal(false);
      }
    } catch (err) {
      console.error("Error scanning item:", err);
      setScanningError("Hubo un error al procesar el código de barras.");
    }
  };

  const handleAddQuantity = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5146/api/Shipments/${id}/addScannedQuantity`,
        { barcode: scannedItem, quantity }
      );

      if (response.data.ok === 0) {
        toast.success(response.data.message);
        const updatedItems = await axios.get(
          `http://localhost:5146/api/Shipments/${id}/shipmentDetails`
        );
        setItems(updatedItems.data);
        setShowQuantityModal(false);
        setQuantity(1);
        setScannedItem(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error("Error adding scanned quantity:", err);
      toast.error("Hubo un problema al agregar la cantidad.");
    }
  };

  const handleReset = async (code) => {
    try {
      const response = await axios.post(
        `http://localhost:5146/api/Shipments/${id}/resetScannedQuantity`,
        { code }
      );

      if (response.data.ok === 0) {
        toast.success(response.data.message);
        const updatedItems = await axios.get(
          `http://localhost:5146/api/Shipments/${id}/shipmentDetails`
        );
        setItems(updatedItems.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error("Error resetting quantity:", err);
      toast.error("Hubo un problema al resetear la cantidad.");
    }
  };

  const handlePauseOrResume = async () => {
    try {
      const newStatus = status === "En surtido" ? "En Pausa" : "En surtido";
      const response = await axios.put(
        `http://localhost:5146/api/Shipments/${id}/pauseOrResume`,
        { status: newStatus }
      );

      if (response.data.ok === 0) {
        toast.success(response.data.message);
        setStatus(newStatus); // Actualiza el estado del surtido
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error("Error pausing or resuming shipment:", err);
      toast.error("Hubo un problema al cambiar el estado del surtido.");
    }
  };

  const handleFinalize = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5146/api/Shipments/${id}/finalize`
      );

      if (response.data.message) {
        toast.success(response.data.message);
        setStatus("Surtido finalizado");
      } else {
        toast.error("Error al finalizar el surtido.");
      }
    } catch (err) {
      console.error("Error finalizing shipment:", err);
      toast.error("Hubo un problema al finalizar el surtido.");
    }
  };

  if (loading) return <div>Cargando detalles del surtido...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Detalles del Surtido</h2>
        <div className="d-flex gap-3">
          {/* Botón de regresar */}
          <button
            className="btn btn-secondary d-flex align-items-center"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft className="me-2" /> Regresar
          </button>
          {/* Botón de escanear */}
          {status !== "Surtido finalizado" && (
            <button
              className="btn btn-primary d-flex align-items-center"
              onClick={() => setShowModal(true)}
            >
              <FaBarcode className="me-2" /> Escanear
            </button>
          )}
        </div>
      </div>

      <div className="row">
        {items.map((item, index) => (
          <div key={index} className="col-md-4 mb-4">
            <div className="card custom-card p-3">
              <div className="card-body">
                <h5>{item.code}</h5>
                <p>{item.description}</p>
              </div>
              <div className="card-body">
                <p>
                  <strong>Almacén:</strong> {item.warehouse}
                </p>
                <p>
                  <strong>Disponible:</strong> {item.available}
                </p>
              </div>
              <div className="card-body">
                <p>
                  <strong>Cantidad:</strong> {item.totalQuantity}
                </p>
                <p className="scanned-pending">
                  <span className="scanned text-primary">
                    Escaneada: {item.scanned}
                  </span>
                  <br />
                  <span className="pending text-danger">
                    Pendiente: {item.pending}
                  </span>
                </p>
              </div>
              {status !== "Surtido finalizado" && (
                <div className="card-body">
                  <button
                    className="btn btn-danger reset-btn"
                    onClick={() => handleReset(item.code)}
                  >
                    <FaRedo /> Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {status !== "Surtido finalizado" && (
        <div className="d-flex justify-content-end mt-4">
          <button
            className={`btn ${
              allCompleted ? "btn-primary" : "btn-warning"
            } d-flex align-items-center`}
            onClick={allCompleted ? handleFinalize : handlePauseOrResume}
          >
            {allCompleted
              ? "Finalizar Surtido"
              : status === "En surtido"
              ? "Pausar Surtido"
              : "Reanudar Surtido"}
          </button>
        </div>
      )}

      {/* Modales */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Escanear Código de Barras</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="barcodeInput">
              <Form.Label>Código de Barras</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el código de barras"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </Form.Group>
            {scanningError && (
              <p className="text-danger mt-2">{scanningError}</p>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleScan}>
            Escanear
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showQuantityModal}
        onHide={() => setShowQuantityModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Ingresar Cantidad Escaneada</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="quantityInput">
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
          <Button
            variant="secondary"
            onClick={() => setShowQuantityModal(false)}
          >
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAddQuantity}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ShipmentDetail;

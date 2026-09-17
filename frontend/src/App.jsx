import { useState } from "react";
import {
  login,
  getProducts,
  getEnquiries,
  getQuotations,
  getSalesOrders,
  createEnquiry,
  createQuotation,
  updateQuotationStatus,
  convertQuotation,
  confirmSalesOrder,
  dispatchSalesOrder,
} from "./api";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("Dashboard");
  const [data, setData] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [enquiryDetails, setEnquiryDetails] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [quotationEnquiry, setQuotationEnquiry] = useState("");
  const [quotationDiscount, setQuotationDiscount] = useState(0);
  const [quotationGst, setQuotationGst] = useState(18);
  const [quotationValidUntil, setQuotationValidUntil] = useState("");
  const [enquiries, setEnquiries] = useState([]);

  const handleDispatchOrder = async (id) => {
    setError("");

    try {
      const token = localStorage.getItem("token");

      await dispatchSalesOrder(token, id);

      await loadPage("Sales Orders");
      await loadPage("Products");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConvertQuotation = async (id) => {
    setError("");

    try {
      const token = localStorage.getItem("token");

      await convertQuotation(token, id);

      await loadPage("Quotations");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login(email, password);

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      setUser(result.user);
    } catch (err) {
      setError(err.message);
    }
  };
  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");

      await createEnquiry(token, {
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        details: enquiryDetails,
        items: [
          {
            productId: Number(selectedProduct),
            quantity: Number(quantity),
          },
        ],
      });

      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setEnquiryDetails("");
      setSelectedProduct("");
      setQuantity(1);

      await loadPage("Enquiries");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");

      await createQuotation(token, {
        enquiryId: Number(quotationEnquiry),
        discount: Number(quotationDiscount),
        gst: Number(quotationGst),
        validUntil: quotationValidUntil,
      });

      setQuotationEnquiry("");
      setQuotationDiscount(0);
      setQuotationGst(18);
      setQuotationValidUntil("");

      await loadPage("Quotations");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleQuotationStatus = async (id, status) => {
    setError("");

    try {
      const token = localStorage.getItem("token");

      await updateQuotationStatus(token, id, status);

      await loadPage("Quotations");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleConfirmOrder = async (id) => {
    setError("");

    try {
      const token = localStorage.getItem("token");

      await confirmSalesOrder(token, id);

      await loadPage("Sales Orders");
      await loadPage("Products");
    } catch (err) {
      setError(err.message);
    }
  };
  const loadPage = async (page) => {
    setActivePage(page);
    setError("");

    const token = localStorage.getItem("token");

    try {
      if (page === "Products") {
        setData(await getProducts(token));
      }

      if (page === "Enquiries") {
        setData(await getEnquiries(token));
      }

      if (page === "Quotations") {
        setData(await getQuotations(token));
        setEnquiries(await getEnquiries(token));
      }

      if (page === "Sales Orders") {
        setData(await getSalesOrders(token));
      }
    } catch (err) {
      setError("Failed to load data");
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setData([]);
    setActivePage("Dashboard");
  };

  if (!user) {
    return (
      <div className="login-container">
        <form className="login-box" onSubmit={handleLogin}>
          <h1>ERP System</h1>
          <p>Sales & Inventory Management</p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>

          {error && <p className="error">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <div>
          <h1>ERP System</h1>
          <span>
            {user.name} · {user.role}
          </span>
        </div>

        <button onClick={logout}>Logout</button>
      </header>

      <nav>
        {[
          "Dashboard",
          "Products",
          "Enquiries",
          "Quotations",
          "Sales Orders",
        ].map((page) => (
          <button key={page} onClick={() => loadPage(page)}>
            {page}
          </button>
        ))}
      </nav>

      <main>
        <h2>{activePage}</h2>

        {activePage === "Dashboard" && (
          <div className="cards">
            <div className="card">
              <h3>Customer Enquiries</h3>
              <p>Manage customer requirements</p>
            </div>

            <div className="card">
              <h3>Quotations</h3>
              <p>Create and manage quotations</p>
            </div>

            <div className="card">
              <h3>Sales Orders</h3>
              <p>Confirm and dispatch orders</p>
            </div>

            <div className="card">
              <h3>Inventory</h3>
              <p>Track physical and reserved stock</p>
            </div>
          </div>
        )}

        {activePage === "Products" && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Unit Price</th>
                  <th>Physical</th>
                  <th>Reserved</th>
                  <th>Available</th>
                </tr>
              </thead>

              <tbody>
                {data.map((item) => {
                  const physical = item.inventory?.physicalQty ?? 0;
                  const reserved = item.inventory?.reservedQty ?? 0;

                  return (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.sku}</td>
                      <td>₹{item.unitPrice}</td>
                      <td>{physical}</td>
                      <td>{reserved}</td>
                      <td>{physical - reserved}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activePage === "Enquiries" && (
          <>
            <div className="form-container">
              <h3>Create Customer Enquiry</h3>

              <form onSubmit={handleCreateEnquiry}>
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />

                <input
                  type="email"
                  placeholder="Customer Email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Customer Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />

                <textarea
                  placeholder="Enquiry Details"
                  value={enquiryDetails}
                  onChange={(e) => setEnquiryDetails(e.target.value)}
                  required
                />

                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                >
                  <option value="">Select Product</option>
                  <option value="1">Hydraulic Pump</option>
                  <option value="2">Industrial Valve</option>
                  <option value="3">Hydraulic Cylinder</option>
                  <option value="4">Pneumatic Cylinder</option>
                  <option value="5">Industrial Gearbox</option>
                  <option value="6">Pressure Sensor</option>
                </select>

                <input
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />

                <button type="submit">Create Enquiry</button>
              </form>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th>Products</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.customer?.name}</td>
                      <td>{item.details}</td>
                      <td>{item.status}</td>
                      <td>{item.items?.length ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activePage === "Quotations" && (
          <>
            <div className="form-container">
              <h3>Create Quotation</h3>

              <form onSubmit={handleCreateQuotation}>
                <select
                  value={quotationEnquiry}
                  onChange={(e) => setQuotationEnquiry(e.target.value)}
                  required
                >
                  <option value="">Select NEW Enquiry</option>

                  {enquiries
                    .filter((item) => item.status === "NEW")
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        Enquiry #{item.id} - {item.customer?.name}
                      </option>
                    ))}
                </select>

                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Discount %"
                  value={quotationDiscount}
                  onChange={(e) => setQuotationDiscount(e.target.value)}
                />

                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="GST %"
                  value={quotationGst}
                  onChange={(e) => setQuotationGst(e.target.value)}
                />

                <input
                  type="date"
                  value={quotationValidUntil}
                  onChange={(e) => setQuotationValidUntil(e.target.value)}
                />

                <button type="submit">Create Quotation</button>
              </form>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Valid Until</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.enquiry?.customer?.name}</td>
                      <td>₹{item.grandTotal}</td>

                      <td>
                        {item.status === "DRAFT" && (
                          <button
                            onClick={() =>
                              handleQuotationStatus(item.id, "SENT")
                            }
                          >
                            Mark Sent
                          </button>
                        )}

                        {item.status === "SENT" && (
                          <>
                            <button
                              onClick={() =>
                                handleQuotationStatus(item.id, "ACCEPTED")
                              }
                            >
                              Accept
                            </button>

                            <button
                              onClick={() =>
                                handleQuotationStatus(item.id, "REJECTED")
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {item.status === "ACCEPTED" && !item.salesOrder && (
                          <button
                            onClick={() => handleConvertQuotation(item.id)}
                          >
                            Convert to Order
                          </button>
                        )}

                        <span> {item.status}</span>
                      </td>
                      <td>
                        {item.validUntil
                          ? new Date(item.validUntil).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activePage === "Sales Orders" && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Items</th>
                </tr>
              </thead>

              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.quotation?.enquiry?.customer?.name}</td>
                    <td>
                      {item.status === "PENDING" && (
                        <button onClick={() => handleConfirmOrder(item.id)}>
                          Confirm Order
                        </button>
                      )}
                      {item.status === "CONFIRMED" && (
                        <button onClick={() => handleDispatchOrder(item.id)}>
                          Dispatch
                        </button>
                      )}

                      <span> {item.status}</span>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>{item.items?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </main>
    </div>
  );
}

export default App;

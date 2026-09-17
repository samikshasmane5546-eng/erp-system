const API_URL = "http://localhost:5000";

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

export async function getProducts(token) {
  const response = await fetch(`${API_URL}/api/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function getEnquiries(token) {
  const response = await fetch(`${API_URL}/api/enquiries`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function getQuotations(token) {
  const response = await fetch(`${API_URL}/api/quotations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function getSalesOrders(token) {
  const response = await fetch(`${API_URL}/api/sales-orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}
export async function createEnquiry(token, enquiryData) {
  const response = await fetch(`${API_URL}/api/enquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(enquiryData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create enquiry");
  }

  return data;
}
export async function createQuotation(token, quotationData) {
  const response = await fetch(`${API_URL}/api/quotations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(quotationData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create quotation");
  }

  return data;
}
export async function updateQuotationStatus(token, id, status) {
  const response = await fetch(`${API_URL}/api/quotations/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update quotation status");
  }

  return data;
}
export async function convertQuotation(token, quotationId) {
  const response = await fetch(
    `${API_URL}/api/sales-orders/${quotationId}/convert`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to convert quotation");
  }

  return data;
}
export async function confirmSalesOrder(token, orderId) {
  const response = await fetch(
    `${API_URL}/api/sales-orders/${orderId}/confirm`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to confirm sales order");
  }

  return data;
}
export async function dispatchSalesOrder(token, orderId) {
  const response = await fetch(
    `${API_URL}/api/sales-orders/${orderId}/dispatch`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        courierName: "DHL",
        trackingNo: "TRK-001",
        notes: "Dispatched successfully",
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to dispatch sales order");
  }

  return data;
}

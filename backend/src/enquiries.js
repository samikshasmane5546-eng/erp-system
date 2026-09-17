const express = require("express");
const prisma = require("./prisma");
const { authenticate, authorize } = require("./auth");

const router = express.Router();

router.post("/", authenticate, authorize("ADMIN", "SALES"), async (req, res) => {
  try {
    const { customer, details, items } = req.body;

    if (!customer || !customer.name || !details || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Customer name, enquiry details and at least one product are required",
      });
    }

    for (const item of items) {
      if (!item.productId || !item.quantity || Number(item.quantity) <= 0) {
        return res.status(400).json({
          message: "Each product must have a valid productId and positive quantity",
        });
      }
    }

    const enquiry = await prisma.$transaction(async (tx) => {
      const newCustomer = await tx.customer.create({
        data: {
          name: customer.name,
          email: customer.email || null,
          phone: customer.phone || null,
          address: customer.address || null,
        },
      });

      return tx.enquiry.create({
        data: {
          customerId: newCustomer.id,
          details,
          items: {
            create: items.map((item) => ({
              productId: Number(item.productId),
              quantity: Number(item.quantity),
            })),
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    res.status(201).json(enquiry);
  } catch (error) {
    console.error(error);

    if (error.code === "P2003") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    res.status(500).json({
      message: "Failed to create enquiry",
    });
  }
});

router.get("/", authenticate, authorize("ADMIN", "SALES"), async (req, res) => {
  try {
    const enquiries = await prisma.enquiry.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        quotation: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    res.json(enquiries);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch enquiries",
    });
  }
});

module.exports = router;
const express = require("express");
const prisma = require("./prisma");
const { authenticate, authorize } = require("./auth");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventory: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

router.post("/", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { name, sku, description, unitPrice, physicalQty } = req.body;

    if (!name || !sku || unitPrice == null || physicalQty == null) {
      return res.status(400).json({
        message: "Name, SKU, unit price and physical quantity are required",
      });
    }

    if (Number(unitPrice) < 0 || Number(physicalQty) < 0) {
      return res.status(400).json({
        message: "Unit price and physical quantity cannot be negative",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description,
        unitPrice,
        inventory: {
          create: {
            physicalQty: Number(physicalQty),
            reservedQty: 0,
          },
        },
      },
      include: {
        inventory: true,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "SKU already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create product",
    });
  }
});

module.exports = router;
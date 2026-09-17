const express = require("express");
const prisma = require("./prisma");
const { authenticate, authorize } = require("./auth");

const router = express.Router();

router.post("/", authenticate, authorize("ADMIN", "SALES"), async (req, res) => {
  try {
    const { enquiryId, validUntil, discount = 0, gst = 0 } = req.body;

    if (!enquiryId) {
      return res.status(400).json({ message: "enquiryId is required" });
    }

    if (Number(discount) < 0 || Number(discount) > 100 ||
        Number(gst) < 0 || Number(gst) > 100) {
      return res.status(400).json({
        message: "Discount and GST must be between 0 and 100",
      });
    }

    const enquiry = await prisma.enquiry.findUnique({
      where: { id: Number(enquiryId) },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    if (enquiry.status !== "NEW") {
      return res.status(400).json({
        message: "Quotation can only be created for a NEW enquiry",
      });
    }

    if (enquiry.items.length === 0) {
      return res.status(400).json({
        message: "Enquiry has no products",
      });
    }

    const existingQuotation = await prisma.quotation.findUnique({
      where: { enquiryId: Number(enquiryId) },
    });

    if (existingQuotation) {
      return res.status(409).json({
        message: "Quotation already exists for this enquiry",
      });
    }

    const discountRate = Number(discount);
    const gstRate = Number(gst);

    const items = enquiry.items.map((item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.product.unitPrice);
      const lineAmount = quantity * unitPrice;

      return {
        productId: item.productId,
        quantity,
        unitPrice,
        lineAmount,
      };
    });

    const subtotal = items.reduce(
      (total, item) => total + item.lineAmount,
      0
    );

    const discountAmount = subtotal * (discountRate / 100);
    const taxableAmount = subtotal - discountAmount;
    const gstAmount = taxableAmount * (gstRate / 100);
    const grandTotal = taxableAmount + gstAmount;

    const quotation = await prisma.$transaction(async (tx) => {
      const newQuotation = await tx.quotation.create({
        data: {
          enquiryId: Number(enquiryId),
          validUntil: validUntil ? new Date(validUntil) : null,
          discount: discountRate,
          gst: gstRate,
          grandTotal: grandTotal.toFixed(2),
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice.toFixed(2),
              lineAmount: item.lineAmount.toFixed(2),
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          enquiry: {
            include: {
              customer: true,
            },
          },
        },
      });

      await tx.enquiry.update({
        where: { id: Number(enquiryId) },
        data: { status: "QUOTED" },
      });

      return newQuotation;
    });

    res.status(201).json({
      message: "Quotation created successfully",
      quotation,
      calculation: {
        subtotal: subtotal.toFixed(2),
        discountPercent: discountRate,
        discountAmount: discountAmount.toFixed(2),
        gstPercent: gstRate,
        gstAmount: gstAmount.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create quotation",
    });
  }
});

router.get("/", authenticate, authorize("ADMIN", "SALES"), async (req, res) => {
  try {
    const quotations = await prisma.quotation.findMany({
      include: {
        enquiry: {
          include: {
            customer: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        salesOrder: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    res.json(quotations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch quotations",
    });
  }
});

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "SALES"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const allowedStatuses = ["DRAFT", "SENT", "ACCEPTED", "REJECTED"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid quotation status",
        });
      }

      const quotation = await prisma.quotation.findUnique({
        where: { id: Number(req.params.id) },
      });

      if (!quotation) {
        return res.status(404).json({
          message: "Quotation not found",
        });
      }

      const updated = await prisma.quotation.update({
        where: { id: Number(req.params.id) },
        data: { status },
      });

      res.json({
        message: "Quotation status updated",
        quotation: updated,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to update quotation status",
      });
    }
  }
);

module.exports = router;
const express = require("express");
const prisma = require("./prisma");
const { authenticate, authorize } = require("./auth");

const router = express.Router();

router.post(
  "/:quotationId/convert",
  authenticate,
  authorize("ADMIN", "SALES"),
  async (req, res) => {
    try {
      const quotationId = Number(req.params.quotationId);

      const quotation = await prisma.quotation.findUnique({
        where: { id: quotationId },
        include: {
          items: true,
          enquiry: true,
        },
      });

      if (!quotation) {
        return res.status(404).json({
          message: "Quotation not found",
        });
      }

      if (quotation.status !== "ACCEPTED") {
        return res.status(400).json({
          message: "Only ACCEPTED quotations can be converted",
        });
      }

      const existingOrder = await prisma.salesOrder.findUnique({
        where: { quotationId },
      });

      if (existingOrder) {
        return res.status(409).json({
          message: "Sales order already exists for this quotation",
          salesOrder: existingOrder,
        });
      }

      const salesOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.salesOrder.create({
          data: {
            quotationId,
            items: {
              create: quotation.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            },
          },
          include: {
            quotation: {
              include: {
                enquiry: {
                  include: {
                    customer: true,
                  },
                },
              },
            },
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        await tx.enquiry.update({
          where: { id: quotation.enquiryId },
          data: { status: "WON" },
        });

        return order;
      });

      res.status(201).json({
        message: "Sales order created successfully",
        salesOrder,
      });
    } catch (error) {
      console.error(error);

      if (error.code === "P2002") {
        return res.status(409).json({
          message: "Sales order already exists for this quotation",
        });
      }

      res.status(500).json({
        message: "Failed to create sales order",
      });
    }
  }
);

router.post(
  "/:id/confirm",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const orderId = Number(req.params.id);

      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.salesOrder.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (!order) {
          throw new Error("ORDER_NOT_FOUND");
        }

        if (order.status !== "PENDING") {
          throw new Error("ORDER_ALREADY_PROCESSED");
        }

        for (const item of order.items) {
          const inventory = await tx.$queryRaw`
            SELECT id, "physicalQty", "reservedQty"
            FROM "Inventory"
            WHERE "productId" = ${item.productId}
            FOR UPDATE
          `;

          if (!inventory.length) {
            throw new Error("INVENTORY_NOT_FOUND");
          }

          const available =
            inventory[0].physicalQty - inventory[0].reservedQty;

          if (item.quantity > available) {
            throw new Error("INSUFFICIENT_STOCK");
          }

          await tx.inventory.update({
            where: { id: inventory[0].id },
            data: {
              reservedQty: {
                increment: item.quantity,
              },
            },
          });
        }

        return tx.salesOrder.update({
          where: { id: orderId },
          data: {
            status: "CONFIRMED",
            confirmedAt: new Date(),
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      });

      res.json({
        message: "Sales order confirmed and inventory reserved",
        salesOrder: result,
      });
    } catch (error) {
      console.error(error);

      if (error.message === "ORDER_NOT_FOUND") {
        return res.status(404).json({
          message: "Sales order not found",
        });
      }

      if (error.message === "ORDER_ALREADY_PROCESSED") {
        return res.status(400).json({
          message: "Sales order is already processed",
        });
      }

      if (error.message === "INVENTORY_NOT_FOUND") {
        return res.status(400).json({
          message: "Inventory record not found",
        });
      }

      if (error.message === "INSUFFICIENT_STOCK") {
        return res.status(409).json({
          message: "Insufficient available inventory",
        });
      }

      res.status(500).json({
        message: "Failed to confirm sales order",
      });
    }
  }
);
router.post(
  "/:id/dispatch",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const { courierName, trackingNo, notes } = req.body;

      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.salesOrder.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (!order) {
          throw new Error("ORDER_NOT_FOUND");
        }

        if (order.status !== "CONFIRMED") {
          throw new Error("ORDER_NOT_CONFIRMED");
        }

        const existingDispatch = await tx.dispatch.findUnique({
          where: { salesOrderId: orderId },
        });

        if (existingDispatch) {
          throw new Error("ALREADY_DISPATCHED");
        }

        for (const item of order.items) {
          const inventory = await tx.$queryRaw`
            SELECT id, "physicalQty", "reservedQty"
            FROM "Inventory"
            WHERE "productId" = ${item.productId}
            FOR UPDATE
          `;

          if (!inventory.length) {
            throw new Error("INVENTORY_NOT_FOUND");
          }

          if (item.quantity > inventory[0].reservedQty) {
            throw new Error("INSUFFICIENT_RESERVED_STOCK");
          }

          await tx.inventory.update({
            where: { id: inventory[0].id },
            data: {
              physicalQty: {
                decrement: item.quantity,
              },
              reservedQty: {
                decrement: item.quantity,
              },
            },
          });
        }

        await tx.dispatch.create({
          data: {
            salesOrderId: orderId,
            courierName: courierName || null,
            trackingNo: trackingNo || null,
            notes: notes || null,
          },
        });

        return tx.salesOrder.update({
          where: { id: orderId },
          data: {
            status: "DISPATCHED",
            dispatchedAt: new Date(),
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
            dispatch: true,
          },
        });
      });

      res.json({
        message: "Sales order dispatched successfully",
        salesOrder: result,
      });
    } catch (error) {
      console.error(error);

      if (error.message === "ORDER_NOT_FOUND") {
        return res.status(404).json({
          message: "Sales order not found",
        });
      }

      if (error.message === "ORDER_NOT_CONFIRMED") {
        return res.status(400).json({
          message: "Only CONFIRMED sales orders can be dispatched",
        });
      }

      if (error.message === "ALREADY_DISPATCHED") {
        return res.status(409).json({
          message: "Sales order has already been dispatched",
        });
      }

      if (error.message === "INVENTORY_NOT_FOUND") {
        return res.status(400).json({
          message: "Inventory record not found",
        });
      }

      if (error.message === "INSUFFICIENT_RESERVED_STOCK") {
        return res.status(409).json({
          message: "Dispatch quantity exceeds reserved inventory",
        });
      }

      res.status(500).json({
        message: "Failed to dispatch sales order",
      });
    }
  }
);
router.patch(
  "/:id/cancel",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const orderId = Number(req.params.id);

      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.salesOrder.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (!order) {
          throw new Error("ORDER_NOT_FOUND");
        }

        if (order.status === "DISPATCHED") {
          throw new Error("ORDER_ALREADY_DISPATCHED");
        }

        if (order.status === "CANCELLED") {
          throw new Error("ORDER_ALREADY_CANCELLED");
        }

        if (order.status === "CONFIRMED") {
          for (const item of order.items) {
            const inventory = await tx.$queryRaw`
              SELECT id, "physicalQty", "reservedQty"
              FROM "Inventory"
              WHERE "productId" = ${item.productId}
              FOR UPDATE
            `;

            if (!inventory.length) {
              throw new Error("INVENTORY_NOT_FOUND");
            }

            if (item.quantity > inventory[0].reservedQty) {
              throw new Error("INVALID_RESERVED_STOCK");
            }

            await tx.inventory.update({
              where: { id: inventory[0].id },
              data: {
                reservedQty: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }

        return tx.salesOrder.update({
          where: { id: orderId },
          data: {
            status: "CANCELLED",
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      });

      res.json({
        message: "Sales order cancelled successfully",
        salesOrder: result,
      });
    } catch (error) {
      console.error(error);

      if (error.message === "ORDER_NOT_FOUND") {
        return res.status(404).json({
          message: "Sales order not found",
        });
      }

      if (error.message === "ORDER_ALREADY_DISPATCHED") {
        return res.status(400).json({
          message: "Dispatched sales orders cannot be cancelled",
        });
      }

      if (error.message === "ORDER_ALREADY_CANCELLED") {
        return res.status(400).json({
          message: "Sales order is already cancelled",
        });
      }

      if (error.message === "INVENTORY_NOT_FOUND") {
        return res.status(400).json({
          message: "Inventory record not found",
        });
      }

      if (error.message === "INVALID_RESERVED_STOCK") {
        return res.status(409).json({
          message: "Reserved inventory is insufficient for release",
        });
      }

      res.status(500).json({
        message: "Failed to cancel sales order",
      });
    }
  }
);
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SALES"),
  async (req, res) => {
    try {
      const orders = await prisma.salesOrder.findMany({
        include: {
          quotation: {
            include: {
              enquiry: {
                include: {
                  customer: true,
                },
              },
            },
          },
          items: {
            include: {
              product: true,
            },
          },
          dispatch: true,
        },
        orderBy: {
          id: "desc",
        },
      });

      res.json(orders);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to fetch sales orders",
      });
    }
  }
);

module.exports = router;
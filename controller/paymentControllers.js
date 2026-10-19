const path = require("path");
const { createOrder, getPaymentStatus } = require("../services/cashfreeServices");
const Payment = require("../models/Payment");
const users = require("../models/userModel");

exports.getPaymentPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
};

exports.processPayment = async (req, res) => {
  console.log("User Id is ", req.user.userId);
  const orderId = "ORDER-" + Date.now();
  const orderAmount = 2000;
  const orderCurrency = "INR";
  const customerID = "1";
  const customerPhone = "9999999999";
  console.log("process payment page hit");

  try {
    //* Create an order in Cashfree and get the payment session ID
    const paymentSessionId = await createOrder(
      orderId,
      orderAmount,
      orderCurrency,
      customerID,
      customerPhone,
    );

    //* Save payment details to the database
    await Payment.create({
      orderId,
      paymentSessionId,
      orderAmount,
      orderCurrency,
      paymentStatus: "Pending",
      userId: req.user.userId,
    });

    console.log("process payment page hit sec times");
    res.json({ paymentSessionId, orderId });
  } catch (error) {
    console.error("Error processing payment:", error.message);
    res.status(500).json({ message: "Error processing payment" });
  }
};


// file path verify kar lena

exports.updatePaymentStatus = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    // 1. Cashfree se actual payment status check karo
    const orderStatus = await getPaymentStatus(orderId);

    // 2. Apna payment record find karo
    const payment = await Payment.findOne({
      where: { orderId: orderId },
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    // 3. Payment status update karo
    payment.paymentStatus = orderStatus;
    await payment.save();

    // 4. Sirf successful payment par user ko premium banao
    if (orderStatus === "Success") {
      await users.update(
        { userRole: "premium" },
        { where: { id: payment.userId } }
      );
    }

    return res.json({
      orderStatus,
      message:
        orderStatus === "SUCCESS"
          ? "Payment successful. User is now premium."
          : "Payment status updated.",
    });
  } catch (error) {
    console.error("Error fetching payment status:", error.message);

    return res.status(500).json({
      message: "Error fetching payment status",
    });
  }
};

// const path = require("path");
// const {
//   createOrder,
//   getPaymentStatus,
// } = require("../services/cashfreeServices");
// const Payment = require("../models/Payment");

// exports.getPaymentPage = (req, res) => {
//   res.sendFile(path.join(__dirname, "../views/index.html"));
// };
// exports.processPayment = async (req, res) => {
//   console.log("User Id is ", req.user.userId);
//   const orderId = "ORDER-" + Date.now();
//   const orderAmount = 2000;
//   const orderCurrency = "INR";
//   const customerID = "1";
//   const customerPhone = "9999999999";
//   console.log("process payment page hit");

//   try {
//     //* Create an order in Cashfree and get the payment session ID
//     const paymentSessionId = await createOrder(
//       orderId,
//       orderAmount,
//       orderCurrency,
//       customerID,
//       customerPhone,
//     );

//     //* Save payment details to the database
//     await Payment.create({
//       orderId,
//       paymentSessionId,
//       orderAmount,
//       orderCurrency,
//       paymentStatus: "Pending",
//       userId: req.user.userId,
//     });

//     console.log("process payment page hit sec times");
//     res.json({ paymentSessionId, orderId });
//   } catch (error) {
//     console.error("Error processing payment:", error.message);
//     res.status(500).json({ message: "Error processing payment" });
//   }
// };

// exports.updatePaymentStatus = async (req, res) => {
//   const orderId = req.params.orderId;

//   try {
//     const orderStatus = await getPaymentStatus(orderId);

//     // Update payment status in the database
//     const order = await Payment.update(
//       { paymentStatus: orderStatus },
//       { where: { orderId: orderId } },
//     );

//     console.log(order);

//     res.json({ orderStatus });
//   } catch (error) {
//     console.error("Error fetching payment status:", error.message);
//     res.status(500).json({ message: "Error fetching payment status" });
//   }
// };



const path = require("path");
const { createOrder, getPaymentStatus } = require("../services/cashfreeServices");
const Payment = require("../models/Payment");

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

exports.updatePaymentStatus = async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const orderStatus = await getPaymentStatus(orderId);

    // Update payment status in the database
    const order = await Payment.update(
      { paymentStatus: orderStatus },
      { where: { orderId: orderId } },
    );

    console.log(order);

    res.json({ orderStatus });
  } catch (error) {
    console.error("Error fetching payment status:", error.message);
    res.status(500).json({ message: "Error fetching payment status" });
  }
};
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-connection");

const Payment = sequelize.define("payment", {
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  paymentSessionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  orderAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  orderCurrency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
module.exports = Payment;

// (async () => {
//     await sequelize.sync({ force: true }); // Sync all models
// })();

// index.js file logic

// const users = require("../models/userModel");
// const expense = require("../models/expenseModel")
// const Payment = require("../models/Payment");
// const forgotpassword = require("../models/ForgotPassworModel");

// users.hasMany(expense, { foreignKey: "userId"});
// expense.belongsTo(users, { foreignKey:"userId"});

// users.hasMany(Payment);
// Payment.belongsTo(users);

// users.hasMany(forgotpassword, {
//     foreignKey: "userId",
//     onDelete: "CASCADE"
// });

// forgotpassword.belongsTo(users, {
//     foreignKey: "userId"
// });

// module.exports = { users, expense,Payment,forgotpassword };

const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-connection");

const expense = sequelize.define("expense", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allwNull: false,
    },
    amount: {
        type: DataTypes.INTEGER,
        allwNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allwNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allwNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = expense;
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-connection");

const content = sequelize.define("content", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    ContentKey: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = content;
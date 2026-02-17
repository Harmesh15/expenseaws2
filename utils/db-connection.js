const { Sequelize } = require("sequelize");

// let sequelize
// if (process.env.DB_URL) {
//   // Render / Production (Postgres)
//   sequelize = new Sequelize(process.env.DB_URL, {
//     dialect: "postgres",
//     protocol: "postgres",
//     logging: false, // optional, logs band
//   });
// } else {
// Local (Postgres)

let sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    // port: process.env.DB_PORT,
    dialect: "mysql",
  },
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("connection created completed");
  } catch (error) {
    console.log(error);
    console.log(JSON.stringify(error));
  }
})();

module.exports = sequelize;





// const sequelize = new Sequelize("expensetracker", "root", "harmesh15", {
//   host: "localhost",
//   dialect: "mysql",
//   post: "3606",
// });

// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("connection created completed");
//   } catch (error) {
//     console.log(error);
//     console.log(JSON.stringify(error));
//   }
// })();

// const Sequelize = require("sequelize");

// const sequelize = new Sequelize(
//   'expense_tracker',
//   'root',
//   'harmesh15',
//   {
//     host: 'localhost',
//     dialect: 'mysql'
//   }
// );


// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("connection completely");
//   } catch (error) {
//     console.log(error);
//   }
// })();

// module.exports = sequelize;


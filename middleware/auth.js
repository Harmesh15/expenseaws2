const jwt = require("jsonwebtoken");

const authorizationToken = async (req, res, next) => {
  console.log("Middleware hit");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // bearer

  if (!token) return res.status(401).json({ message: "Acces token missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ message: "Invalid or Expired token" });
    }

    console.log("middle do his work");
    req.user = user;
    next();
  });
};

module.exports = authorizationToken;

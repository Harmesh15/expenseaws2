// const users = require("../models/expensemodel");
// const bcrypt = require("bcrypt");


// const addUser = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         if (!name || !email || !password) {
//             return res.status(400).json({ message: "all field required" })
//         } 

//         const hashedPass = await bcrypt.hash(password,10);

//         const response = await users.create({
//             name: name,
//             email: email,
//             password:hashedPass
//         })

//         res.status(201).json(response)
//     } catch (error) {
//         console.log(error);
//         res.status(500).send(error.message);
//     }
// };


// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     const user = await users.findOne({
//       where: { email }
//     });

//     if (!user) {
//       return res.status(400).json({ message: "invalid user" });
//     }

//     const isMatched = await bcrypt.compare(password,user.password);

//       if(!isMatched){
//             return res.status(400).json({ message: "Wrong Password" });
//     }
//       return res.status(200).json({ message: "you login " });
    
//   }catch (error) {
//     console.log("LOGIN ERROR:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = {
//     addUser,
//     loginUser
// }
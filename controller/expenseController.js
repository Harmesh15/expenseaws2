const GeminiApi = require("@google/genai");
const Expense = require("../models/expenseModel");
const users = require("../models/userModel");
const content = require("../models/ContentUploded");
const sequelize = require("../utils/db-connection");
const S3services = require('../services/S3services');

const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@Expense@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
const suggestCategory = async (req, res) => {
  try {
    const { descriptionVal } = req.body;

    if (!descriptionVal || descriptionVal.trim() === '') {
      return res.status(400).json({ message: "Description is required" });
    }


    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Categorize this expense description into a single concise category name (e.g., Food, Travel, Shopping, Bills, Entertainment): "${descriptionVal}". Return only the category word.`
    });


    const suggestedCategory = response.text ? response.text.trim() : 'General';

    console.log(suggestedCategory, "ye hai output");

    return res.status(200).json({ category: suggestedCategory });
  } catch (err) {
    // return res.status(500).json({ message: "Failed to generate category", error: err.message });
    console.error("Server Error in suggestCategory:", err);
    return res.status(500).json({ message: "Internal server error", category: "General" });
  }
};




const addExpense = async (req, res) => {
  // const t = await sequelize.transaction();
  console.log("add controller hit");
  try {

    const { amount, category, description } = req.body
    console.log(amount, category, description, req.user.userId);

    const expense = await Expense.create({
      amount,
      category: category || 'General',
      description,
      userId: req.user.userId
    });

    console.log(expense);



    const user = await users.findByPk(req.user.userId);

    if (!user) {
      throw new Error("User not found");
    }

    await user.increment("totalExpense", {
      by: Number(amount)
    });

    getExpense();
    // await t.commit();
    res.status(201).json({ message: "Expense added" });

  } catch (err) {
    console.error("ADD EXPENSE ERROR:", err);
    res.status(500).json({
      message: "Expense not added",
      error: err.message
    });
  }

}




const getExpense = async (req, res) => {
  console.log("refresh par chala getExpense");
  try {
    const expense = await Expense.findAll({
      where: { userId: req.user.userId },
    });

    res.status(200).json(expense);
  } catch (error) {
    console.log(error.message);
  }
};

const deleteExpense = async (req, res) => {
  console.log("hii from delete controller");
  let t = await sequelize.transaction();
  try {
    const expenseId = req.params.id;
    const userId = req.user.userId;

    const decreaseExpAmount = await Expense.findOne({
      attributes: ["amount"],
      where: { id: expenseId },
      transaction: t,
    });

    await users.increment(
      { totalExpense: -decreaseExpAmount.amount },
      {
        where: { id: userId },
        transaction: t,
      },
    );

    // throw new Error("force rollback");

    const deleteExpense = await Expense.destroy({
      where: {
        id: expenseId,
        userId: req.user.userId,
      },
      transaction: t,
    });

    if (!deleteExpense) {
      return res.status(404).json({
        message: "Expense not found or unauthorized",
      });
    }

    await t.commit();
    res.status(200).json({ message: "Expense delete successfully" });
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Update Expense 

const updateTotalExpenseAmount = async (req, res, id) => {
  try {
    const expesneId = id;

    const response = await Expense.findOne({
      attributes: ["amount"],
      where: { id: expesneId },
    });

    const totalExpenseAmount = await users.findOne({
      attributes: ["totalExpense"],
      where: { id: req.user.userId },
    });

    console.log("Expense Value Updated");
  } catch (err) {
    console.log(err, "Update value totalExpense");
  }
};





const updateExpense = async (req, res) => {
  let t = await sequelize.transaction();
  try {
    const updateId = req.params.id;
    const { amount, category, description } = req.body;

    const updateVal = await Expense.findOne({
      where: {
        id: updateId,
        userId: req.user.userId,
      },
      transaction: t,
    });

    if (!updateVal) {
      return res.status(404).json({
        message: "Expense not found or not authorized",
      });
    }

    updateVal.amount = amount ?? updateVal.amount; // ?? isliye use kiya hai   if null / undefined → old value preserved
    updateVal.category = category ?? updateVal.category;
    updateVal.description = description ?? updateVal.description;

    await updateVal.save({ transaction: t });
    res.status(200).json({ message: "update successfully" });

    await t.commit();
  } catch (error) {
    await t.rollback();
    console.log(error.message);
    res.status(500).json({ message: "value not updated server error" });
  }
};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@_Premium_@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

const premiumUserFunction = async (req, res) => {
  console.log("show primum chala controller m");
  try {
    const response = await users.findAll({
      attributes: ["name", "totalExpense"],
      order: [["totalExpense", "DESC"]],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.original);
    res.status(500).json(error.message);
  }
};

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@_Report_@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

const getAllExpenseForReport = async (req, res) => {
  try {
    console.log("getallexpensereport controller hit");

    let limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page);

    const offset = (page - 1) * limit;

    const totalexpenses = await Expense.count({
      where: { userId: req.user.userId },
    });

    const expenses = await Expense.findAll({
      where: { userId: req.user.userId },
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });


    const totalpage = Math.ceil(totalexpenses / limit);

    res.status(200).json({
      expenses,
      pagination: {
        currentpage: page,
        totalpage: totalpage,
        hasnextpage: page < totalpage,
        haspreviouspage: page > 1,
        nextpage: page < totalpage ? page + 1 : null,
        previouspage: page > 1 ? page - 1 : null,
      },
    });
  } catch (error) {
    console.log(error.message);
  }
};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Download ,Create_S3Bucket @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

const downloadExpenses = async (req, res) => {
  try {

    console.log("Controller hit: download report");

    const expenses = await Expense.findAll({
      where: { userId: req.user.userId }
    });

    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ message: "No expenses found" });
    }

    const stringifiedExpense = JSON.stringify(expenses, null, 2);

    const fileName = `expenses/user-${req.user.userId}/${Date.now()}.json`;
    const fileUrl = await S3services.uploadToS3(
      stringifiedExpense,
      fileName,
      "application/json"
    );

    await content.create({
      ContentUrl: fileUrl,
      userId: req.user.userId
    });

    const contentReponse = await content.findAll({ where: { userId: req.user.userId } });
    res.status(200).json({ contentReponse });

  } catch (error) {
    console.error("Download Expense Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


module.exports = {
  addExpense,
  suggestCategory,
  deleteExpense,
  getExpense,
  updateExpense,
  premiumUserFunction,
  getAllExpenseForReport,
  downloadExpenses,
};

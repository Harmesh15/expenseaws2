let form = document.querySelector("form");
let amount = document.querySelector("#inputval");
let categoryInput = document.querySelector("#categoryId");
let description = document.querySelector("#descinput");
let button = document.querySelector("button");

const List = document.getElementById("list");
const showpremuiumbutton = document.querySelector(".showpremuiumbutton");
const buypremiumbtn = document.querySelector(".buyMembership");
const ListPremium = document.querySelector("#premiumUSerList");
const DownloadExpenses = document.querySelector("#DownloadExpenses");
const logoutBtn = document.getElementById("logoutBtn");

const limitSelect = document.getElementById("optionpage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");


const ContentList = document.getElementById("contentList")

let currentPage = 1;
let currentLimit = 5;
let timer;
description.addEventListener('input', () => {
  clearTimeout(timer);

  const descriptionVal = description.value.trim();
  if (descriptionVal.length < 3) return;

  timer = setTimeout(async () => {
    categoryInput.value = "Generating...";

    try {
      const res = await axios.post('/expense/suggest-category', { descriptionVal })
      console.log("res ki value", res);
      const data = res.data.category;
      console.log("category ki", data);
      categoryInput.value = data;
    } catch (err) {
      categoryInput.value = "General";
    }
  }, 1000);
});






form.addEventListener("submit", async function (event) {
  event.preventDefault();
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post("/expense/add",
      {
        amount: amount.value,
        category: categoryInput.value,
        description: description.value,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      },
    );
    console.log("Expense added");
    form.reset();
    getAllExpenses();
  } catch (error) {
    console.log("user not added");
    console.log(error.message);
  }
});













const getAllExpenses = async () => {
  try {
    const token = localStorage.getItem("token");
    const allExpense = await axios.get("/expense/getAll", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    const Data = allExpense.data;
    List.innerHTML = "";
    Data.forEach((item) => {
      let li = document.createElement("li");
      li.innerHTML = ` 
                   Rs ${item.amount}  (${item.category})  ${item.description},
                   <button id="btn" onclick="deleteExpense(${item.id})">DeleteExpense</button>
                `;
      List.appendChild(li);
    });
  } catch (error) {
    console.log(error.message);
  }
};


const deleteExpense = async (id) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`/expense/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    getAllExpenses();
    console.log("Expense deleted");
    showExpenseBylimit(currentPage);
  } catch (error) {
    alert("Something went wrong");
    console.log("Not Authorize to delete other's expenses");
    console.log(error);
  }
};

window.addEventListener("DOMContentLoaded", () => {

  showExpenseBylimit(currentPage);

});


// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ premium users @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


buypremiumbtn.addEventListener("click", () => {
  window.location.href = "payment.html";
});

showpremuiumbutton.addEventListener("click", async () => {
  try {
    console.log("show premium btn hit");
    const token = localStorage.getItem("token");
    const response = await axios.get("/expense/premiumUser",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log("users Displayed", response.data);
    const Data = response.data;
    console.log(Data);
    ListPremium.innerHTML = "";

    Data.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = ` ${item.name}   ${item.totalExpense}`;
      ListPremium.appendChild(li);
    });

    console.log("users Displayed");
  } catch (error) {
    console.log(error);
  }
}
);




//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ShowUserByLimit and Pagination @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@



limitSelect.addEventListener("change", function () {
  currentLimit = Number(this.value);
  currentPage = 1;
  showExpenseBylimit(currentPage);
});


async function showExpenseBylimit(page) {
  currentPage = page;
  const token = localStorage.getItem("token");

  try {
    const res = await axios.get(`/expense/all?page=${currentPage}&limit=${currentLimit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      },
    );

    if (page > res.data.pagination.totalpage && res.data.pagination.totalpage > 0) {
      currentPage = res.data.pagination.totalpage;
      return showExpenseBylimit(currentPage);
    }

    showExpenseReport(res.data.expenses)
    renderPagination(res.data.pagination);
  } catch (error) {
    console.log(error.message);
  }
}



function showExpenseReport(expenses) {
  List.innerHTML = "";

  expenses.forEach((item) => {
    const li = document.createElement("li");

    li.innerHTML = `
      Rs ${item.amount} (${item.category}) ${item.description}
      <button id="btn" onclick="deleteExpense(${item.id})">DeleteExpense</button>
    `;
    List.appendChild(li);
  });
}


function renderPagination(pagination) {
  pageInfo.innerText = "Page " + pagination.currentpage + " of " + pagination.totalpage;

  prevBtn.style.display = pagination.haspreviouspage ? "inline" : "none";
  nextBtn.style.display = pagination.hasnextpage ? "inline" : "none";

  if (pagination.haspreviouspage) {
    prevBtn.onclick = function () {
      showExpenseBylimit(pagination.previouspage);
    };
  }

  if (pagination.hasnextpage) {
    nextBtn.onclick = function () {
      showExpenseBylimit(pagination.nextpage);
    };
  }
}

// window.addEventListener("DOMContentLoaded", () => {
//   showExpenseBylimit(1);
// });


// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Download Report and Show URL @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


DownloadExpenses.addEventListener('click', async () => {
  console.log("DownloadReport fun hit in js 201")
  const token = localStorage.getItem("token");
  console.log(token);
  try {
    const response = await axios.get("/expense/download",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      },
    );

    const Data = response.data.contentReponse;
    console.log(Data);
    showContentUrl(Data);
    console.log(response.data);
  } catch (error) {
    console.log(error.message);
  }
})


function showContentUrl(Data) {
  try {
    premiumUSerList.innerHTML = "";
    Data.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${item.ContentUrl}" target="_blank">Download</a>`;
      premiumUSerList.appendChild(li);
    })
    console.log("successfull");
  } catch (err) {
    console.log(err);
  }
}



logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");

  alert("Logout successful");

  window.location.href = "../login/login.html";
});

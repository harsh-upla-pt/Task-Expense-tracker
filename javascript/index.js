const menuToggle = document.getElementById("menu-toggle");
const menuBackdrop = document.getElementById("menu-backdrop");
const leftSection = document.getElementById("left-section");

const closeMobileMenu = () => {
  leftSection.classList.remove("mobile-menu-open");
  leftSection.style.transform = "";
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
};

menuToggle.addEventListener("click", () => {
  const isOpen = leftSection.classList.toggle("mobile-menu-open");
  leftSection.style.transform = isOpen ? "translateX(0)" : "";
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation" : "Open navigation",
  );
});

menuBackdrop.addEventListener("click", closeMobileMenu);
document.querySelectorAll(".menu-link").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});
document.addEventListener("click", (event) => {
  if (
    !leftSection.contains(event.target) &&
    !menuToggle.contains(event.target)
  ) {
    closeMobileMenu();
  }
});

//Table map function

let rawLS = localStorage.getItem("transactions");
if (rawLS && rawLS !== "undefined") {
  let transLs = JSON.parse(rawLS);
  // console.log("okay");

  document.getElementsByTagName("tbody")[0].innerHTML = JSON.parse(rawLS)
    .map((item) => {
      return `
            <tr>
              <td id="${item.tId}">${item.tId}</td>
              <td>${item.title}</td>
              <td>${item.category}</td>
              <td>
              <div id="${item.type == "income" ? "income" : "expense"}" >
              ${item.type}
              </div>
              </td>
              <td>${item.amount}</td>
              <td>${item.date}</td>
              <td>
                <img
                  id="${item.tId}"
                  class="edit-svg"
                  width="24"
                  src="../assets/edit-svgrepo-com.svg"
                  alt="edit"
                />
                <img
                  id="${item.tId}"
                  class="delete-svg"
                  width="24"
                  src="../assets/red-delete.svg"
                  alt="delete"
                />
              </td>
            </tr>
        `;
    })
    .join(" ");
} else {
  console.log("not okay");
  console.log(rawLS);
  console.log(typeof rawLS);
  document.getElementsByTagName("tbody")[0].innerHTML =
    '<tr><td colspan="7">No transactions yet !</td></tr>';
}

// Income , expense and current value updation

const summaryUpdate = () => {
  let localTrans = JSON.parse(localStorage.getItem("transactions")) ?? [];

  let expenseTotal = localTrans.filter((item) => {
    return item.type == "expense";
  });
  let incomeTotal = localTrans.filter((item) => {
    return item.type == "income";
  });
  // console.log("expense total : ", expenseTotal);
  // console.log("income total : ", incomeTotal);

  //income array
  Array.from(document.getElementsByClassName("income-amount")).forEach(
    (div) => {
      let totalIncome = incomeTotal.reduce(
        (total, transaction) => total + Number(transaction.amount),
        0,
      );
      div.innerHTML = `₹ ${totalIncome}`;
      // console.log(totalIncome);
    },
  );
  //expense array
  Array.from(document.getElementsByClassName("expense-amount")).forEach(
    (div) => {
      let totalExpense = expenseTotal.reduce(
        (total, transaction) => total + Number(transaction.amount),
        0,
      );
      div.innerHTML = `₹ ${Number(totalExpense)}
    `;
      // console.log(totalExpense);
    },
  );
  // current array
  Array.from(document.getElementsByClassName("current-amount")).forEach(
    (div) => {
      let totalIncome = incomeTotal.reduce(
        (total, transaction) => total + Number(transaction.amount),
        0,
      );
      let totalExpense = expenseTotal.reduce(
        (total, transaction) => total + Number(transaction.amount),
        0,
      );
      div.innerHTML = `₹ ${Number(totalIncome) - Number(totalExpense)}`;
    },
  );
};

// Chart Upadte
const categoryColor = (category) =>
  ({
    housing: "#f03d3b",
    food: "#fe8217",
    utilities: "#1d9bf9",
    transportaion: "#8964df",
    other: "#7ad177",
  })[category];

const chartUpdate = () => {
  const localTrans = JSON.parse(localStorage.getItem("transactions")) ?? [];
  const categoryTotals = {
    housing: 0,
    food: 0,
    utilities: 0,
    transportaion: 0,
    other: 0,
  };

  localTrans
    .filter((item) => item.type === "expense")
    .forEach((transaction) => {
      const category = Object.hasOwn(categoryTotals, transaction.category)
        ? transaction.category
        : "other";
      categoryTotals[category] += Number(transaction.amount) || 0;
    });

  const totalExpense = Object.values(categoryTotals).reduce(
    (total, amount) => total + amount,
    0,
  );
  const categoryOrder = [
    "housing",
    "food",
    "utilities",
    "transportaion",
    "other",
  ];
  let currentStop = 0;
  const chartStops = categoryOrder.map((category) => {
    const percentage = totalExpense
      ? (categoryTotals[category] / totalExpense) * 100
      : 0;
    const nextStop = currentStop + percentage;
    const percentId =
      { utilities: "util", transportaion: "trans" }[category] ?? category;
    document.getElementById(`${percentId}-percent`).textContent =
      `${percentage.toFixed(1)}%`;
    const stop = `${categoryColor(category)} ${currentStop}% ${nextStop}%`;
    currentStop = nextStop;
    return stop;
  });

  document.querySelector(".pie-chart").style.background = totalExpense
    ? `conic-gradient(${chartStops.join(", ")})`
    : "#e5e7eb";
  document.querySelector("#hole-div div").textContent = `₹ ${totalExpense}`;
};

summaryUpdate();
chartUpdate();

// Edit form update

let editmode = new URLSearchParams(window.location.search).get("edit");
if (editmode) {
  let currID = new URLSearchParams(window.location.search).get("id");
  if (!currID) {
    alert("no current Id fetched from url");
  }

  document.getElementById("add-button").innerHTML = "Edit & Save";

  let transactionLS = JSON.parse(localStorage.getItem("transactions"));

  let currTrans = transactionLS.find((item) => {
    return item.tId == currID;
  });

  document.getElementById("title-input").value = currTrans.title;
  document.getElementById("amount-input").value = currTrans.amount;
  document.getElementById("select-type").value = currTrans.type;
  document.getElementById("select-category").value = currTrans.category;
  document.getElementById("date-input-form").value = currTrans.date;
}

// Add transaction Function

const validateTransaction = (transaction) => {
  const errors = {
    title: "",
    amount: "",
    type: "",
    category: "",
    date: "",
  };

  if (!transaction.title.trim()) {
    errors.title = "Title is required.";
  } else if (transaction.title.trim().length < 2) {
    errors.title = "Title must be at least 2 characters.";
  }

  if (!transaction.amount) {
    errors.amount = "Amount is required.";
  } else if (
    !Number.isFinite(Number(transaction.amount)) ||
    Number(transaction.amount) <= 0
  ) {
    errors.amount = "Amount must be greater than 0.";
  }

  if (!["income", "expense"].includes(transaction.type)) {
    errors.type = "Select income or expense.";
  }

  if (
    ![
      "education",
      "housing",
      "food",
      "utilities",
      "transportaion",
      "salary",
      "other",
    ].includes(transaction.category)
  ) {
    errors.category = "Select a category.";
  }

  if (!transaction.date) {
    errors.date = "Date is required.";
  } else if (Number.isNaN(new Date(transaction.date).getTime())) {
    errors.date = "Enter a valid date.";
  }

  return errors;
};

document.getElementById("add-button").addEventListener("click", (e) => {
  let transactionLS = JSON.parse(localStorage.getItem("transactions")) ?? [];

  const transactionValues = {
    title: document.getElementById("title-input").value,
    amount: document.getElementById("amount-input").value,
    type: document.getElementById("select-type").value,
    category: document.getElementById("select-category").value,
    date: document.getElementById("date-input-form").value,
  };
  const validationErrors = validateTransaction(transactionValues);
  const errorElements = {
    title: document.getElementById("title-error-div"),
    amount: document.getElementById("amount-error-div"),
    type: document.getElementById("type-error-div"),
    category: document.getElementById("select-error-div"),
    date: document.getElementById("date-error-div"),
  };

  Object.entries(errorElements).forEach(([field, element]) => {
    element.textContent = validationErrors[field];
  });

  if (Object.values(validationErrors).some((error) => error)) {
    document.getElementById("form-error-div").textContent =
      "Please correct the errors above.";
    return;
  }

  document.getElementById("form-error-div").textContent = "";

  let editmode = new URLSearchParams(window.location.search).get("edit");
  if (editmode) {
    let currID = new URLSearchParams(window.location.search).get("id");

    let currTrans = transactionLS.find((item) => {
      return item.tId == currID;
    });

    let editConirm = confirm("do you want to edit this transaction ?");

    if (!editConirm) {
      alert(" editing transaction canceled .");
      return;
    }

    let deletedObjLs = transactionLS.filter((item) => {
      return item.tId != currID;
    });
    console.log(currID);
    console.log(deletedObjLs);

    let setObj = [
      ...deletedObjLs,
      {
        tId: currID,
        title: document.getElementById("title-input").value,
        amount: document.getElementById("amount-input").value,
        type: document.getElementById("select-type").value,
        category: document.getElementById("select-category").value,
        date: document.getElementById("date-input-form").value,
      },
    ];

    localStorage.setItem("transactions", JSON.stringify(setObj));

    document.getElementById("title-input").value = "";
    document.getElementById("amount-input").value = "";
    document.getElementById("select-type").value = "";
    document.getElementById("select-category").value = "";
    document.getElementById("date-input-form").value = "";

    alert("transaction edited successfully .");
    window.location.href = "/html/index.html";
    return;
  }

  let randId = Math.floor(Math.random() * 1000000);

  if (
    transactionLS
      .map((item) => {
        return item.tId;
      })
      .includes(randId)
  ) {
    randId = Math.floor(Math.random() * 1000000);
  }

  let transObj = {
    tId: randId,
    ...transactionValues,
  };

  let setTransObj = [...transactionLS, transObj];

  let setTransaction = localStorage.setItem(
    "transactions",
    JSON.stringify(setTransObj),
  );

  document.getElementsByTagName("tbody")[0].innerHTML = JSON.parse(
    localStorage.getItem("transactions"),
  )
    .map((item) => {
      return `
            <tr>
              <td id="${item.tId}">${item.tId}</td>
              <td>${item.title}</td>
              <td>${item.category}</td>
              <td >
              <div id="${item.type == "income" ? "income" : "expense"}" >
              ${item.type}
              </div>
              </td>
              <td>${item.amount}</td>
              <td>${item.date}</td>
              <td>
                <img
                  id="${item.tId}"
                  class="edit-svg"
                  width="24"
                  src="../assets/edit-svgrepo-com.svg"
                  alt="edit"
                />
                <img
                  id="${item.tId}"
                  class="delete-svg"
                  width="24"
                  src="../assets/red-delete.svg"
                  alt="delete"
                />
              </td>
            </tr>
        `;
    })
    .join("");

  document.getElementById("title-input").value = "";
  document.getElementById("amount-input").value = "";
  document.getElementById("select-type").value = "";
  document.getElementById("select-category").value = "";
  document.getElementById("date-input-form").value = "";
  alert("transaction added.");

  summaryUpdate();
  chartUpdate();
});

// Delete and edit actions
document.getElementsByTagName("tbody")[0].addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-svg")) {
    let confirmed = confirm("Do you want to delete this transaction ?");
    if (!confirmed) {
      return;
    }
    let transLS = JSON.parse(localStorage.getItem("transactions")) ?? [];

    let removedTrans = transLS.filter((item) => {
      return item.tId != e.target.id;
    });

    let setLs = localStorage.setItem(
      "transactions",
      JSON.stringify(removedTrans),
    );

    document.getElementsByTagName("tbody")[0].innerHTML = removedTrans
      .map((item) => {
        return `
            <tr>
              <td id="${item.tId}">${item.tId}</td>
              <td>${item.title}</td>
              <td>${item.category}</td>
              <td >
              <div id="${item.type == "income" ? "income" : "expense"}" >
              ${item.type}
              </div>
              </td>
              <td>${item.amount}</td>
              <td>${item.date}</td>
              <td>
                <img
                  id="${item.tId}"
                  class="edit-svg"
                  width="24"
                  src="../assets/edit-svgrepo-com.svg"
                  alt="edit"
                />
                <img
                  id="${item.tId}"
                  class="delete-svg"
                  width="24"
                  src="../assets/red-delete.svg"
                  alt="delete"
                />
              </td>
            </tr>
        `;
      })
      .join(" ");
    summaryUpdate();
    chartUpdate();
    return;
  }

  if (e.target.classList.contains("edit-svg")) {
    window.location.href = `?edit=true&id=${e.target.id}`;
  }
});

// handle clear all

document
  .getElementById("clear-all-button-div")
  .addEventListener("click", (e) => {
    let clearAllConfirm = confirm(
      "Do you want to delete all transaction history ?",
    );

    if (clearAllConfirm) {
      localStorage.setItem("transactions", JSON.stringify([]));
      document.getElementsByTagName("tbody")[0].innerHTML =
        '<tr><td colspan="7">No transactions yet !</td></tr>';
    }

    alert("All transactions are cleared.");
    summaryUpdate();
    chartUpdate();
  });

/*  Sorting functionality */

//search by title
document.getElementById("search-transaction").addEventListener("input", (e) => {
  let localTrans = JSON.parse(localStorage.getItem("transactions"));

  if (e.target.value == "" || !e.target.value || e.target.value == " ") {
    document.getElementById("tbody").innerHTML = localTrans
      .map((item) => {
        return `
            <tr>
              <td id="${item.tId}">${item.tId}</td>
              <td>${item.title}</td>
              <td>${item.category}</td>
              <td>
              <div id="${item.type == "income" ? "income" : "expense"}" >
              ${item.type}
              </div>
              </td>
              <td>${item.amount}</td>
              <td>${item.date}</td>
              <td>
                <img
                  id="${item.tId}"
                  class="edit-svg"
                  width="24"
                  src="../assets/edit-svgrepo-com.svg"
                  alt="edit"
                />
                <img
                  id="${item.tId}"
                  class="delete-svg"
                  width="24"
                  src="../assets/red-delete.svg"
                  alt="delete"
                />
              </td>
            </tr>
        `;
      })
      .join(" ");
    return;
  }

  let suggestedTransactions = localTrans.filter((item) => {
    return item.title.includes(e.target.value);
  });

  document.getElementById("tbody").innerHTML = suggestedTransactions.map(
    (item) => {
      return `
            <tr>
              <td id="${item.tId}">${item.tId}</td>
              <td>${item.title}</td>
              <td>${item.category}</td>
              <td>
              <div id="${item.type == "income" ? "income" : "expense"}" >
              ${item.type}
              </div>
              </td>
              <td>${item.amount}</td>
              <td>${item.date}</td>
              <td>
                <img
                  id="${item.tId}"
                  class="edit-svg"
                  width="24"
                  src="../assets/edit-svgrepo-com.svg"
                  alt="edit"
                />
                <img
                  id="${item.tId}"
                  class="delete-svg"
                  width="24"
                  src="../assets/red-delete.svg"
                  alt="delete"
                />
              </td>
            </tr>
        `;
    },
  );
});

// type sorting

document.getElementById("filter-type").addEventListener("change", (e) => {
  let localTrans = JSON.parse(localStorage.getItem("transactions"));

  let sortedTrans = localTrans.filter((item) => {
    if (e.target.value == "all-types") {
      return;
    }
    return item.type == e.target.value;
  });

  document.getElementById("tbody").innerHTML = sortedTrans
    .map((item) => {
      return `
            <tr>
              <td id="${item.tId}">${item.tId}</td>
              <td>${item.title}</td>
              <td>${item.category}</td>
              <td>
              <div id="${item.type == "income" ? "income" : "expense"}" >
              ${item.type}
              </div>
              </td>
              <td>${item.amount}</td>
              <td>${item.date}</td>
              <td>
                <img
                  id="${item.tId}"
                  class="edit-svg"
                  width="24"
                  src="../assets/edit-svgrepo-com.svg"
                  alt="edit"
                />
                <img
                  id="${item.tId}"
                  class="delete-svg"
                  width="24"
                  src="../assets/red-delete.svg"
                  alt="delete"
                />
              </td>
            </tr>
        `;
    })
    .join(" ");
});

// category sorting

document.getElementById("filter-category").addEventListener("change", (e) => {
  let localTrans = JSON.parse(localStorage.getItem("transactions"));
  let sortedTrans = localTrans.filter((item) => {
    if (e.target.value == "all-category") {
      return item;
    }
    return item.category == e.target.value;
  });

  document.getElementById("tbody").innerHTML = sortedTrans
    .map((item) => {
      return `
            <tr>
              <td id="${item.tId}">${item.tId}</td>
              <td>${item.title}</td>
              <td>${item.category}</td>
              <td>
              <div id="${item.type == "income" ? "income" : "expense"}" >
              ${item.type}
              </div>
              </td>
              <td>${item.amount}</td>
              <td>${item.date}</td>
              <td>
                <img
                  id="${item.tId}"
                  class="edit-svg"
                  width="24"
                  src="../assets/edit-svgrepo-com.svg"
                  alt="edit"
                />
                <img
                  id="${item.tId}"
                  class="delete-svg"
                  width="24"
                  src="../assets/red-delete.svg"
                  alt="delete"
                />
              </td>
            </tr>
        `;
    })
    .join(" ");
});

// clear all filters

document.getElementById("clear-filter").addEventListener("click", (e) => {
  let localTrans = JSON.parse(localStorage.getItem("transactions"));

  document.getElementById("tbody").innerHTML = localTrans
    .map((item) => {
      return `
            <tr>
              <td id="${item.tId}">${item.tId}</td>
              <td>${item.title}</td>
              <td>${item.category}</td>
              <td>
              <div id="${item.type == "income" ? "income" : "expense"}" >
              ${item.type}
              </div>
              </td>
              <td>${item.amount}</td>
              <td>${item.date}</td>
              <td>
                <img
                  id="${item.tId}"
                  class="edit-svg"
                  width="24"
                  src="../assets/edit-svgrepo-com.svg"
                  alt="edit"
                />
                <img
                  id="${item.tId}"
                  class="delete-svg"
                  width="24"
                  src="../assets/red-delete.svg"
                  alt="delete"
                />
              </td>
            </tr>
        `;
    })
    .join(" ");
});

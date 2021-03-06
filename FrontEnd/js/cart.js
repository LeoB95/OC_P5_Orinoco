"use strict";

let boxSection = document.querySelector("#item__select");
let total = 0;
displayQuantity();

function displayQuantity() {
  if (sessionStorage.getItem("itemStorage") !== null) {
    let items = JSON.parse(sessionStorage.getItem("itemStorage"));
    total = 0;
    boxSection.insertAdjacentHTML(
      "afterbegin",
      `<h1>Panier</h1>
            <table>
                <thead>
                    <tr>
                        <th>Articles</th>
                        <th>Nom</th>
                        <th>Couleurs</th>
                        <th>Nombre<br>d'articles</th>
                        <th>Prix</th>
                    </tr>
                </thead>
                <tbody class="order__details">
                </tbody>
            </table>`
    );
    let html = "";
    items.forEach((product, index) => {
      total = total + product.price * product.quantity;
      html += `
      <div id="item__select"> <tr>
                        <td class="old"><img class="incart__image" src="${
                          product.imageUrl
                        }" alt="ours peluche"></td>
                        <td class="old">${product.name}</td>
                        <td class="old">${product.selectColors}</td>
                        <td class="old"  ><button class="decrease__item itemBtn ${index}"> - </button>
                        ${product.quantity}
                        <button class="increase__item itemBtn ${index}"> + </button></td>
                        <td class="old">${(
                          (product.price * product.quantity) /
                          100
                        )
                          .toFixed(2)
                          .replace(".", ",")}€</td>
                        <td><button class="delete__item ${index}><p>Supprimer</p></button></td>
                    </tr></div>`;
      document.querySelector(".order__details").innerHTML = html;
    });
    boxSection.insertAdjacentHTML(
      "beforeend",
      `<div class="total">
                <p class="cart-section total__cart"><b>Total: ${(total / 100)
                  .toFixed(2)
                  .replace(".", ",")}€</b></p>
                <button class="cancel__ordered">
                    <p>Annuler le panier</p>
                </button>
            </div>`
    );
    // Formulaire
    boxSection.insertAdjacentHTML(
      "beforeend",
      `<h2> Formulaire de commande</h2>
                <form class="contact__form" action="post" type="submit">
                    <div class="details__form">
                        <label for="firstname">PRENOM</label>
                        <input type="text" name="firstname" id="firstname" placeholder="Teddy" maxlength="25" pattern="[a-zA-ZÀ-ÿ]{2,}" required />
                    </div>
                    <div class="details__form">
                        <label for="name">NOM</label>
                        <input type="text" name="name" id="name" placeholder="Bear" maxlength="25" pattern="[a-zA-ZÀ-ÿ]{2,}" required />
                    </div>
                    <div class="details__form">
                        <label for="address">ADRESSE</label>
                        <input type="text" name="address" id="address" placeholder="1 rue des jouets" maxlength="50" required />
                    </div>
                    <div class="details__form">
                        <label for="city">VILLE</label>
                        <input type="text" name="city" id="city" placeholder="Orinoland" maxlength="50" pattern="[A-Za-z]{2,}" required />
                    </div>
                    <div class="details__form">
                        <label for="email">EMAIL</label>
                        <input type="email" name="email" id="email" placeholder="ours@orinoco.fr" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+[.][a-z]{2,4}" required />
                    </div>
                    <button class="validate orderBtn" id="submit"  >
                        <p>Valider votre commande</p>
                    </button>
                </form>`
    );

    const decreaseItem = document.querySelectorAll(".decrease__item");
    decreaseItem.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        removeOneItem(e, items);
      });
    });
    const increaseItem = document.querySelectorAll(".increase__item");
    increaseItem.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        addOneItem(e, items);
      });
    });
    const deleteItem = document.querySelectorAll(".delete__item");
    deleteItem.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        deleteItemSelect(e, items);
      });
    });
    const cancelOrdered = document.querySelector(".cancel__ordered");
    cancelOrdered.addEventListener("click", () => {
      cancelMyOrdered();
    });
    const form = document.querySelector(".contact__form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      sendform();
    });
  } else {
    boxSection.insertAdjacentHTML(
      "afterbegin",
      `<h2>Panier</h2>
            <p class="cart-section">
                Vous n'avez aucun article!<a href="../index.html"><b>Revenir à la page d'accueil</b></a>
            </p>`
    );
  }
}

function addOneItem(e, items) {
  let index = e.target.classList[1].slice(-1);
  items[index].quantity++;
  sessionStorage.setItem("itemStorage", JSON.stringify(items));
  updateNumberArticles();
}

function removeOneItem(e, items) {
  let index = e.target.classList[1].slice(-1);
  items[index].quantity--;

  if (items[index].quantity <= 0) {
    items.splice(index, 1);

    if (items.length === 0) {
      sessionStorage.removeItem("itemStorage");
    } else {
      sessionStorage.setItem("itemStorage", JSON.stringify(items));
    }
  } else {
    sessionStorage.setItem("itemStorage", JSON.stringify(items));
  }

  updateNumberArticles();
}

function deleteItemSelect(e, items) {
  let index = e.target.classList[1].slice(-1);
  items.splice(index, 1);
  sessionStorage.setItem("itemStorage", JSON.stringify(items));

  if (items.length === 0) {
    sessionStorage.removeItem("itemStorage");
  }

  updateNumberArticles();
}

function cancelMyOrdered() {
  sessionStorage.removeItem("itemStorage");
  updateNumberArticles();
}

function updateNumberArticles() {
  boxSection.innerHTML = "";
  displayQuantity();
  itemConfirmation();
}

function sendform() {
  let contact = {
    firstName: document.getElementById("firstname").value,
    lastName: document.getElementById("name").value,
    address: document.getElementById("address").value,
    city: document.getElementById("city").value,
    email: document.getElementById("email").value,
  };
  let products = [];

  if (sessionStorage.getItem("itemStorage") !== null) {
    let productTab = JSON.parse(sessionStorage.getItem("itemStorage"));
    productTab.forEach((p) => {
      products.push(p._id);
    });
  }

  let contactItems = JSON.stringify({
    contact,
    products,
  });
  postOrder(contactItems);
}

function postOrder(contactItems) {
  fetch("http://localhost:3000/api/teddies/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: contactItems,
  })
    .then((response) => {
      return response.json();
    })
    .then((r) => {
      sessionStorage.setItem("contact", JSON.stringify(r.contact));
      sessionStorage.setItem("orderId", JSON.stringify(r.orderId));
      sessionStorage.setItem("total", JSON.stringify(total));
      sessionStorage.removeItem("itemStorage");
      window.location.replace("../html/confirmation.html");
    })
    .catch((e) => {
      displayError();
      console.log(e);
    });
}

require("dotenv").config();
const express = require("express");
const app = express();
const productsList = require("./database/product");
const PORT = process.env.PORT || 3000;

// Налаштування для читання даних з форм
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Вказуємо папку зі статичними файлами (CSS, картинки)
app.use(express.static(__dirname + "/public"));

// Налаштовуємо EJS як шаблонізатор
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

const cart = [];
app.locals.cart = cart; //is for all files ejs

// Головна сторінка
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/catalog", (req, res) => {
  res.render("catalog.ejs", { items: productsList });
});

app.get("/product/:id", (req, res) => {
  // 1. Отримуємо ID товару з посилання
  const requestedId = req.params.id;

  // 2. Шукаємо цей товар у нашій базі даних
  const foundProduct = productsList.find((item) => item.id === requestedId);

  // 3. Якщо товар знайдено - показуємо його сторінку
  if (foundProduct) {
    res.render("product.ejs", { product: foundProduct, cart });
  } else {
    // Якщо такого ID не існує (наприклад, хтось ввів /product/123)
    res
      .status(404)
      .send(
        "<h1>Товар не знайдено 😢</h1><a href='/catalog'>Повернутися в каталог</a>",
      );
  }
});

app.post("/add_to_cart", (req, res) => {
  const productId = req.body.productId;
  // Перевіряємо, чи є вже товар із таким ID у кошику
  const isAlreadyInCart = cart.some((item) => item.id === productId);

  // Якщо товару ще немає в кошику, шукаємо його в базі і додаємо
  if (!isAlreadyInCart) {
    const product = productsList.find((item) => item.id === productId);
    if (product) {
      cart.push(product); // Додаємо товар як є, без quantity
    }
  }

  // Після додавання повертаємо користувача назад у каталог (або на попередню сторінку)
  res.redirect("/catalog");
});

// POST-запит для видалення товару з кошика
app.post("/remove-from-cart", (req, res) => {
  const productId = req.body.productId;

  // Знаходимо індекс ПЕРШОГО товару з таким ID у кошику
  const index = cart.findIndex((item) => item.id === productId);

  // Якщо товар знайдено (індекс не -1), видаляємо рівно 1 елемент
  if (index !== -1) {
    cart.splice(index, 1);
  }

  // Оновлюємо сторінку кошика
  res.redirect("/cart");
});

app.get("/cart", (req, res) => {
  let totalSum = 0;
  cart.forEach((product) => {
    totalSum += product.price;
  });
  res.render("cart.ejs", { cartItems: cart, totalSum: totalSum });
});

app.post("/clear_cart", (req, res) => {
  cart.length = 0;
  res.redirect("/cart");
});

app.get("/checkout", (req, res) => {
  //if cart is empty sent client to cart
  if (cart.length == 0) {
    return res.redirect("/cart");
  }
  let totalSum = 0;
  cart.forEach((item) => (totalSum += Number(item.price)));

  // Віддаємо сторінку checkout.ejs і передаємо туди кошик та суму
  res.render("checkout.ejs", { cartItems: cart, totalSum: totalSum });
});

app.listen(PORT, () => {
  console.log(`Сервер KlyovPlace запущено на http://localhost:${PORT}`);
});

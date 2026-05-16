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
    res.render("product.ejs", { product: foundProduct });
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
  // Знаходимо весь об'єкт товару в базі
  const product = productsList.find((item) => item.id === productId);

  // Якщо товар знайдено, кладемо його в кошик
  if (product) {
    cart.push(product);
  }

  // Після додавання повертаємо користувача назад у каталог (або на попередню сторінку)
  res.redirect("/catalog");
});
app.get("/cart", (req, res) => {
  let totalSum = 0;
  cart.forEach((product) => {
    totalSum += product.price;
    res.render("cart.ejs", { cartItems: cart, totalSum: totalSum });
  });
});
app.listen(PORT, () => {
  console.log(`Сервер KlyovPlace запущено на http://localhost:${PORT}`);
});

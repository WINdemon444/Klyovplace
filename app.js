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

// Головна сторінка
app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/catalog", (req, res) => {
  res.render("catalog.ejs", { items: productsList });
});
app.listen(PORT, () => {
  console.log(`Сервер KlyovPlace запущено на http://localhost:${PORT}`);
});

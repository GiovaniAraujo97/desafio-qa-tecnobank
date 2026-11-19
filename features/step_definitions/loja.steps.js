const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("chai");
const HomePage = require("../../pages/home-page");

const PASSWORD = "QaTest!12345";

function createUniqueUser() {
  return {
    username: `qa_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    password: PASSWORD,
  };
}

Given("que acesso a loja Demoblaze", async function () {
  this.homePage = new HomePage(this.driver);
  await this.homePage.open();
});

When("cadastro uma conta com dados válidos", async function () {
  this.user = createUniqueUser();
  this.signupMessage = await this.homePage.register(
    this.user.username,
    this.user.password,
  );
});

Then("recebo a confirmação de cadastro bem-sucedido", function () {
  expect(this.signupMessage).to.equal("Sign up successful.");
});

Given("já existe uma conta com os dados de teste", async function () {
  this.user = createUniqueUser();
  this.signupMessage = await this.homePage.register(
    this.user.username,
    this.user.password,
  );
  expect(this.signupMessage).to.equal("Sign up successful.");
});

When("tento cadastrar novamente os mesmos dados", async function () {
  this.signupMessage = await this.homePage.register(
    this.user.username,
    this.user.password,
  );
});

Then("recebo a mensagem de usuário já existente", function () {
  expect(this.signupMessage).to.equal("This user already exist.");
});

When("adiciono um celular, um monitor e um computador ao carrinho", async function () {
  this.products = {
    celular: "Samsung galaxy s6",
    monitor: "Apple monitor 24",
    computador: "Sony vaio i5",
  };

  await this.homePage.addProductToCart("celular", this.products.celular);
  await this.homePage.addProductToCart("monitor", this.products.monitor);
  await this.homePage.addProductToCart("computador", this.products.computador);
  await this.homePage.openCart();
});

When("removo o monitor do carrinho", async function () {
  await this.homePage.removeProduct(this.products.monitor);
});

When("atualizo a página do carrinho", async function () {
  await this.homePage.refreshCart();
});

Then("o monitor não está presente no carrinho", async function () {
  const cartItems = await this.homePage.getCartItems();
  expect(cartItems).not.to.include(this.products.monitor);
});

Then("permanecem no carrinho o celular e o computador", async function () {
  const cartItems = await this.homePage.getCartItems();
  expect(cartItems).to.have.members([
    this.products.celular,
    this.products.computador,
  ]);
});

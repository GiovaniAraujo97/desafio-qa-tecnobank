const { By, error, until } = require("selenium-webdriver");

class HomePage {
  constructor(driver) {
    this.driver = driver;
    this.timeout = 15000;
  }

  async open() {
    await this.driver.get("https://www.demoblaze.com");
    await this.driver.wait(until.elementLocated(By.id("nava")), this.timeout);
  }

  async fillSignupInput(locator, value, fieldName) {
    await this.driver.wait(async () => {
      const input = await this.driver.findElement(locator);
      return (await input.isDisplayed()) && (await input.isEnabled());
    }, this.timeout, `${fieldName} não ficou disponível no formulário`);

    const input = await this.driver.findElement(locator);
    await input.click();
    await input.clear();
    await input.sendKeys(value);
    await this.driver.wait(
      async () => (await this.driver.findElement(locator).getAttribute("value")) === value,
      this.timeout,
      `O campo ${fieldName} não reteve o valor informado`,
    );
  }

  async register(username, password) {
    const modal = await this.driver.findElement(By.id("signInModal"));
    if (!(await modal.isDisplayed())) {
      await this.driver.wait(until.elementIsVisible(
        await this.driver.findElement(By.id("signin2")),
      ), this.timeout);

      try {
        await this.driver.findElement(By.id("signin2")).click();
      } catch (exception) {
        if (!(exception instanceof error.ElementNotInteractableError)) {
          throw exception;
        }
        await this.driver.executeScript(
          "document.getElementById('signin2')?.click();",
        );
      }

      await this.driver.wait(async () => {
        try {
          return await modal.isDisplayed();
        } catch (exception) {
          if (exception instanceof error.StaleElementReferenceError) {
            const currentModal = await this.driver.findElement(By.id("signInModal"));
            return await currentModal.isDisplayed();
          }
          throw exception;
        }
      }, this.timeout, "Modal de cadastro não ficou visível");
    }

    await this.driver.wait(async () => {
      const opacity = Number(await modal.getCssValue("opacity"));
      return (await modal.isDisplayed()) && opacity >= 0.99;
    }, this.timeout, "A animação do modal de cadastro não terminou");

    await this.fillSignupInput(By.id("sign-username"), username, "usuário");
    await this.fillSignupInput(By.id("sign-password"), password, "senha");

    const formValues = await this.driver.executeScript(() => ({
      username: document.getElementById("sign-username")?.value,
      password: document.getElementById("sign-password")?.value,
    }));
    if (formValues.username !== username || formValues.password !== password) {
      throw new Error("Os campos de cadastro não estão preenchidos corretamente; envio cancelado.");
    }

    await modal.findElement(By.css("button.btn-primary")).click();

    const alert = await this.driver.wait(until.alertIsPresent(), this.timeout);
    const message = await alert.getText();
    await alert.accept();
    if (message === "Sign up successful.") {
      await this.driver.wait(until.elementIsNotVisible(modal), this.timeout);
      await this.driver.executeScript(() => {
        document.querySelector(".modal-backdrop")?.remove();
        document.body.classList.remove("modal-open");
      });
      await this.driver.sleep(300);
    }
    return message;
  }

  async addProductToCart(category, productName) {
    const categories = {
      celular: "Phones",
      monitor: "Monitors",
      computador: "Laptops",
    };

    const siteCategory = categories[category];
    if (!siteCategory) {
      throw new Error(`Categoria de produto não suportada: ${category}`);
    }

    await this.driver.findElement(
      By.xpath(`//a[contains(@class, "list-group-item") and normalize-space()="${siteCategory}"]`),
    ).click();

    const productLink = By.xpath(
      `//a[contains(@class, "hrefch") and normalize-space()="${productName}"]`,
    );
    await this.driver.wait(async () => {
      const links = await this.driver.findElements(productLink);
      if (links.length === 0) {
        return false;
      }

      try {
        await links[0].click();
        return true;
      } catch (exception) {
        if (exception instanceof error.StaleElementReferenceError) {
          return false;
        }
        throw exception;
      }
    }, this.timeout, `Produto não encontrado: ${productName}`);
    await this.driver.wait(
      until.elementLocated(By.xpath("//a[normalize-space()=\"Add to cart\"]")),
      this.timeout,
    );
    await this.driver.findElement(By.xpath("//a[normalize-space()=\"Add to cart\"]")).click();

    const alert = await this.driver.wait(until.alertIsPresent(), this.timeout);
    const message = await alert.getText();
    await alert.accept();
    if (message !== "Product added") {
      throw new Error(`Não foi possível adicionar ${productName}: ${message}`);
    }

    await this.open();
  }

  async openCart() {
    await this.driver.findElement(By.id("cartur")).click();
    await this.waitForCartCount(3);
  }

  async getCartItems() {
    const rows = await this.driver.findElements(By.css("#tbodyid tr"));
    return Promise.all(
      rows.map(async (row) => {
        const name = await row.findElement(By.css("td:nth-child(2)")).getText();
        return name.trim();
      }),
    );
  }

  async removeProduct(productName) {
    const row = await this.driver.wait(async () => {
      const rows = await this.driver.findElements(By.css("#tbodyid tr"));
      for (const currentRow of rows) {
        try {
          const name = await currentRow.findElement(By.css("td:nth-child(2)")).getText();
          if (name.trim() === productName) {
            return currentRow;
          }
        } catch (exception) {
          if (!(exception instanceof error.StaleElementReferenceError)) {
            throw exception;
          }
        }
      }
      return false;
    }, this.timeout, `Produto não encontrado no carrinho: ${productName}`);

    await row.findElement(By.xpath(".//a[normalize-space()='Delete']")).click();
    await this.waitForCartCount(2);
  }

  async refreshCart() {
    await this.driver.navigate().refresh();
    await this.waitForCartCount(2);
  }

  async waitForCartCount(expectedCount) {
    await this.driver.wait(async () => {
      const rows = await this.driver.findElements(By.css("#tbodyid tr"));
      return rows.length === expectedCount;
    }, this.timeout, `Esperava ${expectedCount} produto(s) no carrinho`);
  }
}

module.exports = HomePage;

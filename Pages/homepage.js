const BasePage = require('./BasePage');

class HomePage extends BasePage {
    constructor(page) {
        super(page);
        this.searchBar = 'input.desktop-searchBar'; // Myntra specific locator
        this.searchButton = 'a.desktop-submit';
    }

    //Main Page URL
    async navigateToHomePage() {
        await this.page.goto('https://www.myntra.com/');
        await this.page.getByText('Profile').hover();
        await this.page.getByRole('link', { name: 'login / Signup' }).click();
        await this.page.waitForTimeout(2000);
        await this.page.locator('input[type="tel"]').fill('6380319982');
        await this.page.getByRole('checkbox').check();
        await this.page.getByText('CONTINUE').click();
        await this.page.pause();
    }

    //Search Bar Function
    async searchForProduct(productName) {
        await this.typeText(this.searchBar, productName);
        await this.clickElement(this.searchButton);
    }

    //
    async scrollToOffersSection() {
        console.log("Scrolling down to find offers...");
        await this.page.mouse.wheel(0, 800); // Scroll down by 800 pixels
        await this.page.waitForTimeout(2000); // Wait for 2 seconds to ensure content loads
    }
}
module.exports = HomePage;
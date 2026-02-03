class BasePage {
    constructor(page) {
        this.page = page;
    }

    /**
     * Common method to navigate to a URL
     * @param {string} path 
     */
    async navigate(path) {
        await this.page.goto(path);
    }

    /**
     * Common method to click an element
     * @param {string} selector 
     */
    async clickElement(selector) {
        await this.page.click(selector);
    }

    /**
     * Common method to type text into an input field
     * @param {string} selector 
     * @param {string} text 
     */
    async typeText(selector, text) {
        await this.page.fill(selector, text);
    }

    /**
     * Common method to get text from an element
     * @param {string} selector 
     * @returns {Promise<string>}
     */
    async getText(selector) {
        return await this.page.locator(selector).innerText();
    }
}

module.exports = BasePage;
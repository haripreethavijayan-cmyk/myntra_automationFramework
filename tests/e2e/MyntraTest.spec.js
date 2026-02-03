const { test, expect } = require('@playwright/test');
const HomePage = require('../../Pages/homepage');

test.describe('Myntra Shopping Flow', () => {
    let homePage;

    // --- HOOK: Setup before every test ---
    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        console.log('Navigating to Home Page...');
        await homePage.navigateToHomePage();
    });

    // --- HOOK: Cleanup after every test ---
    test.afterEach(async ({ page }) => {
        await page.context().clearCookies();
    });

    // --- TEST 1 ---
    test('User should be able to search for products', async ({ page }) => {
        await homePage.searchForProduct('Running Shoes');
        await expect(page).toHaveURL(/myntra/);
    });

    // --- TEST 2 ---
    test('Adding the product to bag', async ({ page }) => {

       // 1. Search and Select Product
        await homePage.searchForProduct('DOCTOR EXTRA SOFT Men Mesh');
        await page.waitForSelector('.results-base');

        const page1Promise = page.waitForEvent('popup');
        await page.getByRole('link', { name: 'DOCTOR EXTRA SOFT Men Mesh' }).first().click();
        
        const page1 = await page1Promise;
        await page1.waitForLoadState();

        // 2. Add to Bag
        await page1.getByRole('button', { name: '8' }).click();
        await page1.getByText('ADD TO BAG').click();
        await page1.getByText('Bag', { exact: true }).click();

        // 3. Enter Pin Code (if needed)
        if (await page1.getByText('ENTER PIN CODE').isVisible()) {
            await page1.getByText('ENTER PIN CODE').click();
             await page1.waitForTimeout(2000);
            await page1.getByRole('textbox', { name: 'Enter Pincode' }).fill('641037');
             await page1.waitForTimeout(2000);
            await page1.getByText('CHECK', { exact: true }).click();
        }

        // Wait for price update
        await page1.waitForTimeout(3000);

        // Extract price details
        const getPrice = async (label) => {
            // Step 1: Try finding the row using the standard class
            let row = page1.locator('.priceDetail-base-row').filter({ hasText: label });
            
            // Step 2: If not found, try the "Total" specific class
            if (await row.count() === 0) {
                row = page1.locator('.priceDetail-total-row').filter({ hasText: label });
            }

            // Step 3: Check if row exists now
            if (await row.count() === 0) {
                console.log(`Warning: Label "${label}" not found.`);
                return 0;
            }

            // Step 4: Find the value inside the row (using wildcard to match both 'base-value' and 'total-value')
            const valueLocator = row.locator('[class*="priceDetail"][class*="value"]'); 
            
            const text = await valueLocator.first().textContent(); 
            return parseFloat(text.replace(/[^0-9.]/g, ''));
        };

        // 4. Extract Values
        const totalMRP = await getPrice('Total MRP'); 
        const discount = await getPrice('Discount on MRP'); 
        //await page1.pause();
        let platformFee = 0;
        try {
            platformFee = await getPrice('Platform Fee');
        } catch (e) {
            console.log("No Platform Fee found");
        }

        // const totalAmount = await getPrice('Total MRP ₹');

        const totalAmount = await page1.locator("#priceBlock > div.priceDetail-base-total"). innerText().then(text => {
            return parseFloat(text.replace(/[^0-9.]/g, ''));
        });

        console.log(`Extracted: MRP=${totalMRP}, Discount=${discount}, Fee=${platformFee}, Total=${totalAmount}`);
        //await page1.pause();
        // 5. Calculate and Assert
        const calculatedTotal = totalMRP - discount + platformFee;
        console.log(`Calculated Total: ${calculatedTotal}`);
        // Assert
        expect(calculatedTotal).toBe(totalAmount);    });

    // --- TEST 3 ---
    test('Purchase a product via the Offers or Scroll feeds on the homepage', async ({ page }) => {
        // 1. Scroll to Offers Section
        await homePage.scrollToOffersSection();
        await page.waitForTimeout(2000); // Wait for offers to load
        await page.locator('div:nth-child(8) > div > div > div > div > div:nth-child(4) > .container-base > div > .container-container > .row-base > .column-base > a > .img-responsive > .image-image').click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Timex His & Her Analogue Couple Watch Gift Set TW00ZP002 Timex His & Her' }).click();
  const page1 = await page1Promise;
  await page1.getByRole('link', { name: 'Green' }).click();
  await page1.getByText('ADD TO BAG').click();
  await page1.getByRole('link', { name: 'GO TO BAG' }).click();

  await page1.waitForTimeout(3000);

        // Extract price details
        const getPrice = async (label) => {
            // Step 1: Try finding the row using the standard class
            let row = page1.locator('.priceDetail-base-row').filter({ hasText: label });
            
            // Step 2: If not found, try the "Total" specific class
            if (await row.count() === 0) {
                row = page1.locator('.priceDetail-total-row').filter({ hasText: label });
            }

            // Step 3: Check if row exists now
            if (await row.count() === 0) {
                console.log(`Warning: Label "${label}" not found.`);
                return 0;
            }

            // Step 4: Find the value inside the row (using wildcard to match both 'base-value' and 'total-value')
            const valueLocator = row.locator('[class*="priceDetail"][class*="value"]'); 
            
            const text = await valueLocator.first().textContent(); 
            return parseFloat(text.replace(/[^0-9.]/g, ''));
        };

        // 4. Extract Values
        const totalMRP = await getPrice('Total MRP'); 
        const discount = await getPrice('Discount on MRP'); 
        //await page1.pause();
        let platformFee = 0;
        try {
            platformFee = await getPrice('Platform Fee');
        } catch (e) {
            console.log("No Platform Fee found");
        }

        // const totalAmount = await getPrice('Total MRP ₹');

        const totalAmount = await page1.locator("#priceBlock > div.priceDetail-base-total"). innerText().then(text => {
            return parseFloat(text.replace(/[^0-9.]/g, ''));
        });

        console.log(`Extracted: MRP=${totalMRP}, Discount=${discount}, Fee=${platformFee}, Total=${totalAmount}`);
        //await page1.pause();
        // 5. Calculate and Assert
        const calculatedTotal = totalMRP - discount + platformFee;
        console.log(`Calculated Total: ${calculatedTotal}`);
        // Assert
        expect(calculatedTotal).toBe(totalAmount);  
    });   

    test('Adding product to wishlist and moving it to bag', async ({ page }) => {
        {
        // 1. Search and Select Product
        await homePage.searchForProduct('Kids Shoes');
        await page.waitForSelector('.results-base');

        const page1Promise = page.waitForEvent('popup');
        await page.getByRole('link', { name: 'PUMA Unisex-Child Caracal V2 IDP Sneakers' }).first().click();
        const page1 = await page1Promise;
        await page1.waitForLoadState();

        }

    });
});


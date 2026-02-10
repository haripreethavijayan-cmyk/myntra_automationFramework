const { test, expect } = require('@playwright/test');
const HomePage = require('../../Pages/homepage');
const { AwardIcon } = require('lucide-react');

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
    
    //  ----- TEST 4 ----- 

    test('Adding product to wishlist and moving it to bag', async ({ page }) => {
        {
        // 1. Search and Select Product
        await homePage.searchForProduct('32626246');
        await page.waitForTimeout(5000); // Wait for search results to load
        await page.getByRole('button', { name: '-1.5Y Rs. 298' }).click();
        await page.getByText('ADD TO BAG').click();
        await page.getByText('Bag', { exact: true }).click();
        await page.getByRole('button', { name: 'MOVE TO WISHLIST' }).click();
        await page.getByRole('dialog').getByRole('button', { name: 'MOVE TO WISHLIST' }).click();
        await page.getByRole('link').first().click();
        await page.locator('span').filter({ hasText: 'Wishlist' }).click();
        await page.locator('//*[@id="item0"]/div[2]/div[2]/span/a').click();
        await page.locator('//*[@id="item0"]/div[2]/div/div/div[3]/button[1]').click();
        await page.locator('//*[@id="item0"]/div[2]/div/div/div[5]').click();
        await page.locator('//*[@id="desktop-header-cnt"]/div[2]/div[2]/a[2]/span[3]').click();
        await page.waitForTimeout(2000);
        }
   });

   //  ----- TEST 5 -----

   test ('Increasing the quantity and size of the product in the bag', async ({page}) => {
    // 1. Search and Select Product 
    await homePage.searchForProduct('Boy shoes')
    await homePage.scrollToOffersSection();
    await page.waitForSelector('.results-base');

    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'AVANT Kids Colourblocked Tan' }).click();
    const page1 = await page1Promise;
    await page1.getByRole('button', { name: '-6Y' }).click();
  await page1.getByText('ADD TO BAG').click();
  await page1.getByRole('link', { name: 'GO TO BAG' }).click();
  // Quantity Increase
  await page1.getByText('Qty:').click();
  await page1.getByText('3', { exact: true }).click();
  await page1.locator('//*[@id="cartItemsList"]/div/div/div/div[2]/div[4]/div/button/div').click();
  //Size chnage
  await page1.getByText('Size: 5.5-6Y').click();
  await page1.getByText('-9Y').click();
  await page1.getByRole('button', { name: 'DONE' }).click();
});

 //  ----- TEST 6 -----

 test ('Removing the product from the bag', async ({page}) => {
    // 1. Search and Select Product 
    await homePage.searchForProduct('Decor')
    await homePage.scrollToOffersSection();
    await page.getByRole('link', { name: 'Chumbak Green & Yellow Photo' }).click();
    const page1Promise = page.waitForEvent('popup');
    const page1 = await page1Promise;
    await page1.getByText('ADD TO BAG').click();
    await page1.getByRole('link', { name: 'GO TO BAG' }).click();
    await page1.getByRole('button', { name: 'REMOVE' }).click();
    await page1.getByRole('dialog').getByRole('button', { name: 'REMOVE' }).click();
 });

 // ----- TEST 7 -----

 test('Applying a coupon code and verifying the discount', async ({page}) => {
    // 1. Search and Select Product
    await homePage.searchForProduct('32758019')
    await homePage.scrollToOffersSection();
    await page.getByRole('textbox', { name: 'Search for products, brands' }).press('Enter');
    await page.getByText('ADD TO BAG').click();
    await page.getByText('Bag', { exact: true }).click();
    await page.getByRole('button', { name: 'APPLY' }).click();
    await page.locator('#applyCoupon').click();
 })

 // ----- TEST 8 -----

 test('Using Credit Card discount and verifying the final price', async ({page}) => {
    // 1. Search and Select Product
    await homePage.searchForProduct('37796337')
    await page.locator('//*[@id="mountRoot"]/div/div[1]/main/div[2]/div[2]/div[2]/div[2]/div/div[1]').click()
    await page.locator('//*[@id="desktop-header-cnt"]/div[2]/div[2]/a[2]/span[1]').click();
    await page.getByText('Show More').click();
    await page.mouse.wheel(0, 800);
    await page.getByRole('button', {name: 'PLACE ORDER'}).click();
    await expect(page.getByText('326, Newchitrambalam Layout, Ponni Nagar,  P.N Palayam', 'Coimbatore, Tamil Nadu 641037')).toBeVisible();
    await page.locator('#placeOrderButton').click();
    await page.getByText('Credit/Debit Card').click();
    await page.getByText('Show More').click();
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(2000);
 });

 // ----- TEST 9 -----

    test('Creating gift card' , async ({page}) => {
        await page.locator('span').nth(4).hover();
        await page.locator('#desktop-header-cnt').getByRole('link', { name: 'Gift Cards' }).click();
        await page.getByRole('button', { name: 'Send Gift Card' }).click();
        await page.getByTestId('message').fill('Happy Married Life with lots of love and joy');
        await page.getByRole('button', { name: 'NEXT' }).click();
        await page.getByText('amount-amountInfo amount-hide').click();
        await page.getByTestId('mobileNumber').fill('0000000000');
        await page.getByTestId('email').fill('test@example.com');
        await page.getByTestId('to').fill('Test User');
        await page.getByRole('button', {name: 'Show Preview'}).click();
        await page.locator('.preview-proceed').click();
        await waitForTimeout(2000);

    });

});


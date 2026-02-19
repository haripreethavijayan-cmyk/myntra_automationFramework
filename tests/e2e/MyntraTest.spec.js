const { test, expect } = require('@playwright/test');
const HomePage = require('../../Pages/homepage');


test.describe('Myntra Shopping Flow', () => {
    let sharedPage;
    let homePage;

    // --- HOOK: Setup before every test ---
   test.beforeAll(async ({ browser }) => {
        console.log("--- Starting Global Setup ---");
        const context = await browser.newContext();
        sharedPage = await context.newPage(); // Open one page for all tests
        homePage = new HomePage(sharedPage);
        await homePage.navigateToHomePage();
        console.log("--- Login/Setup Complete ---");
    });

    // --- HOOK: Cleanup after every test ---
    test.afterAll(async () => {
        console.log("--- Closing Browser ---");
        await sharedPage.close();
    });

    // --- TEST 1 ---
    test('Searching Product', async ({ page }) => {
        await homePage.searchForProduct('34692938');
        console.log("Searching through search bar");
        await sharedPage.locator('#desktop-header-cnt').getByRole('link').filter({ hasText: /^$/ }).click();
        await sharedPage.getByRole('img').nth(2).click();
        console.log("Searching from homepage offers section");
        await sharedPage.locator('#desktop-header-cnt').getByRole('link').filter({ hasText: /^$/ }).click();
        await sharedPage.locator('#desktop-header-cnt').getByRole('link', { name: 'Kids' }).click();
        await sharedPage.locator('.image-image.undefined').first().click();
        console.log("Searching from header navigation menu");
        await sharedPage.locator('#desktop-header-cnt').getByRole('link').filter({ hasText: /^$/ }).click();
       
    });

    // --- TEST 2 ---
    test('Adding the product to bag', async ({ page }) => {

       // 1. Search and Select Product
        await homePage.searchForProduct('26458804');
        await sharedPage.waitForTimeout(5000);

        // 2. Add to Bag
        await sharedPage.getByRole('button', { name: '8' }).click();
        await sharedPage.getByText('ADD TO BAG').click();
        await sharedPage.getByText('Bag', { exact: true }).click();

        // 3. Enter Pin Code (if needed)
        if (await sharedPage.getByText('ENTER PIN CODE').isVisible()) {
            await sharedPage.getByText('ENTER PIN CODE').click();
             await sharedPage.waitForTimeout(2000);
            await sharedPage.getByRole('textbox', { name: 'Enter Pincode' }).fill('641037');
             await sharedPage.waitForTimeout(2000);
            await sharedPage.getByText('CHECK', { exact: true }).click();
        }

        // Wait for price update
        await sharedPage.waitForTimeout(3000);

        // Extract price details
        const getPrice = async (label) => {
            // Step 1: Try finding the row using the standard class
            let row = sharedPage.locator('.priceDetail-base-row').filter({ hasText: label });
            
            // Step 2: If not found, try the "Total" specific class
            if (await row.count() === 0) {
                row = sharedPage.locator('.priceDetail-total-row').filter({ hasText: label });
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

        const totalText = await sharedPage.locator('//*[@id="priceBlock"]/div[5]').innerText();
        const totalAmount = parseFloat(totalText.replace(/[^0-9.-]/g, '')) || 0;                        
  
        console.log(`Extracted: MRP=${totalMRP}, Discount=${discount}, Fee=${platformFee}, Total=${totalAmount}`);
        //await page1.pause();
        // 5. Calculate and Assert
        const calculatedTotal = totalMRP - discount + platformFee;
        console.log(`Calculated Total: ${calculatedTotal}`);
        // Assert
        //expect(calculatedTotal).toBe(totalAmount);  
    
    });

    // --- TEST 3 ---
    // test('Purchase a product via the Offers or Scroll feeds on the homepage', async ({ page }) => {
    //     // 1. Scroll to Offers Section
    //     await homePage.scrollToOffersSection();
    //     await page.waitForTimeout(2000); // Wait for offers to load
    //     await page.locator('div:nth-child(8) > div > div > div > div > div:nth-child(4) > .container-base > div > .container-container > .row-base > .column-base > a > .img-responsive > .image-image').click();
    //     const page1Promise = page.waitForEvent('popup');
    //     await page.getByRole('link', { name: 'Timex His & Her Analogue Couple Watch Gift Set TW00ZP002 Timex His & Her' }).click();
    //     const page1 = await page1Promise;
    //     await page1.getByRole('link', { name: 'Green' }).click();
    //     await page1.getByText('ADD TO BAG').click();
    //     await page1.getByRole('link', { name: 'GO TO BAG' }).click();

    //     await page1.waitForTimeout(3000);

    //     // Extract price details
    //     const getPrice = async (label) => {
    //         // Step 1: Try finding the row using the standard class
    //         let row = page1.locator('.priceDetail-base-row').filter({ hasText: label });
            
    //         // Step 2: If not found, try the "Total" specific class
    //         if (await row.count() === 0) {
    //             row = page1.locator('.priceDetail-total-row').filter({ hasText: label });
    //         }

    //         // Step 3: Check if row exists now
    //         if (await row.count() === 0) {
    //             console.log(`Warning: Label "${label}" not found.`);
    //             return 0;
    //         }

    //         // Step 4: Find the value inside the row (using wildcard to match both 'base-value' and 'total-value')
    //         const valueLocator = row.locator('[class*="priceDetail"][class*="value"]'); 
            
    //         const text = await valueLocator.first().textContent(); 
    //         return parseFloat(text.replace(/[^0-9.]/g, ''));
    //     };

    //     // 4. Extract Values
    //     const totalMRP = await getPrice('Total MRP'); 
    //     const discount = await getPrice('Discount on MRP'); 
    //     //await page1.pause();
    //     let platformFee = 0;
    //     try {
    //         platformFee = await getPrice('Platform Fee');
    //     } catch (e) {
    //         console.log("No Platform Fee found");
    //     }

    //     // const totalAmount = await getPrice('Total MRP ₹');

    //     const totalAmount = await page1.locator("#priceBlock > div.priceDetail-base-total"). innerText().then(text => {
    //         return parseFloat(text.replace(/[^0-9.]/g, ''));
    //     });

    //     console.log(`Extracted: MRP=${totalMRP}, Discount=${discount}, Fee=${platformFee}, Total=${totalAmount}`);
    //     //await page1.pause();
    //     // 5. Calculate and Assert
    //     const calculatedTotal = totalMRP - discount + platformFee;
    //     console.log(`Calculated Total: ${calculatedTotal}`);
    //     // Assert
    //     expect(calculatedTotal).toBe(totalAmount);  
    // });   
    
    //  ----- TEST 4 ----- 

    test('Adding product to wishlist and moving it to bag', async ({ page }) => {
        {
        // 1. Search and Select Product
        await homePage.searchForProduct('32626246');
        await sharedPage.waitForTimeout(5000); // Wait for search results to load
        await sharedPage.getByRole('button', { name: '-1.5Y Rs. 298' }).click();
        await sharedPage.getByText('ADD TO BAG').click();
        await sharedPage.getByText('Bag', { exact: true }).click();
        await sharedPage.getByRole('button', { name: 'MOVE TO WISHLIST' }).click();
        await sharedPage.getByRole('dialog').getByRole('button', { name: 'MOVE TO WISHLIST' }).click();
        await sharedPage.getByRole('link').first().click();
        await sharedPage.locator('span').filter({ hasText: 'Wishlist' }).click();
        await sharedPage.locator('//*[@id="item0"]/div[2]/div[2]/span/a').click();
        await sharedPage.locator('//*[@id="item0"]/div[2]/div/div/div[3]/button[1]').click();
        await sharedPage.locator('//*[@id="item0"]/div[2]/div/div/div[5]').click();
        await sharedPage.locator('//*[@id="desktop-header-cnt"]/div[2]/div[2]/a[2]/span[3]').click();
        await sharedPage.waitForTimeout(2000);
        }
   });

   //  ----- TEST 5 -----

   test ('Increasing the quantity and size of the product in the bag', async ({page}) => {
    // 1. Search and Select Product 
    await homePage.searchForProduct('38914202');
    await sharedPage.getByRole('button', { name: '-24M' }).click();
    await sharedPage.getByText('ADD TO BAG').click();
    await sharedPage.getByRole('link', { name: 'GO TO BAG' }).click();
  // Quantity Increase
  await sharedPage.getByText('Qty:').click();
  await sharedPage.getByText('3', { exact: true }).click();
  await sharedPage.locator('//*[@id="cartItemsList"]/div/div/div/div[2]/div[4]/div/button/div').click();
  //Size chnage
  await sharedPage.getByText('Size: 5.5-6Y').click();
  await sharedPage.getByText('-9Y').click();
  await sharedPage.getByRole('button', { name: 'DONE' }).click();
});

 //  ----- TEST 6 -----

 test ('Removing the product from the bag', async ({page}) => {
    // 1. Search and Select Product 
    await homePage.searchForProduct('28688484')
    await sharedPage.getByText('ADD TO BAG').click();
    await sharedPage.getByRole('link', { name: 'GO TO BAG' }).click();
    await sharedPage.getByRole('button', { name: 'REMOVE' }).click();
    await sharedPage.getByRole('dialog').getByRole('button', { name: 'REMOVE' }).click();
 });

 // ----- TEST 7 -----

 test('Applying a coupon code and verifying the discount', async ({page}) => {
    // 1. Search and Select Product
    await homePage.searchForProduct('32758019')
    await homePage.scrollToOffersSection();
    await sharedPage.getByRole('textbox', { name: 'Search for products, brands' }).press('Enter');
    await sharedPage.getByText('ADD TO BAG').click();
    await sharedPage.getByText('Bag', { exact: true }).click();
    await sharedPage.getByRole('button', { name: 'APPLY' }).click();
    await sharedPage.locator('#applyCoupon').click();
 })

 // ----- TEST 8 -----

 test('Using Credit Card discount and verifying the final price', async ({page}) => {
    // 1. Search and Select Product
    await homePage.searchForProduct('37796337')
    await sharedPage.locator('//*[@id="mountRoot"]/div/div[1]/main/div[2]/div[2]/div[2]/div[2]/div/div[1]').click()
    await sharedPage.locator('//*[@id="desktop-header-cnt"]/div[2]/div[2]/a[2]/span[1]').click();
    await sharedPage.getByText('Show More').click();
    await sharedPage.mouse.wheel(0, 800);
    await sharedPage.getByRole('button', {name: 'PLACE ORDER'}).click();
    await expect(sharedPage.getByText('326, Newchitrambalam Layout, Ponni Nagar,  P.N Palayam', 'Coimbatore, Tamil Nadu 641037')).toBeVisible();
    await sharedPage.locator('#placeOrderButton').click();
    await sharedPage.getByText('Credit/Debit Card').click();
    await sharedPage.getByText('Show More').click();
    await sharedPage.mouse.wheel(0, 800);
    await sharedPage.waitForTimeout(2000);
 });

 // ----- TEST 9 -----

    test('Creating gift card' , async ({page}) => {
        await sharedPage.locator('span').nth(4).hover();
        await sharedPage.locator('#desktop-header-cnt').getByRole('link', { name: 'Gift Cards' }).click();
        await sharedPage.getByRole('button', { name: 'Send Gift Card' }).click();
        await sharedPage.getByText('Wedding').click();
        await sharedPage.getByRole('textbox', { name: 'Edit Message' }).fill('Happy Married Life with lots of love and joy');
        await sharedPage.locator('.personalize-next').click();
        await sharedPage.getByText('2,000').click();
        await sharedPage.getByRole('textbox', { name: 'Recipient mobile number' }).fill('0000000000');
        await sharedPage.getByRole('textbox', { name: 'Recipient email' }).fill('test@example.com');
        await sharedPage.getByRole('textbox', { name: 'Recipient Name*' }).fill('Test User');
        await sharedPage.getByRole('button', {name: 'Show Preview'}).click();
        await sharedPage.locator('.preview-proceed').click();
        //await waitForTimeout(2000);

    });

    // ----- TEST 10 -----

    test('Removing multiple items from the bag', async ({page}) => {
        // 1. Search and Select Product
        await homePage.searchForProduct('27204888');
        await sharedPage.locator('.pdp-add-to-bag pdp-button pdp-flex pdp-center').click();//add first product to bag
        await homePage.searchForProduct('10620364');
        await sharedPage.locator('.pdp-add-to-bag pdp-button pdp-flex pdp-center').click();//add second product to bag
        await homePage.searchForProduct('30743939');
        await sharedPage.locator('.pdp-add-to-bag pdp-button pdp-flex pdp-center').click();//add third product to bag
    });

});


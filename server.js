const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.post('/api/search',(req,res)=>{
  //req.body.searchItem = search item sent from browser

  checkThese = [];
  if(!req.body.searchItem){
    res.json({info:'You need to tell me what to search!'});
    return;
  }

  try{
    void (async () =>{

      const browser = await puppeteer.launch({
        headless:false,
        devtools: true,
  ignoreHTTPSErrors: true,
  defaultViewport: {
    width: 375,
    height: 667,
    isMobile: true,
  }
      });
      const page = await browser.newPage();

      for(let i=0; i < 1; i++){
      await page.goto(`https://www.amazon.ca/s/?field-keywords=${req.body.searchItem}!`);

      await page.waitFor(8000);

      const urls = await page.evaluate(()=>{
      let links = [];
      const products = (document.body.querySelectorAll('.a-link-normal'));
      for(let i = 0; i < products.length; i++){
        links.push(products[i].getAttribute('href'));
      }
      let filter1 = links.filter((el)=>{
        if(el.length > 1){
          return el;
        }
      });
      let filter2 = filter1.filter((el)=>{
        if(!el.includes('advertising')){
          return el;
        }
      });
      let filter3 = filter2.filter((el)=>{
        if(!el.includes('customerReviews')){
          return el;
        }
      });
      filter3 = filter3.filter((el)=>{
        if(!el.includes('/gp/bestsellers')){
          return el;
        }
      });
      filter3 = filter3.filter((el)=>{
        if(!el.includes('/gp/goldbox')){
          return el;
        }});
      filter3 = filter3.filter((el)=>{
        if(!el.includes('/s?k=')){
          return el;
        }
      });
      filter3 = filter3.filter((el)=>{
        if(!el.includes('aax-us-east.amazon-adsystem.com')){
          return el;
        }
      });
      filter3 = filter3.filter((el)=>{
        if(!el.includes('#s-skipLinkTargetForMainSearchResults')){
          return el;
        }
      });
      let filter4 = new Set(filter3);
      filter4 = Array.from(filter4);
      return filter4.slice(0,15);
      });

      for(let j=0; j < urls.length; j++){
       await page.goto(`https://www.amazon.ca/${urls[j]}`)
       //await page.waitFor(1000);
        const data = await page.evaluate(()=>{
          let results = [];
          let potential = "";
          let productTitle = document.body.querySelector('#productTitle');
          let savings = document.body.querySelector('#regularprice_savings');
          let cost = document.body.querySelector('#priceblock_ourprice');
          let cost2 = document.body.querySelector('#priceblock_saleprice');
          let coupon = document.body.querySelector('#clippedCoupon');
          let code = window.find("Promo code");

          if(productTitle){
            productTitle = productTitle.innerHTML.substring(14);
          }
          if(savings){
          savings = savings.innerHTML;
          savings = savings.match(/\d\d%/);
          }
          if(cost){
          cost = cost.innerHTML.substring(10)+'$';
        }else if(cost2){
          cost = cost2.innerHTML.substring(10)+'$';
        }
          if(coupon){
            coupon = coupon.innerHTML.substring(296,316);
          }
          if(code){
            code = "Code Available"
          }

          potential = {
            url: window.location.href,
            Name:productTitle,
            Savings:savings,
            Cost:cost,
            Coupon:coupon,
            Code:code,
          }

          return potential;
        })
        checkThese.push(data);
      }
      res.json({info:checkThese});
    }
    browser.close();
  })()}
  catch(error){
    console.log(error);
  }
    //res.json({info:'response is good'});
})

app.listen(3001,()=>{console.log('Online @ 3001')});

module.exports = app;

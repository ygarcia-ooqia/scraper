/// EASY: https://findbestseo.com/digital-marketing-companies/dma-digital-marketing-agency

const fs = require('fs');
const got = require('got');
const cheerio = require('cheerio');
const jsonframe = require('jsonframe-cheerio');
const _ = require('underscore');

const protocol = 'https';
const website = 'findbestseo.com';
const siteBaseUrl = `${protocol}://${website}`;
const profilePath = '/digital-marketing-companies/dma-digital-marketing-agency';

const STATUS_OK = 200;

const client = got.extend({
    baseUrl: siteBaseUrl,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
    }
});

const profileJsonFrame = {
    name: '#page_content > div > div.col-md-8.col-lg-height.col-top > div > div:nth-child(1) > h2',
    website: '#page_content > div > div.col-md-4.col-lg-height.col-top > div > div.company-represent-contact > p.sidebar_website > a @ href',
    logourl: '#page_content > div > div.col-md-4.col-lg-height.col-top > div > a > img @ src',
    overallScore: '.company-represent-score h2',
    address: '#page_content > div > div.col-md-4.col-lg-height.col-top > div > div.company-represent-contact > p.sidebar_address',
    phone: '#page_content > div > div.col-md-4.col-lg-height.col-top > div > div.company-represent-contact > p.sidebar_phone',
    annualAwwards: {
        _s: '#block-views-company-awards-annual li',
        _d: [{
            title: 'a @ title',
            awward: ".field-content",
            url: 'a @ href',
        }]
    },
    monthlyAwwards: {
        _s: '#block-views-company-awards-monthly li',
        _d: [{
            title: 'a @ title',
            awward: ".field-content",
            url: 'a @ href',
        }]
    },
    companyDescription: '#page_content > div > div.col-md-8.col-lg-height.col-top > div > div.company-content-about > div > div > div > p',
}


let scraperID = (new Date().getTime());
let initTime = new Date().toLocaleString();
(async() => {
    let directoryPageResponse = await client(profilePath);
    if (directoryPageResponse.statusCode === STATUS_OK) {

        let $ = cheerio.load(directoryPageResponse.body);
        jsonframe($);

        let data = $('body').scrape(profileJsonFrame);
        data.services = _.map($('.company-content-services a'), (item) => $(item).text());

        let endTime = new Date().toLocaleString();
        let output = {
            website,
            initTime,
            endTime,
            data
        }
        fs.writeFile(`${website}-${scraperID}.json`, JSON.stringify(output, null, 4), (error) => console.log(error));
    }
})();
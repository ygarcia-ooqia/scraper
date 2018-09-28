const fs = require('fs');
//const got = require('got');
const _ = require('underscore');
const cheerio = require('cheerio');
const jsonframe = require('jsonframe-cheerio');
const puppeteer = require('puppeteer');

const protocol = 'https';
const website = 'www.androidpit.es';
const siteBaseUrl = `${protocol}://${website}`;
const directoryPath = 'noticias/page';
const pages = 1;

const STATUS_OK = 200;
const MAX_REQ_PER_BATCH = 5;

const pageDirectoryScraper = {
    'blogPosts': {
        _s: 'a.articleTeaser',
        _d: [{
            'title': 'h2',
            'image': 'img @ src',
            'url': 'h2 @ url',
            'date': '.articleTeaserTimestamp @ title',
            'comments': '.commentsBubble'
        }]
    }
};

const pageBlogPostScraper = {
    'title': '.article-title__text',
    'author': {
        'name': '.articleAuthorName',
        'profileLink': '.articleAuthorLink @ href',
        'publishDate': '.articlePublishedDate'
    },
    'share': {
        'fb': '#share-fb-sticky_TOP @ href'
    }
};

const sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let result = [];
let scraperID = (new Date().getTime());
let initTime = new Date().toLocaleString();
(async() => {
    for (let i = 0; i < pages; i++) {
        let directoryPageUrl = `${siteBaseUrl}/${directoryPath}/${(i + 1)}`;

        let browser = await puppeteer.launch();
        let page = await browser.newPage();
        let puppeteerResponse = await page.goto(directoryPageUrl);
        let content = await page.content();

        let $ = cheerio.load(content);
        jsonframe($);

        // workaround to get article's url from 'a.articleTeaser[href]' to map with jsonframe (androidpit.com case)
        $('a.articleTeaser').each(function(i, el) {
            $(this).find('h2').attr('url', el.attribs.href)
        });

        let data = $('body').scrape(pageDirectoryScraper); /// => articles = { news: [...] };  

        await page.close();

        result = result.concat(data.blogPosts);
        browser.close();
        await sleep(3000);
    }

    let endTime = new Date().toLocaleString();
    let output = {
        website,
        initTime,
        endTime,
        directoryPath,
        pages,
        resultsCount: result.length,
        result
    };
    fs.writeFile(`${website}-scrappeteer-${scraperID}.json`, JSON.stringify(output, null, 4));
})();
const fs = require('fs');
const got = require('got');
const _ = require('underscore');
const cheerio = require('cheerio');
const jsonframe = require('jsonframe-cheerio');
//const puppeteer = require('puppeteer');

const protocol = 'https';
const website = 'www.androidpit.es';
const siteBaseUrl = `${protocol}://${website}`;
const directoryPath = 'noticias/page/';
const pages = 1;

//const browser = await puppeteer.launch();

const STATUS_OK = 200;
const MAX_REQ_PER_BATCH = 5;

const client = got.extend({
    //rejectUnauthorized: false,
    baseUrl: siteBaseUrl,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36'
    }
});

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
        let directoryPageUrl = `${directoryPath}${(i + 1)}`;

        let directoryPageResponse = await client(directoryPageUrl);
        if (directoryPageResponse.statusCode === STATUS_OK) {
            let $ = cheerio.load(directoryPageResponse.body);
            jsonframe($);

            // workaround to get article's url from 'a.articleTeaser[href]' to map with jsonframe (androidpit.com case)
            $('a.articleTeaser').each(function(i, el) {
                $(this).find('h2').attr('url', el.attribs.href)
            });

            let data = $('body').scrape(pageDirectoryScraper); /// => articles = { news: [...] };  

            let requestBatches = _.chunk(data.blogPosts, MAX_REQ_PER_BATCH); /// => requestBatches = [[a,b,c],[d,e,f],[g,h,i],...]
            for (let i = 0; i < requestBatches.length; i++) {
                let promisesBatch = _.map(requestBatches[i], (x) => client(x.url)); /// => promisesBatch = [got(a.url), got(b.url), got(c.url)]
                let responsesBatch = await Promise.all(promisesBatch); /// => responsesBatch = [a-response, b-response, c-response]

                _.each(responsesBatch, (res) => {
                    if (res.statusCode === STATUS_OK) {
                        let blogPost = _.find(data.blogPosts, function(x) {
                            return `${siteBaseUrl}${x.url}` === res.requestUrl;
                        });
                        if (blogPost !== null) {
                            let $ = cheerio.load(res.body);
                            jsonframe($);

                            let articleContent = $('body').scrape(pageBlogPostScraper);
                            blogPost.content = articleContent;
                        }
                    }
                });
                await sleep(3000);
            }

            result = result.concat(data.blogPosts);
        }
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
    fs.writeFile(`${website}-${scraperID}.json`, JSON.stringify(output, null, 4));
})();
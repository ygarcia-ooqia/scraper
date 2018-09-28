/// MEDIUM: http://fortune.com/fortune500/walmart/

const fs = require('fs');
const got = require('got');
const cheerio = require('cheerio');
const jsonframe = require('jsonframe-cheerio');
const _ = require('underscore');

const protocol = 'https';
const website = 'fortune.com';
const siteBaseUrl = `${protocol}://${website}`;
const profilePath = '/fortune500/walmart';

const STATUS_OK = 200;

const client = got.extend({
    baseUrl: siteBaseUrl,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
    }
});

const profileJsonFrame = {
    name: '.ratio.branding-tile-title.text-center ',
    previousRank: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.ranking.small-12.columns.remove-all-padding > div.small-12.large-8.columns.remove-all-padding > div > div > div > div:nth-child(1) > a > span.data',
    revenue: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.ranking.small-12.columns.remove-all-padding > div.small-12.large-8.columns.remove-all-padding > div > div > div > div:nth-child(2) > a > span.data',
    revenueChange: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.ranking.small-12.columns.remove-all-padding > div.small-12.large-8.columns.remove-all-padding > div > div > div > div:nth-child(3) > a > span.data',
    profits: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.ranking.small-12.columns.remove-all-padding > div.small-12.large-8.columns.remove-all-padding > div > div > div > div:nth-child(4) > a > span.data',
    profitsChange: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.ranking.small-12.columns.remove-all-padding > div.small-12.large-8.columns.remove-all-padding > div > div > div > div:nth-child(5) > a > span.data',
    assets: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.ranking.small-12.columns.remove-all-padding > div.small-12.large-8.columns.remove-all-padding > div > div > div > div:nth-child(6) > a > span.data',
    mktValue: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.ranking.small-12.columns.remove-all-padding > div.small-12.large-8.columns.remove-all-padding > div > div > div > div:nth-child(7) > a > span.data',
    employees: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.ranking.small-12.columns.remove-all-padding > div.small-12.large-8.columns.remove-all-padding > div > div > div > div:nth-child(8) > a > span.data',
    overview: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.F500-body-container > div:nth-child(1) > div.company-info-card > div > div.small-12.large-7.columns.bg-white.company-info-c > div:nth-child(1) > div > span > p',
    ceo: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.F500-body-container > div:nth-child(1) > div.company-info-card > div > div.small-12.large-7.columns.bg-white.company-info-c > div.row.company-info-card-table > div.small-12.columns.remove-all-padding > div:nth-child(1) > div > p',
    ceoTitle: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.F500-body-container > div:nth-child(1) > div.company-info-card > div > div.small-12.large-7.columns.bg-white.company-info-c > div.row.company-info-card-table > div.small-12.columns.remove-all-padding > div:nth-child(2) > div > p',
    sector: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.F500-body-container > div:nth-child(1) > div.company-info-card > div > div.small-12.large-7.columns.bg-white.company-info-c > div.row.company-info-card-table > div.small-12.columns.remove-all-padding > div:nth-child(3) > div > p',
    industry: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.F500-body-container > div:nth-child(1) > div.company-info-card > div > div.small-12.large-7.columns.bg-white.company-info-c > div.row.company-info-card-table > div.small-12.columns.remove-all-padding > div:nth-child(4) > div > p',
    hqLocation: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.F500-body-container > div:nth-child(1) > div.company-info-card > div > div.small-12.large-7.columns.bg-white.company-info-c > div.row.company-info-card-table > div.small-12.columns.remove-all-padding > div:nth-child(5) > div > p',
    website: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.F500-body-container > div:nth-child(1) > div.company-info-card > div > div.small-12.large-7.columns.bg-white.company-info-c > div.row.company-info-card-table > div.small-12.columns.remove-all-padding > div:nth-child(6) > div > a',
    yearOnFortuneFiveHundrerList: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.F500-body-container > div:nth-child(1) > div.company-info-card > div > div.small-12.large-7.columns.bg-white.company-info-c > div.row.company-info-card-table > div.small-12.columns.remove-all-padding > div:nth-child(7) > div > p',
    keyFinancials: {
        _s: '#pageContent > div.F500-item-page.F500-2017-item-page.f500.container.year-2018 > div.F500-body-container > div:nth-child(1) > div.row.expanded.bg-grey > div.row.expanded > div.small-12.large-8.columns.remove-all-padding > div:nth-child(1) > div:nth-child(1) > div tr',
        _d: [{
            title: 'td.title',
            value: 'td:nth-child(2)'
        }]
    }
};


let scraperID = (new Date().getTime());
let initTime = new Date().toLocaleString();
(async() => {
    let directoryPageResponse = await client(profilePath);
    if (directoryPageResponse.statusCode === STATUS_OK) {

        let $ = cheerio.load(directoryPageResponse.body);
        jsonframe($);

        let data = $('body').scrape(profileJsonFrame);

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
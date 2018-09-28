/// EASY: https://www.digimarketingagencies.com/ld_1608_New-A-Marketing.aspx

const fs = require('fs');
const got = require('got');
const cheerio = require('cheerio');
const jsonframe = require('jsonframe-cheerio');

const protocol = 'https';
const website = 'www.digimarketingagencies.com';
const siteBaseUrl = `${protocol}://${website}`;
const profilePath = '/ld_1608_New-A-Marketing.aspx';

const STATUS_OK = 200;

const client = got.extend({
    baseUrl: siteBaseUrl,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
    }
});

const profileJsonFrame = {
    name: '#ContentPlaceHolder1_repDetails_lblCompany_0',
    companyOverview: '#slb-content > div.clearfix.row-fluid > div.span12.sbm-details.member-detail > div.detail-list > div.businessimage > div.leftdiv > div > p:nth-child(3)',
    logourl: 'figure.img-left img @ src',
    streetAddress: '#ContentPlaceHolder1_repDetails_lblstreetaddress_0',
    addressLocality: '#ContentPlaceHolder1_repDetails_lblCity_0',
    yearStablished: '#ContentPlaceHolder1_repDetails_lblyear_0',
    phone: '.phoneicon',
    website: '.sbm-web @ href',
    social: {
        facebook: '#slb-content > div.clearfix.row-fluid > div.span12.sbm-details.member-detail > div.detail-list > div.businessimage > div.rightdiv > div.usersocial > a:nth-child(1) @ href',
        linkedin: '#slb-content > div.clearfix.row-fluid > div.span12.sbm-details.member-detail > div.detail-list > div.businessimage > div.rightdiv > div.usersocial > a:nth-child(2) @ href',
        twitter: '#slb-content > div.clearfix.row-fluid > div.span12.sbm-details.member-detail > div.detail-list > div.businessimage > div.rightdiv > div.usersocial > a:nth-child(3) @ href',
        youtube: '#slb-content > div.clearfix.row-fluid > div.span12.sbm-details.member-detail > div.detail-list > div.businessimage > div.rightdiv > div.usersocial > a:nth-child(4) @ href',
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
        data.logourl = `${siteBaseUrl}/${data.logourl}`;

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

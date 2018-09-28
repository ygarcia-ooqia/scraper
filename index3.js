/// MEDIUM: https://www.digimarketingagencies.com/ld_601_Enfuse-Creative-Design.aspx

const fs = require('fs');
const got = require('got');
const cheerio = require('cheerio');
const jsonframe = require('jsonframe-cheerio');
const _ = require('underscore');

const protocol = 'https';
const website = 'www.digimarketingagencies.com';
const siteBaseUrl = `${protocol}://${website}`;
const profilePath = '/ld_601_Enfuse-Creative-Design.aspx';

const STATUS_OK = 200;

const client = got.extend({
    baseUrl: siteBaseUrl,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
    }
});

const profileJsonFrame = {
    name: '#ContentPlaceHolder1_repDetails_lblCompany_0',
    streetAddress: '#ContentPlaceHolder1_repDetails_lblstreetaddress_0',
    addressLocality: '#ContentPlaceHolder1_repDetails_lblCity_0',
    phone: '.phoneicon',
    website: '.sbm-web @ href',
    logourl: 'figure.img-left img @ src',
    yearStablished: '#ContentPlaceHolder1_repDetails_lblyear_0',
    social: {
        facebook: '#slb-content > div.clearfix.row-fluid > div.span12.sbm-details.member-detail > div.detail-list > div.businessimage > div.rightdiv > div.usersocial > a:nth-child(1) @ href',
        googlePlus: '#slb-content > div.clearfix.row-fluid > div.span12.sbm-details.member-detail > div.detail-list > div.businessimage > div.rightdiv > div.usersocial > a:nth-child(2) @ href',
        twitter: '#slb-content > div.clearfix.row-fluid > div.span12.sbm-details.member-detail > div.detail-list > div.businessimage > div.rightdiv > div.usersocial > a:nth-child(3) @ href',
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
        data.companyOverview = _.map($('.detailContent p'), (item) => $(item).text());

        data.services = _.map($('.services li'), (item) => $(item).text());
        data.additionalInformation = _.map($('#ContentPlaceHolder1_repDetails_lbladditionalInformation_0 p'), (item) => $(item).text());
        data.paymentTypes = $('#ContentPlaceHolder1_repDetails_lblpay_0').text();

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
const fs = require('fs');
const got = require('got');
const _ = require('underscore');
const cheerio = require('cheerio');
const jsonframe = require('jsonframe-cheerio');

const protocol = 'https';
const website = 'www.agencyspotter.com';
const siteBaseUrl = `${protocol}://${website}`;
const directoryPath = '/ehousestudio';
const pages = 1;
const STATUS_OK = 200;
const client = got.extend({
  baseUrl: siteBaseUrl,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
  },
});

const agencyJsonFrame = {
  name: '#agency_name_and_industry > h1',
  industry: {
    _s: '#agency_name_and_industry > h2',
    _d: [{
      name: 'a'
    }]
  },
  services: '',
  website: '',
  verified: '',
  award: '',
  logoUrl: '',
  overview: '',
  rating: '',
  reviews: '',
  location: '',
  facebookLink: '',
  linkedInLink: '',
  twitterLink: '',
  email: '',
  phoneNumber: '',
  clients: '',
  agencySize: '',
  affiliation: '',
  audienceSpeciality: '',
  industryExpertise: '',
};

let result = [];
const scraperID = (new Date().getTime());
const initTime = new Date().toLocaleString();
(async () => {
  const directoryPageResponse = await client(directoryPath);
  if (directoryPageResponse.statusCode === STATUS_OK) {
    const $ = cheerio.load(directoryPageResponse.body);
    jsonframe($);
    const data = $('body').scrape(agencyJsonFrame);
    console.log($("script[type='application/ld+json']")[0].children[0].data);
    data.otherData = $("script[type='application/ld+json']")[0].children[0].data;

    result = data;
  }
  const endTime = new Date().toLocaleString();
  const output = {
    website,
    initTime,
    endTime,
    directoryPath,
    pages,
    resultsCount: result.length,
    result,
  };
  fs.writeFile(`${website}-${scraperID}.json`, JSON.stringify(output, null, 4), (error) => {
    console.log(error);
  });
})();

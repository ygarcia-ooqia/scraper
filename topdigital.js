const fs = require('fs');
const got = require('got');
const _ = require('underscore');
const cheerio = require('cheerio');
const jsonframe = require('jsonframe-cheerio');

const protocol = 'https';
const website = 'topdigital.agency';
const siteBaseUrl = `${protocol}://${website}`;
const directoryPath = '/agency/carusele/';
const pages = 1;
const STATUS_OK = 200;
const client = got.extend({
  baseUrl: siteBaseUrl,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
  },
});

const digitalAgentJsonFrame = {
  name: 'h1.title.title--2.hero__title.entry-title',
  website: 'a.btn.btn--link-primary-inv.btn--sm.btn--compact.btn--link-primary.fw-normal.tt-none',
  agencyScore: 'body > div.wrap > div > div > main > article > header > div > div > div.col-10.col-md-5.col-lg-4 > div > ul > li:nth-child(1) > div.hero__meta-item.mr-1.mr-lg-2',
  logoUrl: 'body > div.wrap > div > div > main > article > header > div > div > div.col-10.col-md-7.col-lg-7.offset-lg-1.col-xl-6.offset-xl-2 > div > div.hero__title-wrap.d-flex.align-items-center.justify-content-start > div > div > img @ src',
  shareUrls: {
    facebook: 'body > div.wrap > div > div > main > article > header > div > div > div.col-10.col-md-7.col-lg-7.offset-lg-1.col-xl-6.offset-xl-2 > div > div.hero__links.d-flex.flex-wrap.align-items-center.text-xs.mt-1 > div > a:nth-child(2) @ href',
    twitter: 'body > div.wrap > div > div > main > article > header > div > div > div.col-10.col-md-7.col-lg-7.offset-lg-1.col-xl-6.offset-xl-2 > div > div.hero__links.d-flex.flex-wrap.align-items-center.text-xs.mt-1 > div > a:nth-child(3) @ href',
    linkedIn: 'body > div.wrap > div > div > main > article > header > div > div > div.col-10.col-md-7.col-lg-7.offset-lg-1.col-xl-6.offset-xl-2 > div > div.hero__links.d-flex.flex-wrap.align-items-center.text-xs.mt-1 > div > a:nth-child(4) @ href',
    googlePlus: 'body > div.wrap > div > div > main > article > header > div > div > div.col-10.col-md-7.col-lg-7.offset-lg-1.col-xl-6.offset-xl-2 > div > div.hero__links.d-flex.flex-wrap.align-items-center.text-xs.mt-1 > div > a:nth-child(5) @ href',
  },
  membershipLevel: 'body > div.wrap > div > div > main > article > header > div > div > div.col-10.col-md-5.col-lg-4 > div > ul > li:nth-child(2) > div',
  awards: '#module-about-tab > div.row.justify-content-center.justify-content-lg-start > div.col-12.col-sm-10.col-lg-9.col-xl-8.offset-lg-2.offset-xl-3 > div > div:nth-child(4)',
  clients: '#module-about-tab > div.row.justify-content-center.justify-content-lg-start > div.col-12.col-sm-10.col-lg-9.col-xl-8.offset-lg-2.offset-xl-3 > div > div:nth-child(6) > p',
  yearFounded: '#module-about-tab > div.row.justify-content-center.justify-content-lg-start > div.col-12.col-sm-10.col-lg-9.col-xl-8.offset-lg-2.offset-xl-3 > div > div:nth-child(8) > p > time',
  locations: {
    _s: '#location > ul > li',
    _d: [{
      name: 'span',
    }],
  },
  geographicFocuses: {
    _s: '#geographic-focus > ul > li',
    _d: [{
      name: 'span',
    }],
  },
  expertises: {
    _s: '#expertise > ul > li',
    _d: [{
      name: 'span',
    }],
  },
  technologyExpertises: {
    _s: '#technology-expertise > ul > li',
    _d: [{
      name: 'span',
    }],
  },
  organizationalSize: '#organizational-size > ul > li > span',
  articles: {
    _s: '#module-articles-tab > section > div > div > article > div > header > h2',
    _d: [{
      url: 'a @ href',
    }],
  },
  caseStudies: {
    _s: '#module-case-studies-tab > section > div > div > article > div > header > h2',
    _d: [{
      url: 'a @ href',
    }],
  },
};

let result = [];
const scraperID = (new Date().getTime());
const initTime = new Date().toLocaleString();
(async () => {
  const directoryPageUrl = `${directoryPath}${(1)}`;
  const directoryPageResponse = await client(directoryPageUrl);
  if (directoryPageResponse.statusCode === STATUS_OK) {
    const $ = cheerio.load(directoryPageResponse.body);
    jsonframe($);
    const data = $('body').scrape(digitalAgentJsonFrame);
    const aboutParagraphs = $('#module-about-tab > div.row.justify-content-center.justify-content-lg-start > div.col-12.col-sm-10.col-lg-9.col-xl-8.offset-lg-2.offset-xl-3 > div > div.module__body-item.editor.mb-2 > p');

    data.about = _.map(aboutParagraphs, item => $(item).text()).join('\n');
    result = result.concat(data);
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

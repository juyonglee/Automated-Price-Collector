//  Price Parsing Function
const axios = require('axios');
const cheerio = require('cheerio');
const baseUrl = "https://www.globalwifi.co.kr/payment_tmp/agency/default"
const moment = require('moment');
require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");

const Excel = require('exceljs');

async function getPrice() {
    try {
        const response = await axios.get(baseUrl, {
            params: {
                code: "Blog_ah",
                gubn_flag: 1
            }
        });
        return response.data;
    } catch (error) {
        console.log(error);
    }
}
async function createPriceList(htmlData) {
    const $ = cheerio.load(htmlData);
    const agencyPriceTable = $(".agency_price").children('tbody').children('tr');
    
    let priceJsonData = {
        each_country: [],
        domestic_price: [],
        airport_price: []
    };
    for(var start=0; start< agencyPriceTable.length; start++) {
        priceJsonData['each_country'].push(agencyPriceTable.eq(start).children('.each_country').text().trim());
        if(agencyPriceTable.eq(start).children('.domestic_price').text().trim() == '-') {
            priceJsonData['domestic_price'].push('￦ 0');
        } else {
            priceJsonData['domestic_price'].push(agencyPriceTable.eq(start).children('.domestic_price').text().trim());
        }
        if(agencyPriceTable.eq(start).children('.airport_price').text().trim() == '-') {
            priceJsonData['airport_price'].push('￦ 0');
        } else {
            priceJsonData['airport_price'].push(agencyPriceTable.eq(start).children('.airport_price').text().trim());
        }
        
    }
    return priceJsonData;
}

async function excelListGenerator(priceJsonData, res) {
    var workbook = new Excel.Workbook();
    workbook.creator = 'Sojuyong';
    var worksheet = workbook.addWorksheet('Global Wife Price');

    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow('B1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('C1').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.columns = [
        { header: '국가', key: 'each_country', width: 23},
        { header: '국내 공항 수령 가격', key: 'domestic_price', width: 23 },
        { header: '일본 공항 수령 가격', key: 'airport_price', width: 23}
    ];
    
    for(var index=1; index<priceJsonData.each_country.length; index++) {
        worksheet.addRow({
            each_country: priceJsonData['each_country'][index], 
            domestic_price: priceJsonData['domestic_price'][index], 
            airport_price: priceJsonData['airport_price'][index]
        });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=" + moment().format('[YYYY-MM-DD] HH:mm:ss') + ".xlsx");
    await workbook.xlsx.write(res);
}

async function runningLogic(res) {
  const priceHTML = await getPrice();
  const priceData = await createPriceList(priceHTML);
  await excelListGenerator(priceData, res);
}

module.exports = runningLogic;
const express = require('express');
const bodyParser = require('body-parser');

const server = express();
server.use(bodyParser.json());

server.post('/predict', function(req, res) {
    predictStart(req, res);
});
server.listen("8999");

//-- random vars
var emptyResponse = "nothing here :]";

//-- Code vars
var data = [];
var years = [];
var allTrendLine = 0;



function predictStart(req, res) {
    userLogger(req);
    // res.send("predict");
    let inputData = req.body;

    inputData = editData(inputData);




    years = createYearsArray(inputData);
    years.forEach(year => removeHolidaysFromYear(year));
    years.forEach(year => console.log(calculateTrendLine(year.sales)));
    years.forEach(year => convertSales(year));
    years.forEach(year => calculateGraphDirection(year));
    years.forEach(year => calculateChangePoints(year));
    years.forEach(year => calculateChangeSlopes(year));

    console.log(years[0]);
    //calculateTrendLine(inputData);

    res.send(emptyResponse);
    // remove this line for debug output
    // res.send(inputData);
};

function userLogger(req, func) {
    console.log(`ip: ${req.ip} ;Route: ${req.route.path}`);
}

function editData(inputData) {
    inputData.forEach(element => element.timestamp = new Date(element.timestamp));
    return inputData;
}

function createYearsArray(inputData) {
    let years = [];
    let yearToFilter = 0;
    yearToFilter = inputData[0].timestamp.getYear();
    let currentYear = yearObjFactory();
    currentYear.year = yearToFilter;

    for (let i = 0; i < inputData.length; i++) {
        const element = inputData[i];
        if (element.timestamp.getYear() == yearToFilter) {
            //save year from year
            currentYear.sales.push(element);
        } else {
            //change params to algoritm
            yearToFilter++;
            console.log(yearToFilter);
            years.push(currentYear);
            currentYear = yearObjFactory();
            currentYear.year = yearToFilter;
            i--;
        }
    }
    years.push(currentYear);
    return years;
}

function yearObjFactory() {
    let year = {
        sales: [],
        changePoints: [],
        year: 0
    };
    return year;
}

function salesFactory(sale) {
    let nSale = {
        timestamp: sale.timestamp,
        value: sale.value,
        dir: "",
        changeSlope: 0
    }
    return nSale;
}

function calculateTrendLine(inputData) {
    let diff = inputData[lsArIn(inputData)].value - inputData[0].value;
    return diff / inputData.length;
}

const lastArrayIndex = (array) => array.length - 1;
const lsArIn = lastArrayIndex;


function removeHolidaysFromYear(year) {
    if (year.sales[lsArIn(year.sales)].timestamp.getMonth() == 11) {
        year.sales.splice(lsArIn(year.sales), 1);
        year.sales.splice(lsArIn(year.sales), 1);
    }
    return year;
}

function convertSales(year) {
    for (let i = 0; i < year.sales.length; i++) {
        let element = year.sales[i];
        element = salesFactory(element);
        year.sales[i] = element;
    }
    return year;
}

function calculateGraphDirection(year) {
    for (let i = 1; i < year.sales.length; i++) {
        const element = year.sales[i];
        if (element.value < year.sales[i - 1].value) {
            element.dir = 'V';
        }
        if (element.value > year.sales[i - 1].value) {
            element.dir = '^';
        }
    }
}

function calculateChangePoints(year) {
    for (let i = 1; i < year.sales.length; i++) {
        const element = year.sales[i];
        if (element.dir != year.sales[i - 1].dir) {
            year.changePoints.push(element);
        }
    }
}

function calculateChangeSlopes(year) {
    for (let i = 1; i < year.changePoints.length; i++) {
        let changePoints = [year.changePoints[i - 1], year.changePoints[i]];
        year.changePoints[i].changeSlope = calculateTrendLine(changePoints);
        if ((year.changePoints[i].dir == "^" && year.changePoints[i].changeSlope < 0) || (year.changePoints[i].dir == "V" && year.changePoints[i].changeSlope > 0)) {
            year.changePoints[i].changeSlope = -1 * year.changePoints[i].changeSlope;
        }
    }
}
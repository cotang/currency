'use strict';

// 17.07, 16.07 - не существует (вс, пн)
// "https://www.cbr-xml-daily.ru/daily_json.js" = текущая дата+1 (18.07 - "https://www.cbr-xml-daily.ru/archive/2017-07-19.js")

// создаем массив из дат для составления url откуда берем json
var dates = [];
function getDateArray(arr){
  var now = new Date();
  now.setDate(now.getDate() + 1);

  for(var i=0;i<7;i++){
    // дата на день раньше   
    var newDay = now.setDate(now.getDate() - 1);
    var d = new Date(newDay);
    // не может быть воскресенье или понедельник
    if (d.getDay() != 0 && d.getDay() != 1) {    
      arr.push(convertDateForURL(d));
    }    
  }
  // return arr.map(convertDateForURL);
}

// изменение формата даты для url
function convertDateForURL(date){
  var year = date.getFullYear();
  var month = date.getMonth()+1;
  if (month<10) month = '0' + month;
  var day = date.getDate();
  if (day<10) day = '0' + day;
  return (year+'-'+month+'-'+day);
}

// изменение формата даты для title
function convertDateForTitle(date){
  var date = new Date(date);
  var day = date.getDate();
  if (day<10) day = '0' + day;
  var year = date.getFullYear();
  var month = date.getMonth()+1;
  if (month<10) month = '0' + month;
  return (day+'-'+month+'-'+year);
}

getDateArray(dates);

var datesForUrl = dates.map(function(date) {
  return "https://www.cbr-xml-daily.ru/archive/"+date+".js";
});




// JSON

var currencyDaysArr = [];

function httpGet(url) {
    return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
      if (this.status == 200) {
        resolve(this.response);
      } else {
        var error = new Error(this.statusText);
        error.code = this.status;
        reject(error);
      }
    };
    xhr.onerror = function() {
      reject(new Error("Network Error"));
    };
    xhr.send();
  });
}


let chain = Promise.resolve();
// в цикле добавляем задачи в цепочку
datesForUrl.forEach(function(url) {
  chain = chain
    .then(() => httpGet(url))
    .then(JSON.parse)
    .then((result) => {
      currencyDaysArr.push(result);
    });
});
// в конце — выводим результаты
chain.then(() => {
  // console.log(currencyDaysArr, currencyDaysArr.length);
  document.querySelector('.overlay').style.display = 'none';
  createTable(currencyDaysArr);
  createChecklist();
  drawDiagram(draw);
});



//
// График одной валюты
//

var diagramDiv = document.querySelector('#diagram');

/* создаем чек-лист */
function createChecklist(){
  var checklist = document.createElement('ul');
  checklist.classList.add('checklist');
  var curList = currencyDaysArr[0].Valute;
  for (var key in curList) {
    createChecklistItem(key, checklist)
  }
  diagramDiv.appendChild(checklist)
}
function createChecklistItem(text, parent){
  var checklistItem = document.createElement('li');
  checklistItem.classList.add('checklist-item');
  checklistItem.innerHTML = 
    '<label><input type="radio" name="currency" id='+text+'>'+text+'</label>';
  checklistItem.querySelector('input[name="currency"]').addEventListener('click', drawGraph);
  parent.appendChild(checklistItem)
}


// define document width and height
var width = 600, height = 550
// create SVG document and set its size
var draw = SVG('drawing').size(width, height)
draw.viewbox(0,0,600,550);
var widthBg = 500;


function drawDiagram(draw){ 
  // draw background
  var dis = 0;
  for (var i=0;i<5;i++){
    var background = draw.rect(widthBg, 50).move((width-widthBg)/2, dis).fill('grey');
    var background = draw.rect(widthBg, 50).move((width-widthBg)/2, dis+50).fill('lightgrey');
    dis += 100;
  }
  // draw lines
  var left = 3;
  for (var i=0;i<4;i++){  
    var line = draw.line(widthBg*(left/10), 0, widthBg*(left/10), height)
    line.stroke({ width: 2, color: '#fff'})
    left += 2;
  }
  // draw ruler
  var rulerValue = 100;
  var rulerHeight = 0;
  for (var i=0;i<10;i++){  
    var rulerRight = draw.text(String(rulerValue)).font({
      size: 12,
      family: 'Menlo, sans-serif',
      anchor: 'end',
      fill: 'black'
    }).move(40, rulerHeight);
    rulerValue -=10;
    rulerHeight += 50;
    var rulerLeft = rulerRight.clone()
      .font('anchor', 'start')
      .x(widthBg+60);
  }
  // draw dates
  var left = 2;
  for (var i=0;i<currencyDaysArr.length;i++){
    var strDate = String(convertDateForTitle(currencyDaysArr[i].Date));    
    var date = draw.text(strDate).font({
      size: 16,
      family: 'Menlo, sans-serif',
      anchor: 'middle',
      fill: 'black'
    }).move(widthBg*(left/10), (height-50)+10);
    left += 2;
  }
}



function drawGraph(){
  drawDiagram(draw);

  var currentCur = this.getAttribute('id');
  var renderData = [];
  /* получаем пять значений в массив */
  for (var i=0;i<currencyDaysArr.length;i++){
    var list = currencyDaysArr[i].Valute;
    var dataObj = {};
    dataObj.date = convertDateForTitle(currencyDaysArr[i].Date);
    for (var key in list) {
      if(currentCur == list[key].CharCode){
        dataObj.value = list[key].Value;
        dataObj.nominal = list[key].Nominal;
        dataObj.name = list[key].Name;
        renderData.push(dataObj);
        break;
      }
    }
  }

  drawCurrencyList(renderData);

  // draw columns 
  var left = 2;
  var columnWidth = 30;
  for (var i=0;i<renderData.length;i++){    
    var columnHeight = renderData[i].value*5;
    var strValue = String(renderData[i].value);
    var background = draw.rect(columnWidth, columnHeight).move(widthBg*(left/10)-(columnWidth/2), ((height-50)-columnHeight)).fill('pink');
    var value = draw.text(strValue).font({
      size: 20,
      family: 'Menlo, sans-serif',
      anchor: 'middle',
      fill: 'black'
    }).move(widthBg*(left/10), ((height-50)-columnHeight-22));
    left += 2;
  }
}

function drawCurrencyList(arr){
  diagramDiv.querySelector('.diagram-list').innerHTML = '';
  arr.forEach(function(item){
    var dayTable = document.createElement('li');
    dayTable.classList.add('diagram-item');
    dayTable.innerHTML = 
      '<header>'+item.date+'</header>'+
      '<div>'+item.nominal+' '+item.name+' = '+item.value+' руб.</div>';
    diagramDiv.querySelector('.diagram-list').appendChild(dayTable)
  }); 
}




//
// Таблица всех валют
// 

// создать "таблицу" из пяти дней
function createTable(arr){
  arr.forEach(function(item){
    createOneDay(item);
  }); 
}

// создать один день из таблицы, используя данные с конкретной страницы
function createOneDay(obj){  
  var wrapper = document.querySelector('#wrapper');
  var oneDay = document.createElement('div');
  oneDay.classList.add('day');

  // создаем title
  var currencyTitle = document.createElement('h2');
  currencyTitle.classList.add('title');
  currencyTitle.innerHTML = 'Курс валют на '+ convertDateForTitle(obj.Date);
  oneDay.appendChild(currencyTitle);

  // создаем list
  var oneDayList = document.createElement('ul');
  oneDayList.classList.add('list');
  for (var key in obj.Valute) {
    createCurrencyItem(obj.Valute[key], oneDayList)
  }
  oneDay.appendChild(oneDayList);
  wrapper.appendChild(oneDay);
}

// создаем единицу каталога валют
function createCurrencyItem(item, div){
  var currencyItem = document.createElement('li');
  currencyItem.classList.add('item');
  currencyItem.setAttribute('data-currency', item.CharCode);
  currencyItem.setAttribute('data-value', item.Value);
  currencyItem.innerHTML = 
    '<header>'+item.CharCode+'</header>'+
    '<p>'+item.Nominal+' '+item.Name+' = '+item.Value+' руб.</p>';
  div.appendChild(currencyItem)
}
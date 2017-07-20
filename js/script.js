var wrapper = document.querySelector('#wrapper');
var currencyDaysArr = [];

getCurrencyArr(getDateArray());

/* получаем массив объектов из json */
function getCurrencyArr(arr){
  arr.forEach(function(url){
    /* вызов getJson, получение данных из json */
    getJson("https://www.cbr-xml-daily.ru/archive/"+url+".js", function(generated){
      var currencyDataObject = generated;
      currencyDaysArr.push(currencyDataObject);
    });
  });  
}
// console.log(currencyDaysArr, currencyDaysArr.length)

/* получаем информацию из файла json */
/* пришлось сделать синхронный запрос, иначе массив currencyDaysArr не заполняется */
function getJson(url, callback){
  var req  = new XMLHttpRequest();
  req.open("GET", url, false);
  req.addEventListener('load', function(){
    try {
      var responseJson = JSON.parse(this.responseText);
    } catch (err) {
      console.log( "Извините, в данных ошибка, мы попробуем получить их ещё раз" );
      console.log( err.name );
      console.log( err.message );
    }
    callback(responseJson)
  });
  req.send();
}


createTable(currencyDaysArr);

/* создать "таблицу" из пяти дней */
function createTable(arr){
  arr.forEach(function(item){
    createOneDay(item);
  }); 
}

/* создать один день из таблицы, используя данные с конкретной страницы */
function createOneDay(obj){  
  var oneDay = document.createElement('div');
  oneDay.classList.add('day');

  /* создаем title */
  var currencyTitle = document.createElement('h1');
  currencyTitle.classList.add('title');
  currencyTitle.innerHTML = 'Курс валют на '+ convertDateForTitle(obj.Date);
  oneDay.appendChild(currencyTitle);

  /* создаем list */
  var oneDayList = document.createElement('ul');
  oneDayList.classList.add('list');
  for (var key in obj.Valute) {
    createCurrencyItem(obj.Valute[key], oneDayList)
  }
  oneDay.appendChild(oneDayList);
  wrapper.appendChild(oneDay);
}



/* создаем единицу каталога валют */
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


/* 
17.07, 16.07 - не существует (вс, пн)
"https://www.cbr-xml-daily.ru/daily_json.js" = текущая дата+1 (18.07 - "https://www.cbr-xml-daily.ru/archive/2017-07-19.js")
*/


/* создаем массив из дат для составления url откуда берем json */
function getDateArray(){ 
  var arr = []; 
  var now = new Date();
  now.setDate(now.getDate() + 1);

  for(var i=0;i<7;i++){
    /* дата на день раньше */    
    var newDay = now.setDate(now.getDate() - 1);
    var d = new Date(newDay);
    if (d.getDay() != 0 && d.getDay() != 1) {    
      arr.push(d);
    }    
  }
  return arr.map(convertDateForURL);
}


/* изменение формата даты для url */
function convertDateForURL(date){
  var year = date.getFullYear();

  var month = date.getMonth()+1;
  if (month<10) month = '0' + month;

  var day = date.getDate();
  if (day<10) day = '0' + day;

  return (year+'-'+month+'-'+day);
}


/* изменение формата даты для title */
function convertDateForTitle(date){
  var date = new Date(date);

  var day = date.getDate()-1; //записывается вчерашним днем
  if (day<10) day = '0' + day;

  var year = date.getFullYear();

  var month = date.getMonth()+1;
  if (month<10) month = '0' + month;

  return (day+'-'+month+'-'+year);
}
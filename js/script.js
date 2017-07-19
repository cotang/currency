var wrapper = document.querySelector('#wrapper');


createFiveDays(getDateArray())
/* создать "таблицу" из пяти дней */
function createFiveDays(arr){
  arr.forEach(function(item){
    createOneDay(item)
  }); 
}

/* создать один день из таблицы, используя данные с конкретной страницы */
function createOneDay(url){
  var currencyDataObject = {};
  var oneDay = document.createElement('div');
  oneDay.classList.add('day');
  var oneDayList = document.createElement('ul');
  oneDayList.classList.add('list');

  /* вызов getJson, получение данных из json */
  getJson("https://www.cbr-xml-daily.ru/archive/"+url+".js", function(generated){
    currencyDataObject = generated;  
    createCurrencyList(currencyDataObject, oneDayList);
  });

  oneDay.appendChild(oneDayList);
  wrapper.appendChild(oneDay);
}


/* получаем информацию из файла json */
function getJson(url, callback){
  var req  = new XMLHttpRequest();
  req.open("GET", url);
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
/* создаем каталог валют */
function createCurrencyList(obj, div){  
  // console.log(obj.Valute);
  for (var key in obj.Valute) {
    createCurrencyItem(obj.Valute[key], div)
  }
}
/* создаем единицу каталога валют */
function createCurrencyItem(item, div){
  var currencyItem = document.createElement('li');
  currencyItem.innerHTML = 
    '<div>'+item.CharCode+'</div>'+
    '<div>'+item.Nominal+' '+item.Name+' = '+item.Value+' руб.</div>';
  div.appendChild(currencyItem)
}




/* 
17.07, 16.07 - не существует (вс, пн)
"https://www.cbr-xml-daily.ru/daily_json.js" = текущая дата+1 (18.07 - "https://www.cbr-xml-daily.ru/archive/2017-07-19.js")
*/

/* создаем массив из дат для составления url откуда берем json */
function getDateArray(){
  var dayArr = [];
  var now = new Date();
  now.setDate(now.getDate() + 1);

  for(var i=0;i<7;i++){
    /* дата на день раньше */    
    var newDay = now.setDate(now.getDate() - 1);
    var d = new Date(newDay);
    if (d.getDay() != 0 && d.getDay() != 1) {    
      dayArr.push(d);
    }    
  }
  var dateForURLArr = dayArr.map(convertDate);
  return dateForURLArr;
}


/* изменение формата даты */
function convertDate(date){
  var year = date.getFullYear();

  var month = date.getMonth()+1;
  if (month<10) month = '0' + month;

  var day = date.getDate();
  if (day<10) day = '0' + day;

  return (year+'-'+month+'-'+day);
}



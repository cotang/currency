var diagramDiv = document.querySelector('#diagram');


createChecklist();

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

drawDiagram(draw);

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

  drawTable(renderData);
  // console.log();

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

function drawTable(arr){
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


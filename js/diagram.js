var diagramDiv = document.querySelector('#diagram');

/* создаем чек-лист */
createChecklist();
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
  checklistItem.querySelector('input[name="currency"]').addEventListener('click', renderDiagram);
  parent.appendChild(checklistItem)
}



function renderDiagram(){
  document.querySelector('#drawing').innerHTML = '';
  var currentCur = this.getAttribute('id');
  var renderData = [];
  /* получаем пять значений в массив */
  for (var i=0;i<currencyDaysArr.length;i++){
    var list = currencyDaysArr[i].Valute;
    for (var key in list) {
      if(currentCur == list[key].CharCode){
        renderData.push(list[key].Value);
        break;
      }
    }
  }
  drawGraph(renderData)
}

function drawGraph(arr){
  // define document width and height
  var width = 500, height = 500
  // create SVG document and set its size
  var draw = SVG('drawing').size(width, height)
  draw.viewbox(0,0,500,500)
  // draw background
  var dis = 0;
  for (var i=0;i<10;i++){  
    var background = draw.rect(width, 50).move(0, dis).fill('grey');
    var background = draw.rect(width, 50).move(0, dis+50).fill('lightgrey');
    dis += 100;
  }
  // draw lines
  var left = 2;
  for (var i=0;i<4;i++){  
    var line = draw.line(width*(left/10), 0, width*(left/10), height)
    line.stroke({ width: 2, color: '#fff'})
    left += 2;
  }

  // draw columns 
  var left = 1;
  var columnWidth = 30;
  for (var i=0;i<arr.length;i++){    
    var columnHeight = arr[i]*5;
    var str = String(arr[i]);
    var background = draw.rect(columnWidth, columnHeight).move(width*(left/10)-(columnWidth/2), (height-columnHeight)).fill('pink');
    var scoreLeft = draw.text(str).font({
      size: 20,
      family: 'Menlo, sans-serif',
      anchor: 'middle',
      fill: 'black'
    }).move(width*(left/10), (height-columnHeight-22));
    left += 2;
  }
}




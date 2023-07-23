function IFrameURLSet(el){
  // 20230723: StarTree
  var elIB = el.previousElementSibling;
  var elIF = el.parentNode.nextElementSibling;
  elIF.src = elIB.value;
}


function PanelAdd(el){
  // 20230722: StarTree
  var elMA = document.getElementById("MainArea");
  var elNPT = document.getElementById("NewPanelTemplate");
  var elTemp = document.createElement("div");
  elTemp.innerHTML = elNPT.innerHTML;
  elTemp.classList.add('mbPanel');

  elMA.appendChild(elTemp);
  
  //elMA.innerHTML += "<div class='mbPanel'><button class='mbbutton' onClick='PanelRemove(this)' style='float:right'>❌</button>Panel<br>" + 
  //"<iframe src='https://panarcana.blogspot.com/p/viewer.html?id=P202303052122' title='Migration Node' style='border:none;width:100%;height:85vh' ></iframe></div>";

}
function PanelRemove(el){
  // 20230722: StarTree
  el.parentNode.remove();
}
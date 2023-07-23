function PanelAdd(el){
  // 20230722: StarTree
  var elMA = document.getElementById("MainArea");
  
  
  el.parentNode.nextElementSibling;
  elMA.innerHTML += "<div class='mbPanel'><button class='mbbutton' onClick='PanelRemove(this)' style='float:right'>❌</button>Panel</div>";

}
function PanelRemove(el){
  // 20230722: StarTree
  el.parentNode.remove();

}
function IFrameURLSet(el){
  // 20230723: StarTree
  var elIB = el.previousElementSibling;
  var elIF = el.parentNode.nextElementSibling;
  var mInput = elIB.value;
  // 20230723: StarTree If the URL does not contain a dot, assume that it is a node ID.
  if(!mInput.includes(".")){
    mInput = "https://panarcana.blogspot.com/p/viewer.html?id=" + mInput;
  }
  elIF.src = mInput;
}


function PanelAdd(el){
  // 20230722: StarTree
  var elMA = document.getElementById("MainArea");
  var elNPT = document.getElementById("NewPanelTemplate");
  var elTemp = document.createElement("div");
  elTemp.innerHTML = elNPT.innerHTML;
  elTemp.classList.add('mbPanel');

  elMA.appendChild(elTemp);

}
function PanelRemove(el){
  // 20230722: StarTree
  el.parentNode.remove();
}
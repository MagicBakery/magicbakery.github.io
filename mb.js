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
  var mPanel = SearchPS(el,'control');
  mPanel.parentNode.remove();
}

// IMPORTED FUNCTIONS
function SearchPS(el,iAttribute){
  // 20230301: Evelyn: Made function for the part shared by QueryAllPSN and ShowLPSN
  // 20230308: LRRH: changed the check for missing iAttribute to undefined.
  if(iAttribute==undefined || iAttribute==""){iAttribute="top";}
  var elTarget = el.parentNode;
  while(elTarget != null && elTarget.getAttribute(iAttribute)==null){
    elTarget = elTarget.parentNode;
  }
  return elTarget;
}
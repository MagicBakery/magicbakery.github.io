function DEBUG(iStr){
  console.log(iStr);
}
function ArchiveSelect(iNodeID){
	// 20230821: StarTree: ARCHIVE SELECTION
  //   Upgrade: The input string could be the full node ID. In that case, just take the first 8 digits.  
  var iDate = iNodeID.substring(0,8);
  if(parseInt(iDate) < 20230101){
	  return "./Archive1.html ";
  }else{
    return "./Archive2.html ";
  }
}
function BoardAdd(el){
  // 20230821: StarTree: Adds a container immediately below the control section
  var elTemp = document.createElement("div");
  elTemp.classList.add('mbscroll');

  // STEP: Add the close button.
  var mHTML = "<div control>";
  mHTML += "<button class='mbbutton' onClick='PanelRemove(this)' style='float:right' title='Close'>🍮</button>";
  mHTML += "</div><div class='mbCB'></div>";
  elTemp.innerHTML= mHTML;
  var mControl = SearchPS(el,'control');
  mControl.after(elTemp);
  return elTemp;
}
function BoardFill(el,iNodeID){
  // 20230821: StarTree: Fill the Board container with content from the node.
  //   The node ID does not have a leading P.
  //   Reference function: LoadArchivePostEl from Blogspot.

  // STEP: Create a container within the Board after the control section for the content.
  //       ((The board itself has a close button))
  var elContainer = document.createElement("span");
  el.append(elContainer)  ;

  // STEP: Get Archive
  var mArchive = ArchiveSelect(iNodeID);
  var mQuery = "#P" + iNodeID;

  // STEP: JQuery
  $(document).ready(function(){
    $(elContainer).load(mArchive + mQuery, function(){	


    }); // END JQuery Load
  }); // END Document ready
}
function GetInputBoxValue(el){
  // 20230821: StarTree: This gets the first input box within the control section.
  var mControl = SearchPS(el,'control');
  var elIB = mControl.getElementsByTagName('input')[0];
  return elIB.value;
}
function IFrameURLSet(el){
  // 20230723: StarTree
  var elIF = el.parentNode.nextElementSibling;
  var mInput = GetInputBoxValue(el);
  // 20230723: StarTree If the URL does not contain a dot, assume that it is a node ID.
  if(!mInput.includes(".")){
    mInput = "https://panarcana.blogspot.com/p/viewer.html?id=" + mInput;
  }
  elIF.src = mInput;
}

function JQAdd(el){
  // 20230821: StarTree: Add to JQuery from GitHub Archive.
  //   Reads the node ID from the input box of the control section.
  //   Creates a new container with a close button below the control section for the content.

  // STEP: Reading the content of the input box
  var mInput = GetInputBoxValue(el);
  // If the input value starts with a P, remove it.
  if(mInput.charAt(0)=='P'){mInput = mInput.substring(1);}

  // STEP: Create a new container with a close button.
  var elBoard = BoardAdd(el);

  // STEP: Fill the board with node content
  BoardFill(elBoard,mInput);


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
  var mControl = SearchPS(el,'control');
  mControl.parentNode.remove();
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
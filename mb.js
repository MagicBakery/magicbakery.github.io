//========SITE SPECIFIC FUNCTIONS
function _At(iLoc){
  // 20230916: StarTree: This function is for the code to know whether it is being run from BlogSpot or GitHub.
  //           The content of this function should be different depending on where the code is placed.
  switch(iLoc){
    case "BlogSpot":
      return false;
    case "GitHub":
      return true;
  }
  return false;
}
//========SHARED FUNCTIONS
function AtBlogSpot(){
  // 20230916: StarTree: Return true if this code is at BlogSpot
  return _At("BlogSpot");
}
function AtGitHub(){
  // 20230916: StarTree: Return true if this code is at GitHub
  return _At("GitHub");
}
function BasePath(){
  // 20230916: StarTree: Returns the base path depending on where the code is running at.
  if(AtGitHub()){
    return "./";
  }
  return "../../p/";
}
function BoardAdd(el){
  // 20230821: StarTree: Adds a container immediately below the control section
  var elTemp = document.createElement("div");
  elTemp.classList.add('mbscroll');

  // STEP: Add the close button.
  var mHTML = "<div control>";
  mHTML += "<a class='mbbutton' onClick='PanelRemove(this)' style='float:right' title='Close'>🍮</a>";
  mHTML += "</div><div class='mbCB'></div>";
  elTemp.innerHTML= mHTML;
  elTemp.style.marginBottom = "0px";
  var mControl = SearchPS(el,'control');
  mControl.nextElementSibling.prepend(elTemp);
  return elTemp;
}
function BoardFill(elBoard,iNodeID){
  // 20230821: StarTree: Fill the Board container with content from the node.
  //   The node ID does not have a leading P.
  //   Reference function: LoadArchivePostEl from Blogspot.

  // For Testing: if iNodeID is blank, use this default:
  if(iNodeID==""){iNodeID="202303052122";};

  // STEP: Create a container within the Board after the control section for the content.
  //       ((The board itself has a close button))
  var elContainer = document.createElement("span");
  
  


  // STEP: Get Archive
  var mArchive = ArchiveSelect(iNodeID);
  var mQuery = "#P" + iNodeID;

  // STEP: JQuery
  $(document).ready(function(){
    $(elContainer).load(mArchive + mQuery, function(){	
      Macro(elContainer);
      NodeFormatter(elContainer);
      elContainer.innerHTML = elContainer.firstElementChild.innerHTML;
      elBoard.firstElementChild.after(elContainer);
    }); // END JQuery Load
  }); // END Document ready
}

function GetInputBoxValue(el){
  // 20230821: StarTree: This gets the first input box within the control section.
  var mControl = SearchPS(el,'control');
  var elIB = mControl.getElementsByTagName('input')[0];
  return elIB.value;
}
function IFrameRefresh(el,mNodeID){
  // 20230916: StarTree: Refresh the content of Iframe when user clicks elButton.
  var elIF = el.parentNode.getElementsByTagName("iframe")[0];
  elIF.src = "https://panarcana.blogspot.com/p/viewer.html?id=P" + mNodeID;
}
function IFrameURLSet(el){
  // 20230723: StarTree: This function is for GitHub Website
  var mControl = SearchPS(el,'control');
  
  var mInput = GetInputBoxValue(el);
  // 20230723: StarTree If the URL does not contain a dot, assume that it is a node ID.
  // 20230916: Just get the last 12 in order to show node ID on title
  var mNodeID = mInput.substr(mInput.length - 12);
  if(IsBlank(mNodeID)){mNodeID = "202303052122";}
  mInput = "https://panarcana.blogspot.com/p/viewer.html?id=P" + mNodeID;

  // 20230916: Always make a new iFrame 
  // <div>
  //   <button class='mbbutton' onClick='RemoveParent(this)' style='float:right;margin-bottom:-20px;margin-right:20px;position:relative;z-index:1' title='Close'>🍮</button>
  //   <iframe src='https://panarcana.blogspot.com/p/viewer.html?id=P202303052122' title='Blogspot Node' style='margin:0px -3px;border:none;width:100%;height:calc(100vh - 136px)' allow='clipboard-read; clipboard-write'></iframe>
  // </div>
  var mHTML = "<a class='mbbutton' onClick='RemoveParent(this)' style='float:right' title='Close'>🍮</a>";
  mHTML += "<a onClick='IFrameRefresh(this," + mNodeID + ")' title='Refresh'>🧭</a> <a class='mbbutton' onClick='HideNext(this)' title='Data from Blogspot'>Blogspot " + mNodeID + "</a>";
  mHTML += "<iframe src='" + mInput + "' title='Blogspot Node' style='border:none;width:100%;height:calc(100vh - 190px)' allow='clipboard-read; clipboard-write'></iframe>";
  var elTemp = document.createElement("div");
  elTemp.innerHTML = mHTML;
  elTemp.classList.add('mbscroll');
  elTemp.style.marginBottom = "0px";
  mControl.nextElementSibling.prepend(elTemp);  
  
}
function JQAdd(el){
  // 20230821: StarTree: Add to JQuery from GitHub Archive.
  //   Reads the node ID from the input box of the control section.
  //   Creates a new container with a close button below the control section for the content.

  // STEP: Reading the content of the input box
  // 2023
  var mInput = GetInputBoxValue(el);
  var mNodeID = mInput.substr(mInput.length - 12);

  // STEP: Create a new container with a close button.
  var elBoard = BoardAdd(el);

  // STEP: Fill the board with node content
  BoardFill(elBoard,mNodeID);
}
function InterLink(){
  // 20231006: Black: Returns the Interlinking function depending on current website
  if(AtGitHub()){
    return "BoardLoad(this,";
  }
  return "QueryBanner(";
}
function BoardLoad(el,iNodeID){
  // 20231006: Black: Make a board in the current column panel given the ID.
  // STEP: Search up for the column control panel
  var mControl = SearchPS(el,'panel').firstElementChild;
  // STEP: Create a new container with a close button.
  var elBoard = BoardAdd(mControl);
  BoardFill(elBoard,iNodeID);
}
function PanelAdd(){
  // 20230722: StarTree
  var elMA = document.getElementById("MainArea");
  var elNPT = document.getElementById("NewPanelTemplate");
  var elTemp = document.createElement("div");
  elTemp.innerHTML = elNPT.innerHTML;
  elTemp.classList.add('mbPanel');
  elTemp.setAttribute("panel","");

  elMA.appendChild(elTemp);

}
function PanelRemove(el){
  // 20230722: StarTree
  var mControl = SearchPS(el,'control');
  mControl.parentNode.remove();
}
function RemoveParent(el){
  // 20230916: StarTree: For hiding iframe.
  el.parentNode.remove();
}

//==IMPORTED FUNCTIONS===
function ArchiveIndex(ei){
  return BasePath() + "archive" + ei + ".html ";
}
function ArchiveNum(){
  return 2;
}
function ArchiveSelect(iNodeID){
	// 20230821: StarTree: ARCHIVE SELECTION
  //   Upgrade: The input string could be the full node ID. In that case, just take the first 8 digits.  
  var iDate = iNodeID.substring(0,8);
  if(parseInt(iDate) < 20230101){
	  return BasePath() + "archive1.html ";
  }else{
    return BasePath() + "archive2.html ";
  }
}
function CH15LoadThisMonth(){
  const monthNames = ["January","February","March","April","May","June","July",
                    "August","September","October","November","December"];
  var today = new Date();
  var pageID = monthNames[today.getMonth()];
  var page = document.getElementById(pageID);
  //if(page!=null){
    Peekaboo("SideViewer",pageID); 
    return true;
  //}
}
function ChName(iChID){
  // 20230331: Sasha
  switch(Number(iChID)){
    case 11: return "Carrot";
    case 12: return "Manga";
    case 13: return "Seed";
    case 14: return "Vacation";
    case 15: return "Happy";
    case 16: return "Dungeon";
    case 17: return "Music";
    case 18: return "Board";
    case 19: return "Puzzle";
    case 20: return "Skill";
    case 21: return "Treasure";
    case 22: return "Wish";
    case 23: return "Arena";
    case 24: return "Paladin";
    case 25: return "Whale";
    case 26: return "Book";
    case 27: return "Guild";
    case 28: return "Freedom";
    case 29: return "Mira";
    case 30: return "Cardinal";
    case 31: return "Detective";
    case 33: return "Tavern";
    case 34: return "Scape";
    default: return "Unknown";
  }
}
function DEBUG(iStr){
  console.log(iStr);
}
function Default(e,mDefault){
  // 20230319: Kisaragi
  return NotBlank(e)? e:mDefault;  
}
function DefaultView_15(){
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var day = urlParams.get('day');
  var month = urlParams.get('month'); 
  var pageID = "Day"+day
  var page = document.getElementById(pageID);
  if(page!=null){
    Peekaboo("CalendarViewerCH15",pageID); 
    return;
  }

  pageID = month;
  page = document.getElementById(pageID);
  if(page!=null){
    ShowTextInWnd(month,"CalendarViewerCH15"); 
    return;
  }
  
  var today = new Date();
  pageID = "Day"+String(GetDayNumber(today));
  page = document.getElementById(pageID);
  if(page!=null){
    ShowTextInWnd(pageID,"CalendarViewerCH15"); 
    return;
  }
  if(CH15LoadThisMonth()){
    return;
  }
}
function FlexShow(elThis){
  /* FlexShow 
  /* By Black (2022-07-01)
  /* Context: 
  /* The parent of this is a Flex object within a Flex container.
  /* The sibling of this is the container to show or hide.
  /* The first child of this is may be the corner image. 
  /* Clicking on this toggles whether the sibling is shown or hidden:
  /* If hidden, set Parent Flex to 100% and set sibling as a block.
  /* If shown, set Parent Flex to 40% and set sibling display to none.
  /* About reading float: https://stackoverflow.com/questions/39041889/how-to-get-the-float-value-of-a-div
  /*
  /* Addition by Ivy (2022-07-01)
  /* To support querying content, this function will also scan for query strings and replace them when queried content.
  /* Query tag format example: <jq>[data-moment-Ivy]</jq>
  /*
  /* Replacing HTML DOM: https://www.javascripttutorial.net/dom/manipulating/replace-a-dom-element/
  /*/
  var eTar = elThis.nextElementSibling;  
  var elImage = elThis.firstElementChild;
  var elParent = elThis.parentNode;

  if(eTar==null){Macro(elThis);return;}

  // 20230220: StarTree: Upgrading to use getComputedStyle for visibility
  if(window.getComputedStyle(eTar).display==="none"){
  //if( eTar.style.display != "block"){

    elParent.style.flex = "100%";
	  /* 2022-07-05: Patricia: Screen.width did not work for CH26 */
    /*if( screen.width > 400 ){*/
    if((elParent.getBoundingClientRect()).width > 500){  
  	  elParent.style.order = -1;
  	}
    if(eTar.nodeName == "HIDE"){
      eTar.style.display = "block";
    }else{
      eTar.style.display = "";
    }
    eTar.classList.remove("mbhide");
    
  	//eTar.style.display = "block";

    Macro(eTar);
    /*
    var z = elNext.getElementsByTagName("jq");
    var elJQ, i, elNew;
    for (i=0;i<z.length;i++){
      elJQ = z[i];
      QueryAllReplace(elJQ,elJQ.innerHTML);
    }*/
    if(elImage!=null){
	    if(window.getComputedStyle(elImage).float == "right"){
  	    /*elImage.style.height = "50px";
	      elImage.style.width = "50px";*/
      }
    }
  }else{ /* Collapsing */
    /*if(window.getComputedStyle(elParent).width > 400){*/
	  /* 2022-07-03: Evelyn: Changed for CH 15.*/
    
    /*if((elParent.getBoundingClientRect()).width < 500){
      elParent.style.flex = "100%"; 
  	}else{
      elParent.style.flex = "30%"; 
    }*/
    if((elParent.getBoundingClientRect()).width > 500){ 
      if(elImage!=null){
	      if(window.getComputedStyle(elImage).float == "right"){
   	      //elImage.style.height = "100px";
	        //elImage.style.width = "100px";
        }
      }
	  } 
    elParent.style.order = 0;
    eTar.style.display = "none";
    elParent.style.flex = "250px"; 
  }
}
function FortuneCookie(elViewer,isRandom){
  // JQUERY
  // 20230201: StarTree: The Fortune Cookies node is 202302011021!
  $(document).ready(function(){
    $(elViewer).load(ArchiveSelect("20230201") + "#Cookies", function(){
      var cookies = $('.mbFC');
      var cookiesNum = cookies.length;
      var idx = 0;
      if(!isRandom){
		    var daynum = RandomToday();
		    idx = Math.floor(daynum * cookiesNum) % cookiesNum;
      }else{
        idx = Math.floor(Math.random()*cookies.length);
      }
	    var message = cookies[idx].innerText;
      var backup = elViewer.innerText;
      elViewer.innerText = message;   
      $(elViewer).show();            
    });
  });
}
function FortuneCookieNext(elThis,isRandom){
  // 20230201: StarTree: Modified for Fortune Cookie node
  var elViewer = elThis.nextElementSibling;
  FortuneCookie(elViewer,isRandom);  
}
function FortuneCookieP(elThis,isRandom){
  // P = Parent here
  // 20230201: StarTree: Modified for Fortune Cookie node
  var elViewer = elThis.parentNode;
  FortuneCookie(elViewer,isRandom);  
}
function FortuneCookiePNC2(elThis,isRandom){
  // P = Parent here
  // 20230201: StarTree: Modified for Fortune Cookie node
  var elViewer = elThis.parentNode;
  elViewer = elViewer.nextElementSibling;
  elViewer = elViewer.firstElementChild;
  elViewer = elViewer.firstElementChild;
  FortuneCookie(elViewer,isRandom);  
}
function FortuneCookiePrev(elThis,isRandom){
  // 20230201: StarTree: Modified for Fortune Cookie node
  var elViewer = elThis.previousElementSibling;
  FortuneCookie(elViewer,isRandom);  
}
function GetDayNumber(date){
  var MonthLUT = Object.freeze([0,31,60,91,121,152,182,213,243,274,305,335]);
  var mm = date.getMonth();
  var dd = date.getDate();
  return MonthLUT[mm]+dd;
}
function GetDayText(iDate){
  var WeekdayLUT = Object.freeze(['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']);
  return WeekdayLUT[iDate.getDay()];
}
function GetMonthText(iDate){
  var MonthLUT = Object.freeze(['January','February','March','April','May','June','July','August','September','October','November','December']);
  return MonthLUT[iDate.getMonth()];
}
function GuessContainerWidth(el){
  // 20230225: StarTree
  var mCheckNode = el;
  var mFrameWidth = 0;
  while(mFrameWidth==0 && mCheckNode != null){
    mCheckNode = mCheckNode.parentNode;
    try{
      mFrameWidth = mCheckNode.getBoundingClientRect().width;
    }catch(e){
      mFrameWidth = 0;
    }
    
  }
  return mFrameWidth;
}
function HappyScaleNext(elThis){
  LoadDivNext(elThis,'../../2021/12/evelyns-garden','HappyScale');
}
function HideEl(el){
  el.classList.add("mbhide");
  if(window.getComputedStyle(eTar).display != "none"){
    el.style.display = "none";
  }
}
function HideNext(el) {
  var eNext = el.nextElementSibling;
  if (eNext.style.display != "none") {
      eNext.style.display = "none";
  } else {
      eNext.style.display = "block";
  }
}
function HideNextInline(el) {
  var eNext = el.nextElementSibling;
  if (eNext.style.display != "none") {
      eNext.style.display = "none";
  } else {
      eNext.style.display = "inline";
  }
}
function HideP3(el){
  HideEl(el.parentNode.parentNode.parentNode);
}
function IsBlank(e){
  // 20230310: Zoey
  return ((e=== undefined) || (e==="") || (e=== null) || (e.length==0));
}
function LangIcon(eCode){
  // 20230311: StarTree: Added for Manga display
  switch(eCode){
    case "EN": return "🇬🇧";
    case "FR": return "🇫🇷";
    case "JA": return "🇯🇵";
    default:   return "🇬🇧";
  }
}
function LnkCode(iID,iDesc,iIcon){
  // 20230323: Ivy: For QSL.
  var mHTML =  "<a class='mbbuttonIn' href='" + ViewerPath() + "?id=P"+iID+"'";
  mHTML += " onclick=\"" + InterLink() + "'" + iID + "');return false;\">";
  if(IsBlank(iIcon)){
    mHTML += iDesc + "</a>";
  }else{
    mHTML += "<span class='mbILB30'>" + iIcon + "</span></a>" + iDesc;
  }
  return mHTML;
}
function MacroAlias(elScope){
  var z = elScope.getElementsByTagName("alias");
  var elJQ, i;
  for (i=0;i<z.length;i++){
    elJQ = z[i];
    QueryAllReplace(elJQ,elJQ.innerHTML);
  }
}
function Macro(elScope){
  // MACRO FORMATTER
  // 20220712: Natalie: So that Quest Lists can query quests.
  // 20230220: Ivy: Added MacroLL for languages
    ProcessNodeData(elScope);
    MacroMacro(elScope);
    MacroJQ(elScope);
    MacroLnk(elScope);
}
function MacroID(eScopeID){
  var elScope = getElementById(eScopeID);
  Macro(elScope);
}
function MacroJQ(elScope){
  // 2022-10-15: Zoey: Separated MacroJQ from Macro
  var z = elScope.getElementsByTagName("jq");
  var elJQ, i;
  var hit = z.length;
  for (i=0;i<hit;i++){
    elJQ = z[i];
    QueryAllReplace(elJQ,elJQ.innerHTML);  
  }
  return hit;
}
function MacroLL(el,mMacro){
  // 20230220: Ivy: Added for language translation <ll>
  // 20230225: StarTree: Changing the call to <macro> with cmd "ll"
  //           el is the node with <macro>
  mParent = el.parentNode;
  mAuthor = mParent.getAttribute("author");
  mDate = mParent.getAttribute("date");
  mTime = mParent.getAttribute("time");
  if(mMacro.desc==null){mMacro.desc = mMacro.en;}
  if(mMacro.desc==null){mMacro.desc = "💬";}
  mDescStr = "<hr class=\"mbhr0\">" + mMacro.desc;
  var elTemp = document.createElement("div");  
  var mHTML = "<span>";
  mHTML += "<div class=\"mbpointer mbav50r mb" + mAuthor + "\" onclick=\"ShowLPN(this)\">";
  mHTML += "<hide>" + mDescStr + "</hide></div>";
  mHTML += "<small style=\"margin-right:5px\"><b>" + mDate + mTime + "</b></small>";
  if(NotBlank(mMacro.en)){
    mHTML += "<button class=\"mbbutton\" onclick=\"ShowNextPN(this)\">🇬🇧</button>";
    mHTML += "<hide><hr class=\"mbhr0\">" + mMacro.en + "</hide>";
  }
  if(NotBlank(mMacro.fr)){
    mHTML += "<button class=\"mbbutton\" onclick=\"ShowNextPN(this)\">🇫🇷</button>";
    mHTML += "<hide><hr class=\"mbhr0\">" + mMacro.fr + "</hide>";
  }
  if(NotBlank(mMacro.ja)){
    mHTML += "<button class=\"mbbutton\" onclick=\"ShowNextPN(this)\">🇯🇵</button>";
    mHTML += "<hide><hr class=\"mbhr0\">" + mMacro.ja + "</hide>";
  }
  if(NotBlank(mMacro.hk)){
    mHTML += "<button class=\"mbbutton\" onclick=\"ShowNextPN(this)\">🇭🇰</button>";
    mHTML += "<hide><hr class=\"mbhr0\">" + mMacro.hk + "</hide>";
  }
  if(NotBlank(mMacro.img)){
    mHTML += "<button class=\"mbbutton\" onclick=\"ShowNextPN(this)\">🖼️</button>";
    mHTML += "<hide><hr class=\"mbhr0\">" + "<macro>{\"cmd\":\"img\",\"src\":\""+ mMacro.img+"\"}</macro>" + "</hide>";
  }
  
  //mHTML += "<div class=\"mbCB\"></div></span>";
  mHTML += "</span>";
  mHTML += "<div>" + mDescStr + "</div>";
  elTemp.innerHTML = mHTML;
  Macro(elTemp);
  el.after(elTemp);
  return;
}
function MacroLnk(elScope){
  /* 2022-10-15: Zoey: Added MacroLnk to help reduce the text size of Archive 
   and make it easier to edit 
   Usage: 
   In the Archive, typing 
     "<lnk>202207041052 | 📗 Book of Life</lnk>""
   Would be interpreted as: 
     "<a class="mbbuttonIn" href="" + ViewerPath() + "?id=P202207041052">📗 Book of Life</a>"
     */
  /* 20230310: Cardinal: Load to main area if the device is not a mobile.
      <a class="mbbutton" href="https://panarcana.blogspot.com/p/viewer.html?id=P202302201503" onclick="" + InterLink() + "'#P202301251008');return false;" >🔮</a>
  */
  var z = elScope.getElementsByTagName("lnk");
  var elJQ, i;
  var hit = z.length;
  for (i=0;i<hit;i++){
    elJQ = z[i];
    cmd = elJQ.innerHTML;
    cmds = cmd.split("|");
    // NEW Code

    AddElement(elJQ,"span",LnkCode(cmds[0],cmds[1]));

    /*
    mQB = "";
    if(true || !AtMobile()){ // 20230312: Disabled check because the new Back is working.
      mQB = " onclick=\"" + InterLink() + "'" + cmds[0] + "');return false;\"";
    }
    elTemp.innerHTML = "<a class='mbbuttonIn' href='" + ViewerPath() + "?id=P"+cmds[0]+"'"+mQB+">"+cmds[1]+"</a>";
    var elTemp = document.createElement("span");
    elJQ.after(elTemp);
    */
    
  }
  for (i=0;i<hit;i++){
    z = elScope.getElementsByTagName("lnk");
    z[0].remove();
  }
  return hit;
}
function MacroMacro(elScope){
  // 20230222: Mikela: Added for <macro>
  // Arguments: cmd, node, desc

  var z = elScope.getElementsByTagName("macro");
  var hit = z.length;
  if(hit<=0){return;}
  var i;
  for (i=0;i<hit;i++){
    MMInner(z[i],JSON.parse(z[i].innerHTML));
  }
  for (i=0;i<hit;i++){
    z = elScope.getElementsByTagName("macro");
    z[0].remove();
  }
  return hit;
}
function MC3Resize(el){    
  if(el.getBoundingClientRect().width >= 750){    
    el.classList.add("mbMC3");
  }else{
    el.classList.remove("mbMC3");
  }
}
function MMInner(el,mMacro){
  // 20230223: StarTree
  var mHTML = "";
  mCmd = "";
  mNode = mMacro.node;
  mInner = "";
  if(mMacro.cmd=="index"){
    mDesc = mMacro.desc;
    mKeys = mMacro.keys;
    mIcon = mMacro.icon;
    mURL = mMacro.url;
    mDifficulty = mMacro.difficulty; mDiffStr="";
    if(NotBlank(mDifficulty)){
      mStar = "⭐";
      mDiffStr = "<small style='float:right'>" + mStar.repeat(Number(mDifficulty)) + "</small>";
    }

    if(NotBlank(mURL)){
      mIcon = "📌";
      mHTML = mDiffStr + "<a class='mbbuttonEx' onclick=\"ExURL('" + mURL + "');return false\" href='"+ mURL +"'>";
      mHTML += "<span class='mbILB25'>" + mIcon + "</span> "  + mDesc + "</a>"
    }else{
      mHTML = mDiffStr + "<lnk>" + mNode + "|<span class='mbILB25'>" + mIcon + "</span> "  + mDesc + "</lnk>";
    }    
    mHTML += "<hide>" + mKeys + "</hide>";
    AddElement(el,"div",mHTML);
    return
  }
  if(mMacro.cmd=="Wide"){
    if(GuessContainerWidth(el) >= 750){
      var elTar = el.nextElementSibling;
      if(mMacro.display != null){ elTar.style.display = mMacro.display;}
      if(mMacro.flex != null){ elTar.style.flex = mMacro.flex;}
      if(mMacro.float != null){ elTar.style.float = mMacro.float;}
      if(mMacro.width != null){ elTar.style.width = mMacro.width;}
      if(mMacro.minWidth != null){ elTar.style.minWidth = mMacro.minWidth;}
      if(mMacro.marginLeft != null){ elTar.style.marginLeft = mMacro.marginLeft;}
      if(mMacro.marginRight != null){ elTar.style.marginRight = mMacro.marginRight;}
      if(mMacro.marginTop != null){ elTar.style.marginTop = mMacro.marginTop;}
    }
    return;
  }
  if(mMacro.cmd=="ll"){
    MacroLL(el,mMacro);
    return;
  }
  if(mMacro.cmd=="MC3"){
    if(GuessContainerWidth(el) >= 750){
      el.nextElementSibling.classList.add("mbMC3");
    }else{
      el.nextElementSibling.classList.remove("mbMC3");
    }
    return;
  }
  if(mMacro.cmd=="LAP3Ni"){mCmd="LAP3N"; mNode="P"+mNode; mInner=",true";}
  if(mMacro.cmd=="QueryAllP3Ni"){mCmd="QueryAllP3N"; mNode="#P"+mNode; mInner=",true";}
  if(mMacro.cmd=="QueryAllPSNi"){mCmd="QueryAllPSN"; mNode="#P"+mNode; mInner=",true";}
  if(mCmd!=""){
    // <div class="mbscroll">
    //   <div class="mbbutton" onclick="LAP3N(this,'P202207101102')">🍹 Jamba You</div>
    // </div>
    var elTemp = document.createElement("div");
    elTemp.classList.add("mbscroll");
    mHTML = "<div class=\"mbbutton\" onclick=\"" + mCmd;
    mHTML += "(this,\'" + mNode + "\'" + mInner + " )\">" + mMacro.desc + "</div>";
    elTemp.innerHTML = mHTML;el.after(elTemp);return;
  }
  if(mMacro.cmd=="mangapages" || mMacro.cmd=="mangapages2"){
    mStart = Number(mMacro.startpage);
    mEnd = Number(mMacro.endpage);
    mLang = mMacro.lang; if(IsBlank(mLang)){mLang="EN"}; mLang = mLang.toUpperCase();
    mChapter = mMacro.chapter;
    mHTML = LangIcon(mLang) + " ";
    for(var i=mStart;i<=mEnd;i++){
      mPad = i.toString().padStart(2,'0');
      mImgFileName= "";
      if(mMacro.cmd=="mangapages2"){ // New Format of Chapter 15
        mImgFileName = "CH" + mChapter + "_" + mPad + "_"+ mLang +".png";
      }else{ // Old Format of Chapter 16
        mImgFileName = "CH" + mChapter + "_"+ mLang +"_" + mPad + ".png";
      }
      mHTML += "<button class='mbbutton' onclick='ShowNextP2P(this)'>"+mPad+"</button>";
      mHTML += "<hide>";
      mHTML += "<div style='display:flex;justify-content: center;'>";  
      mHTML += "<div style='max-width:600px'><img src='https://github.com/MagicBakery/Images/blob/main/" + mImgFileName;
      mHTML += "?raw=true' style='max-width:100%'></div>";
      mHTML += "</div></hide>";
      /*<button class="mbbutton" onclick="ShowNextPP(this)">00</button>
        <hide>
          <img src="https://github.com/MagicBakery/Images/blob/main/CH16_EN_00.png?raw=true">
        </hide>*/
    }
    var elTemp = document.createElement("div"); //<div style="text-align:center">
    elTemp.style.textAlign="center";
    elTemp.innerHTML = mHTML;
    el.after(elTemp);
    return;
  }
  // NEW TYPE: Alphabetical Order
  if(mMacro.cmd=="colorsquares"){ //(div) Ch15 color therapy
    // 20230412: Evelyn: Default: make a 10x10 area.
    // <div class="mbpointer" onclick="ColorSquare(this)" style="display:inline-block;height:30px;width:30px;background-color: brown;"></div>
    mHTML = "";
    for(var c=0;c<10;c++){
      for(var r=0;r<10;r++){
        mHTML += "<div class='mbpointer' onclick='ColorSquare(this)' style='display:inline-block;height:25px;width:25px;background-color:";
        mHTML += getRandomColor1("");
        mHTML += "'></div>";
      }
      mHTML += "<br>";
    }
    elTemp=AddElement(el,"div",mHTML);
    elTemp.style.textAlign="center";
    elTemp.style.lineHeight="0px";
    elTemp.style.paddingTop="15px";
    elTemp.style.paddingBottom="15px";
    return;
  }
  if(mMacro.cmd=="daisy"){
    // 20230331: Sasha: For daily update list
    // Turn:
    //   <macro>{"cmd":"daisy","today":"20230331","activities":"[
    //     {"ch":"12","rank":"S","updates":"8","last":"20230331"},
    //     ...
    //   ]"}</macro>
    // Into:
    //   <div style="padding: 10px 0px 10px 25px;">
    //     <div></div><span class='mbILB25 mbRankBlkS' style='margin-left:-25px'></span>
    //     <a class='mbbutton' onclick='QueryMainCh(12)'>&nbsp;Manga<small></small>&nbsp;</a>
    //     ...
    //   </div>

    var mActivities = mMacro.activities;
    mRankCur = "";
    mToday = Number(mMacro.today);

    // Sort the list first by rank, then by updates, last by update date.
    var mChange = false;
    do{
      mChange = false;
      for(i=1;i<mActivities.length;i++){
        mPrev = mActivities[i-1];
        mCur = mActivities[i];
        mPleaseSwap = false;
        if(RankNum(mPrev.rank) < RankNum(mCur.rank)){
          mPleaseSwap = true;
        }else if(RankNum(mPrev.rank) == RankNum(mCur.rank)){
          if(Number(mPrev.updates) < Number(mCur.updates)){
            mPleaseSwap = true; 
          }else if(Number(mPrev.updates) == Number(mCur.updates)){
            if(Number(mPrev.last) > Number(mCur.last)){
              mPleaseSwap = true;
            }else if(Number(mPrev.last) == Number(mCur.last)){
              if(ChName(mPrev.ch) > ChName(mCur.ch)){
                mPleaseSwap = true;
              }
            }            
          }          
        }
        
        if(mPleaseSwap){
          mActivities[i-1] = mCur;
          mActivities[i] = mPrev;
          mChange = true;
        }
      }
    }while(mChange);


    mHTML = "";
    for(i=0;i<mActivities.length;i++){
      mCh = mActivities[i].ch;
      mRank = mActivities[i].rank;
      mUpdates = mActivities[i].updates;
      if(mRankCur != mRank){
        mRankCur = mRank;
        mHTML += "<div></div><span class='mbILB25 mbRankBlk" + mRankCur;
        mHTML += "' style='margin-left:-25px'></span>";
      }
      mHTML += "<a class='mbbutton' onclick='QueryMainCh("+ mCh +")' ";
      mHTML += "title='Total Updates: " +mUpdates+ "\nLast on: " +mActivities[i].last + "'>&nbsp;";
      mHTML += ChName(mCh);    
      if(NotBlank(mActivities[i].last)){
        mLast = Number(mActivities[i].last);
        if(mLast >= mToday){
          mHTML += "<small>✅</small>";
        }
      }
      mHTML += "&nbsp;</a> ";
      
    }
    var elTemp = AddElement(el,"div",mHTML);
    elTemp.style.padding="10px 0px 10px 25px";
    return;
  }
  if(mMacro.cmd=="daisy2"){ // DIV: Daily Status. Full version
    // 20230520: StarTree: Replaces daisy and scone
    // Macro:
    // <macro>{"cmd":"daisy2","issues":"9","quests":"1260","activities":[
    //   ],"players":"","merits":"","recognitions":"","kudos":"","awards":"","top":[
    // ]}</macro>
    mToday = Number(el.parentNode.getAttribute("date"));
    mHTML  = "<hr class='mbhr'>";
    mHTML += "<div class='mbbutton mbpc' onclick='ShowNext(this)'>";
    mHTML += "Issues: " + mMacro.issues + " | Quests: " + mMacro.quests + "</div>";
    mHTML += "<div class='mbhide'>";    
    { // CHARTER SCORES (daisy)
      mActivities = mMacro.activities;
      mRankCur = "";  
      var mChange = false;
      mHTML += "<div style='padding: 10px 0px 10px 25px;''>";
      do{
        mChange = false;
        for(i=1;i<mActivities.length;i++){
          mPrev = mActivities[i-1];
          mCur = mActivities[i];
          mPleaseSwap = false;
          if(RankNum(mPrev.rank) < RankNum(mCur.rank)){
            mPleaseSwap = true;
          }else if(RankNum(mPrev.rank) == RankNum(mCur.rank)){
            if(Number(mPrev.updates) < Number(mCur.updates)){
              mPleaseSwap = true; 
            }else if(Number(mPrev.updates) == Number(mCur.updates)){
              if(Number(mPrev.last) > Number(mCur.last)){
                mPleaseSwap = true;
              }else if(Number(mPrev.last) == Number(mCur.last)){
                if(ChName(mPrev.ch) > ChName(mCur.ch)){
                  mPleaseSwap = true;
                }
              }            
            }          
          }
          
          if(mPleaseSwap){
            mActivities[i-1] = mCur;
            mActivities[i] = mPrev;
            mChange = true;
          }
        }
      }while(mChange);
      for(i=0;i<mActivities.length;i++){
        mCh = mActivities[i].ch;
        mRank = mActivities[i].rank;
        mUpdates = mActivities[i].updates;
        if(mRankCur != mRank){
          mRankCur = mRank;
          mHTML += "<div></div><span class='mbILB25 mbRankBlk" + mRankCur;
          mHTML += "' style='margin-left:-25px'></span>";
        }
        mHTML += "<a class='mbbutton' onclick='QueryMainCh("+ mCh +")' ";
        mHTML += "title='Total Updates: " +mUpdates+ "\nLast on: " +mActivities[i].last + "'>&nbsp;";
        mHTML += ChName(mCh);    
        if(NotBlank(mActivities[i].last)){
          mLast = Number(mActivities[i].last);
          if(mLast >= mToday){
            mHTML += "<small>✅</small>";
          }
        }
        mHTML += "&nbsp;</a> ";
        
      } 
      mHTML += "</div>";    
    }
    mHTML += "<hr class='mbhr'>";
    mHTML += "</div>";    
    { // MEMBER SCORES (scone)
      mScoreList="";
      if(NotBlank(mMacro.top)){
        mHTML += "<center>";
        mHTML += "<div class='mbav50t mb" + mMacro.top[0].name;
        mHTML += "'>👑<br><br><br><br><br><br><b>"+mMacro.top[0].score+"</b></div>";
        mHTML += "<div class='mbav50t mb" +  mMacro.top[1].name;
        mHTML += "'><br><br><br><br><br><br><b>"+mMacro.top[1].score+"</b></div>";
        mHTML += "<div class='mbav50t mb" +  mMacro.top[2].name;
        mHTML += "'><br><br><br><br><br><br><b>"+ mMacro.top[2].score+"</b></div>";
        mHTML += "</center>";
        mScoreList = "";
        mCurScore = "";
        for(i=0;i<mMacro.top.length;i++){
          if(mCurScore != mMacro.top[i].score){
            mCurScore = mMacro.top[i].score;
            mScoreList += "<b>" + mCurScore + "</b>: ";
          }
          mScoreList += mMacro.top[i].name + " ";
        }
      }
      mHTML += "<div class='mbbutton mbpc' onclick='ShowNext(this)'><b>SCOREBOARD</b></div>"   ;
      mHTML += "<div class='mbhide'>";
      mHTML += "🥨 <b>Players:</b> " + mMacro.players + "</br>";
      mHTML += "⭐ <b>Merits:</b> " + mMacro.merits + "</br>";
      mHTML += "🏅 <b>Recognitions:</b> " + mMacro.recognitions + "</br>";
      mHTML += "💟 <b>Kudos:</b> " + mMacro.kudos + "</br>";
      mHTML += "💗 <b>Awards:</b> " + mMacro.awards + "</br>";
      mHTML += "👑 <b>Top:</b> " + mScoreList;
      mHTML += "</div>";
    }    
    mHTML += "</div>";
    elTemp = AddElement(el,"div",mHTML);
    return;
  }
  if(mMacro.cmd=="img"){ //IMG
    // Old code
    /*var elTemp = document.createElement("img");
    elTemp.src = mMacro.src;
    if(NotBlank(mMacro.maxwidth)){elTemp.style.maxWidth = mMacro.maxwidth;}
    el.after(elTemp);*/
    // New code
    mHTML = "<img style='border:0px;border-radius:10px' src='" + mMacro.src+ "'>";
    var elTemp = AddElement(el,"div",mHTML);
    if(NotBlank(mMacro.maxwidth)){elTemp.style.maxWidth = mMacro.maxwidth;}
    if(NotBlank(mMacro.scale)){
      elTemp.style.transform='scale(' + mMacro.scale +')';
      elTemp.style.display="inline-block";
    }else{
      elTemp.style.maxWidth = "100%";
    }
    return;
  }
  if(mMacro.cmd=="next"){ //
    // 20230515: StarTree: For Chat post. 
    // Creates the discussions button section by reading the node id of the parent.
    // From: 
    //  <macro>{"cmd":"next"}</macro>
    // To:
    //  <hr class="mbCB"><button class="mbbutton" onclick="QueryAllNext(this,'    
    //  [data-202305141753]')">💬 Discussions</button><hide></hide>

    // Search up until an ID is found.
    elTemp = el.parentNode;
    do{
      mPID = elTemp.getAttribute("id"); // This ID includes the leading P.
      elTemp = elTemp.parentNode;
    }while(IsBlank(mPID));
    mID = mPID.substring(1);

    mHTML = "<hr class='mbCB'><button class='mbbutton' onclick=\"QueryAllNext(this,'";
    mHTML += "[data-" + mID + "]')\">💬 Discussions</button><hide></hide>";

    AddElement(el,"div",mHTML);
    return;

  } 
  if(mMacro.cmd=="pb"){ //(span) Pinned Board header 
    //<macro>{"cmd":"pb","icon":"✅","updates":"7","node":"202208161957"}</macro>
    /*<a onclick="QueryBanner('202208161957')" class="mbListCapILB mbRankNone">✅</a>
      <span class="mbListCapILB mbRankQty">7</span> 
      <a class="mbbutton" onclick="ShowNext(this)"><span class="mbILB25"><div class="mbavem mbNatalie"></div></span> @Paladin</a>*/
    var mUpdates = mMacro.updates;

    mRank = mMacro.rank;
    if(IsBlank(mRank)){
      mRank = "";
    }
    //mScore = mUpdates*10;
    mScore = Number(mUpdates);

    switch(mRank){
      case "SS":  break;
      case "S":  mScore += 500; break;
      case "A":  mScore += 400; break;
      case "B":  mScore += 300; break;
      case "C":  mScore += 200; break;
      case "D":  mScore += 100; break;
    }

    el.parentNode.style.order = -mScore;
    
    mStatusIcon = mMacro.icon;
    if(IsBlank(mStatusIcon)){
      if(mScore >=400 || (mScore >=300 && mUpdates>=4)){
        mStatusIcon = "✅";
      }else{
        mStatusIcon = "";
      }
    }
    
    mGuildLogCount = mMacro.guildlog;
    if(IsBlank(mGuildLogCount)){
      mGuildLogCount = "Unknown";
    }
    mHTML = "<a onclick=\"" + InterLink() + "'" + mMacro.node+ "');return false;\" class=\"mbbutton mbILB35 mbRankBlk" + mRank + "\" href=\"" + ViewerPath() + "?id=P"+  mMacro.node  +"\" title='Quests Completed: "+ mUpdates +"\nHighest Rank: "+mRank+"\nRemaining: "+mGuildLogCount+"'></a>";
    mHTML += "<span class='mbILB25 mbRankNone' style='margin-left:5px'>" + mStatusIcon + "</span>";
    mAuthor = mMacro.author;
    if(NotBlank(mAuthor)){
      mHTML += "<span class='mbbutton' onclick=\"ToggleHidePN(this)\" style='padding:0px 7px 0px 4px'><span class='mbILB25'><div class='mbavem mb"+ mAuthor+ "'></div></span> " + mMacro.chapter + "</span>";
    }
    
    AddElement(el,"span",mHTML);
    
    
    return;
  }
  if(mMacro.cmd=="PIN"){
    /*
    <span style="float:right;margin-bottom:-10px">
      &nbsp;<small><b>202302201503</b></small><a class="mbbuttonIn" href="" + ViewerPath() + "?id=P202302201503"><small>📌</small></a> 
    </span>
    */
    var elTemp = document.createElement("span");
    elTemp.style.float = "right";
    elTemp.style.marginBottom = "-10px";
    elTemp.innerHTML = "&nbsp;<small><b>" + mNode + "</b></small><a class=\"mbbuttonIn\" href=\"" + ViewerPath() + "?id=P" + mNode + "\"><small>📌</small></a>";
    el.after(elTemp);
    return;
  }
  if(mMacro.cmd=="PIN2"){
    /* 
      20230305: Black: NEW STYLE 
      20230308: LRRH: Adds music.
      <span class="mbRef" style="margin-top:4px">
        <a class="mbbutton" onclick="Music('MagicBakery')">🎧</a>
        <a class="mbbutton" onclick="ClipboardAlert('202302201503')" title="202302201503">📋</a>  
      </span>  
    */
    var elTemp = document.createElement("span");
    elTemp.classList.add("mbRef");    
    elTemp.style.margintop = "4px";
    elTemp.title = mNode;
    if(NotBlank(mMacro.music)){
      elTemp.innerHTML = "<a class='mbbutton' onclick=\"Music('"+mMacro.music+"')\" title=\"Play theme music\">🎧</a>";
    }
    elTemp.innerHTML += "<a class='mbbutton' onclick=\"ClipboardAlert('"+ mNode+"')\" title=\""+mNode+"\">📋</a>";
    el.after(elTemp);
    return;
  }
  if(mMacro.cmd=="pl"){ // SPAN Youtube Playlist
    /* <a class="mbbuttonEx" onclick="ExURL('https://www.youtube.com/watch?v=DS2sP8CDLas&list=PL77IbAOrvAb9mGTlEOnDpCi4pVYngX0yx')">あたしがとなりにイッル地に</a> */
    if(NotBlank(mMacro.yt)){
      mURL = "https://www.youtube.com/watch?v=" + mMacro.yt + "&list=PL77IbAOrvAb9mGTlEOnDpCi4pVYngX0yx";
    }else if(NotBlank(mMacro.url)){
      // 20230319: Arcacia. 
      mURL = mMacro.url;      
    }else{}

    mHTML = "<a class='mbbuttonEx' onclick=\"ExURL('"+ mURL + "');return false;\" href='"+mURL+"'>" + mMacro.desc + "</a>";
    AddElement(el,"span",mHTML);return;
  }
  if(mMacro.cmd=="pl2"){ // DIV Instrument Study Search List Entry
    /* 20230319: P4: Added for Instrument Study (It is assume that all links are for youtube)
    <macro>{"cmd":"pl2","yt":"Ptk_1Dc2iPY","desc":"Canon In D",
      "style":"Classical, Duet, Soft","instrument":"Cello, Piano",
      "for":"Glory to the World, Living Memories"}</macro>

    <div>
      <macro>{"cmd":"pl","yt":"Ptk_1Dc2iPY","desc":"🎧"}</macro>
      <a class="mbbutton" onclick="ShowNext(this)">Canon in D</a>
      <div class="mbhide">
        <h4>Style:</h4>
        Classical, Duet, Soft<br>
        <h4>Instruments:</h4>
        Cello, Piano, Duet<br>
        <h4>Style for:</h4>
        Living Memories, Glory to the World<br>
      </div>
    </div>
    */
   
    if(NotBlank(mMacro.yt)){
      mURL = "https://www.youtube.com/watch?v=" + mMacro.yt + "&list=PL77IbAOrvAb9mGTlEOnDpCi4pVYngX0yx";
      mHTML = "<a class='mbbuttonEx' onclick=\"ExURL('"+ mURL + "');return false;\" href='"+mURL+"'>🎧</a> "; // Start with icon.
    }else if(NotBlank(mMacro.url)){
      // 20230319: Arcacia. 
      mURL = mMacro.url;
      mHTML = "<a class='mbbuttonEx' onclick=\"ExURL('"+ mURL + "');return false;\" href='"+mURL+"'>🎧</a> "; // Start with icon.
    }else{
      mIcon = Default(mMacro.icon,"");
      if(mMacro.action=="Done"){
        mIcon = "✅";
      }
      if(NotBlank(mMacro.priority)){
        switch(mMacro.priority){
          case "1": case 1: mIcon = "📌"; break;
        }
      }
      
      if(IsBlank(mIcon)){
        if(NotBlank(mMacro.action)){
          mIcon="🍀";
        }else{
          mIcon="&nbsp;";
        }
      }
      
      if(IsBlank(mIcon)){mIcon = Default(mMacro.icon,"⭐");}
      mHTML = "<span class='mbILB25'>" + mIcon + "</span> ";
    }
    if(NotBlank(mMacro.node)){
      mHTML += "<lnk>" + mMacro.node + "|⭐</lnk>";
    }
    mHTML += "<a class='mbbutton' onclick='ShowNext(this)''>"+mMacro.desc+"</a>";
    mHTML += "<div class='mbhide'>";
    mHTML += "<hr class='mbhr0'>";
    
    if(NotBlank(mMacro.author)){
      mAuthor = mMacro.author;
      mGPT = "";
      if(mMacro.ref=="GPT"){
        mGPT = "<sup title='Ref: ChatGPT'>📯</sup>"
      }
      mHTML += "<div class='mbav50r mb" + mAuthor + "'>" + mGPT + "</div>";

    }
    if(NotBlank(mMacro.intro)){
      mHTML += mMacro.intro + "<br>";
    }
    if(mMacro.action != undefined){
      // 20230402: Cardinal: For General Inventory List
      mHTML += "<span class='mbbutton' style='float:right;margin-top:-24px' onclick='HideP2(this)'>❌</span>";
    }
    mHTML += "<div style='line-height:14px'>";
    if(NotBlank(mMacro.note)){mHTML += "<small><b>Notes:</b> " + mMacro.note + "</small><br>";}
    if(NotBlank(mMacro.type)){mHTML += "<small><b>Type:</b> " + mMacro.type + "</small><br>";}
    if(NotBlank(mMacro.singer)){mHTML += "<small><b>Singer:</b> " + mMacro.singer + "</small><br>";}
    if(NotBlank(mMacro.start)){mHTML += "<small><b>Start:</b> " + mMacro.start + " | </small>";}
    if(NotBlank(mMacro.qty)){mHTML += "<small><b>Count:</b> " + mMacro.qty + "/" + mMacro.outof + "</small>";}
    { // For Instrument Study
      if(NotBlank(mMacro.style)){mHTML += "<small><b>Style:</b> " + mMacro.style+ "</small><br>";}
      if(NotBlank(mMacro.instrument)){mHTML += "<small><b>Ins:</b> " + mMacro.instrument+ "</small><br>";}
      if(NotBlank(mMacro.for)){mHTML += "<small><b>For:</b> " + mMacro.for+ "</small><br>";}
    }
    if(NotBlank(mMacro.source)){mHTML += "<small><b>Source:</b> " + mMacro.source + "</small><br>";}
    if(NotBlank(mMacro.action)){mHTML += "<small><b>Action:</b> " + mMacro.action + "</small><br>";}
    if(NotBlank(mMacro.priority)){mHTML += "<small><b>Priority:</b> " + mMacro.priority + "</small><br>";}
    
    // 20230319: Kisaragi: For Grocery List
    if(NotBlank(mMacro.get)){mHTML += "<small><b>Get:</b> " + mMacro.get + "</small><br>";}
    if(NotBlank(mMacro.not)){mHTML += "<small><b>Not:</b> " + mMacro.not + "</small><br>";}      
    mHTML += "</div></div>";
    elTemp = AddElement(el,"div",mHTML);
    // 20230319: P4: https://stackoverflow.com/questions/7785374/how-to-prevent-column-break-within-an-element
    elTemp.style.breakInside = "avoid-column";
    elTemp.style.margin = "0px 0px 2px 0px";
    elTemp.style.padding = "5px 5px";
    elTemp.classList.add("mbpuzzle");
    return;
  }  
  if(mMacro.cmd=="QPSN"){
    // 20231005: Skyle: A more compact link compared to the one in a div.
    //  Behavior: 
    //   When left-clicked, opens the node in PSN
    //   When right-clicked, opens hyperlink menual to allow open in new tap or copy link
    //  Translate:
    //   <macro>{"cmd":"QPSN","node":"202309200912","desc":"2009 Ditch"}</macro>
    //  Into:
    //   <a class="mbbutton" title="202309200912" href="" + ViewerPath() + "?id=P202309200912" onclick="QueryAllPSN(this,'#P202309200912',true );return false;">2009 Ditch</a>
    mHTML = "<a class='mbbutton' title='" + mNode + "' href='" + ViewerPath() + "?id=P" + mNode + "' onclick=\"QueryAllPSN(this,'#P" + mNode + "',true);return false;\">" + mMacro.desc + "</a>";
    var elTemp = document.createElement("span");
    elTemp.innerHTML = mHTML;el.after(elTemp);return;
  } // <a>
  if(mMacro.cmd=="quest"){
    // 20230309: Cardinal
    // <macro>{"cmd":"quest","title":"Layout Update","icon":"🥾","status":"";"info":"0304"}</macro>
    // 🥾 <small><a class="mbbutton" onclick="ShowNextInline(this)">✅1</a>       <hide>0304</hide></small> Layout Update<br>
    var mTitle = mMacro.title;
    var mIcon = mMacro.icon; if(IsBlank(mIcon)){mIcon="⭐";}
    if(mIcon.length>3){
      mIcon = "<div class='mbIcon i"+mIcon+"'></div>";
    }
    
    var mInfo = mMacro.info; if(IsBlank(mInfo)){mInfo="";}
    var mLog = mMacro.log; if(IsBlank(mLog)){mLog="";}
    var mStatus = mMacro.status;    
    var mPriority = mMacro.priority;
    if(IsBlank(mStatus)){
      if(NotBlank(mLog)){
        mStatus="✅";
      }else if(NotBlank(mPriority)){
        switch(mPriority){
          case "0": mStatus="0️⃣"; break;
          case "1": mStatus="1️⃣"; break;
          case "2": mStatus="2️⃣"; break;
          case "3": mStatus="3️⃣"; break;
          case "4": mStatus="4️⃣"; break;
          case "5": mStatus="5️⃣"; break;
          case "6": mStatus="6️⃣"; break;
          case "7": mStatus="7️⃣"; break;
          case "8": mStatus="8️⃣"; break;
          case "9": mStatus="9️⃣"; break;
          case "10": mStatus="🔟"; break;
          default: mStatus=mPriority;
        }
      }else{
        mStatus="";
      }
    }
    if(NotBlank(mNode)){
      mIcon = "<lnk>" + mNode + "|" + mIcon + "</lnk>";
    }
    mStatus = "<span class='mbILB25'>" + mStatus + "</span>"
    mIcon = "<span class='mbILB25'>" + mIcon + "</span>"
    // BEFORE
    //elTemp.innerHTML = mIcon + " <a class=\"mbbutton\" onclick=\"ShowPLInline(this)\"><small>" + mStatus + "</small></a> " + mTitle + " <hide><small>" + mInfo + "</small></hide>";
    // After: 20230312: Evelyn
    // 20230315: James: Don't format as button if mInfo is blank.
    mButton = "";
    if(NotBlank(mLog) || NotBlank(mInfo)){ mButton = " class=\"mbbutton\" onclick=\"ShowPL(this)\"";}
    mHTML = " <span"+ mButton + ">" + mStatus + "</span> " + mIcon + " " + mTitle + " <hide style='line-height:14px'><small> " + mInfo + " " + mLog + "</small></hide>";
    
    AddElement(el,"div",mHTML);return;
  }
  if(mMacro.cmd=="scone"){// DIV daily score sections
    // 20230416: StarTree: Construct the daily scores section.
    // macro format: 
    /* {"cmd":"topscores","players":"","merits":"","recognitions":"","kudos":"","awards":"","top":"
      5	StarTree ...
      "}
      Change to:
      <center>
        <div class="mbav50t mbEvelyn">👑<br><br><br><br><br><br><b>10</b></div>
        <div class="mbav50t mbNatalie"><br><br><br><br><br><br><b>9</b></div> 
        <div class="mbav50t mbArcacia"><br><br><br><br><br><br><b>7</b></div> 
      </center><!--Avatars of Top 3 Scorers-->
      <div class='mbbutton mbpc' onclick='ShowNext(this)'><b>SCOREBOARD</b></div>
      <div class='mbhide'>
        🥨 <b>Players:</b> <br/>
        ⭐ <b>Merits:</b> <br/> 
        🏅 <b>Recognitions:</b> <br/>
        💟 <b>Kudos:</b> <br/>
        💗 <b>Awards:</b> Arcacia, Casey, Evelyn, Ivy, LRRH, Natalie, Sasha, Skyle, StarTree, Tanya, Vivi, Zoey<br/>  
        👑 <b>Top:</b>
        10	Evelyn
        9	Natalie
        7	Arcacia
        7	StarTree ...
      </div>
    */
    mHTML = "";
    mScoreList="";
    if(NotBlank(mMacro.top)){
      mHTML += "<center>";
      mHTML += "<div class='mbav50t mb" + mMacro.top[0].name;
      mHTML += "'>👑<br><br><br><br><br><br><b>"+mMacro.top[0].score+"</b></div>";
      mHTML += "<div class='mbav50t mb" +  mMacro.top[1].name;
      mHTML += "'><br><br><br><br><br><br><b>"+mMacro.top[1].score+"</b></div>";
      mHTML += "<div class='mbav50t mb" +  mMacro.top[2].name;
      mHTML += "'><br><br><br><br><br><br><b>"+ mMacro.top[2].score+"</b></div>";
      mHTML += "</center>";
      mScoreList = "";
      mCurScore = "";
      for(i=0;i<mMacro.top.length;i++){
        if(mCurScore != mMacro.top[i].score){
          mCurScore = mMacro.top[i].score;
          mScoreList += "<b>" + mCurScore + "</b>: ";
        }
        mScoreList += mMacro.top[i].name + " ";
      }
    }
    mHTML += "<div class='mbbutton mbpc' onclick='ShowNext(this)'><b>SCOREBOARD</b></div>"   ;
    mHTML += "<div class='mbhide'>";
    mHTML += "🥨 <b>Players:</b> " + mMacro.players + "</br>";
    mHTML += "⭐ <b>Merits:</b> " + mMacro.merits + "</br>";
    mHTML += "🏅 <b>Recognitions:</b> " + mMacro.recognitions + "</br>";
    mHTML += "💟 <b>Kudos:</b> " + mMacro.kudos + "</br>";
    mHTML += "💗 <b>Awards:</b> " + mMacro.awards + "</br>";
    mHTML += "👑 <b>Top:</b> " + mScoreList;
    mHTML += "</div>";
    elTemp=AddElement(el,"div",mHTML);
  }
  if(mMacro.cmd=="url"){ // SPAN
    /* <a class="mbbuttonEx" onclick="ExURL('https://www.youtube.com/watch?v=DS2sP8CDLas&list=PL77IbAOrvAb9mGTlEOnDpCi4pVYngX0yx')">あたしがとなりにイッル地に</a> */
    mHTML = "<a class='mbbuttonEx' onclick=\"ExURL('"+ mMacro.url + "');return false;\" href='"+mMacro.url+"'>" + mMacro.desc + "</a>";
    AddElement(el,"span",mHTML);return;
  }
}
function Music(eMusicID){
  LoadDiv('MBBGM','https://panarcana.blogspot.com/p/music', eMusicID);
}
function MusicNext(elTest,eMusicID){
  LoadDivNext(elTest,'../p/music',eMusicID);
}
function NotBlank(e){
  // 20230310: Fina
  return (!IsBlank(e));
}
function PNDInner(el,mJSON){
  // 20230621: StarTree
  //If the node type is not chat, return.
  if(mJSON.type != "chat"){return;}  
  // If the node type is chat:

  // Create the header block
  mHTML = "<a class=\"mbbutton\" onclick=\"QueryAllNext(this,'#P" + mJSON.parentid;
  mHTML +="')\"><small>" + mJSON.parentname + "</small></a><hide></hide>";
  mHTML +="<div style=\"float:right\"><small>["+mJSON.id+"]</small></div>";
  mHTML +="<hr class=\"mbCB mbhr\"><div class=\"mbpc\"><a class=\"mbbuttonIn\" href=\"" + ViewerPath() + "?id=P"+mJSON.id+"\"><b>"+mJSON.title+"</b></a></div>";
  mHTML +="<center><small>";
  if(NotBlank(mJSON.prev)){
    mHTML +="<a class=\"mbbutton\" style=\"float:left\" href=\"" + ViewerPath() + "?id=P"+mJSON.prev+"\">◀</a>";
  }
  if(NotBlank(mJSON.next)){
    mHTML +="<a class=\"mbbutton\" style=\"float:right\" href=\"" + ViewerPath() + "?id=P"+mJSON.next+"\">▶</a>";
  }
  // Read the date and time from the node id
  // https://stackoverflow.com/questions/1833892/converting-a-string-formatted-yyyymmddhhmmss-into-a-javascript-date-object
  var mDate = new Date(mJSON.id.replace(/^(\d{4})(\d{2})(\d{2})(\d\d)(\d\d)$/,'$4:$5 $2/$3/$1'));
  //DEBUG(mDate);
  var options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit', hour12:'true', hour:'2-digit',minute:'2-digit' };
  mDateString = mDate.toLocaleDateString("en-US", options);
  //DEBUG(mDateString);
  mDateString = mDateString.replace(/,/g,"");
  mDateString = mDateString.toUpperCase();
  //DEBUG(mDateString);
  mHTML += mDateString.substring(10,15)+" "+mDateString.substring(4,7)+" "+ mDateString.substring(8,10) +" "+ mDateString.substring(0,3)+" " + mDateString.substring(16) + "<br>";
  
  mHTML += mJSON.location + "</small></center><hr class=\"mbhr\">";

  AddElementFC(el.parentNode.firstElementChild.nextElementSibling.nextElementSibling,"div",mHTML);

  // Create the discussion link at the end. (node data is assumed to be at the end)
  mHTML = "<hr class='mbCB'><button class='mbbutton' onclick=\"QueryAllNext(this,'";
  mHTML += "[data-" + mJSON.id + "]')\">💬 Discussions</button><hide></hide>";
  AddElement(el.previousElementSibling.lastElementChild,"div",mHTML);

}
function ProcessNodeData(elScope){
  // 20230621: StarTree: Adding first for chat post.
  // A node is supposed to have only one <node> data, but this function could be called from a scope that has a list of nodes.
  var z = elScope.getElementsByTagName("node");
  var hit = z.length;
  if(hit<=0){return;}
  var i;
  for (i=0;i<hit;i++){
    PNDInner(z[i],JSON.parse(z[i].innerHTML));
  }
  // Unlike the processing of macros, <node> does not need to be removed after processing.
}
function RankNum(iRank){
  // 20230331: Sasha
  switch(iRank){
    case "SS": return 6;
    case "S": return 5;
    case "A": return 4;
    case "B": return 3;
    case "C": return 2;
    case "D": return 1;
    default: return 0;
  }
}
function SearchPS(el,iAttribute){
  // 20230301: Evelyn: Made function for the part shared by QueryAllPSN and ShowLPSN
  // 20230308: LRRH: changed the check for missing iAttribute to undefined.
  if(iAttribute==undefined || iAttribute==""){iAttribute="top";}
  var elTarget = el;
  while(elTarget != null && elTarget.getAttribute(iAttribute)==null){
    elTarget = elTarget.parentNode;
  }
  return elTarget;
}
function ShowSkip(el) {
  var eNext = el.nextElementSibling.nextElementSibling;
  if (eNext.style.display != "block") {
      Macro(eNext);
      eNext.style.display = "block";
  } else {
      eNext.style.display = "none";
  }
}
function HideN3Inline(el) {
  // 20230213: StarTree: For Vacation Island
  var eNext = el.nextElementSibling;
  eNext = eNext.nextElementSibling;
  eNext = eNext.nextElementSibling;
  if (eNext.style.display != "none") {
      eNext.style.display = "none";
  } else {
      eNext.style.display = "inline";
  }
}
function HidePP(elThis){
  var eTar = elThis.parentNode.previousElementSibling;
  if (eTar.style.display != "none") {
    eTar.style.display = "none";
  } else {
    eTar.style.display = "";
  }
}
function HideP2(elThis){
  var eTar = elThis.parentNode.parentNode;
  if (eTar.style.display != "none") {
    eTar.style.display = "none";
  } else {
    eTar.style.display = "";
  }
}
function HideP2P(elThis){
  var eTar = elThis.parentNode.parentNode.previousElementSibling;
  if (eTar.style.display != "none") {
    eTar.style.display = "none";
  } else {
    eTar.style.display = "";
  }
}
function ShowP2P(elThis){
  // 20230220: Fina: Fixed the double click bug with getComputedStyle
  var eTar = elThis.parentNode.parentNode.previousElementSibling;
  if(window.getComputedStyle(eTar).display === "none"){
    eTar.classList.remove("mbhide");
    //eTar.style.display = "block";
  }else{
    eTar.classList.add("mbhide");
    //eTar.style.display = "none";
  }  
}
function HidePrev(elThis){
  var eTar = elThis.previousElementSibling;
  if (eTar.style.display != "none") {
    eTar.style.display = "none";
  } else {
    eTar.style.display = "block";
  }
}
function HideParent(elThis){
	elThis.parentNode.style.display = "none";
}
function HideTarget(elAID) {
  var eToHide = document.getElementById(elAID);
  if (eToHide.style.display != "none") {
      eToHide.style.display = "none";
  } else {
      eToHide.style.display = "block";
  }
}
function JumpURL(url){
  window.location.href=url; 
}
function ExURL(url){
  if(confirm("Open URL in new tab?\n" + url)){
  window.open(url, '_blank');
}
}
function ShowImg(chapter,page){
  //Assumes that the image exists.
  chapter=Number(chapter);
  page=Number(page);
  var eFrame = document.getElementById("MangaImg");
  eFrame.src = document.getElementById(ImgName(chapter,page)).src;
  eFrame.onclick=function(){ShowImg(chapter,page+1)};
  
  var ePrev = document.getElementById("btnPrev");
  if(ImgCheck(chapter,page-1)){
    ePrev.onclick = function(){ShowImg(chapter, page-1)};
    ePrev.innerHTML="Prev";
  }else{
    //ePrev.onclick = function(){ShowTarget("Banner")};
    ePrev.innerHTML="----";
  }

  var eNext = document.getElementById("btnNext");
  if(ImgCheck(chapter,page+1)){
    eNext.onclick = function(){ShowImg(chapter, page+1)};
    eNext.innerHTML="Next";
  }else{
    //eNext.onclick = function(){ShowTarget("Banner")};
    eNext.innerHTML="----";
  }
  
  var eChapter = document.getElementById("btnChapter");
  eChapter.innerHTML= "Chapter " + chapter;
    
  var ePage = document.getElementById("btnPage");
  ePage.innerHTML = "Page " + page; 
  ePage.href="?chapter="+chapter+"&page="+page+"#manga";
  
  var eViewer = document.getElementById("MainViewer");
  eViewer.style.display = "block";
  
  
}
function Skill(eContainerID,eSkillID){
var elContainer = document.getElementById(eContainerID);
LoadDivEL(elContainer,SkillArchive(),eSkillID);
}
function SkillArchive(){
  return 'https://panarcana.blogspot.com/p/data';
}
function SkillNext(elThis,eSkillID){
  LoadDivNext(elThis,SkillArchive(),eSkillID);
}
function ImgName(chapter,page){
  return "IMG_CH"+chapter+"_"+page;
}
function ImgCheck(chapter,page){
    var eImg = document.getElementById(ImgName(chapter,page));
    if(eImg==null){
      return false; 
    }
    return true;
}
function LoadArchivePost(eContainer, eID, iInner){
  // JQUERY
  var elContainer = document.getElementById(eContainer);
  LoadArchivePostEl(elContainer, eID, iInner);
}
function LoadArchivePostEl(elContainer, eID,iInner){
  // 20221210: StarTree: Created for Single Click teleport upgrade
  // JQUERY

  // 20230315: James: Tolerate the eID to have no leading P.
  if(eID.substring(0,1)!="P"){eID = "P" + eID;}

  var eDate= eID.substring(1,9);
  var eTime= eID.substring(9);
  var qArchive = ArchiveSelect(eDate);
  var eQuery = "#" + eID;
  $(document).ready(function(){
    var backup = $(elContainer).html();
    $(elContainer).load(qArchive + eQuery, function(){	
      Macro(elContainer);
      NodeFormatter(elContainer);
      var backup2 = $(elContainer).html();
      if(backup == backup2 && $(elContainer).is(':visible') ){
        
        $(elContainer).hide();
      }else{
        
        $(elContainer).show();
        var elID = document.getElementById(eID);
        var elIDChild = elID.firstElementChild;
        // 20230220: StarTree: If the child is mbDayHeader, just apply macro and show the node.
        if(elIDChild.classList.contains("mbDayHeader")){
          Macro(elContainer);
          if(iInner){elContainer.firstElementChild.classList.remove("mbscroll");}
          return;
        }
        var elIDChildNext = elIDChild.nextElementSibling;
        if ( elIDChildNext != null) {
          var ePostText = elIDChildNext.nextElementSibling;
          if(ePostText!=null){
            if(elIDChild.tagName=="BUTTON"){
              Macro(ePostText);
              ePostText.style.display = "block";
            }else{
              /*2022-07-12: Zoey: Added for flex style objects in archive.*/
              Macro(elContainer);
              FlexShow(elIDChild);
            }
          }else{		
            
            ePostText = elIDChild.nextElementSibling;
            Macro(ePostText);
            ePostText.style.display = "block";
          }
        }else{
          var elFlexContent = elIDChild.firstElementChild
          Macro(elContainer);
          if (elFlexContent!=null){
            FlexShow(elFlexContent);
          }else{
            FlexShow(elIDChild);
          }
        }
      }	
      if(iInner){elContainer.firstElementChild.classList.remove("mbscroll");}
    });
  });
}
function LAPN(elThis, eID,iInner){
  // JQUERY
  var elTarget = elThis.parentNode;
  elTarget = elTarget.nextElementSibling;
  LoadArchivePostEl(elTarget, eID,iInner);
}
function LAP2N(elThis, eID){
  // JQUERY
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.nextElementSibling;
  LoadArchivePostEl(elTarget, eID);
}
function LAP3N(elThis, eID, iInner){
  // JQUERY
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.nextElementSibling;
  LoadArchivePostEl(elTarget, eID,iInner);
}
function LAP4N(elThis, eID,iInner){
  // JQUERY
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.nextElementSibling;
  LoadArchivePostEl(elTarget, eID,iInner);
}
function LoadDiv(eContainer, eHTML, eDIV){
  var elContainer = document.getElementById(eContainer);	
  LoadDivEL(elContainer, eHTML, eDIV);
}
function LoadDivEL(elContainer, eHTML, eDIV){
  // JQUERY
  var qHTML = eHTML + ".html";
  if(eHTML==""){qHTML="";}
  var qDIV = " #"+eDIV;
  if(eDIV==""){qDIV="";}
  $(document).ready(function(){
    var backup = $(elContainer).html();
	$(elContainer).load(qHTML + qDIV, function(){	
  	  var backup2 = $(elContainer).html();
	  if(backup == backup2 && $(elContainer).is(':visible') ){
  		$(elContainer).hide();
	  }else{
  		$(elContainer).show();
	  }	
	}); 
  });
}
function LoadDivN2(elThis, eHTML, eDIV){
	LoadDivNext(elThis.nextElementSibling, eHTML, eDIV);
}
function LoadDivP1(elThis, eHTML, eDIV){
	LoadDivEL(elThis.parentNode, eHTML, eDIV);
}
function LoadDivP2(elThis, eHTML, eDIV){
	LoadDivP1(elThis.parentNode, eHTML, eDIV);
}
function LoadDivP2N(elThis, eHTML, eDIV){
	LoadDivPN(elThis.parentNode, eHTML, eDIV);
}
function LoadDivP3(elThis, eHTML, eDIV){
	LoadDivP2(elThis.parentNode, eHTML, eDIV);
}
function LoadDivP3N(elThis, eHTML, eDIV){
	LoadDivP2N(elThis.parentNode, eHTML, eDIV);
}
function LoadDivP4(elThis, eHTML, eDIV){
	LoadDivP3(elThis.parentNode, eHTML, eDIV);
}
function LoadDivP4N(elThis, eHTML, eDIV){
	LoadDivP3N(elThis.parentNode, eHTML, eDIV);
}
function LoadDivP5(elThis, eHTML, eDIV){
	LoadDivP4(elThis.parentNode, eHTML, eDIV);
}
function LoadDivP5N(elThis, eHTML, eDIV){
	LoadDivP4N(elThis.parentNode, eHTML, eDIV);
}
function LoadDivP6(elThis, eHTML, eDIV){
	LoadDivP5(elThis.parentNode, eHTML, eDIV);
}
function LoadDivP6N(elThis, eHTML, eDIV){
	LoadDivP5N(elThis.parentNode, eHTML, eDIV);
}
function LoadDivP7(elThis, eHTML, eDIV){
	LoadDivP6(elThis.parentNode, eHTML, eDIV);
}
function LoadDivPN(elThis, eHTML, eDIV){
	LoadDivNext(elThis.parentNode, eHTML, eDIV);
}
function LoadDivPN2(elThis, eHTML, eDIV){
	LoadDivN2(elThis.parentNode, eHTML, eDIV);
}
function LoadDivPrev(elThis, eHTML, eDIV){
  var elContainer = elThis.previousElementSibling;
  LoadDivEL(elContainer, eHTML, eDIV);
}
function LoadDivPrev2(elThis, eHTML, eDIV){
  var elContainer = elThis.previousElementSibling;
  LoadDivPrev(elContainer, eHTML, eDIV);
}
function LoadDivNext(elThis, eHTML, eDIV){
  var elContainer = elThis.nextElementSibling;
  LoadDivEL(elContainer, eHTML, eDIV);
}
function LoadQuery(eContainer, eHTML, eQuery){
  // JQUERY
  var qHTML = eHTML + ".html ";
  if(eHTML==""){qHTML="";}
  $(document).ready(function(){
    var backup = $("#"+ eContainer).html();
	$("#"+ eContainer).load(qHTML + eQuery, function(){	
	  var backup2 = $("#"+ eContainer).html();
	  if(backup == backup2 && $("#"+ eContainer).is(':visible') ){
		$("#"+ eContainer).hide();
	  }else{
		$("#"+ eContainer).show();
	  }	
	});
  });
}
function LoadQueryPuzzle(eContainer, eID){
  // JQUERY
  var eDate= eID.substring(0,8);
  var eTime= eID.substring(8);
  var qArchive = ArchiveSelect(eDate);
  var eQuery = "[date='" + eDate + "'][time='" + eTime + "']";
  $(document).ready(function(){
    var backup = $("#"+ eContainer).html();
	$("#"+ eContainer).load(qArchive + eQuery, function(){	
	  var backup2 = $("#"+ eContainer).html();
	  if(backup == backup2 && $("#"+ eContainer).is(':visible') ){
		$("#"+ eContainer).hide();
	  }else{
		$("#"+ eContainer).show();
		var ePuzzleText = document.getElementById(eID).nextElementSibling.nextElementSibling;
		ePuzzleText.style.display = "block";
	  }	
	});
  });
}
function LoadQueryNext(elThis, eHTML, eQuery){
  var elNext = elThis.nextElementSibling;
  // JQUERY
  var qHTML = eHTML + ".html ";
  if(eHTML==""){qHTML="";}
  $(document).ready(function(){
    $(elNext).load(qHTML + eQuery); 
	$(elNext).toggle();
  });
  
}
function LoadQueryTab(eContainer, eHTML, eQuery){
  // JQUERY. Same as LoadDiv but does not hide.
  var qHTML = eHTML + ".html ";
  if(eHTML==""){qHTML="";}
  $(document).ready(function(){
	$("#"+ eContainer).load(qHTML + eQuery, function(){	
		$("#"+ eContainer).show();
	}); 
  });
}
function LoadTab(eContainer, eHTML, eDIV){
  // JQUERY. Same as LoadDiv but does not hide.
  var qHTML = eHTML + ".html";
  if(eHTML==""){qHTML="";}
  var qDIV = " #"+eDIV;
  if(eDIV==""){qDIV="";}
  $(document).ready(function(){
	$("#"+ eContainer).load(qHTML + qDIV, function(){	
		$("#"+ eContainer).show();
	}); 
  });
}
/*===== P =====*/
/* Peekaboo by Evelyn (2022-07-03)
/* 1) If the frame is shown, hide it.
/* 2) If the frame is hidden, show it.
/*    And if it is blank, get default content. 
/*/
function Peekaboo(frameID,contentID) {
  var elFrame = document.getElementById(frameID);
  if(elFrame.style.display=="block"){
    elFrame.style.display = "none";
  }else{
    if(elFrame.innerHTML==""){
      elFrame.innerHTML = document.getElementById(contentID).innerHTML;
    }
    elFrame.style.display = "block";
  }
}
function Pin(elSourceID){
  var elSource = document.getElementById(elSourceID);
  var eTarget = document.getElementById('MBJQSW');
  ShowTextInWndEL(elSource,eTarget);
}
function PinNext(elThis){
  var elNext = elThis.nextElementSibling;
  var eTarget = document.getElementById('MBJQSW');
  ShowTextInWndEL(elNext,eTarget);
}
function PlayNext(elThis){
  var elAudio = elThis.nextElementSibling;
  elAudio.currentTime = 0; // 20230119: StarTree: So it can repeat!
  elAudio.play();
}
function PlayNextShift(elThis,iShift){
  var elAudio = elThis.nextElementSibling;
  elAudio.currentTime = iShift; // 20230119: StarTree: So it can repeat!
  elAudio.play();
}
function YoutubePN(el,iLink){
  // 20230305: StarTree: Added for displaying Japanese lyrics
  var elTarget = el.parentNode.nextElementSibling;
  if(elTarget.getAttribute("mQueryString") == iLink){
    elTarget,innerHTML="";
    elTarget.setAttribute("mQueryString","");
    elTarget.classList.add("mbhide");
    return;
  }
  
  var mHTML = "";
  mHTML = "https://www.youtube.com/embed/" + iLink + "?version=3&loop=1&autoplay=1&list=PL77IbAOrvAb9mGTlEOnDpCi4pVYngX0yx";
  mHTML = "src='" + mHTML + "' ";
  mHTML += "width='100%' frameborder='0' allow='accelerometer;clipboard-write;encrypted-media;gyroscope;picture-in-picture' allowfullscreen";
  mHTML = "<iframe " + mHTML + "></iframe>";
  mHTML = "<center>" + mHTML + "</center>";
  elTarget.innerHTML = mHTML;
  elTarget.setAttribute("mQueryString",iLink);
  elTarget.classList.remove("mbhide");

  /*<center>
    <iframe width="100%" src="https://www.youtube.com/embed/FUH9S44D1BM?version=3&loop=1&autoplay=1&list=PL77IbAOrvAb9mGTlEOnDpCi4pVYngX0yx" title="YouTube video player" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </center>*/

}
function QueryAll(eContainerID, eQuery, iInner){
  // JQUERY
  var elContainer = document.getElementById(eContainerID);
  QueryAllEL(elContainer, eQuery, iInner);
}
function QueryBanner(eQuery){
  
  
  // 20230302: StarTree: The banner data is an element of type "node" somewhere in the first child of the results  
  const InnerCache = [];
  var Hit = 0;
  var elContainer = document.getElementById('MBJQSW');  
  $(document).ready(function(){
    var prevHTML = $(elContainer).html();
    var nextState = {"html":prevHTML};
    window.history.replaceState(nextState, '', window.location.href);
    window.onpopstate = (event) => {
      if(event.state && event.state.html.length > 0){
        document.getElementById("MBJQSW").innerHTML = event.state.html;
        
      }
    };

    for(let i=1; i<=ArchiveNum();i++){
      $(elContainer).hide();
      $(elContainer).load(ArchiveIndex(i) + "#P" + eQuery, function(){
        InnerCache[i]=$(elContainer).html();
        Hit = Hit + 1
        if(Hit==ArchiveNum()){  
          
          $(elContainer).html(InnerCache.join(""));
          Macro(elContainer);
          var elNode = elContainer.getElementsByTagName('node');
          if(elNode.length==0){
            $(elContainer).html("<div class='mbbg'><div class='mbbanner'>"+ $(elContainer).html() + "</div></div>");
            $(elContainer).show();
          }else{
            var elDH = elContainer.firstElementChild.firstElementChild;
            if(elDH != null && elDH.classList.contains("mbDayHeader")){
              elDH.innerHTML="";
            }
            var mJSON = JSON.parse(elNode[0].innerHTML); 
            if(mJSON.type == "chat"){
              // 20230621: StarTree: If the node data is for a chat node, process as if there is no node data.
              $(elContainer).html("<div class='mbbg'><div class='mbbanner'>"+ $(elContainer).html() + "</div></div>");
              $(elContainer).show();
            }else{
              var mHTML = ""
              if(IsBlank(mJSON.subtitle)){
                mHTML = "<div class=\"mbav50pr\" style=\"background-image:url('" + mJSON.img + "')\"></div>";
              }else{
                mHTML = "<div class=\"mbav100pr\" style=\"background-image:url('" + mJSON.img + "')\"></div>";
              }            
              mHTML += "<h1>" + mJSON.title + "</h1>";
              mHTML += "<h3>" + mJSON.subtitle + "</h3>";
              if(NotBlank(mJSON.subtitle)){
                mHTML += "<hr>";
                if(NotBlank(mJSON.parentid)){
                  mHTML += "<h4><lnk>"+mJSON.parentid + "|"+mJSON.parentname+"</lnk></h4>";
                }
              }
              mHTML += "<div class='mbCB'></div>";
              mHTML += elContainer.innerHTML;
              mHTML = "<div class=\"mbbg\"><div class=\"mbbanner\">" + mHTML + "</div></div>"

              $(elContainer).html(mHTML);
              MacroLnk(elContainer);
              $(elContainer).show();
            }            
          }
          
        
          //window.history.replaceState(nextState, nextTitle, nextURL);
          // https://stackoverflow.com/questions/824349/how-do-i-modify-the-url-without-reloading-the-page
          // https://stackoverflow.com/questions/3338642/updating-address-bar-with-new-url-without-hash-or-reloading-the-page
          /* function processAjaxData(response, urlPath){
              document.getElementById("content").innerHTML = response.html;
              document.title = response.pageTitle;
              window.history.pushState({"html":response.html,"pageTitle":response.pageTitle},"", urlPath);
          }*/
          location.href= "#";
          window.history.replaceState({"html": mHTML}, '', "" + ViewerPath() + "?id=P" + eQuery);
        }
      });
    }
  });


  /*
  <div class="mbbg">
    <div class="mbbanner">
      <div class="mbav100pr" style="background-image:url('https://blogger.googleusercontent.com/img/a/AVvXsEj8-HPdatQO9QcEHVpXOjmsFVJhaUwg6j979bp6wokz63RpOL8Ynh4olHbiSGlDfE30ujS3nqZMdViSx1u5gaiuf5oLMpyIAaR-2JRsgF_peHPinXV8eNpjJK9nqYrsd3YYW060Xq48n6KDBbqN1ZvoGigKdOLJwlQoa3ExFj82edK0WP-rmAp1nrSA0Q')"></div>
      <h1>Magic Bakery HQ</h1>
      <h3>Have a Great Day!</h3>
      <hr>
      CONTENT
    </div>
  </div>
  */

}
function QSLI(iQuery){
  // 20230623: Ivy: Query for Search List at MBQSL
  var el = document.getElementById("MBQSL");
  var mHTML = "<hr><div control>";
    mHTML += "<input type='text' onclick='TextSearchPN(this)' onkeyup='TextSearchPN(this)' placeholder='Search...' title='Input a keyword'>";
    mHTML += " </div><!--CONTROLS-->";
    mHTML += "<div class='mbpuzzle' onclick='MC3Resize(this)' >";
    mHTML += "<div class='mbSearch' style='display:flex;flex-direction: column;'>";
    mHTML += "</div></div>";
  el.innerHTML = mHTML;
  QSLEL(el.lastElementChild.lastElementChild,iQuery);
}
function QSLEL(elSearchList,iQuery){
  elSearchList.innerHTML = "Loading " + iQuery + "...";
  var elTemp = document.createElement("div");
  var Hit = 0;
  $(document).ready(function(){
    for(let i=ArchiveNum(); i>0;i--){
      $(elTemp).load(ArchiveIndex(i) + iQuery, function(){
        // Loop through and add each child.
        var mHTML = "";
        var elDiv = elTemp.lastElementChild;
        var mID=""; var mTitle=""; var mIcon="";          
        var mNode = ""; var mJSON = "";
        while(elDiv != null){
          mNode = elDiv.getElementsByTagName("node");          
          if(NotBlank(mNode)){
            mJSON = JSON.parse(mNode[0].innerHTML);
            mTitle = mJSON.title;
            mIcon = mJSON.icon;
            mID = mJSON.id;
          }else{
            mID = elDiv.getAttribute("id");
            mTitle = elDiv.getAttribute("title");
            mIcon = elDiv.getAttribute("icon");
          }
          if(IsBlank(mTitle)){
            if(NotBlank(mID)){
              // 20230324: Mikela: Guess: A puzzle post.
              if(elDiv.firstElementChild.lastElementChild!=null){
                mTitle = elDiv.firstElementChild.lastElementChild.textContent;
              }else{
                mTitle="Mini Diary";
              }
            }
          }
          if(IsBlank(mTitle)){
            if(NotBlank(elDiv.firstElementChild.getAttribute("id"))){
              // Guess: The entry is a chat post.
              if(elDiv.firstElementChild.firstElementChild!=null){
                mTitle = elDiv.firstElementChild.firstElementChild.textContent;
                if(IsBlank(mTitle)){
                  mTitle = elDiv.firstElementChild.lastElementChild.textContent;
                }
              }else{
                mTitle = elDiv.firstElementChild.textContent;
              }
              mIcon = mTitle.substring(0,2);
              mTitle = mTitle.substring(3,30);
            }else{
              // Guess: The entry is an flex show style post.
              mTitle = elDiv.firstElementChild.lastChild.textContent;
              mTitle = mTitle.substring(0,30);
            }
          }
          if(IsBlank(mIcon)){mIcon="📌";}
          if(IsBlank(mID)){mID = elDiv.getAttribute("date")+elDiv.getAttribute("time");}
          if(IsBlank(mID)){ 
            DEBUG(0.001);
            DEBUG(elDiv);
          }else if(mID.substring(0,1)=="P"){
            // Remove the leading P in ID.
            mID = mID.substring(1,13);
          }
          if(IsBlank(mTitle)){mTitle = mID;}
          mHTML += "<div name='"+ mTitle +"'>";
          mHTML += LnkCode(mID,mTitle,mIcon);          
          mHTML += "<hide>"+ elDiv.textContent +"</hide></div>";

          elDiv = elDiv.previousElementSibling;
        }
        Hit++;
        if(Hit==1){          
          elSearchList.innerHTML = mHTML;          
        }else{
          elSearchList.innerHTML += mHTML;  
        }
      });
    }
  });

}
function RND_CoinFlip(el){
  // 20230716: StarTree: For gaming
  var elResultSpace = SearchPS(el,"control").nextElementSibling;
  if(Math.random()<0.5){
    mToss = "➕" ;
  }else{
    mToss = "➖" ;
  }
  elResultSpace.innerHTML = elResultSpace.innerHTML + mToss;

}
function RND_Reset(el){
  // 20230716: StarTree: For gaming
  var elResultSpace = SearchPS(el,"control").nextElementSibling;
  elResultSpace.innerHTML = "";
}
function QSL(el,iQuery){
  // 20230323: Ivy: Query for Search List.
  //   Usage: Runs JQuery and lists the result for the context of a search list.
  //   Assumes that the entry div has attributes: id, name, icon, and keywords.
  //   
  // Assumes this structure:
  // <div control>
  //    <button onclick="QSL(this,'[data-skill]')>... << user clicks this
  // </div>
  // <macro>{"cmd":"MC3"}</macro>
  // <div class="mbpuzzle" onclick="MC3Resize(this)" >
  //   <div class="mbSearch" style="display:flex;flex-direction: column;">
  //      (... search entries ...)
  //   </div>
  // </div>

  var elSearchList = SearchPS(el,"control").nextElementSibling.firstElementChild;
  QSLEL(elSearchList,iQuery);
}
function QueryAllEL(elContainer, eQuery,iInner){
  // 20230220: StarTree: Upgraded to allow querying only the inner.
  // 20230220: Ivy: If the container is a flex class, add the spacers in the end.
  // 20230225: StarTree: saves the query string. if the query string is the same as before, hide if it is shown.
  const InnerCache = [];
  var Hit = 0;
  var bFlex = (window.getComputedStyle(elContainer).display ==="flex");
  var mFlex = "";
  var mQuery = elContainer.getAttribute("mQueryString");
  var mDisplay = window.getComputedStyle(elContainer).display;
  if(mQuery==eQuery && mDisplay!="none"){
    elContainer.setAttribute("mDefaultDisplay",elContainer.style.display);
    elContainer.style.display = "none";
    return;
  }
  if(iInner!=true){iInner = false;}
  elContainer.setAttribute("mQueryString", eQuery);
  elContainer.setAttribute("mInner", iInner);
  if(elContainer.classList.contains("flex")){
    mFlex = "<div class='spacer'></div>";
  }
  $(document).ready(function(){
    for(let i=1; i<=ArchiveNum();i++){
      $(elContainer).hide();
      var backup = $(elContainer).html();
      $(elContainer).load(ArchiveIndex(i) + eQuery, function(){
        if(iInner){
          var elChild = elContainer.firstElementChild;
          if(elChild != null){
            InnerCache[i]=elChild.innerHTML;
          }
        }else{
          InnerCache[i]=$(elContainer).html();
        }
        Hit = Hit + 1
        if(Hit==ArchiveNum()){        
          $(elContainer).html(InnerCache.join(""));
          if( $(elContainer).html() == ""){
            $(elContainer).html("<small><i>(No record for "+ eQuery + ")</i></small>");
          }else{ 
            $(elContainer).html($(elContainer).html() + mFlex + mFlex);
          }
          if(backup == $(elContainer).html() && $(elContainer).is(':visible') ){
            $(elContainer).hide();
          }else{
            Macro(elContainer);
            $(elContainer).show();
          }	
        }
      });
    }
  });
}
function QueryAllEL20230313(elContainer, eQuery,iInner){
  // 20230220: StarTree: Upgraded to allow querying only the inner.
  // 20230220: Ivy: If the container is a flex class, add the spacers in the end.
  // 20230225: StarTree: saves the query string. if the query string is the same as before, hide if it is shown.
  const InnerCache = [];
  var Hit = 0;
  var bFlex = (window.getComputedStyle(elContainer).display ==="flex");
  var mFlex = "";
  var mQuery = elContainer.getAttribute("mQueryString");
  var mDisplay = window.getComputedStyle(elContainer).display;
  if(mQuery==eQuery && mDisplay!="none"){
    elContainer.setAttribute("mDefaultDisplay",elContainer.style.display);
    
    HideEl(elContainer);
    
    return;
  }
  elContainer.setAttribute("mQueryString", eQuery);
  if(elContainer.classList.contains("flex")){
    mFlex = "<div class='spacer'></div>";
  }
  var elTemp = document.createElement("div");
  $(document).ready(function(){
    for(let i=1; i<=ArchiveNum();i++){
      //$(elContainer).hide();
      var backup = $(elContainer).html();
      $(elTemp).load(ArchiveIndex(i) + eQuery, function(){
        if(iInner){
          var elChild = elTemp.firstElementChild;
          if(elChild != null){
            InnerCache[i]=elChild.innerHTML;
          }
        }else{
          InnerCache[i]=$(elTemp).html();
        }
        Hit = Hit + 1
        if(Hit==ArchiveNum()){        
          $(elTemp).html(InnerCache.join(""));
          if( $(elTemp).html().length == 0){
            $(elContainer).html("<div><small>🐣 <i>(No record for "+ eQuery + ")</i></small></div>");
            ShowEl(elContainer);
            //$(elContainer).show();
            return;
          }else{ 
            $(elContainer).html($(elTemp).html() + mFlex + mFlex);
          }
          if(backup == $(elTemp).html() && $(elContainer).is(':visible') ){
            DEBUG("HIDE");
            HideEl(elContainer);
            //$(elContainer).hide();
          }else{
            $(elContainer).html($(elTemp).html());
            Macro(elContainer);
            ShowEl(elContainer);
            //$(elContainer).show();
          }	
        }
      });
    }
  });
}
function XP_Counter(iCache,iFrame,iCode,iName){
  // 20230210: StarTree
  var mSum = 0;
  $(iCache).children("[data-" + iCode + "-" + iName + "]").each(function(){
    var mCount = Math.max(1,Number(this.getAttribute("data-"+ iCode +"-"+ iName)));
    iFrame.setAttribute(iCode, Number(iFrame.getAttribute(iCode))+mCount);
    mSum += mCount;
  });
  return mSum;
}
function XP_Counter2(iCache,iFrame,iCode1,iCode2,iCodeName, iName){
  // 20230212: StarTree: Query entries with both.
  var mSum = 0;
  $(iCache).children("[data-" + iCode1 + "-" + iName + "]"+"[data-" + iCode2 + "-" + iName + "]").each(function(){
    var mCount1 = Math.max(1,Number(this.getAttribute("data-"+ iCode1 +"-"+ iName)));
    var mCount2 = Math.max(1,Number(this.getAttribute("data-"+ iCode2 +"-"+ iName)));
    var mCount = Math.min(mCount1,mCount2);
    iFrame.setAttribute(iCodeName, Number(iFrame.getAttribute(iCodeName))+mCount);
    mSum += mCount;
  });
  return mSum;
}
function XP_CounterNF(iCache,iCode,iName){
  // 20230210: StarTree
  var mSum = 0;
  $(iCache).children("[data-" + iCode + "-" + iName + "]").each(function(){
    var mCount = Math.max(1,Number(this.getAttribute("data-"+ iCode +"-"+ iName)));
    mSum += mCount;
  });
  return mSum;
}
function XP_Display(elAvatar){
  // JQUERY count data-CXP-iPlayer
  // 20230125: Ledia: Copied and modified from the DXP function
  // 20230221: StarTree: Created XP_DisplayEL for the content, because in this function the viewer clicked on the avatar, not the frame.
  XP_DisplayEL(elAvatar.parentNode);
}
function XP_DisplayEL(elFrame){
  // 20230221: StarTree: elFrame is the actual frame where data is stored and displayed.
  var elScoreBoard = elFrame.parentNode;
  var mSortedBy = elScoreBoard.getAttribute("sortedby");
  var mSortOrder = elScoreBoard.getAttribute("sortorder");
  if(IsBlank(mSortedBy)){
    mSortedBy = "totalxp";
    mSortOrder = -1;
    elScoreBoard.setAttribute("sortedby",mSortedBy);
    elScoreBoard.setAttribute("sortorder",mSortOrder);
  }
  
  var elCache = document.createElement("div");

  var CountTXP = 0; elFrame.setAttribute("TXP",0); // TOTAL EXP
  var CountAXP = 0; elFrame.setAttribute("AXP",0); // Arcacian Award
  var CountBXP = 0; elFrame.setAttribute("BXP",0); // Blog / Beauty / Usability
  var CountCXP = 0; elFrame.setAttribute("CXP",0); // Concept / Philosophy
  var CountCoXP = 0; elFrame.setAttribute("CoXP",0); // 🦁 Courage
  var CountDXP = 0; elFrame.setAttribute("DXP",0); // Idea
  var CountGXP = 0; elFrame.setAttribute("GXP",0); // Gem / Memories and Past / Consolidation
  var CountGaXP = 0; elFrame.setAttribute("GaXP",0); // 🍎 Grocery 
  var CountGcXP = 0; elFrame.setAttribute("GcXP",0); // 🥘 Cooking
  var CountHXP = 0; elFrame.setAttribute("HXP",0); // 📯 Herald / Call for Help
  var CountIXP = 0; elFrame.setAttribute("IXP",0); // 🔍 Investigation
  var CountJXP = 0; elFrame.setAttribute("JXP",0); // ⚖️ Judging
  var CountKXP = 0; elFrame.setAttribute("KXP",0); // 🎩 Surprise, entertainment
  var CountLXP = 0; elFrame.setAttribute("LXP",0); // 🔔 Reminder
  var CountLemonXP = 0; elFrame.setAttribute("LemonXP",0); // 🍋 Weapon: Sour Lemon
  var CountLnXP = 0; elFrame.setAttribute("LnXP",0); // ⚡ Weapon: Lightning
  var CountLuckXP = 0; elFrame.setAttribute("LuckXP",0);// 🍀 
  var CountMXP = 0; elFrame.setAttribute("MXP",0); // 🎨 Manga
  var CountOXP = 0; elFrame.setAttribute("OXP",0); // Oracle / Error Catching / Error Prevention
  var CountPXP = 0; elFrame.setAttribute("PXP",0); // 📌 Goal, milestone, objective setting.
  var CountPhotoXP = 0; elFrame.setAttribute("PhotoXP",0); // 📷 Photo, Picture, Screenshot
  var CountQXP = 0; elFrame.setAttribute("QXP",0); // 🎪,⭐ Quest
  var CountRXP = 0; elFrame.setAttribute("RXP",0); // 🚨 Alarm 
  var CountRcXP = 0; elFrame.setAttribute("RcXP",0); // ♻️ Recycle 
  var CountRecXP = 0; elFrame.setAttribute("RecXP",0); // 🏅 Quest 
  var CountSXP = 0; elFrame.setAttribute("SXP",0); // 🎓 Studying 
  var CountTXP = 0; elFrame.setAttribute("TXP",0); // 🧹 Tidying 
  var CountTeaXP= 0; elFrame.setAttribute("TeaXP",0); // 🍵 Tea/Japanese/Chill
  var CountUXP = 0; elFrame.setAttribute("UXP",0); // 🍮 Self-Fault
  var CountVXP = 0; elFrame.setAttribute("VXP",0); // 🗃️ Archival / Clerical
  var CountWarpXP= 0; elFrame.setAttribute("WarpXP",0); // 🌀 Warp
  var CountWaterXP= 0; elFrame.setAttribute("WaterXP",0); // 🌊 Water
  var CountWbXP= 0; elFrame.setAttribute("WbXP",0); // 💣 Weapon: Bomb
  var CountWdXP= 0; elFrame.setAttribute("WdXP",0); // 🗡️ Weapon: Dagger
  var CountWgXP= 0; elFrame.setAttribute("WgXP",0); // 🔫 Weapon: Firearm
  var CountWjXP= 0; elFrame.setAttribute("WjXP",0); // 🥋 Weapon: Dojo/Grapple
  var CountWkXP= 0; elFrame.setAttribute("WkXP",0); // 🚀 Weapon: Rocket
  var CountWpXP= 0; elFrame.setAttribute("WpXP",0); // 🍍 Weapon: Plant based
  var CountWrXP= 0; elFrame.setAttribute("WrXP",0); // 🏹 Weapon: Ranged
  var CountWsXP= 0; elFrame.setAttribute("WsXP",0); // ⚔️ Weapon: Sword
  var CountWwXP= 0; elFrame.setAttribute("WwXP",0); // 🐺 Weapon: Wolf
  var CountZXP = 0; elFrame.setAttribute("ZXP",0); // 🧩 Puzzle XP
  
  var CountPlayed = 0; // For Detective Level Calculation
  var CountWIN = 0; elFrame.setAttribute("DXP-WIN",0); 
  var CountLOS = 0; elFrame.setAttribute("DXP-LOS",0); 
  var CountCHA = 0; elFrame.setAttribute("DXP-CHA",0); // DXP-CHA. Challenge. 20230205: Ledia
  var CountCHAWIN = 0; elFrame.setAttribute("DXP-CHAWIN",0); // DXP-CHA & DXP-WIN. Challenge WIN. 20230205: Tanya

  var done = 0;
  
  var mName = elFrame.getAttribute("name"); if(mName == null){return;}
  // 20230128: Ledia: Made Nick functional.
  var mNick = elFrame.getAttribute("nick"); if(mNick == null){mNick = mName};
  // 20230128: Ledia: Added Archetype
  var mArch = elFrame.getAttribute("archetype"); if(mArch == null){mArch = "???"};
  // 20230806: Ledia: Add link to profile
  var mProfile = elFrame.getAttribute("profile"); 

  var mCXPTitle= elFrame.getAttribute("CXPTitle"); 
  if(mCXPTitle == null){mCXPTitle = "Philosopher";}
  
  var mDetective= elFrame.getAttribute("detective"); 
  if(mDetective == null){mDetective = "Detective";}
  
  var mQXPTitle= elFrame.getAttribute("QXPTitle");
  if(mQXPTitle == null){mQXPTitle = "Quester";}
  
  var mStar = "⭐";

  var mQueryStr = XP_QueryStr(mName);

  for(let i=1; i<=ArchiveNum();i++){
    $(document).ready(function(){
      $(elCache).hide();
      $(elCache).load(ArchiveIndex(i) + mQueryStr, function(){	
        CountAXP += XP_Counter(elCache,elFrame,"AXP",mName);
        CountBXP += XP_Counter(elCache,elFrame,"BXP",mName);
        CountCXP += XP_Counter(elCache,elFrame,"CXP",mName);
        CountCoXP += XP_Counter(elCache,elFrame,"CoXP",mName);
        CountDXP += XP_Counter(elCache,elFrame,"DXP",mName);
        CountWIN += XP_Counter(elCache,elFrame,"DXP-WIN",mName);
        CountLOS += XP_Counter(elCache,elFrame,"DXP-LOS",mName);
        CountCHA += XP_Counter(elCache,elFrame,"DXP-CHA",mName);
        CountCHAWIN += XP_Counter2(elCache,elFrame,"DXP-CHA","DXP-WIN","DXP-CHAWIN",mName);
        CountGXP += XP_Counter(elCache,elFrame,"GXP",mName);
        CountGaXP += XP_Counter(elCache,elFrame,"GaXP",mName);
        CountGcXP += XP_Counter(elCache,elFrame,"GcXP",mName);
        CountHXP += XP_Counter(elCache,elFrame,"HXP",mName);
        CountIXP += XP_Counter(elCache,elFrame,"IXP",mName);
        CountJXP += XP_Counter(elCache,elFrame,"JXP",mName);
        CountKXP += XP_Counter(elCache,elFrame,"KXP",mName);
        CountLXP += XP_Counter(elCache,elFrame,"LXP",mName);
        CountLemonXP += XP_Counter(elCache,elFrame,"LemonXP",mName);
        CountLnXP += XP_Counter(elCache,elFrame,"LnXP",mName);
        CountLuckXP += XP_Counter(elCache,elFrame,"LuckXP",mName);
        CountMXP += XP_Counter(elCache,elFrame,"MXP",mName);
        CountOXP += XP_Counter(elCache,elFrame,"OXP",mName);
        CountPXP += XP_Counter(elCache,elFrame,"PXP",mName);
        CountPhotoXP += XP_Counter(elCache,elFrame,"PhotoXP",mName);
        CountQXP += XP_Counter(elCache,elFrame,"QXP",mName);
        CountRXP += XP_Counter(elCache,elFrame,"RXP",mName);
        CountRcXP += XP_Counter(elCache,elFrame,"RcXP",mName);
        CountRecXP += XP_Counter(elCache,elFrame,"RecXP",mName);
        CountSXP += XP_Counter(elCache,elFrame,"SXP",mName);
        CountTXP += XP_Counter(elCache,elFrame,"TXP",mName);
        CountTeaXP += XP_Counter(elCache,elFrame,"TeaXP",mName);
        CountUXP += XP_Counter(elCache,elFrame,"UXP",mName);
        CountVXP += XP_Counter(elCache,elFrame,"VXP",mName);
        CountWarpXP += XP_Counter(elCache,elFrame,"WarpXP",mName);
        CountWaterXP += XP_Counter(elCache,elFrame,"WaterXP",mName);
        CountWbXP += XP_Counter(elCache,elFrame,"WbXP",mName);
        CountWdXP += XP_Counter(elCache,elFrame,"WdXP",mName);
        CountWgXP += XP_Counter(elCache,elFrame,"WgXP",mName);
        CountWjXP += XP_Counter(elCache,elFrame,"WjXP",mName);
        CountWkXP += XP_Counter(elCache,elFrame,"WkXP",mName);
        CountWpXP += XP_Counter(elCache,elFrame,"WpXP",mName);
        CountWrXP += XP_Counter(elCache,elFrame,"WrXP",mName);
        CountWsXP += XP_Counter(elCache,elFrame,"WsXP",mName);
        CountWwXP += XP_Counter(elCache,elFrame,"WwXP",mName);
        CountZXP += XP_Counter(elCache,elFrame,"ZXP",mName);
        done +=1;
        if(done>=ArchiveNum()){

          GuildEXP_Total = GuildEXP(mName);
          elFrame.setAttribute("TotalXP",GuildEXP_Total);

          GuildEXP_Lv = Math.floor(Math.sqrt(GuildEXP_Total));

          TotalTXP = CountAXP + CountBXP + CountCXP + CountCoXP + CountDXP + CountGXP + CountGaXP + CountGcXP + CountHXP + CountIXP + CountJXP + CountKXP + CountLXP + CountLemonXP + CountLnXP + CountLuckXP + CountMXP + CountOXP + CountPXP + CountPhotoXP + CountQXP + CountRXP + CountRcXP + CountRecXP + CountSXP + CountTXP + CountTeaXP + CountUXP + CountVXP + CountWarpXP + CountWaterXP + CountWbXP + CountWdXP + CountWgXP + CountWjXP + CountWkXP + CountWpXP + CountWrXP + CountWsXP + CountWwXP + CountZXP;
          
          
          //LevelTXP = Math.floor(Math.sqrt(TotalTXP));
          //LevelTXP = Math.floor(Math.sqrt(LevelTXP));
          // 20230312: Ledia: Use Total Guild XP for stars. Calculate by Log10.
          LevelStars = Math.floor(Math.log10(GuildEXP_Total));

          Content = "<div class=\"mbav50r mb" + mName + " mbpointer\" onclick=\"XP_Display(this)\"></div>";
          /*
          Content += "<span style=\"float:right;margin-right:-5px;margin-bottom:-5px;\">"+ mStar.repeat(LevelStars) +"</span>";
          Content += "<small>"+mArch+"&nbsp;Lv&nbsp;"+ LevelTXP +"</small><br>";
          Content += "<a class=\"mbbutton\" onclick=\"HideNext(this)\">"+mNick +"</a>";
          */
          //Content += "<b>"+mNick +"</b><hr class=\"mbhr0\">";
          
          // 20230806: Ledia: Add link to profile if it exists
          if( mProfile!= null){
            Content += "<span class='mbRef' title='" + mProfile + "'>";
            Content += "<a class='mbbuttonIn' ";
            Content += "href='" + ViewerPath() + "?id=" + mProfile + "' ";
            Content += "onclick=\"" + InterLink() + "'" + mProfile + "');return false;\">📋</a>";  
            Content += "</span>";
          }
          
          Content += "<b>"+mNick +"</b><hr>";
          Content += "<span style=\"float:right;margin-right:-55px;margin-bottom:-5px;letter-spacing:-2px;position:relative;z-index:1\"><small>"+ mStar.repeat(LevelStars) +"</small></span>";
          Content += "<a style='display:inline-block' class=\"mbbutton\" onclick=\"ShowNext(this)\" title=\""+ GuildEXP_Total +"\"><small>"+mArch+"&nbsp;Lv&nbsp;"+ GuildEXP_Lv +"</small></a>";

          Content += "<hide>";
          Content += "<span style=\"float:right;margin-top:-0px;margin-bottom:-5px;\"><big><b>&nbsp;"+ TotalTXP +"</b></big></span>";
          
          Content += "<small>";
          if(CountCXP>0){Content += "<b>🏛️&nbsp;" + CountCXP + "</b> ";}
          if(CountQXP>0){Content += "<b>🎪&nbsp;" + CountQXP + "</b> ";} 
          if(CountGaXP>0){Content += "<b>🍎&nbsp;" + CountGaXP + "</b> ";} 
          if(CountPXP>0){Content += "<b>📌&nbsp;" + CountPXP + "</b> ";}  
          if(CountAXP>0){Content += "<b>💗&nbsp;" + CountAXP + "</b> ";}  
          if(CountBXP>0){Content += "<b>🎀&nbsp;" + CountBXP + "</b> ";} 
          if(CountRXP>0){Content += "<b>🚨&nbsp;" + CountRXP + "</b> ";} 
          if(CountHXP>0){Content += "<b>📯&nbsp;" + CountHXP + "</b> ";}
          if(CountJXP>0){Content += "<b>⚖️&nbsp;" + CountJXP + "</b> ";}
          if(CountLXP>0){Content += "<b>🔔&nbsp;" + CountLXP + "</b> ";}
          if(CountDXP>0){Content += "<b>💡&nbsp;" + CountDXP + "</b> ";}
          if(CountRcXP>0){Content += "<b>♻️&nbsp;" + CountRcXP + "</b> ";}
          if(CountLuckXP>0){Content += "<b>🍀&nbsp;" + CountLuckXP + "</b> ";}
          if(CountZXP>0){Content += "<b>🧩&nbsp;" + CountZXP + "</b> ";}
          if(CountTeaXP>0){Content += "<b>🍵&nbsp;" + CountTeaXP + "</b> ";} 
          if(CountIXP>0){Content += "<b>🔍&nbsp;" + CountIXP + "</b> ";}
          if(CountGXP>0){Content += "<b>💎&nbsp;" + CountGXP + "</b> ";}
          if(CountOXP>0){Content += "<b>🔮&nbsp;" + CountOXP + "</b> ";} 
          if(CountUXP>0){Content += "<b>🍮&nbsp;" + CountUXP + "</b> ";} 
          if(CountMXP>0){Content += "<b>🎨&nbsp;" + CountMXP + "</b> ";} 
          if(CountTXP>0){Content += "<b>🧹&nbsp;" + CountTXP + "</b> ";} 
          if(CountGcXP>0){Content += "<b>🥘&nbsp;" + CountGcXP + "</b> ";} 
          if(CountVXP>0){Content += "<b>🗃️&nbsp;" + CountVXP + "</b> ";} 
          if(CountPhotoXP>0){Content += "<b>📷&nbsp;" + CountPhotoXP + "</b> ";}
          if(CountSXP>0){Content += "<b>🎓&nbsp;" + CountSXP + "</b> ";} 
          if(CountKXP>0){Content += "<b>🎩&nbsp;" + CountKXP + "</b> ";} 
          if(CountCoXP>0){Content += "<b>🦁&nbsp;" + CountCoXP + "</b> ";}
          if(CountLemonXP>0){Content += "<b>🍋&nbsp;" + CountLemonXP + "</b> ";}
          if(CountWpXP>0){Content += "<b>🍍&nbsp;" + CountWpXP + "</b> ";}
          if(CountWwXP>0){Content += "<b>🐺&nbsp;" + CountWwXP + "</b> ";}
          if(CountWjXP>0){Content += "<b>🥋&nbsp;" + CountWjXP + "</b> ";}
          if(CountWsXP>0){Content += "<b>⚔️&nbsp;" + CountWsXP + "</b> ";}
          if(CountWdXP>0){Content += "<b>🗡️&nbsp;" + CountWdXP + "</b> ";}
          if(CountWrXP>0){Content += "<b>🏹&nbsp;" + CountWrXP + "</b> ";}
          if(CountWgXP>0){Content += "<b>🔫&nbsp;" + CountWgXP + "</b> ";}
          if(CountWbXP>0){Content += "<b>💣&nbsp;" + CountWbXP + "</b> ";}
          if(CountWkXP>0){Content += "<b>🚀&nbsp;" + CountWkXP + "</b> ";}
          if(CountLnXP>0){Content += "<b>⚡&nbsp;" + CountLnXP + "</b> ";}
          if(CountWaterXP>0){Content += "<b>🌊&nbsp;" + CountWaterXP + "</b> ";}
          if(CountWarpXP>0){Content += "<b>🌀&nbsp;" + CountWarpXP + "</b> ";}
          if(CountRecXP>0){Content += "<b>🏅&nbsp;" + CountRecXP + "</b> ";}
          Content += "</small>"; 

          // Detective Win Ratio
          CountPlayed = CountWIN + CountLOS;
          if(CountPlayed>0){
            WinRatio = CountWIN / CountPlayed;
            DXP_Eff = Math.floor((CountDXP + CountIXP + CountOXP + CountRXP) * WinRatio);
            DXP_Level = Math.min(Math.floor(Math.sqrt(CountDXP * WinRatio)),CountWIN) + CountCHAWIN;
            elFrame.setAttribute("detectivexp",DXP_Eff);
            elFrame.setAttribute("detectivelvxp", DXP_Level*1000000 + DXP_Eff);
          
            Content += "<div class='mbCB' style='color:navy'>";
            Content += "<small><b>🏅&nbsp;" + mDetective + "&nbsp;Lv&nbsp;" + DXP_Level +"</b></small>";
            Content += "<div style='float:right'><small><b>";
            if(CountCHAWIN>0){
              Content += "👑" + CountCHAWIN;
            }
            if(CountCHA>0){
              Content += "💛" + CountCHA;
            }
            Content += "<span class='mbpointer' onclick='ShowNextHTIL(this)'>✔️" + Math.round(WinRatio*100) + "%</span>";
            Content += "<span class='mbhide mbpointer' onclick='ShowPrevHTIL(this)'>✔️" +CountWIN + "/"+ CountPlayed+ "</span></b></small>";
            Content += "</div>"  ;
            Content += "</div>";
          }
          Content += "</hide>";

          //elFrame.style.order = -TotalTXP;
          elFrame.innerHTML=Content;

          // Auto Sort
          if(mSortedBy=="totalxp"){
            elFrame.style.order = mSortOrder * GuildEXP_Total;
          }else if(mSortedBy=="detectivelvxp"){
            elFrame.style.order = mSortOrder * elFrame.getAttribute("detectivelvxp");
          }


        }
      });
      //DEBUG(CountEXP); //This count will show 0
    });
  }
  elCache.remove();
  //DEBUG(CountEXP); //This count will show 0
}
function SortPSN(el,iAttribute,iSearch){
  // 20230312: Ledia: Look for the div with the attribute search term;
  if(IsBlank(iSearch)){iSearch = 'control';}
  SortEL(SearchPS(el,iSearch).nextElementSibling,iAttribute);

}
function SortPN(el,iAttribute){
  // 20230312: Ledia: For Scoreboard
  SortEL(el.parentNode.nextElementSibling,iAttribute);
}
function SortEL(el,iAttribute){
  // 20230312: Ledia: For Scoreboard
  iAttribute = iAttribute.toLowerCase();  
  var mSortedBy = el.getAttribute("sortedby");
  var mSortOrder = Number(el.getAttribute("sortorder"));
  if(IsBlank(mSortOrder)||mSortOrder==0){mSortOrder = -1;}
  if(mSortOrder != -1){mSortOrder = 1;}
  if(mSortedBy == iAttribute){
    // If Sorted By is the same, reverse the order.
    mSortOrder = mSortOrder * -1;
  }
  el.setAttribute("sortedby",iAttribute);
  el.setAttribute("sortorder",mSortOrder);
  var mEntry = el.firstElementChild;
  while(mEntry != null){
    if(!mEntry.classList.contains("spacer")){
      // Skip Spacers
      mEntry.style.order = mSortOrder * Number(mEntry.getAttribute(iAttribute));
    }
    mEntry = mEntry.nextElementSibling;
  }

}
function DXP(elContainer,iPlayer){
  // JQUERY count data-DXP-iPlayer
  // 20221220: Ivy: Created for @Detective EXP
  // 20221221: Sasha: Adding CountWIN and CountLOS
  var CountEXP = 0;
  var CountWIN = 0;
  var CountLOS = 0;
  var done=0;
  for(let i=1; i<=ArchiveNum();i++){
    $(document).ready(function(){
      $(elContainer).hide();
      $(elContainer).load(ArchiveIndex(i) + "[data-DXP-" + iPlayer + "]", function(){	
        CountEXP += XP_CounterNF(elContainer,"DXP-" + iPlayer + "]").length;
        $(elContainer).load(ArchiveIndex(i) + "[data-DXP-WIN-" + iPlayer + "]", function(){
          CountWIN +=	XP_CounterNF(elContainer,"DXP-WIN-" + iPlayer + "]").length;
          $(elContainer).load(ArchiveIndex(i) + "[data-DXP-LOS-" + iPlayer + "]", function(){	
            CountLOS +=	XP_CounterNF(elContainer,"DXP-LOS-" + iPlayer + "]").length;
            done +=1;
            if(done>=ArchiveNum()){
              CountPlayed = CountWIN + CountLOS;
              WinRatio = CountWIN / CountPlayed;
              DXP_Eff = Math.floor(CountEXP * WinRatio);
              DXP_Level = Math.min(Math.floor(Math.sqrt(CountEXP * WinRatio)),CountWIN);
              Content = "Lv " + DXP_Level + "<br>";
              Content += "💡" + CountEXP +  " ";
              Content += "✔️" + Math.round(WinRatio*100) + "% (" + CountWIN + "/" + CountPlayed + ")"
              /*
              DEBUG("Played: " + CountPlayed);
              DEBUG("Won: " + CountWIN);
              DEBUG("Lost: " + CountLOS);
              DEBUG("Win Ratio: " + Math.round(WinRatio*100) + "%");
              DEBUG("EXP: " + CountEXP);
              DEBUG("DXP: " + DXP_Eff);
              DEBUG("DXP Lv: " + DXP_Level);*/

              $(elContainer).html(Content);
              $(elContainer).show();
            }
          });
        });
      });
      //DEBUG(CountEXP); //This count will show 0
    });
  }
  //DEBUG(CountEXP); //This count will show 0
}
function GuildEXP(iMember){
  // 20230129: Ledia: Added for total EXP.
  // #GuildEXP
  var dict={
    "3B": 4259,
    "44": 354,
    "Albatross": 749,
    "Amelia": 444,
    "Arcacia": 4412,
    "Black": 6542,
    "Cardinal": 1158,
    "Casey": 3140,
    "Emi": 11,
    "Evelyn": 7698,
    "Fina": 1466,
    "Gaia": 573,
    "Helen": 1512,
    "Ivy": 2567,
    "James": 2213,
    "Ken": 571,
    "Kisaragi": 2641,
    "Ledia": 5603,
    "LRRH": 4755,
    "Melody": 308,
    "Mikela": 931,
    "Natalie": 2617,
    "Neil": 215,
    "P4": 3842,
    "Patricia": 1439,
    "Robert": 58,
    "RS": 11,
    "Sasha": 3914,
    "Skyle": 1072,
    "StarTree": 6789,
    "Sylvia": 3286,
    "Tanya": 5064,
    "V": 2389,
    "Vivi": 2750,
    "Vladanya": 1549,
    "Zoey": 5275,
  };
  return dict[iMember];
}
function Roster(iIndex){
  // 20230125: Ledia: Preparing for roster stats display.
  //   Returns the length if the argument is negative.
  const mRoster = ["3B", "44", "Albatross", "Amelia", "Arcacia", "Black", "Cardinal", "Casey", "Emi", "Evelyn", "Fina", "Gaia", "Helen", "Ivy", "James", "Ken", "Kisaragi", "Ledia", "LRRH", "Melody", "Mikela", "Natalie", "Neil", "P4", "Patricia", "Robert", "RS", "Sasha", "Skyle", "StarTree", "Sylvia", "Tanya", "V", "Vivi", "Vladanya", "Zoey"];
  if(iIndex>=0){
    return mRoster[iIndex];
  }else{
    return mRoster.length;
  }
}
function XP_QueryStr(iName){
  return "[data-AXP-" + iName + "]" +"," + 
        "[data-BXP-" + iName + "]" +"," + 
        "[data-CXP-" + iName + "]" +"," + 
        "[data-CoXP-" + iName + "]" +"," + 
        "[data-DXP-" + iName + "]" +"," + 
        "[data-DXP-WIN-" + iName + "]" +"," + 
        "[data-DXP-LOS-" + iName + "]" +"," + 
        "[data-DXP-CHA-" + iName + "]" +"," + 
        "[data-GXP-" + iName + "]" +"," + 
        "[data-GaXP-" + iName + "]" +"," +
        "[data-GcXP-" + iName + "]" +"," +
        "[data-HXP-" + iName + "]" +"," + 
        "[data-IXP-" + iName + "]" +"," + 
        "[data-JXP-" + iName + "]" +"," + 
        "[data-KXP-" + iName + "]" +"," + 
        "[data-LXP-" + iName + "]" +"," + 
        "[data-LemonXP-" + iName + "]" +"," + 
        "[data-LnXP-" + iName + "]" +"," + 
        "[data-LuckXP-" + iName + "]" +"," + 
        "[data-MXP-" + iName + "]" +"," + 
        "[data-OXP-" + iName + "]" +"," + 
        "[data-PXP-" + iName + "]" +"," + 
        "[data-PhotoXP-" + iName + "]" +"," + 
        "[data-QXP-" + iName + "]" +"," + 
        "[data-RXP-" + iName + "]" +"," + 
        "[data-RcXP-" + iName + "]" +"," + 
        "[data-RecXP-" + iName + "]" +"," + 
        "[data-SXP-" + iName + "]" +"," + 
        "[data-TXP-" + iName + "]" +"," + 
        "[data-TeaXP-" + iName + "]" +"," + 
        "[data-UXP-" + iName + "]" +"," + 
        "[data-VXP-" + iName + "]" +"," + 
        "[data-WarpXP-" + iName + "]" +"," + 
        "[data-WaterXP-" + iName + "]" +"," + 
        "[data-WbXP-" + iName + "]" +"," + 
        "[data-WdXP-" + iName + "]" +"," + 
        "[data-WgXP-" + iName + "]" +"," + 
        "[data-WjXP-" + iName + "]" +"," + 
        "[data-WkXP-" + iName + "]" +"," + 
        "[data-WpXP-" + iName + "]" +"," + 
        "[data-WrXP-" + iName + "]" +"," + 
        "[data-WsXP-" + iName + "]" +"," + 
        "[data-WwXP-" + iName + "]" +"," + 
        "[data-ZXP-" + iName + "]";
}
function XP_Tally(elContainer){
  // 20230117: StarTree: To tally and copy PXP scores to Guild Log
  var elCache = document.createElement("div");
  const mRosterSize = Roster(-1);
  const mTally = [];
  const mDone = [];
  const mXPQueryStr = [];
  var done = 0;
  const mArchiveSize = ArchiveNum();
  var elStatus = elContainer.previousElementSibling;

  for(let j=0;j<mRosterSize;j++){ // For each member
    mTally[j]=0;
    mDone[j]=0;
    mXPQueryStr[j] = XP_QueryStr(Roster(j));
    //mMember = Roster(j); 20230128: StarTree: Does not work. The names will all be Zoey!
    for(let i=1; i<=mArchiveSize;i++){
      $(document).ready(function(){
      $(elContainer).hide();
      $(elCache).load(ArchiveIndex(i) + mXPQueryStr[j], function(){	
        // 20230128: StarTree: Adding QXP accounting for Quests.
        iAXP = 	XP_CounterNF(elCache,"AXP",Roster(j));
        iBXP = 	XP_CounterNF(elCache,"BXP",Roster(j));
        iCXP = 	XP_CounterNF(elCache,"CXP",Roster(j));
        iCoXP = 	XP_CounterNF(elCache,"CoXP",Roster(j));
        iDXP = 	XP_CounterNF(elCache,"DXP",Roster(j));
        iGXP = 	XP_CounterNF(elCache,"GXP",Roster(j));
        iGaXP = 	XP_CounterNF(elCache,"GaXP",Roster(j));
        iGcXP = 	XP_CounterNF(elCache,"GcXP",Roster(j));
        iHXP = 	XP_CounterNF(elCache,"HXP",Roster(j));
        iIXP = 	XP_CounterNF(elCache,"IXP",Roster(j));
        iJXP = 	XP_CounterNF(elCache,"JXP",Roster(j));
        iKXP = 	XP_CounterNF(elCache,"KXP",Roster(j));
        iLXP = 	XP_CounterNF(elCache,"LXP",Roster(j));
        iLemonXP = 	XP_CounterNF(elCache,"LemonXP",Roster(j));
        iLnXP = 	XP_CounterNF(elCache,"LnXP",Roster(j));
        iLuckXP = 	XP_CounterNF(elCache,"LuckXP",Roster(j));
        iMXP = 	XP_CounterNF(elCache,"MXP",Roster(j));
        iOXP = 	XP_CounterNF(elCache,"OXP",Roster(j));
        iPXP = 	XP_CounterNF(elCache,"PXP",Roster(j));
        iPhotoXP = 	XP_CounterNF(elCache,"PhotoXP",Roster(j));
        iQXP = 	XP_CounterNF(elCache,"QXP",Roster(j));
        iRXP = 	XP_CounterNF(elCache,"RXP",Roster(j));
        iRcXP = 	XP_CounterNF(elCache,"RcXP",Roster(j));
        iRecXP = 	XP_CounterNF(elCache,"RecXP",Roster(j));
        iSXP = 	XP_CounterNF(elCache,"SXP",Roster(j));
        iTXP = 	XP_CounterNF(elCache,"TXP",Roster(j));
        iTeaXP = 	XP_CounterNF(elCache,"TeaXP",Roster(j));
        iUXP = 	XP_CounterNF(elCache,"UXP",Roster(j));
        iVXP = 	XP_CounterNF(elCache,"VXP",Roster(j));
        iWarpXP = 	XP_CounterNF(elCache,"WarpXP",Roster(j));
        iWaterXP = 	XP_CounterNF(elCache,"WaterXP",Roster(j));
        iWbXP = 	XP_CounterNF(elCache,"WbXP",Roster(j));
        iWdXP = 	XP_CounterNF(elCache,"WdXP",Roster(j));
        iWgXP = 	XP_CounterNF(elCache,"WgXP",Roster(j));
        iWjXP = 	XP_CounterNF(elCache,"WjXP",Roster(j));
        iWkXP = 	XP_CounterNF(elCache,"WkXP",Roster(j));
        iWpXP = 	XP_CounterNF(elCache,"WpXP",Roster(j));
        iWrXP = 	XP_CounterNF(elCache,"WrXP",Roster(j));
        iWsXP = 	XP_CounterNF(elCache,"WsXP",Roster(j));
        iWwXP = 	XP_CounterNF(elCache,"WwXP",Roster(j));
        iZXP = 	XP_CounterNF(elCache,"ZXP",Roster(j));
        mTally[j] += (iAXP + iBXP + iCXP + iCoXP + iDXP + iGXP + iGaXP + iGcXP + iHXP + iIXP + iJXP + iKXP + iLXP + iLemonXP + iLnXP + iLuckXP + iMXP + iOXP + iPXP + iPhotoXP + iQXP + iRXP + iRcXP + iRecXP + iSXP + iTXP + iTeaXP + iUXP + iVXP + iWarpXP + iWaterXP + iWbXP + iWdXP + iWgXP + iWjXP + iWkXP + iWpXP + iWrXP + iWsXP + iWwXP + iZXP);
        mDone[j] ++;
        if(mDone[j] >= mArchiveSize ){
        //if(mDone[j] >= 1 ){
          DEBUG(Roster(j) + "(" + mDone[j] + "/" + mArchiveSize + "): " + mTally[j] +" FINAL");
          done++;
          $(elStatus).html(done+"/"+mRosterSize);
        }else{
          DEBUG(Roster(j) + "(" + mDone[j] + "/" + mArchiveSize + "): " + mTally[j]);
        }
        if(done >= mRosterSize){
          var mResult="";
          for(let k=0;k<mRosterSize;k++){
            mResult = mResult + mTally[k] + "\n";
          }
          ClipboardAlert(mResult,"Tally result is ready for clipboard!");
          /*if( document.hasFocus()==false){
            alert("Tally result is ready for clipboard!");
          }
          navigator.clipboard.writeText(mResult);*/
          $(elStatus).html(done+"/"+mRosterSize + "✅");
          DEBUG("COMPLETED: Tallied " + mRosterSize + " members!");
          $(elContainer).html("Tallied to Clipboard");
          $(elContainer).show();
          elCache.remove();
        }
      });
    });
    }// For each archive
  }// For each member
  
}
function XP_TallyAllPN(el,bHideSelf){
  // 20230221: StarTree: Added for score board
  var elFrame = el.parentNode.nextElementSibling;
  if(bHideSelf){el.classList.add("mbhide");}
  XP_TallyAllEL(elFrame);
  
}
function XP_TallyAllPSN(el,bHideSelf,iSearch){
  // 20230313: Ledia: Default key is 'control'
  if(IsBlank(iSearch)){iSearch = 'control';} 
  if(bHideSelf){el.classList.add("mbhide");}
  XP_TallyAllEL(SearchPS(el,iSearch).nextElementSibling);
}
function XP_TallyAllEL(elFrame){
  // 20230221: StarTree: Added for score board
  var elTar = elFrame.firstElementChild;
  var mCount = 0;
  while(elTar != null){
    if(elTar.getAttribute("name") != null ){
      XP_DisplayEL(elTar);
    }
    elTar = elTar.nextElementSibling;
  }
  
}
function QueryAllPP(elThis,eQuery,iInner){
  var elTarget = elThis.parentNode;
  elTarget = elTarget.previousElementSibling;
  QueryAllEL(elTarget,eQuery,iInner);
}
function QueryAllP2P(elThis,eQuery,iInner){
  // 20221210: StarTree: Place Node Single Click upgrade
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.previousElementSibling;
  QueryAllEL(elTarget,eQuery,iInner);
}
function QueryAllPN(elThis,eQuery,iInner){
  var elTarget = elThis.parentNode;
  elTarget = elTarget.nextElementSibling;
  QueryAllEL(elTarget,eQuery,iInner);
}
function HideOnPhone(elThis){
  // 20230213: StarTree
  if(AtMobile()){
    elThis.style.display = "none";
  }
  /*
  if((elTarget.getBoundingClientRect()).width <= 500){  
    elTarget.style.display = "none";
  }*/
}
function AtMobile(){
  return (window.innerWidth <= 500);
}
function QueryAllPNH(elThis,eQuery,iInner){
  // 20230213: StarTree: checks frame size and hide
  var elTarget = elThis.parentNode;
  HideOnPhone(elTarget);
  elTarget = elTarget.nextElementSibling;
  QueryAllEL(elTarget,eQuery,iInner);
}
function QueryAllP2N(elThis,eQuery,iInner){
  // 20221124: Evelyn: Added for Happy Calendar
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.nextElementSibling;
  QueryAllEL(elTarget,eQuery,iInner);
}
function QueryAllP2NH(elThis,eQuery,iInner){
  // 20230219: Natalie
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  HideOnPhone(elTarget);
  elTarget = elTarget.nextElementSibling;
  QueryAllEL(elTarget,eQuery,iInner);
}

function RefreshPS(el){
  // 20230316: Black: Goes up parents and requery the element that has mQueryString
  // Created for Pinned Board.
  var elFrame = SearchPS(el,"mQueryString");
  var mQuery = elFrame.getAttribute("mQueryString");
  var mInner = elFrame.getAttribute("mInner");
  if(IsBlank(mQuery)){HideEl(elFrame);}
  elFrame.setAttribute("mQueryString","");
  QueryAllEL(elFrame,mQuery,mInner);
}
function QueryAllP3N(elThis,eQuery,iInner){
  // 20221210: StarTree: Place Node Single Click upgrade
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.nextElementSibling;
  QueryAllEL(elTarget,eQuery,iInner);
}
function QueryAllP3NH(elThis,eQuery, iInner){
  // 20230213: StarTree: checks frame size and hide
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  HideOnPhone(elTarget);
  elTarget = elTarget.nextElementSibling;
  QueryAllEL(elTarget,eQuery,iInner);
}

function QueryAllP4N(elThis,eQuery,iInner){
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.nextElementSibling;
  QueryAllEL(elTarget,eQuery,iInner);
}
function QueryAllP4NH(elThis,eQuery,iInner){
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  HideOnPhone(elTarget);
  elTarget = elTarget.nextElementSibling;
  QueryAllEL(elTarget,eQuery,iInner);
}
// 20221206: StarTree: For Node Calendar
function QueryAllP5(elThis,eQuery,iInner){
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  QueryAllEL(elTarget,eQuery,iInner);
}
function QueryAllP5N(elThis,eQuery,  iInner){
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.nextElementSibling;
  QueryAllEL(elTarget,eQuery,iInner);
}
function QueryAllP6(elThis,eQuery,iInner){
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  QueryAllEL(elTarget,eQuery,iInner);
}
function QueryAllP6N(elThis,eQuery,iInner){
  // 20221210: Evelyn: For displaying kudos calendar in main calendar
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.nextElementSibling;
  QueryAllEL(elTarget,eQuery,iInner);
}
// 20221206: StarTree: For Node Calendar
function QueryAllP7(elThis,eQuery,iInner){
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  QueryAllEL(elTarget,eQuery,iInner);
}
// 20221206: StarTree: For Node Calendar
function QueryAllP8(elThis,eQuery,iInner){
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  QueryAllEL(elTarget,eQuery,iInner);
}
function QueryAllReplace(elNode, eQuery){
  // JQUERY
  // 2022-11-14: Ivy: Upgrade to support Archive2
  const InnerCache = [];
  var Hit=0;
  for(let i=1; i<=ArchiveNum();i++){
    var elTemp = document.createElement("div");
    $(document).ready(function(){
      $(elTemp).load(ArchiveIndex(i) + eQuery, function(){
        NodeFormatter(elTemp);
       
        // 20230318: Skyle: Added MacroMacro here so profile can work. 
        MacroMacro(elTemp);
        // 20221204: StarTree: Added MacroLnk here so cache can work. Wee~~!
        MacroLnk(elTemp);
        InnerCache[i]=elTemp.innerHTML;
        Hit++;
        if(Hit==ArchiveNum()){
          $(elNode).after(InnerCache.join(""));
          elNode.remove();
        }
      });
    });
  }
}
function NodeFormatter(elTemp){
    var vDivs = elTemp.getElementsByTagName('div');
    var vFirstDiv = vDivs[0];
    while( vFirstDiv != null){
    var vTemps = vFirstDiv.getElementsByTagName('node-content');
      if( vTemps.length > 0)  {
        var vID = vFirstDiv.id.substring(1);
        var vContent = vTemps[0].innerHTML;
        vTemps = vFirstDiv.getElementsByTagName('node-icon');
        var vIcon = vTemps[0].innerHTML;
        vTemps = vFirstDiv.getElementsByTagName('node-title');
        var vTitle = vTemps[0].innerHTML;
        vFirstDiv.innerHTML="<div><button class='mbbutton' onclick='ShowNext(this)'>" 
          + vIcon + " " + vTitle 
          + "</button><div class='mbCB mbscroll mbhide'>" 
          + "<a class='mbbuttonIn' href='" + ViewerPath() +"?id=P" + vID  + "'>"
          + "<small>⭐</small></a> <small><b>" + vID + "</b></small><hr>"
          + vContent 
          + "<hr class='mbCB'>"
          + "<h4>Mentions</h4><jq>[data-" + vID + "]</jq>"
          + "</div></div>" ;
      }
      vFirstDiv = vFirstDiv.nextElementSibling;
    }
}
function QueryAllReplace2(elNode, eQuery){
  // JQUERY
  // 2022-11-14: Ivy: Upgrade to support Archive2
  const InnerCache = [];
  var Hit = 0;
  for(let i=1; i<=ArchiveNum();i++){
    var elTemp = document.createElement("div");
    $(document).ready(function(){
    $(elTemp).load(ArchiveIndex(i) + eQuery, function(){
        NodeFormatter(elTemp);
        InnerCache[i]=elTemp.innerHTML;
        Hit = Hit + 1;
        if(Hit==ArchiveNum()){
          $(elNode).after(InnerCache.join(""));
        }
    });
    });
  }
}
function QueryAllNext(elThis, eQuery){
  // JQUERY
  var elNext = elThis.nextElementSibling;
  /* 20220715: LRRH: Upgraded for loading quest list. */
  QueryAllEL(elNext, eQuery);
  return;
  // 20230227: Let QueryAllEL handle all logic.
  if( $(elNext).html()=="" || !$(elNext).is(':visible')){
    QueryAllEL(elNext, eQuery);
  }else{
    $(elNext).hide();
  }
  /*if( $(elNext).is(':visible') ){
    $(elNext).hide();
  }else{
    QueryAllEL(elNext, eQuery);
  }*/
}
function QueryAllNext20230312(elThis, eQuery, bRetain){
  // 20230312: Zoey: If bRetain is true, just hide/show the content if mQueryString is set.
  var elNext = elThis.nextElementSibling;
  if(bRetain && NotBlank(elNext.getAttribute("mQueryString"))){
    if(elNext.classList.contains("mbhide")){elNext.classList.remove("mbhide");}else{elNext.classList.add("mbhide");}
    DEBUG(333);
    return;
  }
  /* 20220715: LRRH: Upgraded for loading quest list. */
  QueryAllEL(elNext, eQuery);
  return;
}
function QueryAllP2CHT(el, eQuery){
  // 20230207: Tanya: Added for Scoreboard
  var elTarget = el.parentNode.parentNode.firstElementChild;
  QueryAllEL(elTarget, eQuery);
  $(el).hide();
}
function QueryAllPrev(elThis, eQuery){
  // 20230207: Tanya: Added for Scoreboard
  var elNext = elThis.previousElementSibling;
  if( $(elNext).html()=="" || !$(elNext).is(':visible')){
    QueryAllEL(elNext, eQuery);
  }else{
    $(elNext).hide();
  }
}
function QueryAllNextNT(elThis, eQuery){
  // 20230207: Tanya: for Scoreboard
  var elNext = elThis.nextElementSibling;
  QueryAllEL(elNext, eQuery);
  $(elThis).hide();
}
function QueryAllNextNR(elThis, eQuery){
  // 20230131: StarTree: NR: No Refresh
  var elNext = elThis.nextElementSibling;
  if( $(elNext).html()==""){
    QueryAllEL(elNext, eQuery);
  }else if(!$(elNext).is(':visible')){
    $(elNext).show();
  }else{
    $(elNext).hide();
  }
}
function QueryAllNextClr(elThis, eQuery,iInner){
  // 20230120: StarTree: Clears the content when it hides. (For Embedded music player.)
  // JQUERY
  var elNext = elThis.nextElementSibling;
  /* 20220715: LRRH: Upgraded for loading quest list. */
  if( $(elNext).html()=="" || !$(elNext).is(':visible')){
    QueryAllEL(elNext, eQuery,iInner);
  }else{
    $(elNext).html("");
  }
}
function QueryDay(eContainer, eDate){
  // JQUERY
  var elContainer = document.getElementById(eContainer);
  QueryDayEl(elContainer,eDate);
}
// 20221206: StarTree: For Node Calendar
function QueryDayP4N(elThis, eDate){
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.nextElementSibling;
  QueryDayEl(elTarget,eDate);
}
// 20221206: StarTree: For Node Calendar
function QueryDayP5N(elThis, eDate){
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.nextElementSibling;
  QueryDayEl(elTarget,eDate);
}
// 20221206: StarTree: For Node Calendar
function QueryDayP6N(elThis, eDate){
  var elTarget = elThis.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.parentNode;
  elTarget = elTarget.nextElementSibling;
  QueryDayEl(elTarget,eDate);
}
// 20221206: StarTree: For Node Calendar
function QueryDayEl(elContainer,eDate){
  var qArchive = ArchiveSelect(eDate);
  var qDate = "[date='" + eDate + "']";
  var sDate = new Date(eDate.substring(0,4) + "/" + eDate.substring(4,6) + "/" + eDate.substring(6,8));
  var sDateString = GetMonthText(sDate).toUpperCase() + " " + sDate.getDate() + " " + GetDayText(sDate).toUpperCase();
  
  $(document).ready(function(){
    var backup = $(elContainer).html();
	$(elContainer).load(qArchive + qDate, function(){	
        NodeFormatter(elContainer);  
	  var sHeader = "<div class='mbpc'><b>" + sDateString + "</b></div><div class='mbbanner'>";
	  var sFooter = "</div>";
	  $(elContainer).html(  sHeader +   $(elContainer).html() + sFooter) 
	  
	  var backup2 = $(elContainer).html();
	  if(backup == backup2 && $(elContainer).is(':visible') ){
		$(elContainer).hide();
	  }else{
        //var eNode = document.getElementById(eContainer);
        //var eNodes = do
      Macro(elContainer);
      $(elContainer).show();
        
	  }	
	});
  });
}
function QueryMain(eHTML, eDIV, bJump){  
  // Updating URL (https://www.30secondsofcode.org/articles/s/javascript-modify-url-without-reload)
  const nextURL = eHTML + ".html";
  const nextTitle = '';
  const nextState = { additionalInformation: 'Updated the URL with JS' };

  if(bJump==0){
	 LoadTab("MBJQSW", eHTML, eDIV);
	 location.href= "#";
	 // This will create a new entry in the browser's history, without reloading  
     //window.history.pushState(nextState, nextTitle, nextURL);
	 // This will replace the current entry in the browser's history, without reloading
     window.history.replaceState(nextState, nextTitle, nextURL);
  }else{
	window.location.href = nextURL;
  }
 
}
function PinCh(eCH){
  var eHTML="https://panarcana.blogspot.com/2021/12/branch-bakery"
  var bJump=0;
  var mBanner = "";
  switch(eCH){
  case 11: eHTML="../../2021/12/carrot-farm"; mBanner="202208181042"; break;
  case 12: eHTML="../../2021/12/magic-academy"; mBanner="202210032214"; break;
  case 13: eHTML="../../2021/12/world-tree"; mBanner="202208292208"; break;
  case 14: eHTML="../../2021/12/vacation-island"; mBanner="202210080934"; break;
  case 15: eHTML="../../2021/12/evelyns-garden"; mBanner="202208181022"; break;
  case 16: eHTML="../../2021/12/Catacomb"; mBanner="202207161025"; break;
  case 17: eHTML="../../2021/12/main-stage";  mBanner="202208172107"; break;
  case 18: eHTML="../../2021/12/branch-bakery"; break;
  case 19: eHTML="../../2021/12/puzzle-buzzle"; mBanner="202208141928"; break;
  case 20: eHTML="../../2021/12/adventurers-hall"; mBanner="202212090038"; break;
  case 21: eHTML="../../2021/12/pirate-bay"; break;
  case 22: eHTML="../../2021/12/expedition"; mBanner="202208180941"; break;
  case 23: eHTML="../../2021/12/ageless-forest"; mBanner="202208162133"; break;
  case 24: eHTML="../../2021/12/paladin-hall"; mBanner="202208092007"; break;
  case 25: eHTML="../../2021/12/harbor"; mBanner="202208180954"; break;
  case 26: eHTML="../../2021/12/library"; mBanner="202210151642"; break;
  case 27: eHTML="../../2021/12/magic-bakery-hq"; mBanner="202208172056"; break;
  case 28: eHTML="../../2021/12/freedom-plaza"; mBanner="202208141916"; break;
  case 29: eHTML="../../2021/12/mira-mira"; mBanner="202208071528"; break;
  case 30: eHTML="../../2021/12/cardinal"; mBanner="202208250038"; break;
  case 31: eHTML="../../2022/05/magic-bakery-detectives"; mBanner="202208141844"; break;  
  }
  if( mBanner!=""){
    QueryBanner(mBanner);
  }else{
    QueryMain(eHTML,"MBJQ",bJump);
  }
}
function QueryMainCh(eCH){
  PinCh(eCH);
}
function QueryMonth(eContainerID, eDate, eSection){
  var elContainer = document.getElementById(eContainerID);
  QueryMonthEL(elContainer, eDate, eSection);
  
}
function QueryMonthEL(elContainer, eDate, eSection){
  // JQUERY
  var qArchive = ArchiveSelect(eDate);
  var qDate = "[date^='" + eDate.substring(0,6) + "']";
  var qSec  = "[data-" + eSection + "]";
  $(document).ready(function(){
    var backup = $(elContainer).html();
	$(elContainer).load(qArchive + qDate + qSec, function(){	
	  var backup2 = $(elContainer).html();
	  if(backup == backup2 && $(elContainer).is(':visible') ){
		$(elContainer).hide();
	  }else{
		$(elContainer).show();
	  }	
	});
  });
}
function QueryMonthNext(elThis, eDate, eSection){
  var elNext = elThis.nextElementSibling;
  QueryMonthEL(elNext, eDate,eSection);
}
function QueryProfile(eContainerID,iCharID){
  var elContainer = document.getElementById(eContainerID);
  QueryProfileEL(elContainer, iCharID);
}
function QueryProfileCustom(elContainer,iCharID){
  // JQUERY function to return the custom profile (HTML) section of a character.
  var qArchive = SelectArchiveRoster(iCharID);	
  var qProfile = "[data-profile-custom='" + iCharID + "']";
  var sReturn;
  $(document).ready(function(){
  	$(elContainer).load(qArchive + qProfile, function(){	
	alert($(elContainer).html());
	  return $(elContainer).html();
	});
  });
}
function PinProfile(iCharID){
  // JQUERY function to compose character profile from stored data.
  var elContainer = document.getElementById("MBJQSW");
  QueryProfileEL(elContainer,iCharID);
  return;
}
function QueryProfileEL(elContainer,iCharID){
  // JQUERY function to compose character profile from stored data.

  var qArchive = SelectArchiveRoster(iCharID);
  var qProfile = "[data-profile-custom='" + iCharID + "']";
  $(document).ready(function(){
    var backup = $(elContainer).html();
	$(elContainer).hide();
    $(elContainer).load(qArchive + qProfile, function(){	
      var sCusProfile = $(elContainer).html(); 
      qProfile = "[data-profile='" + iCharID + "']";
      $(elContainer).load(qArchive + qProfile, function(){	
  	    $(elContainer).load(qArchive + qProfile, function(){	
          var sContent = "";
          var sFullName =  $(qProfile).attr("data-fullname");
		  var sLevel = $(qProfile).attr("data-level");
		  var sArchetype = $(qProfile).attr("data-archetype");
		  if(sArchetype == "ALC"){
    	    sArchetype = "Alchemist";
		  }else if (sArchetype == "CLR"){
    		sArchetype = "Cleric";
		  }else if (sArchetype == "HRD"){
    		sArchetype = "Herald";
		  }else if (sArchetype == "MAG"){
    		sArchetype = "Magician";
		  }else if (sArchetype == "OCL"){
    		sArchetype = "Oracle";
		  }else if (sArchetype == "PLD"){
    		sArchetype = "Paladin";
		  }
		
		  //sContent = "<div class='mbpointer mbav100r mb" + iCharID + "' onclick=\"PinProfile('"  + iCharID + "')\"></div>";
		  sContent = sContent + "<h3>" + sFullName + "</h3>";
		  sContent = sContent + "<b>Level " + sLevel + " " + sArchetype + "</b>";
		  //sContent = sContent + "<hr>";
		  sContent = sContent + sCusProfile;
          sContent = sContent + "<hr><button class='mbbutton' onclick=\"QueryAllNext(this,'[data-moment-" + iCharID + "]')\">" + iCharID + " moments ⭐</button><hide></hide>";
	    $(elContainer).html("<div class='mbCharPage'>" + sContent + "<div class='mbCB'></div></div>");  
	    
      var elMBJQSW = document.getElementById("MBJQSW");
      if (elContainer == elMBJQSW){
        Macro(elContainer);
        $(elContainer).show();
      }else{ 
        var backup2 = $(elContainer).html();
		    if(backup == backup2  ){
  		    $(elContainer).hide();
			    $(elContainer).html("");
	      }else{
          Macro(elContainer);
			    $(elContainer).show();
		    }
      }
	    });
	  });
	});
  });
}
function QueryProfileNext(elThis, iCharID){
  var elNext = elThis.nextElementSibling;
  QueryProfileEL(elNext, iCharID);
}
function QueryTabEL(elContainer, eQuery){
  // 20221213: Sasha: Same as QueryAll but does not hide.
  const InnerCache = [];
  var Hit = 0;
  for(let i=1; i<=ArchiveNum();i++){
    $(document).ready(function(){
      var backup = $(elContainer).html();
    $(elContainer).load(ArchiveIndex(i) + eQuery, function(){	
      InnerCache[i]=$(elContainer).html();
      Hit = Hit + 1
      if(Hit==ArchiveNum()){
        $(elContainer).html(InnerCache.join(""));
        if(backup == $(elContainer).html() && $(elContainer).is(':visible') ){
          //$(elContainer).hide();
        }else{
          Macro(elContainer);
          $(elContainer).show();
        }	
      }
    });
    });
  }
}
function QueryTabPN(elThis,eQuery){
  var elTarget = elThis.parentNode;
  elTarget = elTarget.nextElementSibling;
  QueryTabEL(elTarget,eQuery);
}
function RandomToday(){
  // Returns a "random" number between 0 to 1 (inclusive) 
  var today = new Date();
  var refUTC = new Date(Date.UTC(2022,1,20,0,0,0));
  return Math.abs(Math.sin(Math.floor( (today.getTime()-refUTC.getTime())/(1000*3600*24) )));    
}

function RollCallList(el){
  // 20230202: StarTree: For Roll Call
  var elContainer = el.parentNode.nextElementSibling;
  var mRosterLen = Roster(-1);
  var mContent = "<hr><div style='margin-top:50px;margin-bottom:50px;'>";
  var bCookieEnabled = (elContainer.getAttribute('CookieEnabled')=="true");
  var mAvStr = "";
  for(var i=0;i<mRosterLen;i++){
    mName = Roster(i);
    mAvStr = "mbav50tr"; // Not selected
    mSelStr = "false";
    if(bCookieEnabled){
      mStatus = localStorage.getItem("RollCall-" + mName);
      if(mStatus > 0){
        mAvStr = "mbav50trg"; // Selected
        mSelStr = "true";
      }
    }
    mContent += "<div onclick='RollCallToggle(this)' ";
    mContent += "style='display:inline-block' ";
    mContent += "name='" + mName + "' ";
    mContent += "selected='" + mSelStr + "' ";
    mContent += "class='"+ mAvStr +" mb" + mName + "'></div> ";
  }
  mContent += "</div><hr>";
  elContainer.innerHTML = mContent;
  if(bCookieEnabled){
    el.innerHTML="Refresh";
  }else{
    el.innerHTML="Reset";
  }
}
function RollCallTally(el){
  // 20230204: StarTree: For Roll Call Feature
  // Create the comma separated string for clipboard.
  try{
    var elRoster = el.parentNode.nextElementSibling.firstElementChild.nextElementSibling;
    var elMember = elRoster.firstElementChild;
  }catch(error){
    return;
  }
  var mStatusStr = "Tallying...";
  var mTallyStr = "";
  var mCountTotal = 0;
  var mCountSelected = 0;
  while(elMember != null){
    
    mCountTotal ++;
    mName = elMember.getAttribute("name");
    mSelected = elMember.getAttribute("selected");
    if(mSelected == "true"){
      mCountSelected ++;
      if(mTallyStr==""){
        mTallyStr = mName;
      }else{
        mTallyStr += ", " + mName;
      }
    }
    mStatusStr = "Tallying " + mCountSelected + "/" + mCountTotal + "...";
    el.innerHTML = mStatusStr;
    
    elMember = elMember.nextElementSibling;
    
  }
  mStatusStr = "Tallied: " + mCountSelected + "/" + mCountTotal + " 📋";
  el.innerHTML = mStatusStr;
  ClipboardAlert(mTallyStr, "Tally result is ready for clipboard!");

}
function ClipboardAlert(iResult,iMessage){
  // 20230204: StarTree: Used by Tally functions.
  if( document.hasFocus()==false){
    if(iMessage==null){iMessage="Copied to clipboard!";}
    alert(iMessage);
  }
  navigator.clipboard.writeText(iResult);
}
function RollCallToggle(el){
  // 20230202: StarTree: For Roll Call
  mName = el.getAttribute("name");
  
  var elContainer = el.parentNode.parentNode;
  var bCookieEnabled = (elContainer.getAttribute('CookieEnabled')=="true");
  var elListButton = el.parentNode.parentNode.previousElementSibling.firstElementChild;

  /*if(bCookieEnabled){
    bSelected = (localStorage.getItem("RollCall-" + mName) >0);
  }else{
    
  }*/
  var bSelected = (el.getAttribute("selected")=="true");
  
  if(!bSelected){
    el.setAttribute("selected","true");
    el.classList.remove("mbav50tr");
    el.classList.add("mbav50trg");
    if(bCookieEnabled){
      localStorage.setItem("RollCall-" + mName, 1); // 1= Present.
    }
  }else{
    el.setAttribute("selected","false");
    //el.className = "mbav50t mb" + mName;
    el.classList.remove("mbav50trg");
    el.classList.add("mbav50tr");
    if(bCookieEnabled){
      localStorage.setItem("RollCall-" + mName, 0); // 0= Absent.
    }
  }
  if(bCookieEnabled){
    RollCallList(elListButton);
  }

}
function RollCallUseCookie(el){
  // 20230203: StarTree: For Roll Call Feature
  var elContainer = el.parentNode.nextElementSibling;
  var elListButton = el.parentNode.firstElementChild;
  var bCookieEnabled = (elContainer.getAttribute('CookieEnabled')=="true");
  if(!bCookieEnabled){
    bCookieEnabled = confirm("Would you allow saving roll call status to a cookie on your device?");
  }else{ // Cookie is enabled, does user want to disable?
    bCookieEnabled = !confirm("Would you like to stop saving roll call status to a cookie on your device?");
  }
  if(bCookieEnabled){
    elContainer.setAttribute("CookieEnabled","true");
    el.innerHTML = "🍪✅";
    elListButton.innerHTML = "Refresh";
    RollCallList(elListButton);
  }else{
    elContainer.setAttribute("CookieEnabled","false");
    el.innerHTML = "🍪⛔";
    elListButton.innerHTML = "Reset";
  }
}
function SelectArchiveRoster(iCharID){
	// ARCHIVE SELECTION (There is only one archive for now)
	return "../../p/roster.html ";
}
function ShowAHideB(elAID, elBID, iMode){
	var eToShow = document.getElementById(elAID);
	var eToHide = document.getElementById(elBID);
	if(iMode==""){
	  iMode = "inline";
	}
	if(eToShow.style.display==iMode){
	  eToShow.style.display="none";	
	}else{
	  eToShow.style.display= iMode;
	  eToHide.style.display="none";
	}
}
function ShowAHideThis(elAID, iMode, eToHide){
	var eToShow = document.getElementById(elAID);
	eToShow.style.display= iMode;
	eToHide.style.display="none";
}
function ShowPP(el){
  // 20230413: Evelyn
  ShowEl(el.parentNode.previousElementSibling);
}
function ShowNext(el) {
  //20230220: Fina: Fixed the double click bug with getComputedStyle
  var eTar = el.nextElementSibling;
  ShowEl(eTar);
}
function ShowL(el){
  // 20230314: Arcacia: Created for Whose turn development area
  ShowEl(el.lastElementChild);
}
function ShowN3(el) {
  // 20230213: StarTree: For Vacation Island
  var eNext = el.nextElementSibling;
  eNext = eNext.nextElementSibling;
  eNext = eNext.nextElementSibling;
  if (eNext.style.display != "block") {
      Macro(eNext);
      eNext.style.display = "block";
  } else {
      eNext.style.display = "none";
  }
}
function ShowLPN(el){
  // 20230204: Tanya: Created for Cardinal Quest Dashboard.
  // Shows the last element child content at the parent's next sibling.
  var elSource = el.lastElementChild;
  var elTarget = el.parentNode.nextElementSibling;
  elTarget.innerHTML = elSource.innerHTML;
}
function ShowLP2N(el){
  // 20230205: Tanya: Created for Cardinal Quest Dashboard.
  // Shows the last element child content at the grandparent's next sibling.
  var elSource = el.lastElementChild;
  var elTarget = el.parentNode.parentNode.nextElementSibling;
  elTarget.innerHTML = elSource.innerHTML;
}
function ShowLP2NH(el){
  // 20230219: Natalie: Created for Criminal Law concepts list.
  // Shows the last element child content at the target.
  var elSource = el.lastElementChild;
  var elTarget = el.parentNode.parentNode;
  HideOnPhone(elTarget);
  elTarget = elTarget.nextElementSibling;
  elTarget.innerHTML = elSource.innerHTML;
}
function ShowLP3N(el){
  // 20230222: Mikela: Added for Puzzle Plaza
  var elSource = el.lastElementChild;
  var elTarget = el.parentNode.parentNode.parentNode;
  elTarget = elTarget.nextElementSibling;
  elTarget.innerHTML = elSource.innerHTML;
}
function LAPSN(el,eID,iInner){
  // 20230301: Evelyn: Based on ShowLPSN but for QueryAllEL
  var elTarget = SearchPS(el,"");
  elTarget = elTarget.nextElementSibling;
  LoadArchivePostEl(elTarget,eID,iInner);
}
function QueryAllPSN(el,eQuery,iInner){
  // 20230301: Evelyn: Based on ShowLPSN but for QueryAllEL
  // Goes up the parents unit it has the attribute, then go to the next element.
  // 20230307: StarTree: Never hide the target.
  var elTarget = SearchPS(el,"");
  elTarget = elTarget.nextElementSibling;
  elTarget.setAttribute("mQueryString","");
  QueryAllEL(elTarget,eQuery,iInner);
}
function ShowLPSN(el,iAttribute){
  // 20230225: StarTree: Goes up the parents until it has the attribute.
  var elSource = el.lastElementChild;
  var elTarget = SearchPS(el,iAttribute);
  elTarget = elTarget.nextElementSibling;
  elTarget.innerHTML = elSource.innerHTML;
  elTarget.classList.remove("mbhide");
}
function PrepLPSN(el,iAttribute){
  // 20230226: StarTree: Goes up the parents until it has the attribute. But do not display.
  var elSource = el.lastElementChild;
  var elTarget = el.parentNode;
  while(elTarget != null && elTarget.getAttribute(iAttribute)==null){
    elTarget = elTarget.parentNode;
  }  
  elTarget = elTarget.nextElementSibling;
  elTarget.classList.add("mbhide");
  elTarget.innerHTML = elSource.innerHTML;
}
function ShowLP3NH(el){
  // 20230214: Natalie: Created for Criminal Law concepts list.
  // Shows the last element child content at the target.
  var elSource = el.lastElementChild;
  var elTarget = el.parentNode.parentNode.parentNode;
  HideOnPhone(elTarget);
  elTarget = elTarget.nextElementSibling;
  elTarget.innerHTML = elSource.innerHTML;
}
function ShowImgPP(elThis,iImgURL){
  // 20230311: StarTree: Created for displaying Manga pages.
  var elTarget = elThis.parentNode.previousElementSibling;
  elTarget.innerHTML = "<img src='" + iImgURL + "'>";
  elTarget.classList.remove("mbhide");
}
function ShowNextPP(elThis){
  // 2022-10-31 Created for displaying Manga pages.
  var elTarget = elThis.parentNode;
  elTarget = elTarget.previousElementSibling;
  var elNext = elThis.nextElementSibling;
  elTarget.innerHTML = elNext.innerHTML;
  elTarget.style.display= "block";
  elTarget.setAttribute("mQueryString", "");
}
function ShowNextP2P(elThis){
  // 20230314: 3B: Created for manga display
  var elTarget = elThis.parentNode.parentNode;
  elTarget = elTarget.previousElementSibling;
  var elNext = elThis.nextElementSibling;
  elTarget.innerHTML = elNext.innerHTML;
  elTarget.style.display= "block";
  elTarget.setAttribute("mQueryString", "");
}
function ShowNextPN(elThis){
  var elTarget = elThis.parentNode;
  elTarget = elTarget.nextElementSibling;
  var elNext = elThis.nextElementSibling;
  elTarget.innerHTML = elNext.innerHTML;
  elTarget.style.display= "block";
  elTarget.setAttribute("mQueryString", "");
}
function ToggleHidePN(el){
  ToggleHide(el.parentNode.nextElementSibling);
}
function ToggleHide(el){
  // 20230313: Ledia: For Scoreboard
  if(el.classList.contains("mbhide")){
    el.classList.remove("mbhide");
  }else{
    el.classList.add("mbhide");
  }
}
function ToggleNextPN(elThis){
  // 20230313: Ledia: For Scoreboard
  var elTarget = elThis.parentNode.nextElementSibling;
  var elSource = elThis.nextElementSibling;
  if(elTarget.innerHTML != elSource.innerHTML){
    elTarget.innerHTML = elSource.innerHTML;
    elTarget.classList.remove("mbhide");
  }else{
    ToggleHide(elTarget);
  }
}
function ShowNextP2N(elThis){
  var elTarget = elThis.parentNode.parentNode;
  elTarget = elTarget.nextElementSibling;
  var elNext = elThis.nextElementSibling;
  elTarget.innerHTML = elNext.innerHTML;
  elTarget.style.display= "block";
  elTarget.setAttribute("mQueryString", "");
}
function ShowNextP2NIL(elThis){
  var elTarget = elThis.parentNode.parentNode;
  elTarget = elTarget.nextElementSibling;
  var elNext = elThis.nextElementSibling;
  elTarget.innerHTML = elNext.innerHTML;
  elTarget.style.display= "inline";
  elTarget.setAttribute("mQueryString", "");
}
function ShowNextP2NH(elThis){
  var elTarget = elThis.parentNode.parentNode;
  HideOnPhone(elTarget);
  elTarget = elTarget.nextElementSibling;
  var elNext = elThis.nextElementSibling;
  elTarget.innerHTML = elNext.innerHTML;
  elTarget.style.display= "block";
  elTarget.setAttribute("mQueryString", "");
}
function ShowNextP3N(elThis){
  var elTarget = elThis.parentNode.parentNode.parentNode;
  elTarget = elTarget.nextElementSibling;
  var elNext = elThis.nextElementSibling;
  elTarget.innerHTML = elNext.innerHTML;
  elTarget.style.display= "block";
  elTarget.setAttribute("mQueryString", "");
}
function ShowNextP3NIL(elThis){
  var elTarget = elThis.parentNode.parentNode.parentNode;
  elTarget = elTarget.nextElementSibling;
  var elNext = elThis.nextElementSibling;
  elTarget.innerHTML = elNext.innerHTML;
  elTarget.style.display= "inline";
  elTarget.setAttribute("mQueryString", "");
}
function ShowNextP3NH(elThis){
  var elTarget = elThis.parentNode.parentNode.parentNode;
  HideOnPhone(elTarget);
  elTarget = elTarget.nextElementSibling;
  var elNext = elThis.nextElementSibling;
  elTarget.innerHTML = elNext.innerHTML;
  elTarget.style.display= "block";
  elTarget.setAttribute("mQueryString", "");
}
function ShowNextP3NHIL(elThis){
  var elTarget = elThis.parentNode.parentNode.parentNode;
  HideOnPhone(elTarget);
  elTarget = elTarget.nextElementSibling;
  var elNext = elThis.nextElementSibling;
  elTarget.innerHTML = elNext.innerHTML;
  elTarget.style.display= "inline";
  elTarget.setAttribute("mQueryString", "");
}
function ShowNextHT(el){
  var eNext = el.nextElementSibling;
  el.style.display = "none";
  eNext.style.display = "block";
}
function ShowNextHTIL(el){
  var eNext = el.nextElementSibling;
  el.style.display = "none";
  eNext.style.display = "inline-block";
}
function ShowEl(eTar){
  //20230220: StarTree: Fixed the double click bug with getComputedStyle
  if(window.getComputedStyle(eTar).display === "none"){
    Macro(eTar);
    if(eTar.nodeName == "HIDE"){
      eTar.style.display = "block";
    }
    eTar.classList.remove("mbhide");
  }else{
    if(eTar.nodeName == "HIDE"){
      eTar.style.display = "";
    }
    eTar.classList.add("mbhide");
  }  
}
function ShowElInline(eTar){
  //20230310: Cardinal
  if(window.getComputedStyle(eTar).display === "none"){
    Macro(eTar);
    if(eTar.nodeName == "HIDE"){
      eTar.style.display = "inline";
    }
    eTar.classList.remove("mbhide");
  }else{
    if(eTar.nodeName == "HIDE"){
      eTar.style.display = "";
    }
    eTar.classList.add("mbhide");
  }  
}
function ShowPLInline(el){
  var eTar = el.parentNode.lastElementChild;
  ShowElInline(eTar);
}
function ShowPL(el){
  var eTar = el.parentNode.lastElementChild;
  ShowEl(eTar);
}
function ShowPrev(el){
  var ePrev = el.previousElementSibling;
  ShowEl(ePrev);
}
function ShowPrevHT(el){
  var ePrev = el.previousElementSibling;
  el.style.display = "none";
  ePrev.style.display = "block";
}
function ShowPrevHTIL(el){
  var ePrev = el.previousElementSibling;
  el.style.display = "none";
  ePrev.style.display = "inline-block";
}
function ShowTargetHT(el,elTargetID){
  var eTarget = document.getElementById(elTargetID);
  el.style.display = "none";
  eTarget.style.display = "block";
}
function ShowSkip(el) {
  var eNext = el.nextElementSibling.nextElementSibling;
  if (eNext.style.display != "block") {
      Macro(eNext);
      eNext.style.display = "block";
  } else {
      eNext.style.display = "none";
  }
}
function ShowChatEx(el){
  // 20230515: StarTree: When expanding, add a mbscroll class to the parent and show its last child.
  //   When collapsing, remove a mbscroll class from the parent and hide its last child.
  mParent = el.parentNode;
  if(mParent.classList.contains("mbscroll")){ // Currently expanded
    mParent.classList.remove("mbscroll");
    mParent.lastElementChild.classList.add("mbhide");
  }else{
    mParent.classList.add("mbscroll");
    mParent.lastElementChild.classList.remove("mbhide");
  }
}
function ShowBothInline(el){
  // 20230220: StarTree: checks only the next element, but hides the prev element also if the next element is now visible.
  // 20230225: StarTree: No need to hide the previous for consistency
  ShowNextInline(el);
  var elPrev = el.previousElementSibling;
  var elNext = el.nextElementSibling;
  /*
  if(window.getComputedStyle(elNext).display === "none"){
    elPrev.style.display = "";
  }else{
    elPrev.style.display = "none";
  }*/
}
function ShowPrep(el){
  // 20230226: StarTree: Created for Side Listing layout.
  //           If the current next element is visible, show the next next element.
  // 20230307: StarTree: Search for the child of class "mbPrep" and swap its content with the next2 sibling.
  var elNext = el.nextElementSibling;
  var elPrep = elNext.getElementsByClassName("mbPrep");
  DEBUG(elPrep.length);
  
  var elNext2 = elNext.nextElementSibling; 
  if(window.getComputedStyle(elNext).display === "none"){
    elNext2.classList.add("mbhide");
    elPrep[0].innerHTML = elNext2.innerHTML;
  }else{
    elNext2.classList.remove("mbhide");
    elNext2.innerHTML = elPrep[0].innerHTML ;
  }
  ShowNextInline(el);
}

function ShowNextInline(el) {
  //20230220: StarTree: Upgrade with getComputedStyle
  var eTar = el.nextElementSibling;
  if(window.getComputedStyle(eTar).display === "none"){
    Macro(eTar);
    eTar.style.display = "inline";
  }else{
    eTar.style.display = "none";
  }


/*
  if (eTar.style.display != "inline") {
      Macro(eTar);
      eTar.style.display = "inline";
  } else {
    eTar.style.display = "none";
  }*/
}
function ShowNextInlineHT(el) {
  var eNext = el.nextElementSibling;
  eNext.style.display = "inline";
  el.style.display = "none";
}
function ShowTarget(elTargetID) {
  var eTarget = document.getElementById(elTargetID);
  if (eTarget.style.display != "block") {
      eTarget.style.display = "block";
  } else {
      eTarget.style.display = "none";
  }
}
function ShowTargetF(elTargetID) {
  var eTarget = document.getElementById(elTargetID);
  eTarget.style.display = "block";
}
function ShowTargetCB(elTargetID,elThis) {
  /* For Board Calendar */
  var eTarget = document.getElementById(elTargetID);
  if (eTarget.style.display != "block") {
      eTarget.style.display = "block";
	  elThis.style.backgroundColor = "lemonchiffon";
  } else {
      eTarget.style.display = "none";
	  elThis.style.backgroundColor = "";
  }
}
function ShowTargetIB(elTargetID) {
  var eTarget = document.getElementById(elTargetID);
  if (eTarget.style.display != "inline-block") {
      eTarget.style.display = "inline-block";
  } else {
      eTarget.style.display = "none";
  }
}
function ShowRefMB26(elRefID, elThis) {
  var elRef = document.getElementById(elRefID);
  elNext = elThis.nextElementSibling;
  if(elNext.innerHTML != ""){
    elNext.innerHTML = "";
	elNext.style.display = "none";
	elThis.innerHTML = "📒"
  }else{
	elNext.innerHTML = "<div class='mbq'>" + elRef.innerHTML + "</div>";
	elNext.style.display = "block";
	elThis.innerHTML = "📖"
  }
}
function ShowTextInWnd(elSourceID,elTargetID) {
  var eSource = document.getElementById(elSourceID);
  var eTarget = document.getElementById(elTargetID);
  ShowTextInWndEL(eSource,eTarget);
}
function ShowTextInWndEL(eSource,eTarget) {
  /* 20220715: Evelyn: Macro goes first for comparison */
  Macro(eSource);
  if(eTarget.style.display==null){
    eTarget.innerHTML = eSource.innerHTML;
    Macro(eTarget);
    eTarget.style.display = "block";
  }else if(eTarget.style.display=="none" || eTarget.innerHTML != eSource.innerHTML){
    eTarget.innerHTML = eSource.innerHTML;
    Macro(eTarget);
    eTarget.style.display = "block";
  }else{
	eTarget.innerHTML = "";
	eTarget.style.display = "none";
  }
}
function ShowTextNext(elThis,elSourceID) {
  var eTarget = elThis.nextElementSibling;
  var eSource = document.getElementById(elSourceID);
  ShowTextInWndEL(eSource,eTarget)
}
function ShowAnswerMB24(elSourceID,elThis) {
  /* For MB24 Ask a Paladin */
  var eSource = document.getElementById(elSourceID);
  var eTarget = elThis.nextElementSibling;
  if(eSource.style.backgroundColor == "lemonchiffon"){
	eSource.style.backgroundColor = "";  
    eTarget.innerHTML = "";
	eTarget.style.display = "none";	
	elThis.innerHTML = "💬"
  }else if(eTarget.innerHTML != ""){
	eSource.style.backgroundColor = "lemonchiffon";
	eSource.style.display = "block";
	location.href= "#a" + elSourceID
	elThis.innerHTML = "🌟"
  }else{
    eTarget.style.display = "inline";
    eTarget.innerHTML = eSource.innerHTML;
	elThis.innerHTML = "🌠" 
  }
}
function TextFilter(iScope,iKeyword,iDOMType){
  // 20230219: Natalie: Created based on MainFilter of Master.HTML for TSN HTML.
  // Created for the Criminal Law node.
  // 20230307: StarTree: made the search only collapse div where its parent has the class mbSearch.
  var els = iScope.getElementsByTagName(iDOMType);
  for (i=0;i<els.length;i++){
    var el = els[i];
    if(el.parentNode.classList.contains("mbSearch")){
      if(el.hasAttribute("show")){
        // This is for always showing the spacer.
      }else{
        if (el.textContent.toUpperCase().indexOf(iKeyword) == -1) {
          el.style.display= "none";
        } else {      
          el.style.display= "";
        }
      }
    }
  }
}
function AddElement(el,iType,iHTML){
  var elTemp = document.createElement(iType);
  elTemp.innerHTML = iHTML;
  el.after(elTemp);
  return elTemp;
}
function AddElementFC(el,iType,iHTML){ // Add as a first child
  var elTemp = document.createElement(iType);
  elTemp.innerHTML = iHTML;
  el.prepend(elTemp);
  return elTemp;
}
function TextSearchPN(elSearchBox){
  var mKeyword = elSearchBox.value.toUpperCase().trim();
  var mScope = elSearchBox.parentNode.nextElementSibling;
  TextFilter(mScope,mKeyword,"div");
}
function ToggleNext(el) {
  var eNext = el.nextElementSibling;
  if (eNext.style.display != "") {
      eNext.style.display = "";
  } else {
      eNext.style.display = "none";
  }
}
function CH23_Special(){
  ShowTargetF('About'); 
    QueryAll('DA-ArenaInner','#P202208162133-Content');   
    
}
function ColorSquare(el){
  // 20230412: Evelyn: User clicks on a color square
  mCurColor = el.style.backgroundColor;
  el.style.backgroundColor = getRandomColor1(mCurColor);
}
function getRandomColor1(iCurColor){
  // 20230412: Evelyn: Get a random color that is different from the current color.
  if(IsBlank(iCurColor)){iCurColor = "";}
  mBC = "";
  do{
    switch(getRandomInt(0,10)){
      case 0: mBC = "mediumslateblue"; break; //"#4461e6"
      case 1: mBC = "royalblue"; break;  //"#7cbeff"
      case 2: mBC = "cornflowerblue"; break; 
      case 3: mBC = "green"; break; 
      case 4: mBC = "yellowgreen"; break; 
      case 5: mBC = "gold"; break; 
      case 6: mBC = "orange"; break; 
      case 7: mBC = "tomato"; break; //ff6e27
      case 8: mBC = "chocolate"; break; //f1535f
      case 9: mBC = "sienna"; break; //d14a68

      /*case 0: mBC = "#9a3752"; break; //"#9a3752"
      case 1: mBC = "#cd3549"; break; //hotpink
      case 2: mBC = "#d84e27"; break; //tomato
      case 3: mBC = "#e38724"; break; //orange
      case 4: mBC = "#ecaa27"; break; //gold // "#ecaa27"
      case 5: mBC = "#b3a41a"; break; //yellowgreen
      case 6: mBC = "#728e27"; break; //green
      case 7: mBC = "#42553d"; break; //darkgreen
      case 8: mBC = "#41709a"; break; //dodgerblue
      case 9: mBC = "#323d6f"; break; //slateblue*/
    }
  }while(mBC == iCurColor);
  return mBC;
}
function getRandomInt(min, max) {
  // 20230412: Evelyn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
function JSONCheckPP(el){
  // 20230313: Arcacia: For Whose turn to pay
  var elSource = el.parentNode.previousElementSibling;
  var elReport = el.nextElementSibling;
  try{
    var mJSON = JSON.parse(elSource.value);
  }catch(e){
    elReport.innerHTML = "🚨 " + e.message;
    return;
  }
  elReport.innerHTML = "✅ It parses!";

}
function ViewerPath(){
  // 20231006: Black: Returns the viewer path depending on the location of the website
  if(AtGitHub()){
    return "./";
  }
  return "../../p/viewer.html";
}

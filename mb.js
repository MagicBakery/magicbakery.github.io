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
// OVERLOAD
// 20240410: StarTree
// https://stackoverflow.com/questions/8746882/jquery-contains-selector-uppercase-and-lower-case-issue
jQuery.expr[':'].contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};
function ACLoadAll_20240508_DELETE(bReport){
  // 20240508: Natalie: Load all archives.
  var elArchives = document.querySelector('archives');
  $(document).ready(function(){
    for(let i=1;i<=ArchiveNum();i++){
      let elArchive = elArchives.querySelector('archive'+i);
      $(elArchive).load(ArchiveIndex(i), function(){
        let mDTS = DTSNow();
        elArchive.setAttribute('loaded',mDTS);
        if(bReport){OLReport(mDTS,true)}
      });
    }
  });
}
function AtBlogSpot(){
  // 20230916: StarTree: Return true if this code is at BlogSpot
  return _At("BlogSpot");
}
function AtGitHub(){
  // 20230916: StarTree: Return true if this code is at GitHub
  return _At("GitHub");
}
function AuthorButton(elAuthor){
  // 20240730: StarTree: This handles the effect when the big author button is pressed.
  // Algorithm: Interpret the current state and cycle through these states:
  // 20240913: StarTree: Changed to Card > List > None > Both.
  // 20241015: StarTree: Change to Card > None > List > Both.
  // Bit 1=1 means no banner. Bit 0=1 means no side panel.
  // 1) [2:Card] >> HIDE SIDEPANEL  
  // 2) [3:None] >> SHOW BANNER
  // 3) [1:List] >> SHOW SIDEPANEL 
  // 4) [0:Both] >> HIDE BANNER
  
  var elBoard = SearchPS(elAuthor,"board");
  var elBanner = elBoard.querySelector("[Banner]");
  var elSidePanel = elBoard.querySelector("[SidePanel]");

  // If both lists are empty, just return.
  if(IsBlank(elBanner) && IsBlank(elSidePanel)){return;}

  // If one list is empty, toggle the other.
  if(IsBlank(elBanner)){ToggleHide(elSidePanel);return;}
  if(IsBlank(elSidePanel)){ToggleHide(elBanner);return;}

  // If Both List Exist, Cycle through them.
  var mState = 0;
  if(elBanner.classList.contains("mbhide")){mState += 2;}
  if(elSidePanel.classList.contains("mbhide")){mState += 1;}

  
  // On Desktop:
  if(!AtMobile()){
    switch(mState){
      case 2: ToggleHide(elSidePanel); return;
      case 3: ToggleHide(elBanner); return;
      case 1: ToggleHide(elSidePanel); return;
      case 0: ToggleHide(elBanner); return;
    }
  }else{ // On Mobile: only the side panel or the banner should be displayed. so cycle through these: If Both are shown, the next step should hide the banner.
  // X) [0] SHOW BANNER | SHOW SIDEPANEL
  // 1) [2] HIDE BANNER | SHOW SIDEPANEL
  // 2) [1] SHOW BANNER | HIDE SIDEPANEL
  // 3) [3] HIDE BANNER | HIDE SIDEPANEL
    switch(mState){
      case 0: ToggleHide(elBanner); return;
      case 2: ToggleHide(elBanner); ToggleHide(elSidePanel); return;
      case 1: ToggleHide(elBanner); return;
      case 3: ToggleHide(elSidePanel); return;
      
    }
  }
  
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
  mHTML += "<span class='mbRef'><a class='mbbutton' onClick='BoardRemove(this)' style='float:right' title='Close'>:Close:</a></span>";
  mHTML += "</div><div class='mbCB'></div>";
  elTemp.innerHTML= mHTML;
  MacroIcons(elTemp);
  elTemp.style.marginBottom = "0px";
  var mControl = SearchPS(el,'control');
  mControl.nextElementSibling.prepend(elTemp);
  return elTemp;
}
function BoardAddBefore(el){
  // 20231030: StarTree: Add a board before el (which should also be a board)
  var elTemp = document.createElement("div");
  elTemp.classList.add('mbscroll');

  // STEP: Add the close button.
  var mHTML = "<div control>";
  mHTML += "<span class='mbRef'><a class='mbbutton' onClick='BoardRemove(this)' style='float:right' title='Close'>:Close:</a></span>";
  mHTML += "</div><div class='mbCB'></div>";
  elTemp.innerHTML= mHTML;
  MacroIcons(elTemp);
  elTemp.style.marginBottom = "0px";
  el.before(elTemp);
  return elTemp;
}
function BoardAddAfter(el){
  // 20231115: Ivy: Add a board after el (which should also be a board)
  var elTemp = document.createElement("div");
  elTemp.classList.add('mbscroll');

  // STEP: Add the close button.
  var mHTML = "<div control>";
  mHTML += "<span class='mbRef'><a class='mbbutton' onClick='BoardRemove(this)' style='float:right' title='Close'>:Close:</a></span>";
  mHTML += "</div><div class='mbCB'></div>";
  elTemp.innerHTML= mHTML;
  MacroIcons(elTemp);
  elTemp.style.marginBottom = "0px";
  el.after(elTemp);
  return elTemp;
}
function BoardFill(elBoard,iNodeID,iDoNotScroll,elArchives){
  // 20230821: StarTree: Fill the Board container with content from the node.
  //   The node ID does not have a leading P.
  //   Reference function: LoadArchivePostEl from Blogspot.
  // For Testing: if iNodeID is blank, use this default:
  if(iNodeID==""){iNodeID="202208172056";};
  elBoard.setAttribute("board",iNodeID);

  // STEP: Create a container within the Board after the control section for the content.
  //       ((The board itself has a close button))
  var elContainer = document.createElement("span");
  var mQuery = "#P" + iNodeID;

  // 20240509: Skyle: For Offline Mode
  if(IsBlank(elArchives)){elArchives = Offline()}
  if( NotBlank(elArchives)){    
    //elBoard.firstElementChild.after(elContainer);
    //elContainer.outerHTML = elArchives.querySelector(mQuery).outerHTML;
    BoardFillEL(elBoard,elContainer,elArchives.querySelector(mQuery),iDoNotScroll,true);
    return;
  }
  
  
  // 20231224: StarTree: Make the board itself has an area to display discussions.
  // The structure of a board:
  // <div board>
  //   <div control/> // This has the pudding close button
  //   <span>     // This is a span to support the pudding close button
  //     <span class="mbDayHeader"/>   // This is loaded from the node
  //     <span/>                       // This is the title button loaded from the node
  //     <span class="mbDayContent"/>  // This is loaded from the node
  //   </span>
  //   <div class="mbCB"></div> // // This is also for displaying the discussion section. 
  
  // STEP: Get Archive
  var mArchive = ArchiveSelect(iNodeID);
  

  // STEP: JQuery
  $(document).ready(function(){
    $(elContainer).load(mArchive + mQuery, function(){	
      // elContainer contains the node outer div.
      var elRecord = elContainer.firstElementChild; 
      BoardFillEL(elBoard,elContainer,elRecord,iDoNotScroll);
    }); // END JQuery Load
  }); // END Document ready
}
function OfflineTag(bOffline){
  if(bOffline){
    return " <span style='font-size:10px;color:darkgoldenrod'>(OFFLINE)</span>";
  }
  return "";
}
function BoardFillEL(elBoard,elContainer,elRecord,iDoNotScroll,bOffline){
  // 20240720: StarTree: This function fills a board with content.
  // 20240509: Skyle: Added to handle Offline Archive.

  // 20231224: StarTree: If the node has a <content> section, then assume that this is the new node style that has <node>, <content>, and <ref> sections.
  var elBanner; try{elBanner = elRecord.querySelector('banner');}catch(error){}        
  var elContent = elRecord.querySelector('content');


  var elNode = elRecord.querySelector('node');
  var mNodeID = "";
  //var mProfile = Default(elRecord.getAttribute("data-Profile"),"");

  if(!IsBlank(elContent) && !IsBlank(elNode)){ 
    // 20231224: StarTree: New Format
    var mJSON = JSON.parse(elNode.innerHTML);
    mNodeID = mJSON.id;


    // 20240908: Sylvia: If the node is a profile node, set the profile tag at the board.
    if(elRecord.hasAttribute("data-profile")){
      elBoard.setAttribute("Profile",mJSON.author);
    }

    // 20240804: StarTree: Add local content if enabled.
    if(NodeEditModeCheck()){
      elContent.innerHTML += Default(localStorage.getItem(mNodeID + "-N"),"");
    }

    var mHTMLInner = "<span class='mbDayHeader'></span>";
    // 20240908: Sylvia: If the node is a profile, use the short title at the top.
    // 20240909: StarTree: If the node is a profile, Show the avatar. 
    if(elRecord.hasAttribute("data-profile")){
      //mHTMLInner += RenderAvXP(mJSON.author,"","","","");


      mHTMLInner += "<div style=\"float:left;margin-right:5px;margin-bottom:-5px;\"><div class=\"mbav50tp mb"+mJSON.author+"\" >";
      //mHTMLInner += "<lnk>" + mJSON.id + "|" + mJSON.icon +"</lnk>";
      mHTMLInner += "</div></lnk></div>";
      mHTMLInner += "<small><lnk>"+mJSON.id +"|<span style=\"display:inline-block;font-weight:bold;width:50px\">"+ mJSON.icon+ " " +MemberLevel(mJSON.author)+"</span></lnk></small> ";
      mHTMLInner += MemberHPBar(mJSON.author);
      mHTMLInner += "<br>";
      mHTMLInner += "<a class='mbbutton' onclick='ShowBothInline(this)'>";      
      mHTMLInner += mJSON.author;
    }else{
      //mHTMLInner += "<lnk>" + mJSON.id + "|" + mJSON.icon +"</lnk>&nbsp;<a class='mbbutton' onclick='ShowBothInline(this)'>";
      // 20240910: Evelyn: Use bigger icon.
      //mHTMLInner += "<lnk>" + mJSON.id + "|<span style=\"transform:rotate("+5*getRandomInt(-1,1,true)+"deg)\" class=\"mbBoardIcon\" >" + mJSON.icon +"</span></lnk>&nbsp;<a class='mbbutton' onclick='ShowBothInline(this)'>";
      mHTMLInner += "<lnk>" + mJSON.id + "|<span class=\"mbBoardIcon\" >" + mJSON.icon +"</span></lnk>&nbsp;<a class='mbbutton' onclick='ShowBothInline(this)'>";
      mHTMLInner += mJSON.title;      
    }

    

    mHTMLInner += OfflineTag(bOffline);  
    mHTMLInner += "</a>";
    
    mHTMLInner += "<span class='mbDayContent";
    // 20240909: StarTree: Don't show when it is profile.
    if(elRecord.hasAttribute("data-profile")){ 
      mHTMLInner += " mbhide";
    }
    mHTMLInner += "'>";     

    
    
    // 20240105: Natalie: If there is no music link, still need the link to the node.
    mHTMLInner += Pin2Code(mJSON);

    // 20240912: StarTree: If a node is a help node, show a handshake icon.
    mHTMLInner += NodeTypeHTML(elRecord);



    mHTMLInner += "<button class='mbbutton mbRef' style='opacity:0.2' title='Toggle Size' onclick='BoardToggleHeight(this)'>½</button>"


    

    mHTMLInner += "<div class='mbCB'></div><hr>";

    // BANNER
    if(NotBlank(elBanner)){
      mHTMLInner += "<div>" + elBanner.innerHTML + "</div><div class='mbCB'></div>";
    }

    // CARD / Gallery Section
    var mCardList = ResCardList(elRecord);
    // RES LIST SEARCH SECTION
    //var mResList = ResList(elRecord, IsBlank(mCardList)); 
    var mResList = ResList(elRecord,true); 
    
    mHTMLInner += mResList;

    
    // 20240731: StarTree: If there is no RES or Card, but there is INV, show the content of INV.
    var mInv = elRecord.querySelector("inv");
    if(IsBlank(mResList) && IsBlank(mCardList) && NotBlank(mInv)){
      mHTMLInner += "<div Banner>" + mInv.innerHTML + "</div>";
    }


    
    // 20240329: StarTree: if there is no card at all, don't show the author badge.
    mHasCard = false;
    var elCard;
    try{
      elCard = elRecord.querySelector('card');
    }catch(error){
      mHasCard = true; // 20240427: Skyle: Has inventory.
    }
    
    // STEP: Start the Card/Inventory section
    if(true || !IsBlank(elCard)){ // 20240730: StarTree: Always use the same frame.
      mHasCard = true;
      mHTMLInner += "<div cardmat class='mbCardMat";      
      mHTMLInner += "'>";
      
      
      // 20240723: StarTree: If the INV section contains RES objects, show a search section.      
      mHTMLInner += mCardList;      
      mHTMLInner += "<div class='mbCardMatText'>";
      
      
      
      // 20240721: StarTree: If there is no author, don't show the inv section.
      // This is done for the Sitemap node.
      if((NotBlank(mJSON.author) || NotBlank(mJSON.img)) && !elRecord.hasAttribute('data-chat')){
        // 20240912: StarTree: Use the node image for the button if it exists.        
        if(IsBlank(mJSON.img) || NotBlank(mCardList)){
          mHTMLInner += "<a class='mbbutton' onclick='AuthorButton(this)' style='clear:right;position:relative;z-index:1'><div class='mbav100r mb" + mJSON.author + "'></div></a>";
        }else{          
          mHTMLInner += "<a class='mbbutton' onclick='AuthorButton(this)' style=\"clear:right;position:relative;z-index:1;\"><div class='mbav100r' style=\"background-image:url('" + mJSON.img + "')\"></div></a>";  
        }        
      }
    }

    // STEP: Show Chat header section if it is a chat node.
    if(elRecord.hasAttribute("data-chat")){
      mHTMLInner += ChatNodeContent(elRecord,mJSON);
    }else{
      // STEP: CONTENT Section
      // 20240720: StarTree: Adding a default search box.      

      mHTMLInner += elContent.innerHTML;

    }

    // STEP: Close the Card section.
    if(!IsBlank(elCard)){
      mHTMLInner += "</div>"; // End Text
      
      mHTMLInner += "</div>"; // End Card Mat
    }


    var elRef = elRecord.querySelector('ref');
    
    // REF SECTION
    if(!IsBlank(elRef)){
      mHTMLInner += "<hr class='mbCB'><div class='mbRef";
      mHTMLInner += "'>";
      
      // STEP: Include custom reference links.
      // 20240407: Skyle: Rearranged this first because the link is green.
      mHTMLInner += elRef.innerHTML + " ";

      


      // 20240304: Ivy: Need to show parent link
      if(NotBlank(mJSON.parentid)){
        //mHTMLInner += "<div style='padding-left:28px;font-size:14px;line-height:16px'><lnk>"+mJSON.parentid+"|"+mJSON.parentname+"</lnk></div>";
        mHTMLInner += "<lnk>"+mJSON.parentid+"|🤎"+mJSON.parentname+"</lnk> ";
      }

      
      // STEP: Follow the tags section with the children section.
      // 20240405: StarTree: include the tag.
      if(NotBlank(mJSON.kids)){
        var mJSONKids = mJSON.kids.split(',');
        var mKid = "";
        var mKidHTML = "";
        for(let i=0;i<mJSONKids.length;i++){
          mKid = mJSONKids[i].replaceAll(" ","");
          if(i!=0){mKidHTML += ","}
          mKidHTML += " <a class='mbbutton' onclick=\"QSLBL(this,'[data-" + mKid + "]')\">" + Cap(mKid.replaceAll("-"," ")) + "</a>";
        }      
        mHTMLInner += "<a class='mbbutton' onclick='ShowNextInline(this)'>🐣Kids</a><hide>:" + mKidHTML + "</hide> ";
      }

      // 20240403: StarTree: Trial: Listing all tags (starts with data-)
      // 20240406: StarTree: Start with the tags section. 
      var elAttr = elRecord.attributes;
      let mTags = [];
      var mTagHTML = ""       
      for(j=0;j<elAttr.length;j++){
        if(elAttr[j].name.startsWith('data-')){
          mTags.push(elAttr[j].name.replace('data-',''));              
        }
      }
      mTags.sort();
      for(k=0;k<mTags.length;k++){            
        if(k!=0){mTagHTML += ","}
        mTagHTML += " <a class='mbbutton' onclick=\"QSLBL(this,'[data-" + mTags[k] + "]')\">" + Cap(mTags[k].replaceAll("-"," ")) + "</a>";
        
      }
      if(mTagHTML!=""){
        mHTMLInner += "<a class='mbbutton' onclick='ShowNextInline(this)'>🏷️Tags</a><hide>:" + mTagHTML + "</hide> ";
      }


      // STEP: Show discussion list query button
      //mHTMLInner += "<a class='mbbutton' onclick=\"QueryAllPSL(this,'[data-" + mJSON.id + "]',false,'board')\">💬 Discussions</a>";
      mHTMLInner += "<a class='mbbutton' onclick=\"QSLBL(this,'[id][date][time][data-" + mJSON.id + "],[id][date][time]:has([data-" + mJSON.id + "])')\">💬Discussions</a>";
      
      // 20240804: StarTree: Edit Mode Button @@@@
      if(NotBlank(mNodeID)){
        mHTMLInner += " <a class=\"mbbutton\" onclick=\"NodeEdit(this,'"+mNodeID+"')\">✏️</a>";
      }
      mHTMLInner += "</div>";
    }
    //mHTMLInner += "<hr class='mbCB'>";
    mHTMLInner += "<div class='mbCB'></div>";

    // STEP: Create the QSL area.
    mHTMLInner += "<div class='mbhide mbpuzzle'><button class='mbbutton mbRef' onclick='HideParent(this)'>:Close:</button>";
    mHTMLInner += "<div control></div><div class='mbCB mbSearch' QSL BL style='display:flex;flex-direction: column;''></div><div class='mbCB'></div></div>";

    elContainer.innerHTML = mHTMLInner;
    Macro(elContainer);

  }else{
    elContainer.innerHTML = elRecord.innerHTML;
    Macro(elContainer);
    NodeFormatter(elContainer); // This is for Sasha's format. P202207191024
  }

  // 20240324: StarTree: If there is already content, remove it.
  try{
    var elnextelement = elBoard.firstElementChild.nextElementSibling;
    if(elnextelement.nodeName!="DIV"){
      elnextelement.remove();
    }
  }catch(error){
  }
  elBoard.firstElementChild.after(elContainer);

  // 20240827: James: Auto Sort by Date
  // 20240905: Skyle: Don't auto sort for the Scoreboard.  
  if(mNodeID != "202301251008"){// 202301251008 is the scoreboard node
    try{
      var elControl = elContainer.querySelector("[control]");
      QSLSortByUpdate(elControl.firstElementChild);   
      QSLSortByUpdate(elControl.firstElementChild);      
      QSLShowTag(elControl.nextElementSibling);
      if(NotBlank(mCardList)){        
        elControl.parentNode.classList.add("mbhide");
      }
    }catch(e){}
  }
  

  // 20231115: Sylvia: Scroll to View
  // Ref: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
  // Ref: https://stackoverflow.com/questions/7408100/can-i-change-the-scroll-speed-using-css-or-jquery
  if(iDoNotScroll){
  }else{
    ScrollIntoView(elBoard);
  } 

}
function BoardLoad(el,iNodeID,iDoNotScroll,iNoReTarget,elArchives){
  // 20240821: StarTree: If the innerHTML is blank, just return.
  //if(IsBlank(el.innerHTML)){return;} // 20240823: StarTree: This doesn't work with how Quest Board was designed. So it is disabled.
  
  // 20240507: Sasha: Remove the leading P if iNodeID has it.
  if(iNodeID.slice(0,1).toLowerCase()=="p"){
    iNodeID = iNodeID.slice(1);
  }
  // 20240507: Sasha: If iNodeID is a DTS number, call another function
  if(String(iNodeID).length==14){
    BoardLoadDTS(el,iNodeID,iDoNotScroll,iNoReTarget,elArchives);
    return;
  }

  // 20231006: Black: Make a board in the current column panel given the ID.
  var mBoard="";
  var elBoard;
  var curBoardID;

  // STEP: Check if the target ID is the same as the current board.
  try{
    mBoard = SearchPS(el,'board');
    if(NotBlank(mBoard) ){
      curBoardID = mBoard.getAttribute('board');
    }
  }catch(error){
    
  }
  

  // 20240325: StarTree: Find the target panel if there is one.
  // Do not retarget if the iNoReTarget flag is set.
  if((!iNoReTarget) && (curBoardID!=iNodeID)){
    var elPanel = PanelGetTarget();
    if(NotBlank(elPanel)){
      el = elPanel.firstElementChild;
    }else{
      // 20240924: Tanya: Make BoardLoad work normally when there is no panel.
      BoardLoadPF(el,iNodeID);
      return;
    }
  }




  try{
    // 20231030: StarTree: If there is a board, add it after the board.
    mBoard = SearchPS(el,'board');
    if(mBoard.hasAttribute('reserved')){
      mBoard = "";
    }

    if(curBoardID==iNodeID){
      elBoard = mBoard;

      // 20240406: If the lnk is in the QSL area, just scroll to view.
      if(NotBlank(SearchPS(el,"qsl"))){
        el.classList.add('mbbuttonSelf');
        el.classList.remove('mbbutton');

        ScrollIntoView(elBoard);
        return;
      }

      // 20240405: StarTree: Clear the footer area when refreshing
      elBoard.lastElementChild.innerHTML = "";
    }else{
      elBoard = BoardAddAfter(mBoard);
    }
    
  }catch(error){
    // STEP: Search up for the column control panel
    var mControl = SearchPS(el,'panel').firstElementChild;
    // STEP: Create a new container with a close button.
    elBoard = BoardAdd(mControl);  
  }
  
  // 20240924: Tanya: If the ID is Feedback, load the feedback form instead.
  if(iNodeID=="Feedback"){
    IFrameFeedback(elBoard);
    return;
  }

  BoardFill(elBoard,iNodeID,iDoNotScroll,elArchives);
  var elContainer = document.getElementById('MBJQSW');  
  var prevHTML = $(elContainer).html();
  //var prevHTML = document.body;
  /*@@P4*/var nextState = {"html":prevHTML};
  /*@@P4*/window.history.pushState(nextState, '', "/?id=P" + iNodeID);  
}
function BoardLoadDTS(el,iDTS,iDoNotScroll,iNoReTarget){
  // 20240507: Sasha: Fine the DTS's nodeID, then call BoardLoad with the Node ID.
  
  // STEP: First check if there is a recent archive
  var elArchives = Offline();
  var elDTS = "";
  if(elArchives){
    elDTS = elArchives.querySelector("[dts='"+iDTS+"']");
    if(NotBlank(elDTS)){
      let elArchive = SearchPS(elDTS,'archive');
      let mLoaded = elArchive.getAttribute('loaded');
      if(NotBlank(mLoaded)){
        //let mAge = Number(DTSNow()) - Number(mLoaded);
        //if(mAge < 10000){ // Within one hour
        let elNode = SearchPS(elDTS,'date');
        BoardLoad(el,elNode.id,iDoNotScroll,iNoReTarget,elArchives);
        //DEBUG("Used Cache. Age:" + mAge);
        return true;
        //}
      }
    }
  }



  let elContainer = document.createElement("div");
  let eQuery = "[id]:has([dts='"+ iDTS+"'])";

  $(document).ready(function(){
    for(let i=1; i<=ArchiveNum();i++){
      $(elContainer).load(ArchiveIndex(i) + eQuery, function(){
        if(NotBlank(elContainer.innerHTML)){
          let iNodeID = elContainer.firstElementChild.id.slice(1);
          BoardLoad(el,iNodeID,iDoNotScroll,iNoReTarget);
          return true;
        }
      });
    }
  });
}
function BoardLoadPF(el,iNodeID, iDoNotScroll){
  // 20240324: StarTree: Loads the board at the top of the first column panel.
  BoardLoad(PanelGetFirst().firstElementChild,iNodeID,iDoNotScroll);
}
function BoardLoadPL(el,iNodeID, iDoNotScroll){
  // 20240324: StarTree: Loads the board at the top of the first column panel.
  BoardLoad(PanelGetLast().firstElementChild,iNodeID,iDoNotScroll);
}
function BoardRemove(el){
  // 20231119: StarTree: Need to do it for "board"
  var mBoard = SearchPS(el,'board');
  mBoard.remove();
}
function BoardToggleHeight(elButton){
  // 20240425: StarTree: Toggles a board between half and full size.
  // Full size: height:auto;overflow-y:visible
  // Half Size: height:50%;overflow-y:auto
  // STEP: Index to the element that has the height data
  var elBoard = SearchPS(elButton,'board');
  var mCurHeight = elBoard.style.maxHeight;  
  var mDefault = false;
  switch(mCurHeight){
    case "": // Full to 1/2 or 3/4 depending on initial state
      if(elButton.innerHTML=="½"){
        // To Half Size
        elBoard.style.maxHeight = "48.7%";
        elButton.innerHTML = "½";
      }else{
        // To 3/4 size
        elBoard.style.maxHeight = "74%";
        elButton.innerHTML = "¾";
      }
      break;
    case "74%": // From 3/4 to 2/3
      elBoard.style.maxHeight = "65.5%";
      elButton.innerHTML = "⅔";
      break;
    case "65.5%": // From 2/3, change to 1/2
      elBoard.style.maxHeight = "48.7%";
      elButton.innerHTML = "½";
      break;
    case "48.7%": // From 1/2, change to 1/3
      elBoard.style.maxHeight = "31.8%";
      elButton.innerHTML = "⅓";
      break;
    case "31.8%": // From 1/3, change to 1/4
      elBoard.style.maxHeight = "23.5%";
      elButton.innerHTML = "¼";
      break;
    case "23.5%": // From 1/4, back to full.
    default:
      mDefault = true;
  }
  if(mDefault){
    elBoard.style.maxHeight = "";
    elBoard.style.overflowY = "visible";
    elButton.style.opacity = 0.2;
    elButton.innerHTML = "¾";
  }else{
    elBoard.style.overflowY = "auto";
    elButton.style.opacity = 0.75;
  }
}
function DTC(mDTS,mDTC){
  // 20240504: StarTree: Converts a DTS number into a DTC item code.
  if(IsBlank(mDTC)){
    //DEBUG(DTCYear(mDTS) + "|"+ DTCMonth(mDTS) +"|"+ DTCDay(mDTS) +"|"+ DTCHour(mDTS) +"|"+ DTCMMSS(mDTS));
    return DTCYear(mDTS) + DTCMonth(mDTS) + DTCDay(mDTS) + DTCHour(mDTS) + DTCMMSS(mDTS);
  }else{
    return DTCYear("",mDTC) + DTCMonth("",mDTC) + DTCDay("",mDTC) + DTCHour("",mDTC) + DTCMMSS("",mDTC);
  }
}
function DTCDay(mDTS,mDTC){
  // 20240504: StarTree: Converts the day between DTS and DTC formats.
  const aDay = "123456789ABCDEFGHJKLMNPQRTUVXYZ";
  if(IsBlank(mDTC)){ // From DTS to DTC
    let i = Number(String(mDTS).slice(6,8));
    return aDay.slice(i-1,i);
  }else{ // From DTC to DTS
    let mDD = String(aDay.search(mDTC.slice(3,4))+1).padStart(2,"0");

    return mDD;
  }
}
function DTCHour(mDTS,mDTC){
  // 20240504: StarTree: Converts the hour between DTS and DTC formats.
  const aHour = "0123456789ABCDEFGHJKLMNP";
  if(IsBlank(mDTC)){  // From DTS to DTC
    let i = Number(String(mDTS).slice(8,10));
    return aHour.slice(i,i+1);
  }else{ // From DTC to DTS
    let mHH = String(aHour.search(mDTC.slice(4,5))+1).padStart(2,"0");

    return mHH;
  }
}
function DTCMMSS(mDTS,mDTC){
  // 20240504: StarTree: Converts the mmss between DTS and DTC formats.
  if(IsBlank(mDTC)){ // From DTS to DTC
    let mMM = Number(String(mDTS).slice(10,12));
    let mSS = Number(String(mDTS).slice(12,14));
    return (mMM * 60 + mSS).toString(16).padStart(3,"0").toUpperCase();
  }else{ // From DTC to DTS
    let mNum = Number("0x" + mDTC.slice(5,8));
    let mMM = String(Math.floor(mNum / 60)).padStart(2,"0");
    let mSS = String(mNum % 60).padStart(2,"0");
    return mMM;// + mSS;
  }
}
function DTCMonth(mDTS,mDTC){
  // 20240504: StarTree: Converts the month between DTS and DTC formats.
  const aDTCMonth = "ABCDEFTUVXYZ";
  if(IsBlank(mDTC)){ // From DTS to DTC
    let i = Number(String(mDTS).slice(4,6));
    return aDTCMonth.slice(i-1,i);
  }else{ // From DTC to DTS
    let mMM = String(aDTCMonth.search(mDTC.slice(2,3))+1).padStart(2,"0");
    
    return mMM;
  }
}
function DTCYear(mDTS,mDTC){
  // 20240504: StarTree: Converts the year portion of DTS to DTC.
  if(IsBlank(mDTC)){ // If DTC is blank, return the DTC value of the DTS.
    return String(mDTS).slice(2,4);
  }else{ // Else, return the DTS value of the DTC.
    return "20" + mDTC.slice(0,2);
  }
}
function JSONPartiStr(mJSON){
  // 20240404: StarTree: For new chat node format.
  var mHTML = ""
  try{
    var mParticipants = mJSON.participants.split(', ');
    var mPartiStr = "";
    for(var i=1;i<mParticipants.length;i++){
      mPartiStr += "<div class='mbavem mb" + mParticipants[i] + "'></div> ";
    }
    mHTML += "<button class='mbbutton' onclick='ShowNextInline(this)'><div class='mbavem mb" + mJSON.author + "'></div><small>⭐"+ (mParticipants.length-1) +"</small></button>";
    mHTML += "<hide>" + mPartiStr + "</hide>";
  }catch(error){}
  return mHTML;
}
function DateStrFromID(mID){
  // 20240404: StarTree: For new chat node format.
  // https://stackoverflow.com/questions/1833892/converting-a-string-formatted-yyyymmddhhmmss-into-a-javascript-date-object
  var mDate = new Date(mID.replace(/^(\d{4})(\d{2})(\d{2})(\d\d)(\d\d)$/,'$4:$5 $2/$3/$1'));
  var options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit', hour12:'true', hour:'2-digit',minute:'2-digit' };
  mDateString = mDate.toLocaleDateString("en-US", options);
  mDateString = mDateString.replace(/,/g,"");
  mDateString = mDateString.toUpperCase();
  return mDateString.substring(10,15)+" "+mDateString.substring(4,7)+" "+ mDateString.substring(8,10) +" "+ mDateString.substring(0,3)+" " + mDateString.substring(16);
}
function ChatNodeContent(elAttr,mJSON){
  // 20240405: StarTree: For the new chat node format.
  var mHTMLInner = "";

  if(elAttr.hasAttribute('data-chat')){

    if(NotBlank(mJSON.prev)){
      mHTMLInner +="<a class=\"mbbuttonIn\" style=\"float:left\" href=\"" + ViewerPath() + "?id=P"+mJSON.prev+"\" onclick=\"BoardLoad(this,'"+ mJSON.prev+"');return false;\"><small>◀</smalL></a>";
    }else{
      mHTMLInner +="<a class=\"mbbutton\" style=\"float:left\">◁</a>";
    }
    
    if(NotBlank(mJSON.next)){
      mHTMLInner +="<a class=\"mbbuttonIn\" style=\"float:right\" href=\"" + ViewerPath() + "?id=P"+mJSON.next+"\" onclick=\"BoardLoad(this,'"+ mJSON.next+"');return false;\"><small>▶</small></a>";
    }else{
      mHTMLInner +="<a class=\"mbbutton\" style=\"float:right\">▷</a>";
    }
    mHTMLInner += "<center><small>" + DateStrFromID(mJSON.id) + "</small></center>";
    mHTMLInner += "<hr class='mbCB'>";
    mHTMLInner += "<div class=\"mbav100r mb" + mJSON.author + "\"></div>";
  }
  
  mHTMLInner += elAttr.querySelector('content').innerHTML;

  
  return mHTMLInner;
}
function Pin2Code(mJSON){
  // 20240405: StarTree: Creates the HTML for the node pin.
  var mHTML="";
  mHTML += "<macro>{\"cmd\":\"PIN2\",\"node\":\"" +mJSON.id +"\"";
  if(NotBlank(mJSON.music) || NotBlank(mJSON.yt)){
    if(NotBlank(mJSON.music)){
      mHTML += ",\"music\":\""+mJSON.music+"\"";
    }
    if(NotBlank(mJSON.yt)){
      mHTML += ",\"yt\":\""+mJSON.yt+ "\"";
    }
  }
  mHTML += "}</macro>";
  return mHTML;
}

function GetInputBoxValue(el){
  // 20230821: StarTree: This gets the first input box within the control section.
  var mControl = SearchPS(el,'control');
  var elIB = mControl.getElementsByTagName('input')[0];
  return elIB.value;
}
function IFrameFeedback(el){
  // 20231029: Black: Spawn a feedback form
  var mInput = "https://docs.google.com/forms/d/e/1FAIpQLSeOpcxl7lS3R84J0P3cYZEbkRapkrcpTrRAtWA8HCiOTl6nTw/viewform";
  var mHTML = "<span class='mbRef'><a class='mbbutton' onClick='BoardRemove(this)' style='float:right' title='Close'><span class=\"mbIcon iClose\"></span></a></span>";

  //mHTML += "<button class='mbbutton mbRef' style='opacity:0.2' title='Toggle Size' onclick='BoardToggleHeight(this)'>⅔</button>";
  mHTML += "<a onClick='IFrameFeedback(this)' title='Feedback Form'>💌</a> <a class='mbbutton' onClick='HideNext(this)' title='Feedback Form'>Feedback Form</a>";
  mHTML += "<iframe src='" + mInput + "' title='Google Form' style='border:none;width:100%;height:calc(100vh - 190px)' allow='clipboard-read; clipboard-write'></iframe>";
  
  el.innerHTML = mHTML;
  el.setAttribute('Board','');
  /*var elTemp = document.createElement("div");
  elTemp.innerHTML = mHTML;
  elTemp.classList.add('mbscroll');
  elTemp.setAttribute('Board','');
  elTemp.style.marginBottom = "0px";*/
  
  var mPanel;
  try{
    mPanel = SearchPS(el,'panel');
  }catch(error){
    mPanel = null;
  }
  if(mPanel != null){
    //mPanel.firstElementChild.nextElementSibling.prepend(elTemp);  
    el.scrollIntoView(true);
    return;
  }
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
  //   <button class='mbbutton' onClick='RemoveParent(this)' style='float:right;margin-bottom:-20px;margin-right:20px;position:relative;z-index:1' title='Close'>:Close:</button>
  //   <iframe src='https://panarcana.blogspot.com/p/viewer.html?id=P202303052122' title='Blogspot Node' style='margin:0px -3px;border:none;width:100%;height:calc(100vh - 136px)' allow='clipboard-read; clipboard-write'></iframe>
  // </div>
  var mHTML = "<span class='mbRef'><a class='mbbutton' onClick='BoardRemove(this)' style='float:right' title='Close'>:Close:</a></span>";
  mHTML += "<a onClick='IFrameRefresh(this," + mNodeID + ")' title='Refresh'>🕰️</a> <a class='mbbutton' onClick='HideNext(this)' title='Data from Blogspot'>Blogspot " + mNodeID + "</a>";
  mHTML += "<iframe src='" + mInput + "' title='Blogspot Node' style='border:none;width:100%;height:calc(100vh - 190px)' allow='clipboard-read; clipboard-write'></iframe>";
  var elTemp = document.createElement("div");
  elTemp.innerHTML = mHTML;
  elTemp.classList.add('mbscroll');
  elTemp.setAttribute("Board","");
  elTemp.style.marginBottom = "0px";
  MacroIcons(elTemp);
  mControl.nextElementSibling.prepend(elTemp);  
}
function IsDisplayed(el){
  // 20250118: StarTree: Returns True if the element is in display
  return (window.getComputedStyle(el).display !== "none");
}
function JQAdd(el,iNoReTarget){
  // 20230821: StarTree: Add to JQuery from GitHub Archive.
  //   Reads the node ID from the input box of the control section.
  //   Creates a new container with a close button below the control section for the content.

  // STEP: Reading the content of the input box
  // 20240507: Sasha: Making the code work for DTS number.
  var mInput = GetInputBoxValue(el).toLowerCase();  
  var mNodeIDs = mInput.split('p');
  var mNodeID = mNodeIDs[mNodeIDs.length-1];
  
  // 20240610: StarTree: For Panel
  // BoardLoad(el,iNodeID,iDoNotScroll,iNoReTarget,elArchives){

  BoardLoad(el,mNodeID,"",iNoReTarget);
  
}
function InterLink(){
  // 20231006: Black: Returns the Interlinking function depending on current website
  if(AtGitHub()){
    return "BoardLoad(this,";
  }
  return "QueryBanner(";
}
function Offline(elArchives,bToggle,bReload){
  // 20240508: Patricia: This is an overloaded function that performs different functions depending on the arguments.
  if(IsBlank(elArchives)){
    elArchives = document.querySelector('archives');
  }
  // STEP: If the archives section does not exist, initialize the section and calls itself again.
  if(IsBlank(elArchives)){
    $(document).ready(function(){
      elArchives = document.createElement('archives');
      document.body.after(elArchives);
      var mHTML = "";
      for(let i=1;i<=ArchiveNum();i++){
        mHTML += "<archive" + i+" archive class=\"mbhide\"></archive" + i+">";
      }
      elArchives.innerHTML = mHTML;
      Offline(elArchives,bToggle,bReload); // Update this with the argument list.
    });
    return false;
  }
  var bOffline = elArchives.hasAttribute('offline');
  // STEP: Handle Toggle Request;
  if(bToggle){
    if(bOffline && confirm("Disable offline mode?")){
      // Set Offline mode to OFF and load.
      // 20240510: Skyle: I think removing the archives may cause a bug for sitemap.
      // After switching off Offline mode, the sitemap query does not work.
      //elArchives.remove(); // 20240509: Black: Remove the archives.
      elArchives.removeAttribute('offline');
      elArchives.removeAttribute('loaded');
      bOffline = false;
    }else if(!bOffline && confirm("Enable offline mode?")){
      elArchives.setAttribute('offline','');      
      bOffline = true;
      bReload = true;
    }
  }
  // STEP: Handle Reload Request
  if(bReload){
    $(document).ready(function(){
      for(let i=1;i<=ArchiveNum();i++){
        let elArchive = elArchives.querySelector('archive'+i);
        $(elArchive).load(ArchiveIndex(i), function(){
          let mDTS = DTSNow();
          elArchive.setAttribute('loaded',mDTS);
          elArchives.setAttribute('loaded',mDTS);
          Offline(elArchives); // Report
        });
      }
    });
    return elArchives;
  }
  // STEP: Report the status
  var elIndicator = document.body.querySelector('[d-offline]');
  var mLoaded = elArchives.getAttribute('loaded');
  if(bOffline){
    elIndicator.innerHTML = "[ OFFLINE " + mLoaded + " ]";
    return elArchives;
  }else{
    elIndicator.innerHTML = "";
    return false;
  }    
}
function OLButton_20240508_DELETE(){
  // 20240508: Natalie: Offline mode button. 
  // Save the current mode at the attributes of Archives.
  var elArchives = document.querySelector('archives');
  var bOffline = elArchives.hasAttribute('offline');
  if(bOffline){
    if(confirm("Disable offline mode?")){
      elArchives.removeAttribute('offline');
      OLReport("",false);
    }
    return;
  }else{
    if(!confirm("Enable offline mode?")){
      return;
    }
  }
  // STEP: Start Offline Mode by Loading All Archives.
  elArchives.setAttribute('offline',"");
  ACLoadAll(true);
}

function OLReport_20240508_DELETE(mDTS,mActive){ 
  // 20240508: StarTree: Offline mode indicator.
  var elReport = document.body.querySelector('[d-offline]');
  if(!mActive){
    elReport.innerHTML = "";
    return;
  }
  elReport.innerHTML = "🛩️" + mDTS;

}
function PanelAdd(){
  // 20230722: StarTree
  var elMA = document.getElementById("MainArea");
  var elNPT = document.getElementById("NewPanelTemplate");
  var elTemp = document.createElement("div");
  elTemp.innerHTML = elNPT.innerHTML;
  elTemp.classList.add('mbPanel');
  elTemp.setAttribute("panel","");
  elTemp.onclick = HideAllFP;

  elMA.appendChild(elTemp);

  // 20240325: StarTree: Default the first panel to be the serving panel.
  // 20240414: Arcacia: If this is the only panel, default its width to wide and set as serve target.
  var mOtherPanel = document.querySelector('panel');
  if(IsBlank(mOtherPanel)){
    elTemp.style.flex = "50%";
    PanelToggleServe(elTemp.firstElementChild);
  }
  MacroIcons(elTemp);
  return elTemp;
}
function PanelAddAfter(el){
  // 20231030: StarTree
  var mPanel = SearchPS(el,"panel");
  var elNPT = document.getElementById("NewPanelTemplate");
  var elTemp = document.createElement("div");
  elTemp.innerHTML = elNPT.innerHTML;
  elTemp.classList.add('mbPanel');
  elTemp.setAttribute("panel","");
  mPanel.after(elTemp);
  return elTemp;
}
function PanelAddBefore(el){
  // 20231030: StarTree
  var mPanel = SearchPS(el,"panel");
  var elNPT = document.getElementById("NewPanelTemplate");
  var elTemp = document.createElement("div");
  elTemp.innerHTML = elNPT.innerHTML;
  elTemp.classList.add('mbPanel');
  elTemp.setAttribute("panel","");
  mPanel.before(elTemp);
  return elTemp;
}
function PanelGetFirst(){
  // 20240324: StarTree: Return the first panel. Add if necessary
  var elPanel = document.querySelector('[panel]');
  // STEP: If there is no panel, add a panel
  if(IsBlank(elPanel)){
    elPanel = PanelAdd();
  }
  return elPanel;
}
function PanelGetLast(){
  // 20240324: StarTree: Return the last panel. Add if necessary
  var elPanelList = document.querySelectorAll('[panel]');
  var elPanel = elPanelList[elPanelList.length-1];
  //var elPanel = document.querySelectorAll('[panel]:last-child');
  // STEP: If there is no panel, add a panel
  if(IsBlank(elPanel)){
    elPanel = PanelAdd();
  }
  return elPanel;
}
function PanelGetTarget(){
  // 20240325: StarTree: Return the target panel if there is one.
  var mPanelList = document.querySelectorAll('[panel]');
  for(i=0;i<mPanelList.length;i++){
    if(mPanelList[i].hasAttribute('serve')){
      return mPanelList[i];
    }
  }
  return null;
}
function PanelToggleHeight(elButton){
  // 20240425: StarTree: Toggles a panel between half and full size.
  // Full size: height:calc(-130px + 100vh)
  // Half Size: height:50vh
  // STEP: Index to the element that has the height data
  var elPanel = SearchPS(elButton,'panel');
  var elContainer = elPanel.firstElementChild.nextElementSibling;
  var mCurHeight = elContainer.style.height;  
  var mPanelHeight="";
  if(mCurHeight!="calc(-130px + 100vh)"){
    mCurHeight = "calc(-130px + 100vh)";
    mPanelHeight = "auto";
  }else{
    mCurHeight = "45vh";
    mPanelHeight = "45vh";
  }
  elContainer.style.height = mCurHeight;
  elPanel.style.Height = mPanelHeight;
}
function PanelRemove(el){
  // 20230722: StarTree
  // 20231119: StarTree: Need to do it for "panel"
  var mPanel = SearchPS(el,'panel');  
  mPanel.remove();
}
function PanelToggleServe(el){
  // 20240324: StarTree: Setting the target panel for serving nodes
  // STEP: Loop through all panels and only set this panel's icon to a plate.
  var mTargetPanel = SearchPS(el,'panel');
  var mPanelList = document.querySelectorAll('[panel]');
  var aIcon;
  for(i=0;i<mPanelList.length;i++){
    aIcon=mPanelList[i].firstElementChild.lastElementChild.previousElementSibling;
    
    // STEP: If the target panel's icon is not a plate, change it to plate.
    if((mPanelList[i]==mTargetPanel) && (aIcon.innerHTML != "🥞")){
      mPanelList[i].setAttribute('serve',"");
      aIcon.innerHTML = "🥞";
    }else{
      // STEP: Else, set the icon back to bread.
      mPanelList[i].removeAttribute('serve');
      aIcon.innerHTML = "🍞";
    }
  }
}
function PanelToggleWidth(el){
  // 20240303: StarTree: Added to help display slides on desktop.
  var mPanel = SearchPS(el,'panel');
  if(IsBlank(mPanel.style.flex)){
    mPanel.style.flex= "50%";
  }else{
    mPanel.style.flex= "";
  }
  
}
function RemoveParent(el){
  // 20230916: StarTree: For hiding iframe.
  el.parentNode.remove();
}

//==IMPORTED FUNCTIONS===
function DTSInc(mDTS){
  // 20240427: Sasha: Increments the number as a DTS value.
  var mNewDTS = Number(mDTS)+1;
  var sNewDTS = String(mNewDTS);
  if(sNewDTS.slice(12,14)=="60"){
    mNewDTS = Number(sNewDTS.slice(0,12))+1;
    sNewDTS = String(mNewDTS);
  }
  if(sNewDTS.slice(10,12)=="60"){
    mNewDTS = Number(sNewDTS.slice(0,10))+1;
    sNewDTS = String(mNewDTS);
  }
  if(sNewDTS.slice(8,10)=="24"){ 
    mNewDTS = Number(sNewDTS.slice(0,8))+1;
    sNewDTS = String(mNewDTS);
  }
  if(sNewDTS.slice(6,8)=="28"){ // Sasha: I know. This function is not entirely correct.
    mNewDTS = Number(sNewDTS.slice(0,6))+1;
    sNewDTS = String(mNewDTS);
  }
  if(sNewDTS.slice(4,6)=="12"){
    mNewDTS = Number(sNewDTS.slice(0,4))+1;
    sNewDTS = String(mNewDTS);
  }


  return DTSPadding(sNewDTS);
}
function ArchiveCacheAll_20240508_DELETE(){
  // 20240427: StarTree: Experimental: Load all the archives into onto the document
  // --> Load to a region <archive> after <body>

  //**/return false;
  Offline();
  return false;
  var bPreempt = false; // Set to true to not load the default node.
  
  $(document).ready(function(){
    var elArchives = document.createElement('archives');
    document.body.after(elArchives);

    var mSingleArchive = 101;
    var mHTML = "";
    // STEP: Create the containers
    for(let i=1;i<=ArchiveNum();i++){
      mHTML += "<archive" + i+" archive class=\"mbhide\"></archive" + i+">";
    }
    elArchives.innerHTML = mHTML;


    return false; // 20240508: LRRH: Don't test by default. Make a button for those trying to test.
    
    for(let i=1;i<=ArchiveNum();i++){
    //for(let i=mSingleArchive;i==mSingleArchive;i++){
      let elArchive = elArchives.querySelector('archive'+i);
      //let elArchive = document.createElement("archive" + i);  
      //elArchive.classList.add('mbhide');
      //elArchives.append(elArchive);
      //$(elCache).load(ArchiveIndex(mSingleArchive), function(){
      $(elArchive).load(ArchiveIndex(i), function(){
        
        elArchive.setAttribute('loaded',DTSNow());

        // SPECIAL PROCESSING
        //let elArchive = elArchives.querySelector('[updated=\"'+DTSNow()+'\"]');

        // 20240427: Sasha: To fix Cards
        /*
        var elCards =elTemp.querySelectorAll(".mbCharCard"); 
        elCards.forEach((elCard)=>{
          try{
            let mTitle = elCard.querySelector(".mbCharCardTitle2").innerHTML;
            let mImg = elCard.querySelector(".mbCharCardImg").style.backgroundImage;
            mImg = mImg.replace("url(\"",'');
            mImg = mImg.replace("\")",'');
            let mSubTitle = elCard.querySelector(".mbCharCardSubtitle").innerHTML;
            let mContent = elCard.querySelector(".mbCharCardDescInner").innerHTML;
            mDTS = DTSInc(mDTS);    
            let mHTML = "<card DTS='" + mDTS + "' title='" + mTitle + "' subtitle='" + mSubTitle +"'";
            mHTML += " img='" + mImg + "'>"+mContent+"</card>";
            elCard.outerHTML = mHTML;
          elCard.remove();
          }catch(e){
          }
        });*/

        /* 20240428: Melody: Searching for the extra small
        var elSmalls = elArchive.querySelectorAll("small");
        var mMax = 0;
        var mInner = "";
        elSmalls.forEach((elSmall)=>{
          let mLen = elSmall.innerHTML.length;
          if(mMax<mLen){
            mMax = mLen;
            mInner = elSmall.outerHTML;
          }
        });

        alert("Len: " + mMax);*/

        /*elArchive = elArchives.querySelector('[archive=\"'+i+'\"]');
        navigator.clipboard.writeText(elArchive.innerHTML);
        alert("Updated for Archive ["+ i+ "]");//*/
      });
    }
  });
  return bPreempt;
}
function ArchiveIndex(ei){
  return BasePath() + "archive" + ei + ".html ";
}
function ArchiveNum(){
  return 3;
}
function ArchiveNumSelect(iNodeID){
  // 20240111: StarTree: Returns just the Archive number.
  var iDate = iNodeID.substring(0,8);
  if(parseInt(iDate) < 20230101){
	  return "1";
  }else if(parseInt(iDate) < 20231225){
    return "2";
  }else{
    return "3";
  }
}
function ArchiveSelect(iNodeID){
	// 20230821: StarTree: ARCHIVE SELECTION
  //   Upgrade: The input string could be the full node ID. In that case, just take the first 8 digits.  
  return BasePath() + "archive" + ArchiveNumSelect(iNodeID) + ".html ";
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
    case 5: return "Academy";
    case 7: return "Home";
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
    case 32: return "Gaia";
    case 33: return "Tavern";
    case 34: return "Scape";
    case 35: return "Night";
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
    $(elViewer).load(ArchiveSelect("20230201") + "#P202302011021", function(){
      var cookies = elViewer.querySelectorAll('.mbFC');
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
function HideFP(el){
  // 20240422: StarTree
  var elFP = SearchPS(el,'FP');
  elFP.classList.add('mbhide');
  elFP.style.zIndex = 0;
  ShowWidgets();
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
  // 20241006: Mikela: Upgrading this to work with checking for blank element.
  if(e instanceof Element){return false;}


  return ((e==NaN) ||(e=== undefined) || (e==="") || (e=="") || (e=== null) || (e.length==0) || (e=="null") || (e=="undefined")) ;
}
function LangIcon(eCode){
  // 20230311: StarTree: Added for Manga display
  switch(eCode){
    case "EN": return "🇬🇧";
    case "FR": return "🇫🇷";
    case "HK": return "🇭🇰";
    case "JA": return "🇯🇵";
    case "JP": return "🇯🇵";
    case "TW": return "🇹🇼";
    case "ZN": return "🇹🇼";
    default:   return "🇬🇧";
  }
}
function LatestDate(elScope){
  // 20240725: Patricia: Given a scope, return the largest DTS within.  
  // 20240925: StarTree: Don't use the DTC value if there is DTS.
  
  var mDTSmax = Number(Default(elScope.getAttribute("dts"),0));  
  var elDTS = elScope.querySelectorAll("[dts]");
  var mDTScur = 0;
  for(i=0;i<elDTS.length;i++){
    mDTScur = Number(elDTS[i].getAttribute("dts"));
    mDTSmax = Math.max(mDTSmax,mDTScur);
  }  
  //if(mDTSmax != 0 && elScope.hasAttribute("item")){
  if(mDTSmax == 0){
    mDTScur = Number(DTC("",elScope.getAttribute("item")));
  }
  mDTSmax = Math.max(mDTSmax,mDTScur);
  mDTSmax = mDTSmax.toString();
  return mDTSmax.slice(0,8);
}
function LatestUpdate(){
  // 20240818: StarTree
  var elContainer = document.body.querySelector("LatestUpdate");
  elContainer.innerHTML = "20250118 Sort by Stars / MP Spawner Upgrades";
}

function LnkCode(iID,iDesc,iIcon,bMark,iTitle){
  // 20230323: Ivy: For QSL. <lnk>
  var mHTML="";

  // 20240330: StarTree: Display Node Marking
  if(bMark==true){    
    
    if(iIcon==false){
      mHTML = NodeMarkCode(iID,iDesc);
    }else{
      var mButtonStyle = "";
      if(IsBlank(iDesc)){ mButtonStyle=" mbbutton";}
      mHTML = "<span class='mbILB30'>" + NodeMarkCode(iID,iDesc) + "<hide>"+ iID+"</hide></span>";
    }
  }


  // 20240415: StarTree: Highlight lnk object used as visit mark differently.
  // 20241005: StarTree: Use custom title if specified.
  let mTitle = Default(iDesc,iID);
  mHTML += "<a class='mbbuttonIn' href='" + ViewerPath() + "?id=P"+iID+"'";
  mHTML += " onclick=\"" + InterLink() + "'" + iID + "');return false;\" title='"+
            Default(iTitle,"Show " + iID)+"'>";
  
  if(IsBlank(iIcon)){
    mHTML += iDesc + "</a><hide>" + iID +"</hide>";
  }else{
    mHTML += "<span class='mbILB30'>" + iIcon + "</span></a>"+ iDesc ;
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
  // 20240414: StarTree: Added Bubble.
  ProcessNodeData(elScope);
  MacroRes(elScope); // RES might expand into Topic objects.
  MacroTopic(elScope); // TOPIC might expand into Bullets.
  MacroNote(elScope);
  MacroMacro(elScope);
  MacroJQ(elScope);  
  MacroBullet(elScope);
  MacroMsg(elScope);
  MacroCard(elScope);
  MacroLnk(elScope);
  MacroURL(elScope);
  MacroIcons(elScope);
}
function MacroBullet(el){
  // 20240420: StarTree: Changes:
  /*   <bullet title="Title"></bullet>
     into:
      <li>
          <span class='mbbutton' onclick='ShowNextInline(this)'>Title</span><hide>
        
          </hide>
        </li>
  */
  var mTags = el.querySelectorAll('bullet');
  mTags.forEach((mTag)=>{    
    let mDTS = mTag.getAttribute("dts");
    let mTitle = Default(mTag.getAttribute("title"),"New Bullet");
    let mIcon = Default(mTag.getAttribute("icon"),"");
    let mHTML = "<span class='mbbutton' onclick='ShowNextInline(this)'>";
    mHTML += "<span class='mbILB30'>" + mIcon + "</span>";
    mHTML += FullTitle(mTag,"","",true) + "</span><hide>";

    //DEBUG(FullTitle(mTag,"","",true));

    mHTML += mTag.innerHTML + "</hide>";
    let elNew = document.createElement('li');
    elNew.setAttribute('DTS',mDTS);
    elNew.innerHTML = mHTML;
    mTag.before(elNew);
    mTag.remove();
  });
       
}
function MacroCard(el){
  /* 20240427: Skyle: changes card macro code into HTML code. The DTS field is optional.
  FROM:
    <card DTS="20240427193733" title="Mediation" subtitle="Cleric Skill" img="https://cdn.pixabay.com/photo/2016/10/07/14/11/tangerines-1721633_640.jpg">Mediation is a conflict resolution skill.</card>
  TO:
    <div class='mbCharCard' DTS="20240427193733">
      <div class='mbCharCardTitle2'>Mediation</div>
      <div class='mbCharCardImg' style="background-position: 50% 50%; background-image:url('https://cdn.pixabay.com/photo/2016/10/07/14/11/tangerines-1721633_640.jpg')"></div>
      <div class='mbCharCardSubtitle'>Cleric Skill</div>
      <div class='mbCharCardDesc'>
        <center>
          <div class='mbCharCardDescInner'>
            Mediation is a conflict resolution skill.
          </div>
        </center>
      </div>
    </div>
  STYLE 2: Distinguishing feature: It has a class.
    FROM:
      <card dts="20240428182908" class="mbCharCardAQ" img="https://github.com/MagicBakery/Images/blob/main/Infographic.png?raw=true"></card>
    TO:
      <div>
        <a href="https://github.com/MagicBakery/Images/blob/main/Infographic.png?raw=true" target="_blank">
          <div class="mbCharCardAQ" style="background-image:url('https://github.com/MagicBakery/Images/blob/main/Infographic.png?raw=true')">
          </div>
        </a>
      </div>
    */
  var mTags = el.querySelectorAll('card');
  mTags.forEach((mTag)=>{    

    if(MacroCard2(mTag)){return;}

    let mDTS = mTag.getAttribute("dts");
    let mTitle = Default(mTag.getAttribute("title"),"Title");
    let mSubTitle = Default(mTag.getAttribute("subtitle"),"Subtitle");
    let mIMG = Default(mTag.getAttribute('img'),"");

    let elNew = document.createElement('div');
    if(NotBlank(mDTS)){elNew.setAttribute('DTS', mDTS);}
    elNew.classList.add('mbCharCard');

    let mHTML = "<div class='mbCharCardTitle2'>" + mTitle + "</div>";
    mHTML += "<a href='" + mIMG + "' target='_blank' onclick='return false;' style='cursor:default'>";
    mHTML += "<div class='mbCharCardImg' style=\"background-position: 50% 50%; background-image:url('" + mIMG + "')\"></div></a>";
    mHTML += "<div class='mbCharCardSubtitle'>"+ mSubTitle + "</div>";
    mHTML += "<div class='mbCharCardDesc'><center><div class='mbCharCardDescInner'>";
    mHTML += mTag.innerHTML;
    mHTML += "</div></center></div></div>";
    elNew.innerHTML = mHTML;
    mTag.before(elNew);
    mTag.remove();
  });
}
function MacroCard2(elCard){
  /* 20240428: Sasha: Render Style 2 that has a class and just a picture.
  STYLE 2: Distinguishing feature: It has a class.
    FROM:
      <card dts="20240428182908" class="mbCharCardAQ" img="https://github.com/MagicBakery/Images/blob/main/Infographic.png?raw=true"></card>
    TO:
      <div>
        <a href="https://github.com/MagicBakery/Images/blob/main/Infographic.png?raw=true" target="_blank">
          <div class="mbCharCardAQ" style="background-image:url('https://github.com/MagicBakery/Images/blob/main/Infographic.png?raw=true')">
          </div>
        </a>
      </div>
    */
   if(!elCard.classList.contains('mbCharCardAQ')){return false;}
   let mDTS = elCard.getAttribute('dts');
   let mImg = elCard.getAttribute('img');
   let elNew = document.createElement('div');
   let mHTML = "<a style='cursor:default' onclick='return false;' href='" + mImg + "' target='_blank'>";
   mHTML += "<div class='mbCharCardAQ' style=\"background-image:url('" + mImg + "')\">"
   mHTML += "</div></a>";
   elNew.innerHTML = mHTML;
   elNew.setAttribute('dts',mDTS);
   elCard.before(elNew);
   elCard.remove();
  return true;
}
function MacroIcons(el,iHTMLInner){
  //DEBUG("MacroIcons");
  // 20240810: Black: Replace emoji in the scope or the entire document.
  
  if(IsBlank(el)){el = document.body;}
  var mHTMLInner="";
  if(IsBlank(iHTMLInner)){
    mHTMLInner = el.innerHTML;  
  } else{
    mHTMLInner = iHTMLInner;
  }
  
  const mIconList = [
    ["Apple","🍎"],
    ["Alarm","🚨"],
    ["Archive",":Archive:"],
    ["Archive1",":Archive1:"],
    ["Archive2",":Archive2:"],
    ["Archive3",":Archive3:"],
    ["Backpack","🎒"],
    ["Basket","🧺"],
    ["Bell","🔔"],
    ["BlackCat","🐈‍⬛"],
    ["BlankBox","□"],
    ["Bomb","💣"],
    ["Book","📔"],
    ["BookGreen","📗"],
    ["Bow","🏹"],
    ["Box","📦"],
    ["Bread","🍞"],
    ["Briefcase","💼"],
    ["Broom","🧹"],
    ["Bulb","💡"],
    ["Cactus","🌵"],
    ["Cake","🍰"],
    ["CallBell","🛎️"],
    ["Calendar","📅"],
    ["Camp","🏕️"],
    ["Castle","🏰"],
    ["CD","📀"],
    ["ChatBubble","💬"],
    ["Checker",":Checker:"],
    ["Chick","🐤"],
    ["Circus","🎪"],
    ["Clipboard","📋"],
    ["Clock","🕒"],
    ["Close",":Close:"],
    ["CornerRibbon",":CornerRibbon:"],
    ["Correct","✔️"],
    ["Compass","🧭"],
    ["CopperCoin",":CopperCoin:"],
    ["Court","🏛️"],
    ["CrossSkull","☠️"],
    ["Crown","👑"],
    ["CrystalBall","🔮"],
    ["Dice","🎲"],
    ["Done","✅"],
    ["Dove","🕊️"],
    ["Drum","🥁"],
    ["DryTree","🪾"],
    ["Eagle","🦅"],
    ["Egg","🥚"],
    ["Fan","🪭"],
    ["FallingLeaf","🍃"],
    ["FileBox","🗃️"],
    ["Fire","🔥"],
    ["Forbid","🚫"],
    ["Fountain","⛲"],
    ["FourLeaf","🍀"],
    ["Folders","🗂️"],
    ["Fox","🦊"],
    ["Frog","🐸"],
    ["Ghost","👻"],
    ["Gift","🎁"],
    ["Giraffe","🦒"],
    ["GoldCoin",":GoldCoin:"],
    ["GoldCoin","🪙"],
    ["Grape","🍇"],
    ["GreenApple","🍏"],
    ["Handshake","🤝"],
    ["Hatch","🐣"],
    ["Headphone","🎧"],
    ["Heart","❤️"],
    ["HeartBeat","💗"],
    ["HeartBlue","💙"],
    ["HeartBrown","🤎"],
    ["HeartEmpty","🤍"],
    ["HeartGreen","💚"],
    ["HeartYellow","💛"],
    ["Honey","🍯"],
    ["Hourglass","⏳"],
    ["House","🏡"],
    ["ID","🪪"],
    ["JackLantern","🎃"],
    ["Jam",":Jam:"],
    ["Jar",":Jar:"],
    ["Jellyfish","🪼"],
    ["KarateGi","🥋"],
    ["Key","🗝️"],
    ["Kudookie","💟"],
    ["Lemon","🍋"],
    ["Link","🔗"],
    ["LoveLetter","💌"],
    ["Lyre",":Lyre:"],
    ["Magic","✨"],
    ["Magnifier","🔍"],
    ["Mailbox","📬"],
    ["MantleClock","🕰️"],    
    ["Map","🗺️"],
    ["Masks","🎭"],
    ["Medal","🏅"],
    ["Mirror","🪞"],
    ["Mushroom","🍄‍🟫"],
    ["NestEggs","🪺"],
    ["Orange","🍊"],
    ["Owl","🦉"],
    ["Paladin",":Paladin:"],
    ["Palette","🎨"],
    ["Pancake","🥞"],
    ["Paw","🐾"],
    ["Pencil","✏️"],
    ["Phoenix","🐦‍🔥"],
    ["Phone","☎️"],
    ["PianoKeyboard","🎹"],
    ["Pie","🥧"],
    ["Pin","📌"],
    ["PostHorn","📯"],
    ["Pretzel","🥨"],
    ["Pudding","🍮"],
    ["Puzzle","🧩"],
    ["Question",":?:"],
    ["Rabbit","🐰"],
    ["Radio","📻"],
    ["Rainbow","🌈"],
    ["Ribbon","🎀"],
    ["Rock","🪨"],
    ["Rocket","🚀"],
    ["Rose","🌹"],
    ["Scale","⚖️"],
    ["Scarf","🧣"],
    ["School","🏫"],
    ["Scroll","📜"],
    ["Seeding","🌱"],
    ["Shield","🛡️"],
    ["ShiningStar","🌟"],
    ["ShootingStar","🌠"],
    ["ShoppingCart","🛒"],
    ["SilverCoin",":SilverCoin:"],
    ["Spell","💫"],
    ["SquareCap","🎓"],
    ["Star","⭐"],
    ["StarEmpty",":StarEmpty:"],
    ["Stopwatch","⏱️"],
    ["SwordX","⚔️"],
    ["Tag","🏷️"], 
    ["Target","🎯"], 
    ["Teddy","🧸"], 
    ["Toolbox","🧰"], 
    ["TopHat","🎩"],
    ["Tornado","🌪️"], 
    ["Tree","🌳"], 
    ["TriangleL","◀"],
    ["TriangleR","▶"],
    ["Trophy","🏆"],
    ["Turtle","🐢"],
    ["Violin","🎻"],
    ["Waffle","🧇"],
    ["Wand","🪄"],
    ["WingL",":WingL:"],
    ["WingR",":WingR:"],
    ["WingR","🪽"],
    ["Wood","🪵"],
    ["Writing","📝"],
    ["Wrong","❌"],
    ["XmasTree","🎄"],
    ["Yarn","🧶"]
  ];
  for(i=0;i<mIconList.length;i++){
    var mSearchIcon = mIconList[i][1];
    var mImgCode = mIconList[i][0];
    var mStart = 0;
    var mPos = 0;  
    var mLookAround1 = "";
    var mLookAround = "";
    var mSubstitute = "";

    while(true){
      mPos = mHTMLInner.indexOf(mSearchIcon,mStart);
      if(mPos==-1){break;}
      
      // STEP: Check if this match is valid
      mLookAround1 = mHTMLInner.slice(mPos-1,mPos+mSearchIcon.length+1); 
      mLookAround = mHTMLInner.slice(mPos-6,mPos+mSearchIcon.length+7);
      if( (mLookAround != "<icon>"+ mSearchIcon + "</icon>") && (mLookAround1 != "'"+mSearchIcon +"'") && (mLookAround1 != "\""+mSearchIcon +"\"")){
        // The match is valid. Compose the substitute string:
        mSubstitute = "<span class='mbIcon i"+ mImgCode +"'><icon>"+mSearchIcon+"</icon></span>";
        mHTMLInner = mHTMLInner.slice(0,mPos) + mSubstitute + mHTMLInner.slice(mPos+mSearchIcon.length);
        mStart = mPos + mSubstitute.length;
      }else{
        mStart = mPos + mSearchIcon.length;
      }
    }    
  }
  if(IsBlank(iHTMLInner)){
    el.innerHTML = mHTMLInner;
  }
  return mHTMLInner;
}
function MacroNote(el){
  // 20240501: Cardinal: A note defines an inline collapsible section.
  /* CHANGES:
      <note dts icon title subtitle>...</node>
     INTO:
      <span node dts>
        <a class="mbbutton" onclick="ShowNextInline(this)">Icon Title Subtitle</a>
        <hide>...</hide>
      </span>*/
  var mTags = el.querySelectorAll('note');
  for(let i=mTags.length-1;i>-1;i--){
    let mTag = mTags[i];
    let mDTS = mTag.getAttribute("dts");
    let mIcon = Default(mTag.getAttribute("icon"),"");
    let mTitle = Default(mTag.getAttribute("title"),"");
    let mSubtitle = Default(mTag.getAttribute("Subtitle"),"");
    let mNode = Default(mTag.getAttribute("node"),"");
    let mHTML = "";
    let mLabel = "";
    mHTML = "<mbnote dts=\"" + mDTS +"\">";
    mHTML += "<a class='mbbutton' onclick='ShowNextInline(this)'>";
    
    // 20240822: StarTree: If only Title exists, don't use the brackets. 
    if(NotBlank(mTitle)){mLabel = mTitle;}
    else if(NotBlank(mSubtitle)){mLabel = "[" + mSubtitle + "]";}
    if(mLabel ==""){ // 20240502: StarTree: Don't add the brackets when there is just the icon.
      mLabel = mIcon;
    }else{
      if(NotBlank(mIcon)){
        
        mLabel = "[" + mIcon + " " + mTitle + " " + mSubtitle + "]";
      }      
    }
    mHTML += mLabel;
    mHTML += "</a><hide>";   
    mHTML += "<small>↴</small>"; 
    
    mHTML += "<div class=\"mbNotes\"><hr class=\"mbhide\">"; // 20240820: StarTree: Use block for note content.

    if(NotBlank(mNode)){ // 20240820: StarTree: Add a link if there is node info.
      //mHTML += "<span class=\"mbRef mbContext\" style=\"margin:-2em -10px -2em -10px\">"
      //mHTML += " " + LnkCode(mNode,"",":Archive"+ArchiveNum(mNode)+":");
      //mHTML += "<span class=\"mbRef\" style=\"margin:-13px -20px -13px -20px\">";
      //mHTML += "<div class=\"mbIcon iCornerRibbon\" style=\"float:right;margin:-0.7em;padding-right:0.7em\">";
      //mHTML += " " + LnkCode(mNode,"","◥");
      mHTML += "<div style=\"float:right;margin:-0.7em -0.9em\">";
      mHTML += " " + LnkCode(mNode,"",":CornerRibbon:");
      mHTML += "</div><hr class=\"mbhide\">";
    }

    mHTML += mTag.innerHTML;


    mHTML += "<div class=\"mbCB\"></div></div>";
    mHTML += "</hide></a></mbnote>";
    mTag.outerHTML = mHTML;
  }
}
function MacroRes(el){
  // 20240428: Zoey: To support nested resources (image) and to include music and file also.
  // This is for things that we want to include but don't want the browser to load when
  // it fetches the archive.
  // Format:
  // <res DTS="###" src="..." class="..." style="...">...</res>
  var mTags = el.querySelectorAll('res');
  //for(let i=mTags.length-1;i>-1;i--){ 
  // 20240428: Zoey: Does not need reverse order to process nested resources.
  
  // TEMP
  //var mConvert = "";
  
  for(let i=0;i<mTags.length;i++){
    let mTag = mTags[i];    
    // STEP: Determine the type and process accordingly.
    if(MacroResCalendar(mTag)){continue;} // Calendar Object
    if(MacroResItem(mTag)){continue;} // Library Item
    if(MacroResTimeline(mTag)){continue;}
    if(MacroResImage(mTag)){continue;} // Default as image
    
  }
  /// TEMP
  //if(mConvert!=""){navigator.clipboard.writeText(mConvert);alert("Done!!!!")}
}
function MacroResCalendar(mTag){
  // 20240608: Arcacia
  // Type = Calendar: Required attribute
  // Icons = A | separated list.
  // Month = Indicates which month to use for rolling diary
  // .. Plan: If the length is 2, interpret it as MM for a rolling calendar.
  // .. Plan: Otherwise, interpret as YYYYMMM for a regular calendar
  let mType = Default(mTag.getAttribute("type"),"");
  if(mType.toLowerCase() != "calendar"){return false;}
  let mIcons = mTag.getAttribute("icons");
  let mMonth = mTag.getAttribute("month");
  let bRolling = (mMonth.length==2);

  // STEP: Interpret the number of days in the calendar
  let mIconArr = mIcons.split("|");
  let mNumberOfDays = mIconArr.length;
  // STEP: Starting Offset: Default is to have no offset.
  
  
  let mHTML = "<table control class=\"mbCalendarb\" style=\"margin-bottom:10px\">";
  // STEP: Add Header Row only if it is not a rolling diary
  if(!bRolling){
    mHTML += "<thead><tr><th>SUN</th><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th>SAT</th></tr></thead>";
  }
  // STEP: Compose the body
  mHTML += "</tbody>";
  let i = 0; // Also keeps track of the column position.
  let mDay = 1; 

  while(mDay <= mNumberOfDays){

    // STEP: start a row if at column count mods 7.
    if(i%7==0){
      if(i==0){mHTML += "<tr>";}else{mHTML += "</tr><tr>";}
    }
    // STEP: Fill the day content
    mHTML += "<td class=\"mbbuttonCal\" ";

    // STEP: Add the OnClick function call
    if(bRolling && mDay > 0){ // Assumes that Rolling calendar is a happy/kudo calendar
      let mMMDD = mMonth + mDay.toString().padStart(2,'0');
      //mHTML += " onclick=\"QSL(this,&quot;[date$='"+mMMDD+"'][data-happy],[id][date][time]:has([date$='"+mMMDD+"'][icon='💟'],[date$='"+mMMDD+"'][icon='💗'],mbkudo[date$='"+mMMDD+"'])&quot;)\"";
      //mHTML += " onclick=\"QSL(this,&quot;[date$='"+mMMDD+"'][data-happy],[id][date][time]:has([date$='"+mMMDD+"'][icon='💟'],[date$='"+mMMDD+"'][icon='💗'],mbkudo[date$='"+mMMDD+"'])&quot;)\"";
      mHTML += " onclick=\"QSLRollingKudo(this,&quot;"+mMMDD+"&quot;)\"";
    }

    mHTML += ">";
    if(mDay >0){
      mHTML += mDay + "<br>";
      let mDayIcon = Default(mIconArr[mDay-1],"&nbsp;");
      if(!isNaN(mDayIcon)){mDayIcon = "&nbsp;"} // If the content is just a number, assume that it is just a position marker and don't display it.
      mHTML += mDayIcon;
      mHTML += "</td>";
    }
    mDay ++;i++;
  }
  mHTML += "</tr>";
  mHTML += "</tbody></table>";
  // STEP: Add the search result area
  mHTML += "<div style=\"text-align:left\">";
  mHTML += "<div control=\"\"></div>";
  mHTML += "<div class=\"mbSearch\" style=\"display:flex;flex-direction: column;\"></div>"
  mHTML += "</div>";
  let elNew = document.createElement('div');
  mTag.after(elNew);
  elNew.innerHTML = mHTML;
  mTag.remove();
  return true;
}
function MacroResImage(mTag){
  // 20240428: Zoey // image type is the default. This process should be last.  
  let mDTS = mTag.getAttribute("dts");
  let mSRC = mTag.getAttribute("src");
  let mClass = mTag.getAttribute("class");
  let mStyle = mTag.getAttribute("style");
  let mHTML = "";
  mHTML = "<div";
  if(NotBlank(mDTS)){mHTML += " DTS=\"" +mDTS+"\"";}
  if(NotBlank(mClass)){mHTML += " class=\"" + mClass + "\"";}
  mHTML += " style=\"" + mStyle + ";";
  mHTML += "background-image:url('" + mSRC + "')\">";
  mHTML += mTag.innerHTML + "</div>";
  /* Example:
  <div DTS="..." style="position: relative; margin:5px 5px;padding:20px 10px; background-image:url('HTTP');border-radius:10px; box-shadow: 0px 0px 5px saddlebrown;background-position: 50% 50%; background-size:cover; ">*/
  let elNew = document.createElement('div');
  mTag.after(elNew);
  elNew.outerHTML = mHTML;
  mTag.remove();
  return true;
}
function MacroResItem(mTag){

  // 20240503: Skyle: For Board Game Library
  if(!mTag.hasAttribute('item')){return false;}
  /* FROM:
      <res dts="20240502234934" available item icon="" title="Item Name"  loc="" src="" node=""></res>
  TO:
      <topic dts="20240502232826" icon="⬜" title="Catan Junior">*/
  let mDTS = DTC("",mTag.getAttribute("item"));
  let mUpdate = LatestDate(mTag);
  //let mDate = Default(mTag.getAttribute("date"),mDTS.slice(0,8));  
  // 20241013: StarTree: Don't default the date with item ID.
  let mDate = Default(mTag.getAttribute("date"),Default(mTag.getAttribute("year"),"99999999"));  
  let mIcon = Default(mTag.getAttribute("icon"),"🎲");
  let mTitle = mTag.getAttribute("title");
  
  let mNode = mTag.getAttribute("node");
  let mSrc = mTag.getAttribute("src");
  let mTags = Default(mTag.getAttribute("tags"),"");
  let mOwner = Default(mTag.getAttribute("owner"),"???");
  let mItem = mTag.getAttribute("item");
  let mChannel = Default(mTag.getAttribute('channel'),"");
  let mSinger = Default(mTag.getAttribute("Singer"),"");
  let mStarCode = Default(mTag.getAttribute("star"),""); // 20250118: StarTree
  let mYouTube = Default(mTag.getAttribute("Youtube"),"");
  let mMuseScore = Default(mTag.getAttribute("Musescore"),"");


  var bSpoiler = mTag.hasAttribute('spoiler');
  
  // Save the Title in the name field for sorting.
  //let mHTML = "<div class=\"mbscroll\" item date=\""+mDate +"\" dts=\"" + mDTS + "\"";
  //mHTML += "\" name=\"" + mTitle + "\">";
  
  // Right header for sorting info
  mHTML = "<code label style=\"float:right;font-size:15px;letter-spacing:-0.5px;\"></code>";


   // TITLE: Local Storage Mark
  // 20240728: StarTree: Added for the Grocery List so that the data can be stored on the phone.
  mHTML += "<lnk>" + mItem +"|</lnk>"

  // TITLE: Icon
  //mHTML += "<span class=\"mbILB25\" style=\"font-size:14px\">";
  mHTML += "<span class=\"mbILB30\">" + ResIcon(mTag) + "</span>";

 


  /* ATTEMPT: FILTER: Result cannot be easily filtered by text.
  mHTML += "<span class=\"mbILB30\" style=\"filter:sepia(";
  if(mTag.hasAttribute('available')){mHTML += "0%);opacity:1" ;}else{mHTML += "100%);opacity:0.2";}
  mHTML += "\">" + mIcon + "</span>";*/

  // TITLE: This is where to add float right icons or sort parameters.
  mHTML += "<span label style=\"float:right;font-size:15px\"></span>"
  // TITLE: Item Title, this is a button to expand the rest.

  if(!bSpoiler){
    mHTML += "<a class=\"mbbutton\" onclick=\"ShowPL(this)\" style=\"text-wrap:wrap\">" + mTitle +"</a>";
  }else{
    mHTML += "<a class=\"mbbutton\" onclick=\"ShowPL(this)\" style=\"text-wrap:wrap\">" + "< ? ? ? > " +"</a>";
  }
  
  // INTEREST
  /// 20240608: Patricia
  /*mHTML += "<code style=\"font-size:15px;font-weight:bold\">"
  if(mTry>0){
    mHTML += " 🐱<b>" + mTry + "</b>";
  }
  mHTML += "</code>";*/
  mHTML += "<hide><hr>";
  // DATA: This is the area for basic data about the item
  mHTML += "<div control class=\"mbpuzzle\" style=\"float:right;font-size:15px;margin:-2px 0px -3px 0px;padding:2px 5px;max-width:150px;\">";  //max-width:145px
  //mHTML += "<div class=\"mbpuzzle\" style=\"font-size:15px;margin:0px 0px 0px 0px;\">";  
  

  // == Avaiablity Label ==
  if(mTag.hasAttribute('available')){
    mHTML += "<center style=\"color:green\"><b>AVAILABLE</b></center>";
  }else if(mTag.hasAttribute('unavailable')){
    mHTML += "<center style=\"color:darkgoldenrod\"><b>IN USE</b></center>";
  }else if(mTag.hasAttribute('unowned')){
    mHTML += "<center style=\"color:saddlebrown\"><b>UNOWNED</b></center>";
  }else if(mTag.hasAttribute('open')){ 
    // Open Discussion
    mHTML += "<center style=\"color:green\"><b>OPEN</b></center>";
  }else if(bSpoiler){
    mHTML += "<center><note subtitle=\"Reveal Spoiler\">" + mTitle+ "</note></center>";
  }
  // DATA: Channel Info
  if(NotBlank(mChannel)){
    mHTML += "<center><b>"+ mChannel+ "</b></center>";
  }

  // DATA: Youtube Playlist Link
  
  if(NotBlank(mYouTube) || NotBlank(mMuseScore)){
    mHTML += "<center>";
    let mURL = "";
    if(NotBlank(mYouTube)){
      
      mURL = "https://www.youtube.com/watch?v=" + mYouTube + "&list=PL77IbAOrvAb9mGTlEOnDpCi4pVYngX0yx";
      // 20250118: StarTree: This was the original code.
      //mHTML += "<a title='Youtube' class='mbbuttonEx' onclick=\"ExURL('"+ mURL + "');return false;\" href='"+mURL+"'>🎧<hide>"+mURL+"</hide></a>";
      // 20250118: StarTree: Upgrading to spawn a youtube frame.
      mHTML += "<a class=\"mbbutton\" title=\"Play\" onclick=\"YoutubeSpawnFP(this,'"+ mTitle + "','"+mYouTube+"','');return false\" href=\""+mURL+"\">🎧</a>";
      mHTML += "<hide>" + mYouTube + "</hide>"
    }
    if(NotBlank(mMuseScore)){
      mURL = "https://musescore.com/user/35526651/scores/" + mMuseScore;
      mHTML += "<a title='Musescore' class='mbbuttonEx' onclick=\"ExURL('"+ mURL + "');return false;\" href='"+mURL+"'>🎼<hide>"+mURL+"</hide></a>";
    }  
    mHTML += "</center>";
  }
  

  // DATA: ID
  if(NotBlank(mItem)){
    mHTML += "<b>ID:</b> [" + mItem +"] ";
  }else{
    mHTML += "<b>ID:</b> [📌" + mDTS +"] ";
  }  
  // Node Link in the Side Panel
  if(NotBlank(mTag.getAttribute('node'))){
    var mArchiveNum = ArchiveNumSelect(mNode);
    mHTML += LnkCode(mNode,":Archive"+mArchiveNum+":","") +"<br>";
  }else{
    mHTML += "🥚<br>"
  }

  // == Star Pattern == (Show as part of tags)
  
  var mStarPattern = StarPattern(mStarCode);
  /*if(NotBlank(mStarPattern)){
    mHTML += "<center>" + mStarPattern + "</center>";
  }*/

  // Tags. Need to display this for text filter
  // 20240827: James: Don't show tags if there is none.
  
  if(NotBlank(mTags) || NotBlank(mStarPattern)){ 
    mHTML += "<hide tags>+";
    
    if(NotBlank(mStarPattern)){mHTML += mStarPattern + "+";} // 20250118: Sasha: Show stars as part of tags
    mHTML += mTags.replaceAll(" ","+").replaceAll("_"," ") + "+</hide>";
    mHTML += "<b>Tags:</b>&nbsp;" ;
    if(NotBlank(mStarPattern)){mHTML += mStarPattern + " ";} // 20250118: Sasha: Show stars as part of tags
    mHTML += mTags.replaceAll("_"," ") +"<br>";
  }

  // Singers.
  if(NotBlank(mSinger)){
    mHTML += "<b>Singer:</b>&nbsp;" + mSinger +" ";
  }

  
  
  // URL in the Side Bar
  if(mTag.hasAttribute("src")){
    if(NotBlank(mSrc)){
      mHTML += GetURLCode(mSrc) +"<br>";
    }else{
      // 20240504: Sasha: If the url is blank, output error flag
      mHTML += "[📌src?]<br>";
    }
  }else{
    mHTML += "<div></div>";
  }

  
  //mHTML += "<b>Owner:</b>&nbsp;" + mOwner +"<br>";
  if(mTag.hasAttribute("loc")){
    mHTML += "<b>Loc:</b>&nbsp;" + Default(mTag.getAttribute("loc"),"📌loc?")  +" ";
  }
  
  mHTML += "</div>"

  // Custom Content about this item.
  mHTML += "<hr class=\"mbhide\">"; // Trick to use Enter bubble.
  mHTML += mTag.innerHTML;
  mHTML += "<div class=\"mbCB\"></div><hr>";
  mHTML += "</hide>";
  
  let elNew = document.createElement('div');
  mTag.after(elNew);
  elNew.innerHTML = mHTML;

  // 20241014: Ivy: If the grandparent is not a banner, use mbpuzzle.

  if(elNew.parentNode.parentNode.hasAttribute("banner")){
    elNew.classList.add("mbscroll");
  }else{
    elNew.classList.add("mbpuzzle");
  }
  
  // tags copying
  elNew.setAttribute('topic','');
  elNew.setAttribute('name',mTitle);
  elNew.setAttribute("date",mDate);
  elNew.setAttribute("update",mUpdate);
  elNew.setAttribute("dts",mDTS);
  elNew.setAttribute("star",mStarCode); // 20250118: StarTree
  elNew.setAttribute("tags",mTags);
  
  if(mTag.hasAttribute("year")){
    
    elNew.setAttribute("year",mTag.getAttribute("year"))}

  mTag.remove();
  return true;
}
function MacroResTimeline(mTag){
  // 20240522: StarTree: A timeline object has a year
  if(!mTag.hasAttribute("year")){return false;}
  let mYear = mTag.getAttribute("year");
  let mTitle=mTag.getAttribute('title');
  let mSrc = mTag.getAttribute("src");

  
  
  let mHTML = "<div class=\"mbscroll\" name=\""+mTitle+"\"";
  mHTML += " year=\""+mYear+"\"";
  // Pad the year if it has fewer than 5 characters.
  mYear = mYear.padStart(5," ").replaceAll(" ","&nbsp;");
  mHTML += ">";
  mHTML += "<code class=\"\" label style=\"float:right;font-size:15px\"></code>"
  mHTML += "<a onclick=\"ShowNextHTIL(this)\" class=\"mbbutton mbhide\"><code>" + mYear + "</code></a><a onclick=\"ShowPrevHTIL(this)\" class=\"mbbutton\"><code>&nbsp;???&nbsp;</code></a> <span class=\"mbbutton\" onclick=\"ShowNextInline(this)\">" + mTitle + "</span> <hide>";
  mHTML +="<url>" + mSrc + "</url>";
  mHTML += mTag.innerHTML;
  mHTML += "</hide></div>";
  let elNew = document.createElement('div');
  mTag.after(elNew);
  elNew.outerHTML = mHTML;
  mTag.remove();
  return true;
}
function MacroTopic(el){
  // 20240420: StarTree: Changes:
  //   <topic Icon="🏹" Title="New Topic">...</topic>
  // Into: 
  /*  <div class='mbscroll'>
        <div class='mbbutton' onclick='ShowNext(this)'>🏹 New Topic</div>
        <div class='mbhide'>
          ...
          <hr class='mbCB'>
        </div>
      </div>
  */
  var mTags = el.querySelectorAll('topic');
  for(let i=mTags.length-1;i>-1;i--){
    let mTag = mTags[i];
    let mDTS = mTag.getAttribute("dts");
    let mIcon = Default(mTag.getAttribute("icon"),"");
    let mTitle = Default(mTag.getAttribute("title"),"");
    let mPrefix = Default(mTag.getAttribute("prefix"),"");
    let mSubtitle = Default(mTag.getAttribute("Subtitle"),""); 
    let mHTML = "";

    // STEP: If a topic is inside OL or UL, turn it into a bullet.
    if(mTag.parentNode.tagName=="OL" || mTag.parentNode.tagName=="UL"){
      let elNew = document.createElement('bullet');
      elNew.setAttribute('title',mTitle);
      elNew.setAttribute('Subtitle',mSubtitle);
      elNew.setAttribute('prefix',mPrefix);
      elNew.setAttribute('DTS',mDTS);
      elNew.setAttribute('Icon',mIcon);
      if(mTag.hasAttribute('monthly')){
        elNew.setAttribute('monthly',mTag.getAttribute("monthly"));
      }

      elNew.innerHTML = mTag.innerHTML;
      mTag.before(elNew);
      mTag.remove();
      continue;
    }    
    
    // STEP: If the topic has the attribute Scan, command for a scan.
    // 20240426: Patricia: Make the normal node only when not scanning.
    if(!MSTopic(mTag)){
      let mClass = "mbscroll";
      let mParentTag = mTag.parentNode.tagName;
      if(mParentTag == "TOPIC" || mParentTag=="BULLET" || mParentTag=="MSG"){
        mClass = "mbpuzzle";
      }
      let mFullTitle = FullTitle(mTag);

      mHTML = "<div class='mbbutton' onclick='ShowNext(this)'>";
      // 20240910: Evelyn: 
      //mHTML += "<div style=\"transform:rotate("+5*getRandomInt(-4,4,true)+"deg)\" class='mbTopicIcon'>" + mIcon + "</div>";
      mHTML += "<div class='mbTopicIcon'>" + mIcon + "</div>";
      mHTML += mFullTitle + "</div><hide class=\"mbSearch\"><hr class='mbhr'>";
  
      mHTML += mTag.innerHTML;
      
      mHTML += "<div class='mbCB'></div></hide>";
      // 20240711: Natalie: to improve formatting.
      let elNew = document.createElement('div');
      /*
      elNew.classList.add("mbCL");      
      mTag.before(elNew);

      elNew = document.createElement('div');//*/
      elNew.classList.add(mClass);   
      elNew.classList.add("mbCL"); // 20240801: Arcacia
      elNew.setAttribute('DTS',mDTS);
      elNew.setAttribute('topic',"");
      elNew.innerHTML = mHTML;
      mTag.before(elNew);
    }
    mTag.remove();
  }
}
function MacroURL(el){
  // 20240503: StarTree: 
  /* FROM: <url>...</url>
     TO:   <a class="mbbuttonEx mbURL" onclick="ExURL('https://www.youtube.com/watch?v=DS2sP8CDLas&list=PL77IbAOrvAb9mGTlEOnDpCi4pVYngX0yx')">🔗</a>
  */
 // 20240504: Sylvia: Optional argument <url title="...">...</url>
  let mTags = el.querySelectorAll("url");
  mTags.forEach((mTag)=>{
    mTag.outerHTML = GetURLCode(mTag.innerHTML, mTag.getAttribute('title'),mTag.getAttribute('lang'));
  });
}
function MemberHPBar(iMember,mHPMax,mHPCur){
  // 20240909: StarTree: Returns a mock HP bar.
  //mHPMax = parseInt(mHPMax);
  //mHPCur = parseInt(mHPCur);  
  if(mHPMax==undefined){
    mHPMax = 3;
    switch(iMember){
      case "James": mHPMax = 4; break;
      case "LRRH": mHPMax = 1; break;
      case "Neil": mHPMax = 2; break;
      case "P4": mHPMax = 2; break;
    }    
    mHPCur = getRandomInt(0,mHPMax,true); // 20240909: StarTree: Temproary code.
  }
  
  var mHTML = "<span HPMax=\""+mHPMax+"\" HPCur=\""+mHPCur+"\" style=\"font-size:16px\">" + "<a class=\"mbbutton\" onclick=\"MemberHPClick(this)\">❤️</a>".repeat(mHPCur) + "<a class=\"mbbutton\" onclick=\"MemberHPClick(this)\">🤍</a>".repeat(mHPMax-mHPCur) + "</span>" ;
  return mHTML;
}
function MemberHPClick(el){
  // 20240909: StarTree: This function is applied to each heart of an HP Bar.
  // If the click is on a full heart, the current HP decreases.
  // If the click is on an empty heart, the current HP increases.
  var elHPBar = SearchPS(el,"HPMax");
  var mHPMax = Number.parseInt(elHPBar.getAttribute("HPMax"));
  var mHPCur = Number.parseInt(elHPBar.getAttribute("HPCur"));
  if(el.innerHTML.search("❤️")!=-1){
    mHPCur = Math.max(0,mHPCur-1);
  }else{
    mHPCur = Math.min(mHPMax,mHPCur+1);
  }  
  elHPBar.outerHTML = MacroIcons("",MemberHPBar("",mHPMax,mHPCur));
  elHPBar.setAttribute("HPCur",mHPCur);
}
function MemberLevel(iMember){
  // 20240909: StarTree
  return Math.floor(Math.sqrt(GuildEXP(iMember)));
}
function GetURLCode(mURL,mDesc, mLang){
  // 20240504: Sylvia: mDesc argument is optional.
  var bIcon = false;
  var bYouTube = false; // 20250118: StarTree: Enabling embedded frame spawning.
  if(IsBlank(mDesc)){
    mDesc = "url";
    if(mURL.includes(".jpeg")){mDesc="JPEG"};
    if(mURL.includes(".pdf")){mDesc="PDF"};
    if(mURL.includes("amazon.com")){mDesc="Amazon"};
    if(mURL.includes("https://a.co/")){mDesc="Amazon"};
    if(mURL.includes("boardgamegeek.com")){mDesc="BGG"};
    if(mURL.includes("deviantart.com")){mDesc="DeviantArt"};
    if(mURL.includes("jlptsensei.com")){mDesc="JLPT";};
    if(mURL.includes("wikipedia.org")){mDesc="Wiki"};
    if(mURL.includes("nextdoor.com")){mDesc="🏡";bIcon=true;};
    if(mURL.includes("reddit.com")){mDesc="Reddit"};
    if(mURL.includes("twitter.com")){mDesc="💬";bIcon=true;};    
    if(mURL.includes("youtube.com")){mDesc="📺";bIcon=true;bYouTube=true;};
    if(mURL.includes("&list=")){mDesc="🎧";bIcon=true;};
    if(mURL.includes("podcast")){mDesc="📻";bIcon=true;};

  }
  if(NotBlank(mLang)){
    mDesc += "&nbsp;" + mLang;
  }
  // 20240511: Black Don't put brackets around an icon. 
  if(!bIcon){
    mDesc = "[" + mDesc + "]";
  }
  // 20250118: StarTree: If it is a youtube link, try to spawn it at the Music Player.
  if(bYouTube){
    let mYouTubeCode = YouTubeDecode(mURL);
    return "<a class=\"mbbutton\" title=\"Play\" onclick=\"YoutubeSpawnFP(this,'"+ mDesc + "','"+mYouTubeCode+"','');return false\" href=\""+mURL+"\">"+ mDesc+"</a>";
  }


  return "<a class=\"mbbuttonEx mbURL\" onclick=\"ExURL('" + mURL + "');return false;\" href=\""+mURL+"\">" + mDesc + "</a>";
}
function FullTitle(el,mPrefix,mSubtitle,bNS){
  // 20240429: Cardinal
  let mTitle = Default(el.getAttribute("title"),"");
  mPrefix = Default(mPrefix,el.getAttribute("prefix"));
  mSubtitle = Default(mSubtitle,el.getAttribute("Subtitle"));
  let mHTML = FullTitleStr(mTitle,mPrefix,mSubtitle,bNS);
  
  // 20240528: Sasha: Auto display of monthly attribute.
  if(el.hasAttribute("monthly") || NotBlank(el.querySelector('[monthly]'))){
    let mYYYYMM = DTSNow().slice(0,6); // Get the current month.
    let mMTodo = el.querySelector("[monthly]:not(:has(msg[dts^='"+mYYYYMM+"']:not([icon='📌'])))");
    let mMDone = el.querySelector("msg[dts^='"+mYYYYMM+"']:not([icon='📌'])");
    if(NotBlank(mMTodo) || IsBlank(mMDone)){
      mHTML += " <small title='Monthly Quest'>🔔</small>";
    }else{
      mHTML += " <small title='Monthly Quest Completed'>✅</small>";
    }
    
  }

  return mHTML;
}
function FullTitleNS_DELETE20240528(el,mPrefix,mSubtitle){
  // 20240429: Cardinal
  let mTitle = Default(el.getAttribute("title"),"");
  mPrefix = Default(mPrefix,el.getAttribute("prefix"));
  mSubtitle = Default(mSubtitle,el.getAttribute("Subtitle"));
  let mHTML = FullTitleStr(mTitle,mPrefix,mSubtitle,true);
  // 20240528: Sasha: Auto display of monthly attribute.
  if(el.hasAttribute("monthly")){
    mHTML += " <small>🔔</small>";
  }
  return mHTML;
}
function FullTitleStr(mTitle,mPrefix,mSubtitle,bNS){
  // 20240429: Cardinal: With substitution
  if(!bNS){
    if(mSubtitle=="Completed"){mSubtitle="✅";}
  }else{
    // 20240429: Cardinal: NO Substitution.
    let mFullTitle = "";
    if(NotBlank(mPrefix)){mFullTitle += mPrefix + " ";}
    mFullTitle += mTitle;
    if(NotBlank(mSubtitle)){
      if(mSubtitle.slice(0,1)=="/"){
        mFullTitle += mSubtitle;
      }else{
        if(NotBlank(mFullTitle)){
          mFullTitle += " " + mSubtitle;
        }else{
          mFullTitle += mSubtitle;
        }
      }
    }
    return mFullTitle;
  }
  return FullTitleStr(mTitle,mPrefix,mSubtitle,true);
}
function FullTitleStrNS_DELETE20240528(mTitle,mPrefix,mSubtitle){
  // 20240429: Cardinal: NO Substitution.
  let mFullTitle = "";
  if(NotBlank(mPrefix)){mFullTitle += mPrefix + " ";}
  mFullTitle += mTitle;
  if(NotBlank(mSubtitle)){
    if(mSubtitle.slice(0,1)=="/"){
      mFullTitle += mSubtitle;
    }else{
      if(NotBlank(mFullTitle)){
        mFullTitle += " " + mSubtitle;
      }else{
        mFullTitle += mSubtitle;
      }
    }
  }
  return mFullTitle;
}
function MacroMsg(el){
  // STEP: Interpret the context and compose the html code
  // 20240420: StarTree: If this is the first bubble in a topic, use the "ENTER" format.
  var mBubbles = el.querySelectorAll('msg');
  mBubbles.forEach((mTag)=>{
    // STEP: Processing Attributes

    let mDTS = mTag.getAttribute("dts");
    let mParent = mTag.getAttribute('parent'); // 20240427: Black: This comes from MSScanFor
    let mParentName = mTag.getAttribute('parentname');
    let mHTML = "";
    //let bFirst = (mTag.parentNode.querySelector('msg')==mTag);
    let bFirst = (mTag.parentNode.querySelector('msg')==mTag);
    

    // 20240620: Mikela: The first element is HR.
    let mParentTag = mTag.parentNode.tagName;
    let elPrev = mTag.previousElementSibling;
    if(bFirst && (mTag.parentNode.classList.contains("mbDayContent")) ){
      mHTML = RenderStart(mTag);
    }else if(bFirst && (mTag.parentNode.classList.contains("mbCardMatText"))){
      mHTML = RenderStart(mTag);
    //}else if(bFirst && mTag.parentNode.hasAttribute('topic')){
      // The situation of a bullet.
      //mHTML = RenderEnter(mTag);
    }else if(NotBlank(elPrev) && elPrev.tagName=='HR'){
      // The situation of topic after topic is already rendered.
      mHTML = RenderEnter(mTag);
    }else{
      
      mHTML = RenderMsg(mTag);
    }
    let elNew = document.createElement("span");
    elNew.setAttribute('DTS',mDTS);
    elNew.setAttribute("bubble",''); // 20240430: Remember that it is a bubble.    
    elNew.setAttribute('parent',mParent);
    elNew.setAttribute('parentname',mParentName);
    elNew.innerHTML = mHTML;
    mTag.before(elNew);
    
    return;
  });
  mBubbles.forEach((mTag)=>{
    mTag.remove();
  });
}
function MSIconToggle(elButton){
  // 20240505: StarTree: Show or hide XP icons.
  let elWidget = SearchPS(elButton,"widget");
  let elDisplay = elWidget.querySelector("[display]");
  let bMode = (elButton.getAttribute('mode')=="show");
  let elIcons = elDisplay.querySelectorAll('[d-XPIcon]');
  let elXPs = elDisplay.querySelectorAll('[d-XP]');

  if(bMode){ // Currently Showing. So hide all of them.
    elButton.setAttribute('mode','hide');
    elIcons.forEach((mTag)=>{mTag.classList.add("mbhide");});
    elXPs.forEach((mTag)=>{mTag.classList.add("mbhide");});
  }else{ // Show them.
    elButton.setAttribute('mode','show');
    elIcons.forEach((mTag)=>{mTag.classList.remove("mbhide");});
    elXPs.forEach((mTag)=>{mTag.classList.remove("mbhide");});
  }
}
function MSModeToggle(elButton){
  // 20240505: StarTree: Show or hide Mode Info.
  let elWidget = SearchPS(elButton,"widget");
  let bMode = (elButton.getAttribute('mode')=="show");
  let elModes = elWidget.querySelectorAll('[d-mode]');

  if(bMode){ // Currently Showing. So hide all of them.
    elButton.setAttribute('mode','hide');
    elModes.forEach((mTag)=>{mTag.classList.add("mbhide");});
  }else{ // Show them.
    elButton.setAttribute('mode','show');
    elModes.forEach((mTag)=>{mTag.classList.remove("mbhide");});
  }
}
function MSTopic(elTopic){
  // 20240426: Patricia: Check if this topic should replace its content with scanned content. If so, get the start and end time and commission a scan.
  if(!elTopic.hasAttribute('scan')){return false;}
  let mStart = DTSPadding(elTopic.getAttribute('start'));
  let mEnd = DTSPadding(elTopic.getAttribute('end'));
  let mDTS = elTopic.getAttribute("dts");
  let mTitle = Default(elTopic.getAttribute("title"),"Scan Result");
  let mIcon = Default(elTopic.getAttribute("icon"),"");

  // Make the Topic Header
  let mClass = "mbscroll";
  let mParentTag = elTopic.parentNode.tagName;
  let mHTML = "";
  if(mParentTag == "TOPIC" || mParentTag=="BULLET" || mParentTag=="MSG"){
    mClass = "mbpuzzle";
  }
  mHTML = "<div class='mbbutton' onclick='ShowNext(this)'>";
  mHTML += "<span class='mbILB30'>" + mIcon + "</span>";
  mHTML += mTitle + "</div><hide topic><hr class='mbhr'>";
  mHTML += "<div display topic></div>"; // Put the Scanned content here.
  mHTML += "<div class='mbCB'></div></hide>";
  let elNew = document.createElement('div');
  elNew.classList.add(mClass);
  elNew.setAttribute('DTS',mDTS);
  elNew.setAttribute('scan','');
  elNew.setAttribute('topic','');
  elNew.setAttribute('start',mStart);
  elNew.setAttribute('end', mEnd);
  elNew.innerHTML = mHTML;
  elTopic.before(elNew);
  let elDisplay = elNew.querySelector('[display]');
  MSScanFor(elDisplay,mStart,mEnd,elNew.querySelector('[header]'));
  return true;
}
function MSModeTally(elStruct,mArea,mModeCode){
  // 20240505: Sasha
  // 20240505: StarTree: Changed to Mode.
  let mAreaCode = 1;
  if(mArea=="academy"){mAreaCode = 0;}
  if(mArea=="help"){mAreaCode = 2;}
  elStruct[mAreaCode][mModeCode]++;
}
function MSScanFor(elDisplay,mStart,mEnd,elHeader,bGroupByTopic){
  // 20240426: Patricia: Populate the element with messages.
  elDisplay.innerHTML = WaitIcon();
  if(NotBlank(elHeader)){elHeader.innerHTML = ""}
  let elCache = document.createElement("div");
  $(document).ready(function(){
    // STEP: If it is Offline Mode, populate the archives with cache data.
    var elArchives = Offline();
    var mMsgList = [];    
    if(NotBlank(elArchives)){
      let elMsgs = elArchives.querySelectorAll("MSG[dts]");
      MSScanForPush(mMsgList,elMsgs,mStart,mEnd);
      MSScanForEL(elDisplay,mMsgList,elHeader,bGroupByTopic,mStart,mEnd)
      return;
    }
    var mDone = 0;  
    for(let i=1; i<=ArchiveNum();i++){
      // 20240427: Black: Expanding the query to get the context.

      $(elCache).load(ArchiveIndex(i) + "[id][date][time]", function(){
        let elMsgs = elCache.querySelectorAll('MSG[dts]');
        MSScanForPush(mMsgList,elMsgs,mStart,mEnd);        
        mDone ++;
        if(mDone >= ArchiveNum()){
          MSScanForEL(elDisplay,mMsgList,elHeader,bGroupByTopic,mStart,mEnd)
          elCache.remove();
        }
      });
    };
  });
}
function MSScanForPush(mMsgList,elMsgs,mStart,mEnd){
  // STEP: Push into mMsgList if the message is within range.

  elMsgs.forEach((mMsg)=>{
    let mMsgDTS = Number(DTSPadding(mMsg.getAttribute('DTS')));
    if(mStart<= mMsgDTS && mMsgDTS < mEnd){
      let elNode = SearchPS(mMsg,'time');
      mMsg.setAttribute('parent',elNode.id.slice(1));
      mMsg.setAttribute('nodeName',GetNodeTitle(elNode));
      mMsg.setAttribute('area',GetNodeArea(elNode));
      mMsg.setAttribute('parentName',GetLocalTitle(mMsg,elNode));
      mMsgList.push([mMsgDTS,mMsg]);
    }
  });
}
function MSScanForEL(elDisplay,mMsgList,elHeader, bGroupByTopic, mStart, mEnd){
  // 20240509: Black: The inner function of MSScanFor, shared between online and offline mode.
  var mHTML = "";
  var mHeaderHTML = ""
  var mModeTally = [[0,0,0],[0,0,0],[0,0,0]]; 
  // This is an array of mode tally. 0=Academy, 1=Guild, 2=Help
  // Then 0=maintenance, 1=upgrade, 2=service

  mMsgList.sort();  // Sort by DTS

  // STEP: Check if the content should be sorted by group.          
  let elWidget = SearchPS(elDisplay,'widget');
  if(IsBlank(bGroupByTopic)){
    bGroupByTopic = true;
    try{
      bGroupByTopic = elWidget.querySelector('[MS_ByTopic]').checked;
    }catch(e){
      bGroupByTopic = false;
    }
  }
  if(bGroupByTopic){
    for(let i=0;i<mMsgList.length;i++){
      mMsgList[i][0] = mMsgList[i][1].getAttribute('nodename');
    }
    mMsgList.sort();  // Sort by Topic
  }
  // STEP: Output to the container.
  let mCurTopic = "";
  let mCurArea = "";
  let mMsgCount = 0;
  let mTopicHTML = "";
  let mCurIcon = "";
  let mCurDTS = "";
  let mCurNode = "";
  let mMaintenance = 0; let mUpgrade = 0; let mService = 0;
  let mTopicEXP = 0;
  for(let i=0;i<mMsgList.length;i++){
    let mMsg = mMsgList[i][1];

    if(bGroupByTopic){
      let mMsgTopic = mMsgList[i][0];
      if(mCurTopic != mMsgTopic){
        if(mCurTopic !=""){
          // If this is not the first topic, wrap the previous cached HTML in a topic object.
          mHTML += TopicWrap(mCurNode,mCurDTS,mMsgCount,mCurIcon,mCurTopic,mTopicHTML,mCurArea,mTopicEXP,mMaintenance,mUpgrade,mService);
        }
        mTopicHTML = "";
        mMsgCount = 0;
        mCurDTS = mMsg.getAttribute('dts');
        mCurIcon = mMsg.getAttribute('icon');
        mCurArea = mMsg.getAttribute('area');
        mCurNode = mMsg.getAttribute('parent');
        mCurTopic = mMsgTopic;
        mTopicEXP = 0;
        mMaintenance = mUpgrade = mService = 0;
      }
      mTopicHTML += mMsgList[i][1].outerHTML;
      mMsgCount ++;

      // 20240505: StarTree: Account for the rank if the message is ranked.
      let mEXP = 0;
      if(mMsg.hasAttribute('exp')){
        mEXP = Number(Default(mMsg.getAttribute('EXP'),1));
      }
      mTopicEXP += mEXP;
      if(mMsg.hasAttribute('mode')){
        //if(mEXP==0){mEXP = 1} // Assumes that mEXP was 0 because it was blank.
        // 20240505: StarTree: LRRH wants this count to be per occurence, not per XP.
        switch(ModeCSS(mMsg.getAttribute('mode'))){
          case "Maintenance": mMaintenance++;MSModeTally(mModeTally,mCurArea,0);break;
          case "Upgrade": mUpgrade++;MSModeTally(mModeTally,mCurArea,1);break;
          case "Service": mService++;MSModeTally(mModeTally,mCurArea,2);break;
        }
      }
    }else{
      // Not grouping by topic
      mHTML += mMsgList[i][1].outerHTML;
    }
  }// END FOR EACH MESSAGE

  // Close the topic if there were any
  if(mCurTopic!=""){
    mHTML += TopicWrap(mCurNode,mCurDTS,mMsgCount,mCurIcon,mCurTopic,mTopicHTML,mCurArea,mTopicEXP,mMaintenance,mUpgrade,mService);
    elDisplay.style.display = "flex";
    elDisplay.style.flexDirection = "column";
    elDisplay.classList.remove('mbpuzzle');
  }else{
    elDisplay.style.display = "block";
    elDisplay.classList.add('mbpuzzle');
    //elDisplay.style.flexDirection = "initial";
  }

  // Compose the header.
  mHeaderHTML = "<center>";
  mHeaderHTML+= MSModeShow(mModeTally);
  mHeaderHTML += "</center>";

  // 20240502: Arcacia: No Result message
  if(IsBlank(mHTML)){
    mHTML = "No result from " + mStart + " to " + mEnd + ".";
    mHeaderHTML = "";
  }else{

  }
  if(NotBlank(elHeader)){elHeader.innerHTML = mHeaderHTML;}
  elDisplay.innerHTML = mHTML;
  Macro(elDisplay);
  

}
function MSModeShow(elStruct){
  // 20240505: Sasha: Returns an HTML string.
  var mHTML = "<span class=\"mbhide\" d-mode>";
  const mMode = ["mbMaintenanceTx","mbUpgradeTx","mbServiceTx"];
  let i = 0;
  for(let i=0;i<3;i++){
    if(i==0){mHTML += "🎓"}
    if(i==1){mHTML += " 🥨"}
    if(i==2){mHTML += " ☎️"}
    for(let j=0;j<3;j++){
      //if(elStruct[i][j] > 0){
        mHTML+=" <span class=\"" + mMode[j] + "\"><small>" + elStruct[i][j] + "</small></span> ";
      //}
    }
  }
  mHTML += "</span>";
  return mHTML;
}
function MSSortTopics(el,bFL){
  // 20240430: Sylvia
  var elDisplay = SearchPS(el,'widget').querySelector('[display]');
  var mTopics = elDisplay.querySelectorAll('[topic]');
  var mTopicList=[];
  var mOrder = "";
  mTopics.forEach((mTopic)=>{    
    // This assumes that the topic is already sorted internally.
    if(bFL){
      // Sort by first message
      mOrder = mTopic.querySelector('[bubble]').getAttribute('dts');
      mTopic.setAttribute('start',mOrder);
    }else{
      // Sort by last message
      let mBubbles = mTopic.querySelectorAll('[bubble]');
      mOrder = mBubbles[mBubbles.length-1].getAttribute('dts');
      mTopic.setAttribute('end',mOrder);
    }
    mTopicList.push([mOrder,mTopic]);
  });
  mTopicList.sort();
  for(let i=0;i<mTopicList.length;i++){
    mTopicList[i][1].style.order = i;
  }
  if(bFL){
    elDisplay.style.flexDirection = 'column';
  }else{
    elDisplay.style.flexDirection = 'column-reverse';
  }

}
function TextBetween(iStr,iHead,iTail){
  // 20240906: StarTree: For parsing URL
  var mSplit = iStr.split(iHead);
  if(mSplit.length>1){
    iStr = mSplit[1];
  }
  mSplit = iStr.split(iTail);
  if(mSplit.length>1){
    iStr = mSplit[0];
  }
  return iStr;
}
function TopicWrap(mNode,mDTS,mCount,mIcon,mTitle,mTopicHTML,mArea,mTopicEXP,mMaintenance,mUpgrade,mService){
  // 20240505: StarTree: This display is getting complex and needs to be a custom header like the library code.
  let mNodeIcon = "📌"
  let mHTML = "<div topic class=\"mbscroll\" item dts=\"" + mDTS + "\" name=\"" + mTitle + "\">";

  // Topic Header: Show the Quest Area
  mHTML += "<span class=\"mbhide\" d-mode style=\"float:right;font-size:14px;\">";
  
  if(IsBlank(mArea)){mArea = "guild"}
  switch(mArea){
    case "academy": mNodeIcon = "🎓";break;
    case "guild": mNodeIcon = "🥨";break;
    case "help":  mNodeIcon = "☎️";break;
  }
   
  // Simplified Display: Mode Display
  
  mHTML += "<span class=\"mbMaintenanceTx\">" + mMaintenance +"</span> ";
  mHTML += "<span class=\"mbUpgradeTx\">" + mUpgrade +"</span> ";
  mHTML += "<span class=\"mbServiceTx\">" + mService +"</span> ";
  mHTML += NodeIDClipboardButtonCode(mNode,"",mNodeIcon)+" "; 

  /*
  //mHTML += "<b>";
  if(mRankS > 0){ mHTML += "<span class=\"mbRankS\"><small>" + mRankS + "</small></span> ";}
  if(mRankA > 0){ mHTML += "<span class=\"mbRankA\"><small>" + mRankA + "</small></span> ";}
  if(mRankB > 0){ mHTML += "<span class=\"mbRankB\"><small>" + mRankB + "</small></span> ";}
  if(mRankC > 0){ mHTML += "<span class=\"mbRankC\"><small>" + mRankC + "</small></span> ";}
  if(mRankD > 0){ mHTML += "<span class=\"mbRankD\"><small>" + mRankD + "</small></span> ";}
  mHTML += "</b>";
  */

  
  
  //
  /*mHTML += " <b>" + Cap(mArea) + "</b>";
  mHTML += "<br>"
  mHTML += "<small>⭐</small>" + mTopicEXP;*/
  mHTML += "</span>";

  // 20240619: Patricia: Use the chat icon as the default icon if there is none
  mIcon = Default(mIcon,"💬");

  // Topic Title
  mHTML += "<span class=\"mbILB30\">" + LnkCode(mNode,"",mIcon) + "</span>";
  mHTML += "<a class=\"mbbutton\" onclick=\"ShowNext(this)\" style=\"text-wrap:wrap\">";
  mHTML += mTitle;
  mHTML += " <small>[" + mCount + "]</small>"
  mHTML += "</a><hide><hr>";
  mHTML += mTopicHTML;
  mHTML += "<div class=\"mbCB\"></div><hr></hide></div>";

  
  
  //mHTML = "<topic dts=\""+mDTS+"\" title=\"" + mTopic + " ["+mCount+ "]\" Icon=\"" +mIcon + "\">";
  //mHTML += mTopicHTML;
  //mHTML += "</topic>";
  return mHTML;
}
function GetLocalTitle(elMsg, elNode){
  // 20240429: Cardinal: Search up to the node to get the first local title
  // STEP: Get the node to know when to stop (currently passed as argument)

  var mPtr = elMsg;
  var mPrefix = "";
  var mSubtitle = "";
  while(mPtr != elNode){
    if(mPtr.hasAttribute('title')){
      return FullTitle(mPtr,mPrefix,mSubtitle);
    }
    if(IsBlank(mPrefix)){mPrefix = mPtr.getAttribute("prefix");}
    if(IsBlank(mSubtitle) && NotBlank(mPtr.getAttribute("Subtitle"))){
      let tSubtitle = mPtr.getAttribute("Subtitle");
      if(tSubtitle=="Completed"){
        tSubtitle="✅";
        mSubtitle = tSubtitle + mSubtitle;
      }else{
        mSubtitle = "/" + tSubtitle + mSubtitle;
      }
    }
    mPtr = mPtr.parentNode;
  }
  return GetNodeTitle(elNode,mPrefix,mSubtitle);
}
function GetNodeArea(elNode){
  // 20240505: StarTree: Given a node element, return the area, which should be distinct.
  // Rule: If the area is specified, return that.
  //   Else, if the node has data-subject, then its area is academy.
  //   Otherwise, its area is guild.
  if(elNode.hasAttribute('area')){return elNode.getAttribute('area')}
  if(elNode.hasAttribute('data-subject')){return "academy"}
  return "guild";


}
function GetNodeTitle(elNode,mPrefix,mSubtitle){
  // 20240427: Black: Returns the title of the node given the element. 
  var elJSON = elNode.querySelector('node'); // get the JSON element.
  if(IsBlank(elJSON)){return "???";}
  var mJSON = JSON.parse(elJSON.innerHTML);
  return FullTitleStr(mJSON.title,mPrefix,mSubtitle);
}
function MSScan(elButton){
  // 20240426: StarTree: Implements the Message Scanner
  // It is assumed that within the control there are date input fields with titles "Start" and "End"
  var elWidget = SearchPS(elButton,'widget');
  var elControl = SearchPS(elButton,'control');
  var elStart = elControl.querySelector('[title="Start"]');
  var elEnd = elControl.querySelector('[title="End"]');
  var elDisplay = elWidget.querySelector('[display]');
  var elHeader = elWidget.querySelector('[header]');

  // STEP: Process the inputs
  var mStart = elStart.value; 
  if(IsBlank(mStart)){
    // 20240426: Patricia: Default start is the start of today.
    let mNow = DTSNow();
    mStart = DTSPadding(mNow.slice(0,8));
  }else{
    mStart = Number(DTSFormatStr(mStart));
  }
  var mEnd = elEnd.value;
  if(IsBlank(mEnd)){
    mEnd = Number(DTSNow()); 
  }else{
    mEnd = Number(DTSFormatStr(mEnd));
  }

  //elDisplay.classList.add('mbpuzzle');


  MSScanFor(elDisplay,mStart,mEnd,elHeader);
}
function RenderStart(el){
  // 20240420: StarTree: Renders a bubble in the a traditional START format.

  // 20240521: StarTree: If the first character is not alphabet, return a normal bubble.
  // 20240726: Evelyn: We need code that can automatically bold all beginning capitalized words.
  var mTextFC = el.innerHTML.slice(0,1);
  var mFirst3 = el.innerHTML.slice(0,3);

  if(mFirst3.toLowerCase() != "<b>" &&  mTextFC.toLowerCase() == mTextFC.toUpperCase()){
  //  if( mTextFC.toLowerCase() == mTextFC.toUpperCase()){
    return RenderMsg(el);
  }

  var mHTML="";
  // STEP: Show the Avatar with optional EXP icon.
  var mSPK = Default(SPKAvatar(el),"");
  var mEXP = RenderExp(el);
  var mIcon = Default(el.getAttribute("Icon"),"⭐");
  
  // 20240726: Evelyn: Hide the avatar in Start format.
  //if(NotBlank(mSPK)){
  //  mHTML += RenderAvXP(mSPK,mEXP,mIcon,el.getAttribute('rank'),el.getAttribute('mode'));
  //}

  mHTML += "<div class='mbpdc'>" + el.innerHTML;
  // 20240726: Evelyn: I think the start format doesn't need this chicken.
  /*if(el.hasAttribute('DTS')){
    mHTML += " <a class='mbbutton' onclick='MsgContext(this)'><small>...</small></a>";
  }*/
  mHTML += "</div>";
  //mHTML += "<div class='mbCL'></div>";
  return mHTML;
}
function ResCardList(elRecord){
  // 20240730: StarTree: Given a record, return a section HTML code for displaying cards.

  // STEP: Applicability: 20240731: Vivi: Query for all cards in the node, not just from the INV section.
  //var elInv = elRecord.querySelector("Inv");
  //if(IsBlank(elInv)){return "";}
  var elCardList = elRecord.querySelectorAll("Card");
  if(elCardList.length==0){return "";}

  // STEP: Make the Card section
  // 20240730: StarTree: Milestone 1: Just display the first card.
  var mHTML = "<div SidePanel class='mbCardRM";
  // 20240908: Ledia: If the node is a profile node, don't show the res section initially.
  if(elRecord.hasAttribute("data-profile")){
   mHTML += " mbhide";
  }
  mHTML += "'>";
  mHTML += "<div>" + elCardList[0].outerHTML + "</div>";
  var mIndex=""
  if(elCardList.length>1){ // Gallery Code
    mHTML += "<div>";
    for(i=0;i<elCardList.length;i++){
      mIndex = Default(elCardList[i].getAttribute("index"),String(i).padStart(2,"0"));
      mHTML += "<a class=\"mbbutton\" onclick=\"ShowNextPP(this)\">"+ mIndex  +"</a>";
      mHTML += "<hide>" + elCardList[i].outerHTML + "</hide> ";

    }
    mHTML += "</div>";
  }
  mHTML += "</div>";  
  return mHTML;
}
function ResIcon(mRes){
  // 20240731: StarTree: Returns an icon based on the content of the RES object.

  // RULE: If the RES contains any icon field with a pin, use the pin as the icon.
  var mPins = mRes.querySelectorAll("[icon=📌]");
  if(mPins.length > 0){return "📌";}

  // RULE: If the RES has one of these status attribute, then ignore any specified icon.
  if(mRes.hasAttribute('todo')){return "📌";}
  if(mRes.hasAttribute('unanswered')){return "📌";}
  if(mRes.hasAttribute('open')){return "💬";}
  if(mRes.hasAttribute('done')){return "✅";}
  if(mRes.hasAttribute('answered')){return "✅";}
  
  // RULE: If the Icon is defined, use the icon.
  if(mRes.hasAttribute('icon')){return mRes.getAttribute("icon");}

  // RULE: If there is no icon specified, check available flags.
  
  if(mRes.hasAttribute('unavailable')){return "💛";}
  if(mRes.hasAttribute('spoiler')){return "🤎";}
  if(mRes.hasAttribute('seeking')){return "🤍";}
  if(mRes.hasAttribute('unowned')){return "🕊️";}
  if(mRes.hasAttribute('available')){return "💚";}
  if(mRes.hasAttribute('instrumental')){return "🥁";}
  if(mRes.hasAttribute('vocal')){return "🎤";}

  // RULE: If it doesn't match any situation above, use a checkmark.
  return "✅";
}
function ResList(elRecord,bShow){
  // 20240730: StarTree: Given a record (a node) object, return the section HTML code of a search enabled RES List
  
  // STEP: Applicability Check: If the record does not have a RES items in the INV section, return an empty string.
  // 20240731: Vivi: Get RES items from the whole node, not just the INV section.
  //var elInv = elRecord.querySelector("Inv");
  //if(IsBlank(elInv)){return "";}
  //var elResList = elRecord.querySelectorAll("Res[item]");
  var elResList = elRecord.querySelectorAll("Res");
  if(elResList.length==0){return "";}

  // STEP: There is content, so make the searchable RES List.
  // Sub Step: Concatenate the Res Items.
  var mResPack = "";
  elResList.forEach((item)=>{
    // 20240925: StarTree: Don't include Calendar objects
    if(item.getAttribute("type")=="calendar"){return;}
    mResPack += item.outerHTML;
  });

  
  

  //DEBUG(mResPack);
  // Sub Step: Call the wrapper function
  return SearchWrapper(elRecord,mResPack,bShow,elResList.length);
}
function ModeCSS(mMode){
  // 20240506: Sasha
  if(NotBlank(mMode)){
    switch (mMode.toLowerCase()){
      case "maintenance":
      case "sort":
        return "Maintenance";
      case "upgrade":
      case "make":
      case "bake":
        return "Upgrade";
      case "service":
      case "give":
        return "Service";
    }
  }
  return "";
}
function RenderAvXP(mSPK,mEXP,mIcon,mRank,mMode){
  // 20240426: Skyle: Function called by other render functions
  var mHTML="";
  mHTML = "<div class=\"mbav50e mb" + mSPK;
  let mModeCSS = ModeCSS(mMode);
  if(NotBlank(mModeCSS)){mHTML += " mb" + mModeCSS;}
  mHTML += "\">";
  if(mEXP || NotBlank(mRank)){
    mHTML += "<div class='mbavXP' d-xpicon icon=\""+mIcon+"\">";
    mHTML += mIcon;
    if(mEXP !=1 || NotBlank(mRank)){
      mHTML += "<br><br><span class=\"mbXPTB mbILB20";
      if(NotBlank(mRank)){
        mHTML += " mbRank"+ mRank;
      }
      mHTML += "\" d-xp>" + mEXP +"</span>";
    }
    mHTML += "</div>";
  }
  mHTML += "</div>";
  return mHTML;
}
function RenderEnter(el){
  // 20240420: StarTree: Renders a bubble in the a traditional ENTER format.
  var mHTML="";
  // STEP: Show the Avatar with optional EXP icon.
  var mSPK = Default(SPKAvatar(el),"???");
  var mEXP = RenderExp(el);
  var mTitle = el.getAttribute("Title");
  var mIcon = Default(el.getAttribute("Icon"),"⭐");
  mHTML = "<div class=\"mbCL\"></div>"
  mHTML += RenderAvXP(mSPK,mEXP,mIcon,el.getAttribute('rank'),el.getAttribute('mode'));
  if(el.hasAttribute('DTS')){
    mHTML += "<a class='mbbutton' onclick='MsgContext(this)'>" + mSPK + "</a>" + SPKMultiStr(el) +" ";
  }else{
    mHTML += "<b>"+mSPK+":</b> ";
  }
  if(NotBlank(mTitle)){
    mHTML += "<b>" + mTitle +":</b> ";
  }
  mHTML += el.innerHTML;
  //mHTML += "<hr class='mbCB'>";
  return mHTML;
}
function RenderExp(el){
  // 20240420: StarTree: Interpret and create the short EXP string that is used in Bubble or Enter
  var mHasEXP =  el.hasAttribute("EXP");
  var mEXP = 0;
  if(mHasEXP){
    mEXP = Default(el.getAttribute("EXP"),1);
  }
  return mEXP;
}
function MsgContext(el){
  // 20240427: Black: Shows context information. 
  // el is the button.
  // STEP: If the previous element is not a context element, create it.
  var mContext = el.nextElementSibling;
  if(IsBlank(mContext) || !mContext.hasAttribute('context')){
    mContext = document.createElement('span');
    mContext.setAttribute('context',"");
    mContext.classList.add('mbContext');
    // Populate with context information.
    var elDTS = SearchPS(el,'dts');
    var mParent = elDTS.getAttribute('parent');
    var mParentName = elDTS.getAttribute('parentName');
    
    if(IsBlank(mParent)){
      let elBoard = SearchPS(el,'board');
      mParent = elBoard.getAttribute('board');
      elDTS.setAttribute('parent',mParent);
    }  
    mContext.innerHTML = NodeIDClipboardButtonCode(elDTS.getAttribute('dts'),mParent);
    
    // Don't make a link to the node itself or if the parentName is missing.
    if(NotBlank(mParentName)){
      mContext.innerHTML += " " + LnkCode(mParent,mParentName) + " ";
    }

    //mContext.innerHTML = "[" + elDTS.getAttribute('dts') +"]";
    MacroIcons(mContext);
    el.after(mContext);
  }else{
    // Manage Show/Hide
    if(mContext.classList.contains('mbhide')){
      mContext.classList.remove('mbhide');
    }else{
      mContext.classList.add('mbhide');
    }
  }
  

}
function RenderMsg(el){
// 20240414: StarTree: The bubble macro:
  // Turn:
  // <msg DTS="202404141904" SPK="StarTree" EXP="2" Icon="🍍">Testing Testing.</msg>
  // Into:
  // <button class='mbbutton' onclick='ShowNextInline(this)' DTS='202404141904' EXP='2' Icon='🍍'>🍍<small>2</small><div class='mbavem mbStarTree"></div></button><hide> <b>StarTree:</b> Testing Testing.</hide>
  var mHTML = "";
  let mDTS = el.getAttribute("DTS");
  if(NotBlank(mDTS)){mHTML += " DTS='" + mDTS + "'";}
  let mSPK = SPKAvatar(el);  
  let mRank = el.getAttribute("Rank")  ;
  let mEXP = RenderExp(el);
  let mTitle = el.getAttribute("Title");
  let mIcon = el.getAttribute("Icon");
  mHTML = "<button class=\"mbbutton";

  // 20240505: StarTree: Mode coloring
  if(el.hasAttribute('mode')){
    let mModeCSS = ModeCSS(el.getAttribute('mode'));
    if(NotBlank(mModeCSS)){mHTML += " mb" + mModeCSS;}
    let mMode = (el.getAttribute('mode')).toLowerCase();
  }

  mHTML += "\" onclick=\"ShowNextInline(this)\"";

  if(mEXP!=0){
    mHTML += " EXP='" + mEXP + "'";
    if(IsBlank(mIcon)){
      mIcon = '⭐';
    }
  }
  if(NotBlank(mIcon)){
    mHTML += " Icon='" + mIcon + "'";
  }
  mHTML += ">";
  if(NotBlank(mTitle)){mHTML += "<small>" + mTitle + "</small> ";}
  if(NotBlank(mIcon)){mHTML += "<small d-XPIcon>"+mIcon+"</small>";}
  //if(NotBlank(mEXP)){mHTML += "<sup class='mbSS'>⭐</sup>";}
  mHTML += "<span class=\"";
  if(NotBlank(mRank)){
    mHTML += "mbRank" + mRank
    if(!el.hasAttribute('EXP')){mEXP=0} // 20240505: P4: Show a 0 if there is rank but no EXP.
  }
  mHTML += "\">";
  if(NotBlank(mRank) || (NotBlank(mEXP) && mEXP > 1)){mHTML += "<small d-XP>" + mEXP + " </small>";}
  mHTML += "</span>";
  
  mHTML += "<div class='mbavem mb" + mSPK + "'></div>";
  mHTML += SPKPlus(el);
  mHTML += "</button><hide>";
  if(el.hasAttribute('DTS')){
    mHTML += "<a class='mbbutton' onclick='MsgContext(this)'>" + mSPK + "</a>" + SPKMultiStr(el) +" ";
  }else{
    mHTML += "<b>"+ mSPK + SPKMultiStr(el) + "</b> ";
  }
  mHTML += el.innerHTML;
  mHTML += "</hide>";
  return mHTML;
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
  var bMark = NodeMarkCookieCheck();
  var bMarkLocal = bMark;

  for (i=0;i<hit;i++){
    elJQ = z[i];
    cmd = elJQ.innerHTML;
    cmds = cmd.split("|");
    if(cmds.length<2){cmds[1] = "🥨";} // 20240508: LRRH: Added a default icon.
    // NEW Code

    // 20240331: StarTree: Disable bMark if it is within a questboard.
    if(bMark){
      bMarkLocal = bMark;
      try{
        var elQB = SearchPS(elJQ,'questboard');
        if(NotBlank(elQB)){
          bMarkLocal = false;
        }
      }catch(error){}
    }
    
    // 20241005: StarTree: Adding optional Title
    var mTitle = elJQ.getAttribute("title");
    var elNew = AddElement(elJQ,"span",LnkCode(cmds[0],cmds[1],"",bMarkLocal,mTitle));
    elNew.style.display="inline-block";
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
    try{
      MMInner(z[i],JSON.parse(z[i].innerHTML));
    }catch(e){
      DEBUG("MacroMacro Exception:" + z[i].innerHTML);
    }    
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
    el.classList.remove("mbMC2");
  }else if(el.getBoundingClientRect().width >= 500){    
    el.classList.add("mbMC2");
    el.classList.remove("mbMC3");
  }else{
    el.classList.remove("mbMC2");
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
  if(mMacro.cmd=="ll"){ // Language translation
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
      mHTML += "<div style='max-width:600px'><img style='border:0px;border-radius:10px' src='https://github.com/MagicBakery/Images/blob/main/" + mImgFileName;
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
  if(mMacro.cmd=="ButtonList"){ // (span) Creates a series of buttons
    // 20240422: StarTree: Changes:
    /*   <macro>{"cmd":"ButtonList","func":"NMMsg","list":"📌|🧰"]"}</macro>
       To:
         <a class="mbbutton" onclick="NMMsg(this,'📌')">📌</a>
         <a class="mbbutton" onclick="NMMsg(this,'🧰')">🧰</a>
    */
    let mIcons = mMacro.list.replaceAll(" ","").split("|");
    mHTML = "";
    for(let i=0;i<mIcons.length;i++){
      mHTML += "<a class='mbbutton' onclick=\"" + mMacro.func + "(this,'" + mIcons[i] + "')\">" + mIcons[i] + "</a> ";
    }
    let elTemp = AddElement(el,"span",mHTML);
    return;
  }
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
        mHTML += "<a class='mbbutton' onclick='QueryMainCh("+ mCh +",this)' ";
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
        mHTML += "<div style='display:inline-block'><div style='margin-bottom: -38px;position:relative;'>👑</div><br>";
        mHTML += "<div class='mbav50t mb" + mMacro.top[0].name;
        mHTML += "'><br><div style='line-height:40px'>&nbsp;</div><b>"+mMacro.top[0].score+"</b></div>";
        mHTML += "</div>";
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
    mHTML = "<img src='" + mMacro.src+ "'";
    // 20240427: Skyle: Accepting a class parameter.
    if(NotBlank(mMacro.class)){
      mHTML += " class='"+ mMacro.class + "'";
    }
    // 20240427: Skyle
    if(NotBlank(mMacro.style)){
      mHTML += " style='"+ mMacro.style + "'";
    }
    if(IsBlank(mMacro.class) && IsBlank(mMacro.style)){
      // Do not use this default style if class or style is specified.
      mHTML += " style='border:0px;border-radius:10px'";
    }
    // 20240427: Skyle: Accepting a width parameter.
    if(NotBlank(mMacro.width)){
      mHTML += " width='"+ mMacro.width + "'";
    }
    mHTML += ">";
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
      case "SS": mScore += 600; break;
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
    mHTML = "<a onclick=\"" + InterLink() + "'" + mMacro.node+ "');return false;\" class=\"mbbuttonIn mbILB35 mbRankBlk" + mRank + "\" href=\"" + ViewerPath() + "?id=P"+  mMacro.node  +"\" title='Quests Completed: "+ mUpdates +"\nHighest Rank: "+mRank+"\nRemaining: "+mGuildLogCount+"'></a>";
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
      elTemp.innerHTML = "<a class='mbbutton' onclick=\"Music('"+mMacro.music+"')\" title=\"Play theme music\">🎧</a> ";
    }
    // 20231229: Patricia: Open Youtube link to music player.
    if(NotBlank(mMacro.yt)){
      var mURL = "https://www.youtube.com/watch?v=" + mMacro.yt + "&list=PL77IbAOrvAb9mGTlEOnDpCi4pVYngX0yx";
      elTemp.innerHTML += "<a class='mbbuttonEx' onclick=\"ExURL('"+ mURL + "');return false;\" href='" +mURL+"'>🎧</a> ";

    }
    // 20240330: StarTree: Node visit marking
    // STEP: if the main cookie is ON, show the current icon.
    // 20240331: StarTree: No need to show it here because it is shown in LnkCode.
    //if(NodeMarkCookieCheck()){ elTemp.innerHTML += NodeMarkCode(mNode); }    
    
    elTemp.innerHTML += NodeIDClipboardButtonCode(mNode) + "&nbsp;";
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
    //   When right-clicked, opens hyperlink manual to allow open in new tap or copy link
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
    /*if(mIcon.length>3){
      mIcon = "<div class='mbIcon i"+mIcon+"'></div>";
    }*/
    
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
      // 20240331: StarTree: To hide visit status at Quest Board.
      // 20240510: Skyle: Use the icon for icon field. 
      mIcon = LnkCode(mNode,"",mIcon,false);
      
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
      mHTML += "<div class='mbav50t mbIconShift mb" + mMacro.top[0].name;
      mHTML += "'>👑<br><br><br><br><br><b>"+mMacro.top[0].score+"</b></div>";
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
  if(mMacro.cmd=="slideidx"){ // DIV Slide Index Item
    // 20240303: StarTree: Added for search index for images hosted at github.
    /* Sample macro call:
         <macro>{"num","27","node":"202402292014","name":"OST","cmd":"pngidx"}</macro>
       Translates into:
         <div>
          <macro>{"cmd":"url","url":"https://github.com/MagicBakery/Images/blob/main/Slide_27.png?raw=true","desc":"27"}</macro> 
          <lnk>202402292014|🌳</lnk> Public Education / Open Skill Tree
         </div>
    //*/
    mHTML = MacroURLHTML("https://github.com/MagicBakery/Images/blob/main/Slide_" + mMacro.num + ".png?raw=true",mMacro.num) +" ";
    if(NotBlank(mMacro.node)){
      mHTML += "<lnk>" + mMacro.node + "|🥨</lnk>";
    }
    mHTML += mMacro.name;
    var elTemp = document.createElement("div");
    elTemp.innerHTML = mHTML;el.after(elTemp);return;
  }
  if(mMacro.cmd=="url"){ // SPAN
    /* <a class="mbbuttonEx" onclick="ExURL('https://www.youtube.com/watch?v=DS2sP8CDLas&list=PL77IbAOrvAb9mGTlEOnDpCi4pVYngX0yx')">あたしがとなりにイッル地に</a> */
    mHTML = MacroURLHTML(mMacro.url,mMacro.desc);
    AddElement(el,"span",mHTML);return;
  }
}
function MacroURLHTML(mURL,mDesc){
  return "<a class='mbbuttonEx' onclick=\"ExURL('"+ mURL + "');return false;\" href='"+mURL+"'><small>" + mDesc + "</small></a>";
}
function Music(eMusicID){  
  if(AtBlogSpot()){
    LoadDiv('MBBGM','https://panarcana.blogspot.com/p/music', eMusicID);
    return;
  }
  if(AtGitHub()){
    // 20231029: StarTree: Default to not loop.
    var mURL = MusicURL(eMusicID);
    // 20250113: StarTree: Change to get the last one.
    var mDivs = document.querySelectorAll('#MBBGM');
    //DEBUG(mDivs.length);
    var mDiv = mDivs[mDivs.length-1];
    //var mDiv = document.getElementById('MBBGM');    
    var mLoop = "";
    if(eMusicID.search("_Loop")>-1){
      mLoop = " loop";
    }
    mDiv.innerHTML = "<audio controls autoplay" + mLoop + "><source src='" + mURL + "' type='audio/mpeg'></audio>";
    return;
  }
}
function MusicEL(el,eMusicID){
  // 20250113: StarTree: To allow multiple music players.
  var mURL = MusicURL(eMusicID);
  var mLoop = "";
  if(eMusicID.search("_Loop")>-1){
    mLoop = " loop";
  }
  el.innerHTML = "<audio controls autoplay" + mLoop + "><source src='" + mURL + "' type='audio/mpeg'></audio>";
  return;
}
function MusicPP(el,eMusicID){
  MusicEL(el.parentNode.previousElementSibling,eMusicID);
}
function MusicURL(eMusicID){
  // 20231029: StarTree: Maps MusicID to URL.
  var mMusicID = eMusicID.replace("_Loop","");
  switch(mMusicID){
    case "ArcacianSky": return "https://github.com/MagicBakery/Music/blob/main/Arcacian%20Sky%20(20221001)%20Climax%20Reverb.mp3?raw=true";
    case "CookingWithArcacia": return "https://github.com/MagicBakery/Music/blob/fce1794cee034fe2535579ad4f18dd091bb613cf/Cooking%20with%20Arcacia%20(20220510).mp3?raw=true";
    case "EternalNight": return "https://github.com/MagicBakery/Music/blob/main/Eternal%20Night%20(20220713)%20Re.mp3?raw=true";
    case "FortArsenal": return "https://github.com/MagicBakery/Music/blob/main/Fort%20Arsenal%20(20220518)%20A%20major.mp3?raw=true";
    case "LastMasquerade": return "https://github.com/MagicBakery/Music/blob/main/Last%20Masquerade%20(20090818).mp3?raw=true";
    case "MagicBakery": return "https://github.com/MagicBakery/Music/blob/main/Magic%20Bakery%20Waltz%20(20200910).mp3?raw=true";
    case "MagicVacation": return "https://github.com/MagicBakery/Music/blob/main/Through%20the%20Magnite%20Cloud%20(20080210).mp3?raw=true";
    case "MagniteCloud": return "https://github.com/MagicBakery/Music/blob/main/Through%20the%20Magnite%20Cloud%20(20080210).mp3?raw=true";   
    case "NinjaDash": return "https://github.com/MagicBakery/Music/blob/main/Ninja%20Dash%20(20220616).MP3?raw=true";
    case "NinjaErrands": return "https://github.com/MagicBakery/Music/blob/main/Ninja%20Errands%20(20220314).MP3?raw=true";
    case "NorthShore": return "https://github.com/MagicBakery/Music/blob/4252f0c6593eed49df4af5595135611a8d75cf31/North%20Shore%2020220326-1938.mp3?raw=true";
    case "SoraArcacia": return "https://github.com/MagicBakery/Music/blob/main/Arcacian%20Sky%20(20221001)%20Climax%20Reverb.mp3?raw=true";
    case "StarryNight": return "https://github.com/MagicBakery/Music/blob/main/Starry%20Night%20(20220606).MP3?raw=true";
    case "Vacation": return "https://github.com/MagicBakery/Music/blob/main/Vacation%20(20220713).mp3?raw=true";
    case "Piano_C4": return "https://github.com/MagicBakery/Music/blob/main/Piano/C4.mp3?raw=true";
    case "Piano_C4s": return "https://github.com/MagicBakery/Music/blob/main/Piano/C4s.mp3?raw=true";
    case "Piano_D4": return "https://github.com/MagicBakery/Music/blob/main/Piano/D4.mp3?raw=true";
    case "Piano_D4s": return "https://github.com/MagicBakery/Music/blob/main/Piano/D4s.mp3?raw=true";
    case "Piano_E4": return "https://github.com/MagicBakery/Music/blob/main/Piano/E4.mp3?raw=true";
    case "Piano_F4": return "https://github.com/MagicBakery/Music/blob/main/Piano/F4.mp3?raw=true";
    case "Piano_F4s": return "https://github.com/MagicBakery/Music/blob/main/Piano/F4s.mp3?raw=true";
    case "Piano_G4": return "https://github.com/MagicBakery/Music/blob/main/Piano/G4.mp3?raw=true";
    case "Piano_G4s": return "https://github.com/MagicBakery/Music/blob/main/Piano/G4s.mp3?raw=true";
    case "Piano_A4": return "https://github.com/MagicBakery/Music/blob/main/Piano/A4.mp3?raw=true";
    case "Piano_A4s": return "https://github.com/MagicBakery/Music/blob/main/Piano/A4s.mp3?raw=true";
    case "Piano_B4": return "https://github.com/MagicBakery/Music/blob/main/Piano/B4.mp3?raw=true";
    case "Piano_C5": return "https://github.com/MagicBakery/Music/blob/main/Piano/C5.mp3?raw=true";
    
    default:
      return "https://github.com/MagicBakery/Music/blob/main/Magic%20Bakery%20Waltz%20(20200910).mp3?raw=true";

  }
}
function MusicNext(elTest,eMusicID){
  LoadDivNext(elTest,'../p/music',eMusicID);
}
function NodeTypeHTML(elRecord){
  // 20241005: StarTree: This function returns the html code.
  // 20240912: StarTree: If a node is a help node, show a handshake icon.
  var mIcon = "🥨";
  var mTitle = "Guild Node";
  if(elRecord.hasAttribute('data-festive')){
    mIcon = "🍰";
    mTitle = "Festive Node";
  } else if(elRecord.hasAttribute('data-help')){
    mIcon = "🤝";
    mTitle = "Help Node";    
  }else if(elRecord.hasAttribute('data-subject')){
    mIcon = "🎓";
    mTitle = "Academic Node";   
  }else if(elRecord.hasAttribute('data-case')){
    mIcon = "📂";
    mTitle = "Case Node";
  }

  return "<span class='mbbutton mbRef'><lnk title='"+ mTitle +"'>202409271001|"+ mIcon +"</lnk>&nbsp;</span>"

}
function NotBlank(e){
  // 20230310: Fina
  return (!IsBlank(e));
}

function PNDInner(el,mJSON){
  // 20230621: StarTree
  //If the node type is not chat, return.
  // 20240404: StarTree: A new type of chat node has data-chat attribute.

  if(mJSON.type != "chat"){return;}  
  
  // If the node type is chat:

  // STEP: Create the header block
  // 20231227: StarTree: Change the the simpler LNK code

  mHTML = "<lnk>"+mJSON.parentid+"|"+mJSON.parentname+"</lnk>";

  mHTML +="<div style=\"float:right\"><small>["+mJSON.id+"]</small></div>";
  mHTML +="<hr class=\"mbCB mbhr\"><div class=\"mbpc\">";
  // 20231105: Arcacia: Use lnk for GitHub.
  // Before:
  //   mHTML += "<a class=\"mbbuttonIn\" href=\"" + ViewerPath() + "?id=P"+mJSON.id+"\"><b>"+mJSON.title+"</b></a></div>";
  // After:
  mHTML +="<lnk>" + mJSON.id + "|" + mJSON.title + "</lnk>";
  
  mHTML +="<center><small>";
  if(NotBlank(mJSON.prev)){
    mHTML +="<a class=\"mbbutton\" style=\"float:left\" href=\"" + ViewerPath() + "?id=P"+mJSON.prev+"\" onclick=\"BoardLoad(this,'"+ mJSON.prev+"');return false;\"><small>◀</small></a>";
  }
  if(NotBlank(mJSON.next)){
    mHTML +="<a class=\"mbbutton\" style=\"float:right\" href=\"" + ViewerPath() + "?id=P"+mJSON.next+"\" onclick=\"BoardLoad(this,'"+ mJSON.next+"');return false;\"><small>▶</small></a>";
  }
  // Read the date and time from the node id
  mHTML += DateStrFromID(mJSON.id)+ "<br>";
  mHTML += mJSON.location + "</small></center><hr class=\"mbhr\">";

  AddElementFC(el.parentNode.firstElementChild.nextElementSibling.nextElementSibling,"div",mHTML);

  // Create the discussion link at the end. (node data is assumed to be at the end)
  mHTML = "<hr class='mbCB'><button class='mbbutton' onclick=\"QueryAllNext(this,'";
  mHTML += "[data-" + mJSON.id + "]')\">💬 Discussions</button><hide></hide>";
  AddElement(el.previousElementSibling.lastElementChild,"div",mHTML);

  // 20240403: StarTree: Delete the node
  el.remove();

}
function ProcessNodeData(elScope){
  // 20230621: StarTree: Adding first for chat post.
  // A node is supposed to have only one <node> data, but this function could be called from a scope that has a list of nodes.
  var z = elScope.getElementsByTagName("node");
  var hit = z.length;
  if(hit<=0){return;}
  var i;
  for (i=0;i<hit;i++){
    try{
      PNDInner(z[i],JSON.parse(z[i].innerHTML));  
    }catch(error){
      DEBUG("ProcessNodeData: PNDInner: " + z[i]);
    }
    
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
  try{
    if(iAttribute==undefined || iAttribute==""){iAttribute="top";}
    var elTarget = el;
    while(elTarget != null && elTarget.getAttribute(iAttribute)==null){
      elTarget = elTarget.parentNode;
    }
    return elTarget;
  }catch(error){
    return "";
  }
}
function SearchRecount(el){
  // 20241005: StarTree: Recount and display the number of visible topics in the search result list.
  //el.innerHTML = "[###]";
  var elControl = SearchPS(el,"control");
  var elListArea = elControl.nextElementSibling;
  var elCount = elControl.querySelector("[count]");
  if(IsBlank(elCount)){return;}
  elCount.innerHTML = "[None]";
  var elTopics = elListArea.querySelectorAll("[topic]");
  var mCount = 0;
  elTopics.forEach((mTopic)=>{
    if(mTopic.parentNode==elListArea && !mTopic.classList.contains("mbhide") && mTopic.style.display!="none"){
      mCount++;
      elCount.innerHTML = "["+mCount+"]";
    }
  });
  /*
  DEBUG(mCount);
  DEBUG(elCount.innerHTML);
  if(NotBlank(elCount)){
    elCount.innerHTML = "["+mCount+"]";
  DEBUG("SDS");
  }*/
  
}
function SearchWrapper(elScope,iInner,bShow,mCount){
  // 20240722: StarTree: Wraps the Inner content with a search frame.
  var mHideClass = "";
  if(!bShow){
    mHideClass = " class=\"mbhide\"";
  }
  var mHTML = "<div banner"+ mHideClass +" style=\"margin-bottom:5px\"><div control>" + 
  "<input type=\"text\" onclick=\"TextSearchPN(this)\" onkeyup=\"TextSearchPN(this)\" placeholder=\"Search...\" title=\"Input a keyword\" style=\"width:100px\"> " + 
  "<span>" + 
  "<a class=\"mbbutton\" style=\"float:right\" onclick=\"QSLSortRandom(this)\">🎲</a>" + 
  "<a class=\"mbbutton\" style=\"float:right\" onclick=\"ToggleHeight(this)\" title=\"Toggle full height\">🥞</a>" + 
  "<a class=\"mbbutton\" onclick=\"QSLSortByName(this)\">🍎</a> " +
  "<a class=\"mbbutton\" onclick=\"QSLSortByIcon(this,'📌')\">📌</a> " +
  "<a class=\"mbbutton\" onclick=\"QSLSortBy(this,'star')\" title=\"Star Rating\">⭐</a> " +
  "<a class=\"mbbutton\" onclick=\"QSLSortByUpdate(this)\" title=\"Sort by last update\">🔔</a> "  + 
  "<a class=\"mbbutton\" onclick=\"QSLSortByDate(this)\" title=\"Sort by entry date\">🕰️</a> ";
 

  // 20240720: StarTree: If there is a search section, add it here.
  try{
    var elSearch = elScope.querySelector('Search');
    mHTML += elSearch.innerHTML;
  }catch(error){          
  }

  // 20240722: StarTree: Closing the search control section.
  mHTML +=  "<a class=\"mbbutton\" count onclick=\"SearchRecount(this)\" style=\"float:right;font-weight:bold;font-size:14px\" title=\"Count\">[" + mCount + "]</a>" +
          "</span>" + 
          "<div class=\"mbpuzzle mbhide\"></div>" + "<div class=\"mbCB\"></div>" +
        "</div>";
  // Starting the container for the RES content
  mHTML += "<div class=\"mbSearch mbStack\" style=\"resize:vertical; max-height:263px;overflow-y:auto;padding:5px 2px;display:flex;flex-direction: column;gap:10px;\">";
  mHTML += iInner;
  mHTML += "</div></div>";
  return mHTML;
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
function SPKAvatar(el){
  // 20240803: StarTree: Returns the first person in SPK as the avatar speaker.
  // .. Needs to handle two formats of SPK:
  // .. 1) SPK="StarTree"
  // .. 2) SPK="|StarTree|Tanya|"
  
  var mSPK = el.getAttribute("SPK");
  if(IsBlank(mSPK)){return "";}
  var mSPKs = mSPK.split("|");
  if(mSPKs.length==1){return mSPK;} // Case 1
  return mSPKs[1];
}
function SPKPlus(el){
  // 20240803: StarTree: Returns a mark string to indicate that the entry EXP applies to multiple persons.
  var mSPK = el.getAttribute('SPK');
  if(IsBlank(mSPK)){return ""}
  var mSPKs = mSPK.split("|");
  if(mSPKs.length<=2){return ""}
  return " <small><b>" + String(mSPKs.length-2)+"</b></small> ";
}
function SPKMultiStr(el){
  // 20240803: StarTree: Returns a string listing the SPK if it contains multiple.
  var mSPK = el.getAttribute("SPK");
  if(IsBlank(mSPK)){return ":"}
  var mSPKs = mSPK.split("|");
  if(mSPKs.length<=2){return ":"}
  var mHTML="";
  mHTML = mSPK.replace("|"+mSPKs[1]+"|","");
  mHTML = mHTML.slice(0,mHTML.length-1).replaceAll("|",", ");

  // Kudo Format: 
  if(el.getAttribute("icon")=="💟"){
    mHTML = "<b> thanks " + mHTML + ":</b>";
  }else{
    // Generic Format:
    mHTML = "<b> with " + mHTML + ":</b>";
  }
  return mHTML;  
}
function StarPattern(iCode1,iCode2){
  // 20250118: StarTree: Return the Magic Bakery HTML code for the graphics of a star code.
  
  // If Code 1 is not provided, just return.
  if(IsBlank(iCode1)){return "";}

  // If only Code 1 is provided, interpret it as the combined code and decompose it.
  var bFilledLast = true;
  if(IsBlank(iCode2)){
    bFilledLast = false;
    iCode2 = iCode1 %10;
    iCode1 = Math.floor(iCode1/10);
  }

  var mNumEmptyStar = iCode1 - iCode2;
  var mNumFilledStar = iCode1 - mNumEmptyStar;
  var mEmptyStar = ":StarEmpty:";
  var mFilledStar = "⭐";
  var mStarPattern = mFilledStar.repeat(mNumFilledStar);
  if(bFilledLast){
    mStarPattern = mEmptyStar.repeat(mNumEmptyStar) + mStarPattern;
  }else{
    mStarPattern += mEmptyStar.repeat(mNumEmptyStar);
  }
  mStarPattern = MacroIcons(null,mStarPattern);
  return mStarPattern;
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
  if(eTar.classList.contains('mbhide')){
    eTar.classList.remove('mbhide');
  }else{
    eTar.classList.add("mbhide");
  }
  /*if (eTar.style.display != "none") {
    eTar.style.display = "none";
  } else {
    eTar.style.display = "";
  }*/
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
	//elThis.parentNode.style.display = "none";
  elThis.parentNode.classList.add("mbhide");
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
      NodeFormatter(elContainer);
      Macro(elContainer);
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
function YouTubeDecode(iText){
  // 20250118: StarTree: Refactored.
  // Parse a url for the video code
  // Example URL: https://www.youtube.com/watch?v=Xo1g5HWgaRA&list=PL77IbAOrvAb9mGTlEOnDpCi4pVYngX0yx&index=136
  iText = TextBetween(iText,"watch?v=","&list=");
  // 20240906: StarTree: Make it work for this also:
  // https://youtu.be/D4OAx2ALK34?si=1eb8Mmnd-BO4Zs9T
  iText = TextBetween(iText,"https://youtu.be/","?si=");
  return iText
}
function YoutubeEL(el,iLink,iPlaylist){
  // 20230305: StarTree: Added
  // 20231029: StarTree: Split for YouTubePNC

  // 20240905: StarTree: If both iLink and iPlaylist are blank, assume that the link is in the clipboard.
  if(IsBlank(iLink) && IsBlank(iPlaylist)){
    navigator.clipboard.readText().then((mCBText)=>{
      // Parse a url for the video code
      mCBText = YouTubeDecode(mCBText);

      // 20250113: StarTree: Compare the link with what is saved. If they are the same and the element is shown, just hide the element.
      var mCBTextCur = el.getAttribute("mTestString");
      if(mCBTextCur == mCBText && !(el.classList.contains("mbhide"))){
        ToggleHide(el);
        el.setAttribute('mTestString',"");
        return;
      }
      // 20250113: StarTree: Save the link.
      el.setAttribute('mTestString',mCBText);
      return YoutubeEL(el,mCBText);      
    });
  }

  var elTarget = el;


  if(elTarget.getAttribute("mQueryString") == iLink || elTarget.getAttribute("mQueryString") == iPlaylist){
    // 20250113: StarTree: Just Toggle.
    //if(NotBlank(elTarget.innerHTML) && IsBlank(iPlaylist)){ // 20240905: StarTree: Playlist may not have iLink content.
    if(NotBlank(elTarget.innerHTML)){
      //elTarget.innerHTML="";
      //elTarget.setAttribute("mQueryString","");
      //elTarget.classList.add("mbhide");
      // 20250113: StarTree: Just toggle the visibility. 
      ToggleHide(elTarget);
      return;
    }
  }
  var mHTML = "";
  //mHTML = "https://www.youtube.com/embed/" + iLink + "?version=3&loop=1&autoplay=1&list=PL77IbAOrvAb9mGTlEOnDpCi4pVYngX0yx";
  // 20231008: Mikela: Don't include the list

  // 20240904: StarTree: If a playlist is specified:
  if(NotBlank(iPlaylist)){
    /*mHTML= "https://www.youtube.com/playlist?list=" + iPlaylist;
    el.setAttribute("href",mHTML);*/    
    //mHTML = "https://www.youtube.com/embed/videoseries?si=m0csnEsQRdzeZSQ1&amp;list=" + iPlaylist;
    mHTML = "https://www.youtube.com/embed/videoseries?list=" + iPlaylist;    
  }else{
    mHTML = "https://www.youtube.com/embed/" + iLink + "?rel=0?version=3&autoplay=1&loop=1";

  }
  mHTML = "src='" + mHTML +"' ";

  // 20250118: StarTree: Get the width of the div.
  let mDivWidth = parseInt(window.getComputedStyle(el).width.replaceAll("px",""));
  let mDivHeight = Math.floor(mDivWidth * 9 / 16);
  mHTML += "width='100%' height='"+mDivHeight+"px' frameborder='0' allow='accelerometer;clipboard-write;encrypted-media;gyroscope;picture-in-picture' allowfullscreen";

  //mHTML += "width='100%' height='200px' frameborder='0' allow='accelerometer;clipboard-write;encrypted-media;gyroscope;picture-in-picture' allowfullscreen";
  mHTML = "<iframe " + mHTML + "></iframe>";
  mHTML = "<center>" + mHTML + "</center>";
  elTarget.innerHTML = mHTML;
  if(IsBlank(iLink)){
    elTarget.setAttribute("mQueryString",iPlaylist);  
  }else{
    elTarget.setAttribute("mQueryString",iLink);
  }

  elTarget.classList.remove("mbhide");
  /*<center>
    <iframe width="100%" src="https://www.youtube.com/embed/FUH9S44D1BM?version=3&loop=1&autoplay=1&list=PL77IbAOrvAb9mGTlEOnDpCi4pVYngX0yx" title="YouTube video player" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </center>*/
}
function YoutubeMBBGM(iLink){
  // 20231229: Patricia: Added for playing youtube
  var el = document.getElementById('MBBGM');
  YoutubeEL(el,iLink)
}
function YoutubePN(el,iLink){
  // 20230305: StarTree: Added for displaying Japanese lyrics
  YoutubeEL(el.parentNode.nextElementSibling,iLink)
}
function YoutubePNC(el,iLink){
  // 20231029: For GitHub Control
  YoutubeEL(SearchPS(el,"Control").nextElementSibling,iLink)
}
function YoutubePPC(el,iLink,iPlaylist){
  // 20231029: For GitHub Control
  YoutubeEL(SearchPS(el,"Control").previousElementSibling,iLink,iPlaylist)
}
function YoutubePrev(el,iLink,iPlaylist){
  // 20250113: StarTree: For separate viewers.
  YoutubeEL(el.previousElementSibling,iLink,iPlaylist)
}
function YoutubeSpawnELBefore(el,iTitle,iLink,iPlaylist){
  // 20250118: StarTree: Spawns a Youtube frame before the el (Refactored from YoutubeSpawnPC).
  var elTemp = document.createElement("span");
  var mHTML = "<span control style='text-align:left;font-size:14px;word-wrap:break-word;'>";
  
  //var mHTML = "<span control class='mbCharCardSubtitle'>";
  

  //mHTML += "<span class='mbRef'><a class='mbbutton' onClick='Remove(this,\"viewer\")' style='float:right' title='Close'>:Close:</a></span>";
  mHTML += "[ <a class='mbbutton' style='white-space: normal' onClick='ToggleHidePN(this)' title='Show/Hide'>" + iTitle + "</a> ";
  mHTML += "<a class='mbbutton' onClick='Remove(this,\"viewer\")'  title='Close'>:Close:</a> ]";
  mHTML += "</span><div></div>";
  elTemp.innerHTML= MacroIcons(null,mHTML);
  elTemp.style.textAlign = "Left";
  elTemp.setAttribute('viewer','');
  el.before(elTemp);

  YoutubeEL(elTemp.firstElementChild.nextElementSibling,iLink,iPlaylist);
}
function YoutubeSpawnFP(el,iTitle,iLink,iPlaylist){
  // 20250118: StarTree: If the music player FP is found, spawn there. Otherwise, spawn before the control div.
  var elFP = document.querySelector("[fp='20240904213516']");  
  if(IsBlank(elFP) || !IsDisplayed(elFP)){ // If not found, just spawn before the control div.
    YoutubeSpawnPC(el,iTitle,iLink,iPlaylist);
    return;
  }
  // If found, index to the control frame in the FP
  YoutubeSpawnPC(elFP.lastElementChild,iTitle,iLink,iPlaylist);
}
function YoutubeSpawnPC(el,iTitle,iLink,iPlaylist){
  // 20250113: StarTree: Spawns a Youtube frame before the Control div.
  var elControl = SearchPS(el,"Control");
  if(NotBlank(elControl)){YoutubeSpawnELBefore(elControl,iTitle,iLink,iPlaylist);return;}
  
  // Next try to spawn it just before the card mat if it is in a sidepanel.
  elControl = SearchPS(el,"sidepanel");
  if(NotBlank(elControl)){elControl = SearchPS(el,"cardmat");}
  if(NotBlank(elControl)){YoutubeSpawnELBefore(elControl,iTitle,iLink,iPlaylist);return;}
  
  // If no frame is found, just spawn before the current element.
  YoutubeSpawnELBefore(el,iTitle,iLink,iPlaylist);  
}
function Remove(el,iScope){
  // 20250113: StarTree
  var mDiv = SearchPS(el,iScope);  
  mDiv.remove();
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
    /*@@P4*/var nextState = {"html":prevHTML};
    /*@@P4*/window.history.replaceState(nextState, '', window.location.href);
    /*@@P4*/window.onpopstate = (event) => {
    /*@@P4*/  if(event.state && event.state.html.length > 0){
    /*@@P4*/    document.getElementById("MBJQSW").innerHTML = event.state.html;
        
     /*@@P4*/ }
    /*@@P4*/};

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
          /*@@P4*/window.history.replaceState({"html": mHTML}, '', "" + ViewerPath() + "?id=P" + eQuery);
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
function DTSPadding(mDTS){
  // 20240414: StarTree: Pads the number with trailing zeroes as needed.
  // The DTS format number has 14 digits YYYYMMDDhhmmss
  var mStr = mDTS.toString();
  var mPow = 14 - mStr.length;
  mPow = Math.max(0,mPow);
  mStr += "0".repeat(mPow);
  return parseInt(mStr);
}
function DTSGetLatest(el){
  // 20240414: StarTree: Return the latest DTS within the element.
  var mElements = el.querySelectorAll('[date],[dts]');
  var mDTS = DTSGet(el);
  
  for(let i=0;i<mElements.length;i++){
    let mElDTS = DTSGet(mElements[i]);
    if(mDTS < mElDTS){
      mDTS = mElDTS;
    }
  }
  return mDTS;
}
function DTSGet(el){
  // 20240414: StarTree: Returns a DTS format number of YYYYMMDDhhmmss from the element attributes
  

  // RULE: If the element has a DTS value, then use the DTS value
  var mDTS = el.getAttribute('dts');
  if(NotBlank(mDTS)){
    return DTSPadding(mDTS);
  }
  
  // RULE: Next, use the Date and Time values if they exist.
  var mDate = Default(el.getAttribute('date'),0);
  if(mDate != 0){
    var mTime = Default(el.getAttribute('time'),0);
    return parseInt(mDate) * 1000000 + parseInt(mTime*100);
  }
  /*
  // RULE: Return the number portion of the ID if it is the traditional 13 letter string 
  var mID = Default(el.id,"0");
  if(mID != 0){
    return parseInt(mID.replace("P",""));
  }*/
  return 0;
}
function QSLEL(elSearchList,iQuery,elArchives,bOffline){
  elSearchList.previousElementSibling.innerHTML = "<small>Loading " + iQuery + "... </small>" + WaitIcon();
  elSearchList.innerHTML="";
  
  
  $(document).ready(function(){
    if(IsBlank(elArchives)){
      // 20240510: Skyle: If this function was called with blank elArchives argument this is called for the first time for the query.
      elArchives=Offline();
      if(NotBlank(elArchives)){bOffline = true;}
    }
    if(IsBlank(elArchives)){
      elArchives = document.querySelector('archives');
      var mHit = 0; // Archive Hit Counter
      for(let i=ArchiveNum(); i>0;i--){  
        let elArchive = elArchives.querySelector('archive'+i);
        $(elArchive).load(ArchiveIndex(i) + iQuery, function(){
          mHit++;
          if(mHit >= ArchiveNum()){
            QSLEL(elSearchList,iQuery,elArchives,bOffline);
            return;
          }
        });
      }
      return;
    }
    // STEP: The archive argument is not blank. Just get the data from the archive.
    // 20240510: Skyle: The data in the archive may not be complete.
    //var elRecords = elArchives.querySelectorAll(iQuery);
    //var elRecords = $(elArchives, "archives >" + iQuery);
    //var elRecords = $("html > archives > [archive] > " + iQuery);
    var elRecords = $(elArchives).find(iQuery);
    //var elRecords = $(iQuery);
    // Loop through and add each child.

    QSLContentCompose(bOffline,elRecords,elSearchList);
  });//END Document Ready
}
function TitleToTag(mTitle){
  // 20240331: StarTree Turns a node title to a data tag.
  mTitle = mTitle.replace(/[\W_]+/g,"");
  //mTitle = mTitle.replaceAll(" ","");
  //mTitle = mTitle.replaceAll("'","");
  return "data-" + mTitle.toLowerCase();
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
function RND_QSCardCode(el,bShowIcon){
  // 20250104: Tanya: Give a random QS card code with replenish
  var elResultSpace = SearchPS(el,"control").nextElementSibling;
  var mArchetype = Math.ceil(Math.random()*6)-1;
  var mCode1 = Math.ceil(Math.random()*5);
  
  var mCode2 = Math.ceil(Math.random()*mCode1);
  var aArchetypes = ["P","C","H","A","O","M"];
  var aArchetypeIcons = [":Paladin:","❤️","📯","🍀","🔮","🎩"];
  var mResult = aArchetypes[mArchetype] + mCode1.toString() + mCode2.toString();
  if(!bShowIcon){
    if(NotBlank(elResultSpace.innerHTML)){elResultSpace.innerHTML += " "}
    elResultSpace.innerHTML += mResult;
  }else{
    //var mNumEmptyStar = mCode1 - mCode2;
    //var mNumStar = mCode1 - mNumEmptyStar;
    //var mEmptyStar = ":StarEmpty:";
    //var mStar = "⭐";
    //var mResultIcon = aArchetypeIcons[mArchetype] + mEmptyStar.repeat(mNumEmptyStar) + mStar.repeat(mNumStar);
    var mResultIcon = aArchetypeIcons[mArchetype] + StarPattern(mCode1, mCode2);
    mResultIcon = MacroIcons(null,mResultIcon);
    if(NotBlank(elResultSpace.innerHTML)){elResultSpace.innerHTML += "<br>"}
    elResultSpace.innerHTML += "<span class='mbILB40' style='text-align:left'>" + mResult + "</span>";
    elResultSpace.innerHTML += mResultIcon;
  }
  

}
function RND_Reset(el){
  // 20230716: StarTree: For gaming
  var elResultSpace = SearchPS(el,"control").nextElementSibling;
  elResultSpace.innerHTML = "";
}
function ScrollIntoView(el){
  // 20231118: StarTree: Trying to fix the scrolling issue on phones
  // el is the board. But before scrolling the board into view, first scroll the panel into view.
  var mPanel = SearchPS(el,"panel");
  try{
    mPanel.style.scrollMarginTop = "100px";
    mPanel.scrollIntoView(true);
    
    //mPanel.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
  
    //el.style.scrollMargin = "10px";
    el.scrollIntoView(true);
    //el.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
  }catch(error){}
}

function QSL(el,iQuery,iMonthly){
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
  // 20240507: Natalie: Adding an argument to specify the context for querying monthly quests.
  
  if(NotBlank(iMonthly)){
    iMonthly = iMonthly.toLowerCase();
    let mYYYYMM = DTSNow().slice(0,6);
    switch(iMonthly){
      //case "monthly": iQuery += ":has([monthly])"; break;
      //case "done": iQuery += ":has([monthly]:has([dts^='"+mYYYYMM+"']))"; break;
      case "done": iQuery += ":has(msg[dts^='"+mYYYYMM+"']:not([icon='📌']))"; break;
      //case "todo": iQuery += ":has([monthly]:not(:has([dts^='"+mYYYYMM+"'])))"; break;
      case "todo": iQuery += ":not(:has(msg[dts^='"+mYYYYMM+"']:not([icon='📌'])))"; break;
    }
  }

  var elSearchList = SearchPS(el,"control").nextElementSibling.lastElementChild;
  elSearchList.parentNode.classList.remove('mbhide');
  QSLEL(elSearchList,iQuery);  
}
function QSLThisMonth(el,iQuery){
  // 20240507: Natalie: This version of QSL only return
}
function QSLShowTag(elList,iTag){
  // 20241006: Mikela: Show the tag for the end text. If iTag is not specified, show the first tag.  
  var elItems = elList.querySelectorAll("[topic]");
  
  
  if(NotBlank(iTag)){
    iTag = MacroIcons(null,iTag); 
  }
  elItems.forEach((item)=>{
    if(item.parentNode != elList){return;}
    let mFirstTag = "";

    var elTags= item.querySelector("[tags]");
    if(IsBlank(elTags)){return;}
    var mTags = elTags.innerHTML;    
    var mTagsPlus = "+"+iTag+"+";
    mFirstTag = mTags.split("+")[1].replaceAll("_"," ");  

    
    if(IsBlank(iTag)){
      item.firstElementChild.innerHTML = mFirstTag;
    }else if(mTagsPlus.search("+"+iTag+"+")>-1){
      item.firstElementChild.innerHTML = iTag;
    }
  });

}
function QSLSortBy(el,iAttribute){
  // 20240413: StarTree: This sort function assumes that the attribute is already set.
  // 20240420: StarTree: If the sort type had just change into this type, just show the stats without sorting.
  var elContainer = QSLGetContainer(el);
  var bReversed = QSLSortReverseIfSet(elContainer,iAttribute);
  var elEntries = elContainer.querySelectorAll(".mbSearch > div[name]");
  elEntries.forEach((item)=>{
    // 20250118: StarTree: Show Star Pattern if the attribute is star.
    let mSortValue = item.getAttribute(iAttribute);
    if(iAttribute.toLowerCase() == "star"){
      // Don't auto link to description just yet, because different nodes might have different definition for its star ratings. 
      //item.firstElementChild.innerHTML = LnkCode("202501020158",StarPattern(mSortValue));
      item.firstElementChild.innerHTML = StarPattern(mSortValue);
    }else{
      item.firstElementChild.innerHTML = mSortValue
    }
    
    if(bReversed){
       item.style.order = mSortValue;
    }    
  });
  elContainer.scrollTop = -elContainer.scrollHeight;
}
function QSLSortByDate(el){
  // 20241013: StarTree: This function sort the entries in a QSL by its event date stored as "date".
  // .. In the Res data, this is the "date" attribute value.
  var elContainer = QSLGetContainer(el);
  if(IsBlank(elContainer)){return;}
  var bReversed = QSLSortReverseIfSet(elContainer,'date');
  var elEntries = elContainer.querySelectorAll(".mbSearch > div[date]");
  elEntries.forEach((item)=>{
    let mDate = item.getAttribute('date');
    item.firstElementChild.innerHTML = mDate;
    item.style.order = mDate;
    // 20241014: StarTree: Hide the entry if the value is 99999999.
    if(mDate == "99999999"){
      item.classList.add("mbhide");
    }
  });
  elContainer.scrollTop = -elContainer.scrollHeight;
  SearchRecount(el);
}
function QSLSortByUpdate(el){
  // 20240407: Ledia: This function sort the entries in a QSL by date.
  // .. To get the last updated date, it checks the attribute "updated" if it exists.
  // .. If not, it uses the node ID as the date.
  var elContainer = QSLGetContainer(el);
  if(IsBlank(elContainer)){return;}
  var bReversed = QSLSortReverseIfSet(elContainer,'update');
  var elEntries = elContainer.querySelectorAll(".mbSearch > div[update]");
  elEntries.forEach((item)=>{
    let mDate = item.getAttribute('update');
    item.firstElementChild.innerHTML = mDate;
    item.style.order = mDate;
  });
  elContainer.scrollTop = -elContainer.scrollHeight;
  SearchRecount(el);
}
function QSLSortByIcon(el,iIcon){
  // 20240608: Patricia: Counts the icons within the item and sort by that number.
  // If the sort type had just change into this type, just show the stats without sorting.
  var elContainer = QSLGetContainer(el);
  var bReversed = QSLSortReverseIfSet(elContainer,iIcon);
  var elEntries = elContainer.querySelectorAll(".mbSearch > div[name]");
  let mTotalCount = 0;
  elEntries.forEach((item)=>{
    // STEP: Count the number of such icon in the item.
    // 20240802: Arcacia: First check if there is any "icon" attribute, if not, just match the icon.
    let mCount  = 0;
    let mMarkCount = 0;
    
    mCount = item.querySelectorAll("[icon]").length;
    if(mCount>0){
      mCount = item.querySelectorAll("[icon=\""+iIcon+"\"]").length;
    }
    if(mCount==0){
      // 20240823: Black: Need to subtract the result icon.
      mCount = item.innerHTML.split(">"+iIcon+"<").length-1;
      mMarkCount = item.firstElementChild.innerHTML.split(">"+iIcon+"<").length-1;
      mCount = mCount -mMarkCount;
    }    
    item.firstElementChild.setAttribute("count",mCount);
    mTotalCount += mCount;
    item.firstElementChild.innerHTML = iIcon + "<b>" + mCount + "</b>";

    
    MacroIcons(item.firstElementChild);
    if(bReversed){
       item.style.order = item.firstElementChild.getAttribute("count");
    }
    // Auto Hide those that don't have the icon
    if(mCount==0){
      item.classList.add("mbhide");
    }else{
      item.classList.remove("mbhide");
    }
    SearchRecount(el);
  });
  elContainer.scrollTop = -elContainer.scrollHeight;
  var elControlText = SearchPS(el,"control").firstElementChild;
  elControlText.innerHTML = "<small><b>Found " + mTotalCount + "</b></small><div  style='display:inline-block;font-size:12px;vertical-align:-0.25em'>" + MacroIcons(null,iIcon) + "</div>"

}
function QSLSortByName(el){
  // 20240407: Ledia: This function sort the entries recursivly in a QSL by name.
  var elContainer = QSLGetContainer(el);
  let bReversed = QSLSortReverseIfSet(elContainer,'name');
  var elEntries = elContainer.querySelectorAll(".mbSearch > div[name]");
  // STEP: Create an array of pairs to for the name and address.
  var mKV = [];
  elEntries.forEach((item)=>{
    // 20240622: Arcacia: Made the sort order more intuitive by using lower case and adding a space in the end.
    mKV.push([item.getAttribute('name').toLowerCase()+" ",item]);
  });
  mKV.sort();
  for(i=0;i<mKV.length;i++){
    mKV[i][1].style.order = i;
  }
  elContainer.scrollTop = -elContainer.scrollHeight;
  
}
function QSLSortReverseIfSet(elContainer,iSortBy){
  // 20240408: Ledia: Set the sortby attribute.
  // .. If the attribute is different, set the attribute and return false.
  // .. If the attribute is the same, reverse the order and return true.
  if(elContainer.getAttribute('sortby')==iSortBy){
    if(elContainer.style.flexDirection == 'column'){
      elContainer.style.flexDirection = 'column-reverse';
      elContainer.querySelectorAll(".mbSearch").forEach((item2)=>{
        item2.style.flexDirection = 'column-reverse';
      });
    }else{
      elContainer.style.flexDirection = 'column';
      elContainer.querySelectorAll(".mbSearch").forEach((item2)=>{
        item2.style.flexDirection = 'column';
      });  
    }
  }else{
    elContainer.setAttribute('sortby',iSortBy);
    //elContainer.style.flexDirection = 'column';
    return false;
  }
  return true;
}
function QSLSortRandom(el){
  // 20240407: Ledia: This function sorts the entries in a QSL randomly.
  // STEP: Locate the container:
  var elContainer = QSLGetContainer(el);
  elContainer.setAttribute('sortby','random');
  elContainer.style.flexDirection = 'column';
  // STEP: For each Div in elContainer that has a name and with a parent node that has mbSearch class, assign a random order number.
  // https://www.w3schools.com/jquery/jquery_ref_selectors.asp
  var elEntries = elContainer.querySelectorAll(".mbSearch > div[name]");
  for(let i=0;i<elEntries.length;i++){
    let mRand = getRandomInt(1,Math.max(99,elEntries.length+10));
    elEntries[i].style.order = mRand;
    elEntries[i].firstElementChild.innerHTML = MacroIcons("","🎲") +"<b>" + mRand +"</b>";
  }
  elContainer.scrollTop = -elContainer.scrollHeight;
}
function QSLGetContainer(el){
  // 20240407: Ledia: Return the QSL container that has the mbSearch class.
  var elControl = SearchPS(el,'control');
  if(IsBlank(elControl)){return;}
  var elControlNext = elControl.nextElementSibling;
  if(elControlNext.classList.contains('mbSearch')){
    return elControlNext;}

  return elControlNext.querySelector(".mbSearch");
}

function QSLBL(el,iQuery){
  // 20240404: StarTree For automatically showing tags of a node.
  var elContainer = SearchPS(el,"board").querySelector('[qsl][bl]');
  elContainer.parentNode.classList.remove('mbhide');
  QSLEL(elContainer,iQuery);  
}
function Cap(mStr){
  // 20240407: Skyle: Updated to avoid function name conflict and capitalizes every word.
  try{
    var mCapNext = true;
    var rStr = "";    
    for(i=0;i<mStr.length;i++){
      if(mCapNext){
        rStr += mStr.charAt(i).toUpperCase();
        mCapNext = false;
      }else{
        rStr += mStr.charAt(i);
      }
      if(mStr.charAt(i)==" "){
        mCapNext = true;
      }
    }
    return rStr;
  }catch(error){
    return mStr;
  }
}
function QSLRollingKudo(el,mDate){
  // 20240804: Skyle: Query for the rolling kudos diary.
  var elSearchList = SearchPS(el,"control").nextElementSibling.lastElementChild;
  elSearchList.parentNode.classList.remove('mbhide');
  QSLRollingKudoEL(elSearchList,mDate);
}
function QSLRollingKudoEL(elSearchList,mDate,elArchives,bOffline){
  // 20240804: Skyle: Query for the rolling kudos diary.
  // .. First query all entries with date or dts with the mDate substring, 
  // .. then check for correcty matches.
  
  var iQuery = "[date*='"+mDate+"'][data-happy],[id][date][time]:has([dts*='"+mDate+"'][icon='💟'],[dts*='"+mDate+"'][icon='💗'],mbkudo[dts*='"+mDate+"'])";
  var iQuery2 = "[date*='"+mDate+"'][data-happy],[dts*='"+mDate+"'][icon='💟'],[dts*='"+mDate+"'][icon='💗'],mbkudo[dts*='"+mDate+"']";

  elSearchList.previousElementSibling.innerHTML = "<small>Loading " + iQuery + "... </small>" + WaitIcon();
  elSearchList.innerHTML="";


  $(document).ready(function(){
    // STEP: Initialization
    if(IsBlank(elArchives)){  // This function is newly called.
      elArchives = Offline();
      if(NotBlank(elArchives)){bOffline = true;}
    }
    if(IsBlank(elArchives)){
      elArchives = document.querySelector('archives');
      var mHit = 0; // Archive Hit Counter
      for(let i=ArchiveNum(); i>0;i--){  
        let elArchive = elArchives.querySelector('archive'+i);
        $(elArchive).load(ArchiveIndex(i) + iQuery, function(){
          mHit++;
          if(mHit >= ArchiveNum()){
            QSLRollingKudoEL(elSearchList,mDate,elArchives,bOffline);
            return;
          }
        });
      }
      return;
    }
    // STEP: Process the content in the cached archives.
    var elRecords = $(elArchives).find(iQuery2);
    QSLContentCompose(bOffline,elRecords,elSearchList,mDate);
  });// END Document Ready
}
function QSLContentCompose(bOffline,elRecords,elSearchList,mDate){
  // 20240804: Skyle: Check the date if it is specified.
  
  setTimeout(function(){
    var bMark = NodeMarkCookieCheck();
    var mCount = 0;
    var mHTML = "";
    var bDate = NotBlank(mDate);
    var elDivPrev = "";
    for(let i=0;i<elRecords.length;i++){
      let elDiv = elRecords[i];

      /*
        let mCategory = iQuery.replace("[data-","");
        mCategory = mCategory.replace("]","");
        let mOrder = elDiv.getAttribute("data-"+mCategory);
        if(mCategory.toLowerCase()=="best"){
          mOrder = 99999999-mOrder;
        }
      */

      // 20240804: Skyle: Check the date if it is specified.
      if(bDate){
        let mYYMM = Default(elDiv.getAttribute("date"),"00000000").slice(4,8);
        if(mYYMM=="0000"){
          mYYMM = Default(elDiv.getAttribute("dts"),"00000000").slice(4,8);
        }
        if(mYYMM != mDate){ // Entry is not a match
          continue;
        }
      }
      // Avoid listing duplicate nodes with more than one kudo message.
      if(!elDiv.hasAttribute('time')){
        elDiv = SearchPS(elDiv,'time');
        if(IsBlank(elDiv)){continue;}
        if(elDiv == elDivPrev){continue;}
      }
      elDivPrev = elDiv;
      
      let mOrder="";
      let mKids = [];
      let mJSONKids = "";
      let mID=""; let mTitle=""; let mIcon="";
      let mJSON=""; let mType=""; 
      let mNode ="";
      mNode = elDiv.querySelector("node");

      if(NotBlank(mNode)){
        mJSON = JSON.parse(mNode.innerHTML);
        mTitle = mJSON.title;
        mIcon = mJSON.icon;
        mID = mJSON.id;
        mType = mJSON.type;
        mJSONKids = mJSON.kids;
      }else{
        try{
          mID = elDiv.getAttribute("id");
        }catch{
          //DEBUG(elDiv.outerHTML);
        }
        //mID = elDiv.getAttribute("id");
        if(IsBlank(mID)){mID = elDiv.getAttribute('DTS');}
        mTitle = Default(elDiv.getAttribute("title"),elDiv.getAttribute("subtitle"));
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
      }else if(mID.substring(0,1)=="P"){
        // Remove the leading P in ID.
        mID = mID.substring(1,13);
      }
      if(IsBlank(mTitle)){mTitle = mID;}
      if(IsBlank(mType)){mType = "";}
      if(mType=="chat" || NotBlank(elDiv.hasAttribute('data-chat'))){mType = "<span style='margin-left:-16px;-20px;font-size:14px'><sup>💬</sup></span>";}
      if(IsBlank(mOrder)){mOrder = mID;}
      
      
      if(IsBlank(mJSONKids)){
        //mTag = TitleToTag(mTitle);
        mKids.push(mID);
      }else{
    
        mKids = mJSONKids.split(',');
        for(let j=0;j<mKids.length;j++){
          mKids[j]=mKids[j].replaceAll(" ","");
          mKids[j] = Cap(mKids[j]);
        }
      }
      // 20240331: StarTree: Further Exploration Icon     
      // 20240406: StarTree: Multiple kids:   
      // 20240804: Don  
      for(let k=0;k<mKids.length;k++){
        mCount ++;
        mHTML += "<div name='"+ mTitle + "'";
        //var mUpdated = elDiv.getAttribute("date");

        let mUpdated = DTSGetLatest(elDiv).toString().slice(0,8);
        
        mHTML += " date='" + mUpdated + "'";
        mHTML += " size='" + elDiv.innerHTML.length + "'";
        mHTML += " style='order:" + mOrder + "'>";

        // 20240413: StarTree: Add a float right display frame.
        mHTML += "<code class='mbRefS mbCB'></code>";

        mHTML += "<div control>";
        mHTML += "<hide>"+ elDiv.innerHTML + "</hide>"; // 20240802: Arcacia: Changed to use innherHTML to query icons.

        
        mHTML += "<a class='mbbutton mbILB25' onclick='QSLTree(this,\"[data-"+ mKids[k] +"]\")'>📒</a>";
        if(k==0){
          mHTML += MacroIcons(null,LnkCode(mID,mTitle,mIcon+mType,bMark)); 
        }else{

          mHTML += MacroIcons(null,LnkCode(mID,mTitle + "\\" + Cap(mKids[k]).replaceAll("-"," "),mIcon+mType,bMark)); 
        }

        mHTML += "</div>";// End of Control
        mHTML += "<div class='mbhide'><div style='margin-left:10px' control></div><div class='mbnav mbSearch' QSL></div></div>"; // QSL Container
        mHTML += "</div>";
      }
    }
  
    // STEP Display the result.
    elSearchList.innerHTML = mHTML;    
    // STEP: Display the sort bar
    if(NotBlank(elSearchList.previousElementSibling)){
      mHTML = "<a class='mbbutton' onclick='ShowNextInline(this)'><small><b>Found: "
      + mCount +"</b></small>" + OfflineTag(bOffline) + "</a><hide><small> "
      + "<input type='text' onclick='TextSearchPS(this)' onkeyup='TextSearchPS(this)' placeholder='Search...' title='Input a keyword' style='width:80px'> "
      + "<a class='mbbutton' onclick='QSLSortByName(this)'>🍎</a> " 
      + "<a class=\"mbbutton\" onclick=\"QSLSortByIcon(this,'📌')\">📌</a> "
      + "<a class='mbbutton' onclick='QSLSortBy(this,\"date\")'>📅</a> "
      + "<a class='mbbutton' onclick='QSLSortBy(this,\"size\")'>🐘</a> "
      + "<a class='mbbutton' onclick='QSLSortRandom(this)'>🎲</a>"
      + "</small></hide>";
      elSearchList.previousElementSibling.innerHTML = mHTML;
      MacroIcons(elSearchList.previousElementSibling);
      elSearchList.previousElementSibling.classList.remove('mbhide');
    }
    
  },0);

}
function QSLTree(el,iQuery){
  // 20240331: StarTree: Customized QSL for Sitemap display  
  var elContainer = SearchPS(el,"control").nextElementSibling;
  
  // STEP: Check current folder mode for expand/collapse
  var mFolder = el.innerHTML;
  if(mFolder == "📖"){
    elContainer.classList.add('mbhide');
    el.innerHTML = "📙";
    return;
  }else{
    QSLEL(elContainer.lastElementChild,iQuery);  
    elContainer.classList.remove('mbhide');
    el.innerHTML = "📖";  
  }
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
            NodeFormatter(elContainer);
            Macro(elContainer);
            $(elContainer).show();

            // 20231115: Sylvia: Scroll to View
            // Ref: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
            // Ref: https://stackoverflow.com/questions/7408100/can-i-change-the-scroll-speed-using-css-or-jquery
            ScrollIntoView(elContainer);
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
function XP_Count(iCache,iName){
  // 20240414: StarTree: This function counts the EXP value for the SPK in the archive cache. It doesn't care what icon is used.
  var mCount = 0;
  iCache.querySelectorAll("[EXP][SPK='"+iName+"'],[EXP][SPK*='|"+iName+"|']").forEach((item)=>{
    let mXP = Default(item.getAttribute('exp'),1);
    mCount += Number(mXP);
  });
  return mCount;
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
function XP_Display(elAvatar,bOrder){
  // JQUERY count data-CXP-iPlayer
  // 20230125: Ledia: Copied and modified from the DXP function
  // 20230221: StarTree: Created XP_DisplayEL for the content, because in this function the viewer clicked on the avatar, not the frame.
  XP_DisplayEL(elAvatar.parentNode,bOrder);  
}
function XP_DisplayEL(elFrame,bOrder){
  // 20230221: StarTree: elFrame is the actual frame where data is stored and displayed.
  var elScoreBoard = elFrame.parentNode;
  var mSortedBy = elScoreBoard.getAttribute("sortedby");
  var mSortOrder = elScoreBoard.getAttribute("sortorder");
  if(IsBlank(mSortedBy) && !(bOrder==false)){
    mSortedBy = "totalxp";
    mSortOrder = -1;
    elScoreBoard.setAttribute("sortedby",mSortedBy);
    elScoreBoard.setAttribute("sortorder",mSortOrder);
  }  
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
  var CountWwXP= 0; elFrame.setAttribute("WwXP",0); // 🐾 Weapon: Wolf/Paw
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
  var mEXPList="";
  var mEXPMap = new Map();
  var mEXPDetective=0;
 

  for(let i=1; i<=ArchiveNum();i++){
    $(document).ready(function(){
      let elCache = document.createElement("div");
      $(elCache).hide();
      $(elCache).load(ArchiveIndex(i) + mQueryStr, function(){	
        done++;
        
        // 20240414: Ledia: For the new EXP tag format.
        let mIcon = "";
        let mValue = "";
        mEXPList = elCache.querySelectorAll("[EXP][SPK='"+mName+"'],[EXP][SPK*='|"+mName+"|']");
        mEXPList.forEach((mEXPItem)=>{
          mIcon = Default(mEXPItem.getAttribute('icon'),"⭐");
          if(!mEXPMap.has(mIcon)){mValue = 0;}else{mValue = mEXPMap.get(mIcon);}
          mValue += Number(Default(Number(mEXPItem.getAttribute('EXP')),1));
          mEXPMap.set(mIcon,mValue);
        });
        if(done>=ArchiveNum()){
          let mEXPArray = [];
          mEXPMap.forEach((value,key)=>{
            mEXPArray.push([value,key]);
          });
          mEXPArray.sort((a,b)=>{return a[0] - b[0];});
          mEXPArray.reverse();
          var mEXPTotal = 0;
          var mEXPStr = "";
          mEXPArray.forEach((pair)=>{
            mEXPStr += pair[1] + pair[0] + " ";
            mEXPTotal += pair[0];

            // 20240415: LRRH: Fixing Detective XP
            if(pair[1]=="🚨" || pair[1]=="💡" || pair[1]=="🔍" || pair[1]=="🔮"){
              mEXPDetective += pair[0];
            }

          });
        }


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
        

        if(done>=ArchiveNum()){

          GuildEXP_Total = GuildEXP(mName);
          elFrame.setAttribute("TotalXP",GuildEXP_Total);

          GuildEXP_Lv = Math.floor(Math.sqrt(GuildEXP_Total));

          TotalTXP = CountAXP + CountBXP + CountCXP + CountCoXP + CountDXP + CountGXP + CountGaXP + CountGcXP + CountHXP + CountIXP + CountJXP + CountKXP + CountLXP + CountLemonXP + CountLnXP + CountLuckXP + CountMXP + CountOXP + CountPXP + CountPhotoXP + CountQXP + CountRXP + CountRcXP + CountRecXP + CountSXP + CountTXP + CountTeaXP + CountUXP + CountVXP + CountWarpXP + CountWaterXP + CountWbXP + CountWdXP + CountWgXP + CountWjXP + CountWkXP + CountWpXP + CountWrXP + CountWsXP + CountWwXP + CountZXP + mEXPTotal;
          
          
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
            Content += "<div class='mbRef' style='position:relative;z-index:1' title='" + mProfile + "'>";
            Content += "<a class='mbbuttonIn' ";
            Content += "href='" + ViewerPath() + "?id=" + mProfile + "' ";
            Content += "onclick=\"" + InterLink() + "'" + mProfile + "');return false;\">🪪</a>";  
            Content += "</div>";
          }
          
          Content += "<div style=\"white-space:nowrap;text-overflow: hidden;\"><b>"+mNick +"</b></div><hr>";
          Content += "<span style=\"float:right;margin-right:-55px;margin-bottom:-5px;letter-spacing:-2px;position:relative;z-index:1\"><small>"+ mStar.repeat(LevelStars) +"</small></span>";
          Content += "<a style='display:inline-block' class=\"mbbutton\" onclick=\"ShowNext(this)\" title=\""+ GuildEXP_Total +"\"><small>"+mArch+"&nbsp;Lv&nbsp;"+ GuildEXP_Lv +"</small></a>";

          Content += "<hide>";
          Content += "<span style=\"float:right;margin-top:-0px;margin-bottom:-5px;\"><big><b>&nbsp;"+ TotalTXP +"</b></big></span>";
          
          Content += "<small>";
          Content += "<b>" + mEXPStr + "</b>";
          if(NotBlank(mEXPStr)){Content+="<b> // </b>";}

          if(CountCXP>0){Content += "<b>🏛️&nbsp;" + CountCXP + "</b> ";}
          if(CountQXP>0){Content += "<b>🎪&nbsp;" + CountQXP + "</b> ";} 
          if(CountGaXP>0){Content += "<b>🍎&nbsp;" + CountGaXP + "</b> ";} 
          if(CountPXP>0){Content += "<b>📌&nbsp;" + CountPXP + "</b> ";}  
          if(CountAXP>0){Content += "<b>💗&nbsp;" + CountAXP + "</b> ";}  
          if(CountBXP>0){Content += "<b>🎀&nbsp;" + CountBXP + "</b> ";} 
          if(CountRXP>0){Content += "<b>🚨&nbsp;" + CountRXP + "</b> ";} 
          if(CountWwXP>0){Content += "<b>🐾&nbsp;" + CountWwXP + "</b> ";}
          if(CountHXP>0){Content += "<b>📯&nbsp;" + CountHXP + "</b> ";}
          if(CountJXP>0){Content += "<b>⚖️&nbsp;" + CountJXP + "</b> ";}
          if(CountGcXP>0){Content += "<b>🥘&nbsp;" + CountGcXP + "</b> ";}
          if(CountLXP>0){Content += "<b>🔔&nbsp;" + CountLXP + "</b> ";}
          if(CountDXP>0){Content += "<b>💡&nbsp;" + CountDXP + "</b> ";}
          if(CountLnXP>0){Content += "<b>⚡&nbsp;" + CountLnXP + "</b> ";}
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
          if(CountVXP>0){Content += "<b>🗃️&nbsp;" + CountVXP + "</b> ";} 
          if(CountPhotoXP>0){Content += "<b>📷&nbsp;" + CountPhotoXP + "</b> ";}
          if(CountSXP>0){Content += "<b>🎓&nbsp;" + CountSXP + "</b> ";} 
          if(CountKXP>0){Content += "<b>🎩&nbsp;" + CountKXP + "</b> ";} 
          if(CountCoXP>0){Content += "<b>🦁&nbsp;" + CountCoXP + "</b> ";}
          if(CountLemonXP>0){Content += "<b>🍋&nbsp;" + CountLemonXP + "</b> ";}
          if(CountWpXP>0){Content += "<b>🍍&nbsp;" + CountWpXP + "</b> ";}
          if(CountWjXP>0){Content += "<b>🥋&nbsp;" + CountWjXP + "</b> ";}
          if(CountWsXP>0){Content += "<b>⚔️&nbsp;" + CountWsXP + "</b> ";}
          if(CountWdXP>0){Content += "<b>🗡️&nbsp;" + CountWdXP + "</b> ";}
          if(CountWrXP>0){Content += "<b>🏹&nbsp;" + CountWrXP + "</b> ";}
          if(CountWgXP>0){Content += "<b>🔫&nbsp;" + CountWgXP + "</b> ";}
          if(CountWbXP>0){Content += "<b>💣&nbsp;" + CountWbXP + "</b> ";}
          if(CountWkXP>0){Content += "<b>🚀&nbsp;" + CountWkXP + "</b> ";}
          
          if(CountWaterXP>0){Content += "<b>🌊&nbsp;" + CountWaterXP + "</b> ";}
          if(CountWarpXP>0){Content += "<b>🌀&nbsp;" + CountWarpXP + "</b> ";}
          if(CountRecXP>0){Content += "<b>🏅&nbsp;" + CountRecXP + "</b> ";}
          Content += "</small>"; 

          // Detective Win Ratio
          CountPlayed = CountWIN + CountLOS;
          if(CountPlayed>0){
            WinRatio = CountWIN / CountPlayed;
            
            DXP_Eff = Math.floor((CountDXP + CountIXP + CountOXP + CountRXP + mEXPDetective) * WinRatio);
            DXP_Level = Math.min(Math.floor(Math.sqrt(DXP_Eff)),CountWIN) + CountCHAWIN;
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
          MacroIcons(elFrame);
          ScrollIntoView(elFrame);
        }
        elCache.remove();
      });
    });
  }
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

      // 20240112: Cardinal: If the attribute is "random", set a random number.
      if(iAttribute=="random"){
        mEntry.style.order = mSortOrder * Math.ceil(Math.random()*10000);
      }else{
        mEntry.style.order = mSortOrder * Number(mEntry.getAttribute(iAttribute));
      }
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
    });
  }
}
function GuildEXP(iMember){
  // 20230129: Ledia: Added for total EXP.
  // #GuildEXP
  var dict={
"3B": 6061,
"44": 777,
"Albatross": 2242,
"Amelia": 924,
"Arcacia": 8195,
"Black": 13427,
"Cardinal": 2487,
"Casey": 4600,
"Clyde": 23,
"Emi": 66,
"Evelyn": 12870,
"Fina": 2629,
"Gaia": 1384,
"Helen": 3144,
"Ivy": 4845,
"James": 3248,
"Jao": 60,
"Karl": 26,
"Ken": 780,
"Kisaragi": 5934,
"Koyo": 491,
"Ledia": 8210,
"LRRH": 10160,
"Melody": 1213,
"Mikela": 1491,
"Natalie": 5461,
"Neil": 261,
"P4": 5998,
"Patricia": 3370,
"Rick": 68,
"Robert": 236,
"Roger": 112,
"RS": 11,
"Sasha": 6948,
"Skyle": 3622,
"StarTree": 13214,
"Sylvia": 5708,
"Tanya": 8507,
"Therese": 150,
"V": 3714,
"Vivi": 5893,
"Vladanya": 2980,
"Zoey": 8415,
  };
  return dict[iMember];
}
function RandomMember(){
  // 20240423: StarTree: Returns a random member.
  return Roster(getRandomInt(0,Roster(-1)));
}
function Roster(iIndex){
  // 20230125: Ledia: Preparing for roster stats display.
  //   Returns the length if the argument is negative.
  const mRoster = ["3B", "44", "Albatross", "Amelia", "Arcacia", "Black", "Cardinal", "Casey", "Clyde", "Emi", "Evelyn", "Fina", "Gaia", "Helen", "Ivy", "James", "Jao", "Karl", "Ken", "Kisaragi", "Koyo", "Ledia", "LRRH", "Melody", "Mikela", "Natalie", "Neil", "P4", "Patricia", "Rick", "Robert", "Roger", "RS", "Sasha", "Skyle", "StarTree", "Sylvia", "Tanya", "Therese", "V", "Vivi", "Vladanya", "Zoey"];
  //const mRoster = ["3B","44", "Albatross"];
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
        "[data-ZXP-" + iName + "]" + "," +
        "[EXP][SPK='" + iName + "']" + "," + 
        "[EXP][SPK*='|" + iName + "|']" ;
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
        mTally[j] += XP_Count(elCache,Roster(j));
        mTally[j] += (iAXP + iBXP + iCXP + iCoXP + iDXP + iGXP + iGaXP + iGcXP + iHXP + iIXP + iJXP + iKXP + iLXP + iLemonXP + iLnXP + iLuckXP + iMXP + iOXP + iPXP + iPhotoXP + iQXP + iRXP + iRcXP + iRecXP + iSXP + iTXP + iTeaXP + iUXP + iVXP + iWarpXP + iWaterXP + iWbXP + iWdXP + iWgXP + iWjXP + iWkXP + iWpXP + iWrXP + iWsXP + iWwXP + iZXP);
        mDone[j] ++;
        if(mDone[j] >= mArchiveSize ){
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
function HC(el){
  // 20231118: StarTree: Hide control
  var mControl = SearchPS(el,'control');
  mControl.classList.add('mbhide');
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
function NodeEdit(el,mNodeID){
  // 20240804: StarTree: The NodeEdit button has been clicked.
  var bNodeEdit = NodeEditModeCheck(el);
  if(!bNodeEdit){return;}
  
  // STEP: NodeEdit mode is ON, pass the Node ID to be edited through main param,
  Parameter("NodeEditID",mNodeID);
  
  // STEP: NodeEdit mode is ON, show the NotePad widget.
  var elWidgetButton = document.querySelector("button[BB][title='Notepad']");
  ShowNextFP(elWidgetButton,"20240330201200",true);
}
function NodeEditWidgetLoad(elWidget,mDTS){
  // 20240804: StarTree: If this widget is the notepad being loaded by NodeEdit button, populate the content with local storage content.
  if(mDTS != "20240330201200"){return;}
  var mNodeID = Parameter("NodeEditID");
  if(IsBlank(mNodeID)){return}
  elWidget.setAttribute("NodeEditID",mNodeID);  
  // STEP: Remove the Honey Button.
  var elButton = elWidget.querySelector("button[title='Use Cookie']");
  elButton.innerHTML = "✏️" + mNodeID;
  var elTextArea = elWidget.querySelector("textarea[textarea]");
  TextAreaLoad(elTextArea);
}
function NodeFormatter(elTemp){
  // 20231224: StarTree: Update: This function is also used by calendar when listing nodes.
  var vDivs = elTemp.getElementsByTagName('div');
  var vFirstDiv = vDivs[0];
  while( vFirstDiv != null){
    var vTemps = vFirstDiv.getElementsByTagName('node-content');
    var vContent = vFirstDiv.getElementsByTagName('content'); // 20231224: StarTree: New format
    var vHTML="";
    if( vTemps.length > 0)  {
      var vID = vFirstDiv.id.substring(1);
      var vNodeContent = vTemps[0].innerHTML;
      vTemps = vFirstDiv.getElementsByTagName('node-icon');
      var vIcon = vTemps[0].innerHTML;
      vTemps = vFirstDiv.getElementsByTagName('node-title');
      var vTitle = vTemps[0].innerHTML;
      vFirstDiv.innerHTML="<div><button class='mbbutton' onclick='ShowNext(this)'>" 
        + vIcon + " " + vTitle 
        + "</button><div class='mbCB mbscroll mbhide'>" 
        + "<a class='mbbuttonIn' href='" + ViewerPath() +"?id=P" + vID  + "'>"
        + "<small>⭐</small></a> <small><b>" + vID + "</b></small><hr>"
        + vNodeContent 
        + "<hr class='mbCB'>"
        + "<h4>Mentions</h4><jq>[data-" + vID + "]</jq>"
        + "</div></div>" ;
    }else if(!IsBlank(vContent)){
      // 20231224: StarTree: This is for the new format.
      var vJSON = vFirstDiv.getElementsByTagName('node')[0];
      var mJSON = JSON.parse(vJSON.innerHTML);

      // 20240405: StarTree: Don't show the picture if it is missing.
      vHTML = "";
      if(NotBlank(mJSON.img)){
        vFirstDiv.classList.add('mbscroll');
        vHTML = "<div class='mbav50pr' style=\"background-image:url('" + mJSON.img + "')\"></div>";
        vHTML += "<h4><lnk>" + mJSON.parentid + "|" + mJSON.parentname + "</lnk></h4>";
        vHTML += "<lnk>"+ mJSON.id + "|" + mJSON.icon + " " + mJSON.title + "</lnk>";
      }else{
        // 20240405: StarTree: Assume that this is a chat node
        vFirstDiv.classList.add('mbscroll');
        //vFirstDiv.setAttribute('Board',mJSON.id);
        vHTML +="<div>";
        vHTML += Pin2Code(mJSON);
        // 20240406: StarTree: Include the parent lnk
        vHTML += "<h4><lnk>" + mJSON.parentid + "|" + mJSON.parentname + "</lnk></h4>";
        
        vHTML += "<lnk>"+ mJSON.id + "|" + mJSON.icon + "</lnk> ";
        vHTML += "<a class='mbbutton' onclick='ShowPL(this)'>" + mJSON.title + "</a>";
        vHTML += JSONPartiStr(mJSON);
        
        vHTML +="<span class='mbhide'><hr class='mbCB'>"+ChatNodeContent(vFirstDiv,mJSON)+"</span>";        
        vHTML +="</div>";
        vHTML +="<div></div><div class='mbCB' QSL></div>";   
      }    
      vFirstDiv.innerHTML = vHTML;  
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
  try{
    var elWidget = SearchPS(elContainer,'widget');
    var elDisplay = elWidget.querySelector('[display]');
    MSScanFor(elDisplay,DTSPadding(eDate),DTSPadding(Number(eDate)+1),"",true);
  }catch(e){}
  var qArchive = ArchiveSelect(eDate);
  var qDate = "[date='" + eDate + "'][id],[date='" + eDate + "'][time],[date='" + eDate + "'][data-happy]";
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
     /*@@P4*/window.history.replaceState(nextState, nextTitle, nextURL);
  }else{
	window.location.href = nextURL;
  }
 
}
function PinCh(eCH,el){
  var eHTML="https://panarcana.blogspot.com/2021/12/branch-bakery"
  var bJump=0;
  var mBanner = "";
  switch(eCH){
  case 5: mBanner="202403231454";break;
  case 7: mBanner="202310081703";break;
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
  case 32: mBanner="202209251051";break;
  case 33: mBanner="202309052239";break;
  case 34: mBanner="202310232341";break;
  case 35: mBanner="202303052122";break;
  }
  if(AtBlogSpot()){
    if( mBanner!=""){
      QueryBanner(mBanner);
    }else{
      QueryMain(eHTML,"MBJQ",bJump);
    }
  }else if(AtGitHub()){
    // 20231115: Black
    BoardLoad(el,mBanner);
  }

}
function QueryMainCh(eCH,el){
  PinCh(eCH,el);
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
      // 20240406: StarTree: Need to process each node before showing.
      
      NodeFormatter(elContainer);
      Macro(elContainer);
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
function QueryTabEL_20240509_DELETE(elContainer, eQuery){
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
function QueryTabPN_20240509_DELETE(elThis,eQuery){
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
  var mContent = "<hr><div style='margin:5px -10px;'>";
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
    bCookieEnabled = confirm("Would you allow saving roll call status to local storage on your browser?");
  }else{ // Cookie is enabled, does user want to disable?
    bCookieEnabled = !confirm("Would you like to stop saving roll call status to local storage on your browser?");
  }
  if(bCookieEnabled){
    elContainer.setAttribute("CookieEnabled","true");
    el.innerHTML = "🍯✅";
    elListButton.innerHTML = "Refresh";
    RollCallList(elListButton);
  }else{
    elContainer.setAttribute("CookieEnabled","false");
    el.innerHTML = "🍯⛔";
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
function ShowWidgets(){
  //20240421: Arcacia Show all button class objects that are immediate children
  var elButtons = document.querySelectorAll('[BB]');
  var mNumHidden = 0;
  // Match the visibility status of the FP
  elButtons.forEach((mTag)=>{
    let elFP = mTag.nextElementSibling.querySelector('[FP]');
    mTag.classList.remove('mbhide');
  });
  FPGetTopZ();
}
function HideAllFP(){
  // 20240421: Arcacia: Hide all FP.
  // .. Only hide the ones over half a screen tall.
  var elFPs = document.querySelectorAll('[FP]');
  elFPs.forEach((mTag)=>{
    if(screen.availHeight< 2*$(mTag).height()){
      mTag.classList.add('mbhide');
    }    
  });
}
function WidgetDockCycle(elButton){
  // 20240424: StarTree: Cycles among Left > Center > Right
  // elButton is the cycle button.
  // STEP: Get the Widget FP.
  var elFP = SearchPS(elButton,"FP");
  // INFO: The frame that contains the property is the parent of the FP.
  var mCurPos = elFP.parentNode.style.justifyContent;
  
  // Move to right
  switch(mCurPos){
    case "left": mCurPos = "center"; break;
    case "center": mCurPos = "right"; break;
    case "right": mCurPos = "left"; break;
    default: mCurPos = "center";
  }
  elFP.parentNode.style.justifyContent = mCurPos;
}

function BringToFrontFP(el){
  // 20240421: Arcacia: Bring the FP to front.
  // The el in the input is a div within the FP.
  // 20240423: Sylvia: Restructured.
  // 20240424: P4: Bring to Top should not "show" the widget because it should already be shown.
  var mCurMax = Number(FPGetTopZ());
  var elFP = SearchPS(el,'FP');
  elFP.style.zIndex = mCurMax + 1;
  return;
}
function FPGetTopZ(){
  // 20240423: Sylvia: This function returns the top zIndex among the FP objects in display.
  //   And sets the zIndex of those not in display to 0.
  var elFPs = document.querySelectorAll('[FP]');
  var mZArray = [];
  for(let i=0;i<elFPs.length;i++){
    if(elFPs[i].classList.contains('mbhide')){
      mZArray.push([0,elFPs[i]]);
    }else{
      mZArray.push([Number(elFPs[i].style.zIndex),elFPs[i]]);
    }
  }
  mZArray.sort();
  var mCurMax=0;
  for(let i=0;i<elFPs.length;i++){
    if(mZArray[i][0] != 0){
      mCurMax ++;
      mZArray[i][1].style.zIndex = mCurMax;
    }
  }
  FPSepia(mZArray,mCurMax);
  return mCurMax;
}
function FPSepia(mZArray,mCurMax){
  // 20240424: Black: Scans and update FP button sepia/opacity settings
  // This should be called after having a sorted array.
  for(let i=0;i<mZArray.length;i++){
    let mButton = (mZArray[i][1]).parentNode.parentNode.previousElementSibling;    
    if(mZArray[i][0] == 0){
      // If the FP is not shown, grey out its button
  
      if(mButton.innerHTML=="🎧"){ // This icon is abnormally dark to begin with.
        mButton.style.opacity = 1;
      }else{
        mButton.style.opacity = 0.1;
      }
      mButton.style.filter = "sepia(100%)";
    }else if(mZArray[i][0] >= mCurMax){
      // If the FP is the top most (and not hidden), full color.
      mButton.style.opacity = 1;
      mButton.style.filter = "sepia(0%)";
    }else{
      // Else: tone down the button
      mButton.style.opacity = 0.60;
      mButton.style.filter = "sepia(100%)";
    }
  }
}
function FPHide(elFP){
  // 20240424: P4: Hides an FP
  elFP.classList.add('mbhide');
  elFP.style.zIndex=0;
}
function FPShow(elFP){
  // 20240424: Black: Shows an FP
  
  //MacroIcons(elFP); // 20240904: StarTree: Causes refresh bug on music player and textarea.
  elFP.classList.remove('mbhide');
  elFP.style.zIndex=FPGetTopZ()+1;
}
function ShowNextFP(el,mDTS,bRefresh){
  // 20240420: StarTree: Show the FP within the next element.
  // 20240424: P4: Reorganized
  // 20240804: StarTree: Added bRefresh to not hide the frame.

  var elFP = el.nextElementSibling.querySelector('[FP]');
  // STEP: If the FP is already shown, either bring it to top or close it.
  if(!bRefresh && !elFP.classList.contains('mbhide')){
    var mTopZ = FPGetTopZ();
    if(elFP.style.zIndex == mTopZ){
      // Close it if it is at the top.
      FPHide(elFP);
    }else{
      elFP.style.zIndex = mTopZ+1;
    }    
    FPGetTopZ();
    
    return;
  }
  // The following is for the cases when the FP is currently hidden.

  // STEP: Load the content as needed.
  // STEP: If mDTS is blank, skip loading.
  // 2024904: StarTree: Don't reload automatically. There is a a reload button.
  //if(NotBlank(mDTS) && (bRefresh || (elFP.classList.contains('mbhide') && elFP.innerHTML==""))){
  if(bRefresh || (elFP.classList.contains('mbhide') && elFP.innerHTML=="")){
    elFP.setAttribute('FP',mDTS);
    ReloadFP(elFP);
  }

  // STEP: If it is not on a phone, bring to top and done.
  if(!AtMobile()){
    FPShow(elFP);
    FPGetTopZ();
    return elFP;
  }
  // The following is for the case when the FP is on a phone.

  // STEP: Hide all FP.
  var elFPs = document.querySelectorAll('[FP]');
  elFPs.forEach((mTag)=>{FPHide(mTag);});
  // STEP: Show only this FP.
  FPShow(elFP);
  FPGetTopZ();
  return;

}
function WaitIcon(){
  // 20240905: Sasha: Made this its own function and added wings.
  //return MacroIcons(null,"<center><small>:WingL:</small><big>⏳</big><small>:WingR:</small></center>");
  return MacroIcons(null,"<center><big>⏳</big></center>");
}
function ReloadFP(el){
  // 20240420: Skyle: Reload an FP that is in display.
  var elFP = el;
  if(!elFP.hasAttribute('FP')){
    elFP = SearchPS(el,'FP');
  }  
  elFP.innerHTML = WaitIcon();

  var mDTS = elFP.getAttribute('FP');
  var mHTML="";
  // 20240421: Arcacia: Special handling for the Feedback Form.
  if(mDTS=="Feedback"){  
    var mInput = "https://docs.google.com/forms/d/e/1FAIpQLSeOpcxl7lS3R84J0P3cYZEbkRapkrcpTrRAtWA8HCiOTl6nTw/viewform";
    mHTML = "<span class='mbRef'><a class='mbbutton' onClick='HideFP(this);FPGetTopZ()' style='float:right' title='Close'><span class=\"mbIcon iClose\"></span></a></span>";
    // 20240924: Tanya: Widgets don't have height button and this button is not working properly.
    //mHTML += "<button class='mbbutton mbRef' style='opacity:0.2' title='Toggle Size' onclick='BoardToggleHeight(this)'>⅔</button>"
    // 20240924: Tanya: The widget needs a way to refresh because sometimes the google form can crash.

    mHTML += "<a class='mbbutton' onClick=\"BoardLoadPF(this,'Feedback');return false;\" target=\"_blank\" title=\"Feedback\" href=\"https://docs.google.com/forms/d/e/1FAIpQLSeOpcxl7lS3R84J0P3cYZEbkRapkrcpTrRAtWA8HCiOTl6nTw/viewform\">💌</a> "; 

    mHTML += "<a class='mbbutton' onClick='ReloadFP(this)' title='Reload Feedback Form'>Feedback Form</a><span><hr>";
    mHTML += "<iframe src='" + mInput + "' title='Google Form' style='border:none;width:100%;height:45vh' allow='clipboard-read; clipboard-write'></iframe></span>";
    elFP.innerHTML = MacroIcons(null,mHTML);

    return;
  }
  // 20240509: Black
  var elArchives = Offline();
  $(document).ready(function(){
    // OFFLINE MODE
    if(NotBlank(elArchives)){
      ReloadFPEL(elArchives.querySelector("[DTS=\""+mDTS +"\"]"),elFP,mDTS,true);
      return;
    }

    // ONLINE MODE
    for(let i=1; i<=ArchiveNum();i++){
      let elCache = document.createElement("div");
      $(elCache).load(ArchiveIndex(i) + " [DTS="+mDTS +"]", function(){
        if(NotBlank(elCache.innerHTML)){
          ReloadFPEL(elCache.firstChild,elFP,mDTS);
        }
        elCache.remove();
      });
    }
  });
}
function ReloadFPEL(elWidget,elFP,mDTS,bOffline){
  // 20240509: Black: This is the shared function for handling both offline and online modes
  
  // 20240422: StarTree
  let mNodeID = elWidget.getAttribute('node');
  let mTitle = elWidget.getAttribute('title');
  let mIcon = elWidget.getAttribute('icon');
  

  // 20240422: Add a close button
  mHTML = "<small><span class='mbRef'>";
  mHTML += NodeIDClipboardButtonCode(mNodeID) +"&nbsp;";
  mHTML += "<a class='mbbutton' title='Hide Widget' onclick='HideFP(this)'>:Close:</a>&nbsp;";
  mHTML += "<a class='mbbutton' title='Cycle dock position' onclick='WidgetDockCycle(this)'><small>▶</small></a>";
  mHTML += "</span>";

  mHTML += "<lnk>" + mNodeID + "|" + mIcon + "</lnk> ";
  mHTML += "<span class='mbbutton' title='Refresh' onclick='ReloadFP(this)'>"+mTitle+ "</span></small>";
  mHTML += OfflineTag(bOffline) + "<hr>";
  //mHTML += "<div style='overflow-Y:auto;overflow-x: hidden;'>";
  mHTML += elWidget.innerHTML;
  //mHTML += "</div>";
  
  elFP.innerHTML = mHTML;
  Macro(elFP);  
  elFP.setAttribute('FP',mDTS);
  elFP.setAttribute('Widget',mDTS);

  // 20240804: StarTree: Special Handling for Notepad when using Node Edit
  NodeEditWidgetLoad(elFP,mDTS);
}
function NodeIDClipboardButtonCode(mNodeID,mParentID,mIcon){
  // 20240422: V
  // 20240427: Black: Added mArchiveID for showing bubble context.
  var mHTML = "<a class='mbbutton' onclick=\"ClipboardAlert('"+ mNodeID+"')\" title=\"" +  mNodeID+  " [";
  var mArchiveNum = "0";
  if(IsBlank(mParentID)){
    mArchiveNum = ArchiveNumSelect(mNodeID);
  }else{
    mArchiveNum = ArchiveNumSelect(mParentID);
  }
  //DEBUG(mArchiveNum);
  mHTML += mArchiveNum;
  if(IsBlank(mIcon)){
    mIcon = ":Archive"+mArchiveNum+":";
  }
  mHTML += "]\">"+mIcon+"</a>";

  return mHTML
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
function ShowLP3NJ(el){
  // 20240205: StarTree: Scrolls to view
  var elSource = el.lastElementChild;
  var elTarget = el.parentNode.parentNode.parentNode;
  elTarget = elTarget.nextElementSibling;
  elTarget.innerHTML = elSource.innerHTML;
  ScrollIntoView(elTarget);
}
function LAPSN(el,eID,iInner){
  // 20230301: Evelyn: Based on ShowLPSN but for QueryAllEL
  var elTarget = SearchPS(el,"");
  elTarget = elTarget.nextElementSibling;
  LoadArchivePostEl(elTarget,eID,iInner);
}
function QueryAllPS(el,eQuery,iInner,iAttribute){
  // 20231220: StarTree
  var elTarget = SearchPS(el,iAttribute);
  elTarget.setAttribute("mQueryString","");
  QueryAllEL(elTarget,eQuery,iInner);
}
function QueryAllPSL(el,eQuery,iInner,iAttribute){
  // 20231220: StarTree
  var elTarget = SearchPS(el,iAttribute);
  elTarget = elTarget.lastElementChild;
  elTarget.setAttribute("mQueryString","");
  QueryAllEL(elTarget,eQuery,iInner);
}
function QueryAllPSN(el,eQuery,iInner,iAttribute){
  // 20230301: Evelyn: Based on ShowLPSN but for QueryAllEL
  // Goes up the parents unit it has the attribute, then go to the next element.
  // 20230307: StarTree: Never hide the target.
  var elTarget = SearchPS(el,iAttribute);
  elTarget = elTarget.nextElementSibling;
  elTarget.setAttribute("mQueryString","");
  QueryAllEL(elTarget,eQuery,iInner);
}
function ShowLBL(el,iAttribute){
  // 20240604: Ledia: Added for profiles.
  var elSource = el.lastElementChild;
  var elTarget = SearchPS(el,"board").querySelector('[qsl][bl]');
  elTarget.parentNode.classList.remove('mbhide');
  elTarget.innerHTML = elSource.innerHTML;
  elTarget.classList.remove("mbhide");
}
function ShowLPSL(el,iAttribute){
  // 20231220: StarTree: Goes up the parents until it has the attribute.
  var elSource = el.lastElementChild;
  var elTarget = SearchPS(el,iAttribute);
  elTarget = elTarget.lastElementChild;
  elTarget.innerHTML = elSource.innerHTML;
  elTarget.classList.remove("mbhide");
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
function CookieCheck(el,iScope){
  // 20240330: StarTree: Go up the Widget level and check of cookie enable.
  if(IsBlank(iScope)){
    iScope = "Widget";
  }
  try{
    var elScope = SearchPS(el,iScope);
    return (elScope.getAttribute('CookieEnabled')=="true");
  }catch(error){
    DEBUG("NOT FOUND")
    return false;
  }  
}
function NodeMarkCode(iNodeID,iDesc){
  // 20240330: StarTree: Returns the HTML code for the node marking.
  var mButtonStyle = "mbbutton";
  if(IsBlank(iDesc)){ mButtonStyle="mbbutton";}
  var mVDTS = NodeMarkLoadDTS(iNodeID);
  var mSepia = 0;   
  var mHTML = "";
  mHTML += "<a class=\""+mButtonStyle+"\" id=\"P"+ iNodeID+"-V\" onclick=\"NodeMarkCycle(this,'" + iNodeID + "')\" title=\"Cycle node marking\" style=\"filter:sepia(" + mSepia + "%)\">";
  mHTML += NodeMarkLoad(iNodeID)+"</a>";
  return mHTML;
}
function NodeDTS(iNodeID){
  // 20240426: Zoey: Returns an integer for the latest DTS within a node.
  // STEP Get the node

  // STEP: Call DTSGetLatest
  return 0;
}

function NodeEditModeCheck(el){
  // 20240804: StarTree: Checks if the page should load local node content.
  // .. If el is Blank: Check if the page should load local node content.
  // .. Else: Show the dialog and update the parameter value.
  var mParam = 'NodeEditMode';
  if(el==null){return Parameter(mParam);}
  var bParam = Parameter(mParam);
  bParam = confirm("Enable local node content?");
  if(bParam){Parameter(mParam,"true");}
  /*
  if(bParam!="true"){
    bParam = confirm("Enable local node content?");
  }else{
    bParam = !confirm("Disable loading local node content?");
  }
  if(bParam){
    Parameter(mParam,"true");
    el.innerHTML = "📝✅";
  }else{
    Parameter(mParam,"false");
    el.innerHTML = "📝⛔";
  }
    */
  return bParam;
}
function NodeMarkCookieCheck(){
  // 20240330: StarTree: Checks if the page should mark node visit status.
  return (Parameter('CookieEnabled')=="true");
}
function Parameter(mParam,mSet){
  // 20240804: StarTree: Check attribute parameters of document main.
  // .. This function is overloaded. 
  // .. If mSet is blank, it checks the parameter.
  // .. If mSet is not blank, it sets the parameter.
  var elMain = document.querySelector('[main]');
  if(IsBlank(mSet)){    
    return (elMain.getAttribute(mParam));
  }
  elMain.setAttribute(mParam,mSet);
  return mSet;
}
function TextAreaLoad(elTextArea){
  // 20240330: StarTree: For Cookie TextArea. Loads from Cookie when it is first activated.
  
  // STEP: If NodeEditID exists, load from local storage for that.
  var elWidget = SearchPS(elTextArea,"widget");
  var mNodeID = elWidget.getAttribute("NodeEditID");
  if(NotBlank(mNodeID)){ // The Content is for a specific node.
    elTextArea.value = localStorage.getItem(mNodeID + "-N");
    return;
  }


  // STEP: Check for cookie enable.
  if(!CookieCheck(elTextArea)){return;}

  // STEP: Load from Local Storage
  var mText = localStorage.getItem("TextArea-Value");
  if(NotBlank(mText)){
    elTextArea.value = mText;
  }
}
function TextAreaSave(elTextArea){
  // 20240330: StarTree: Saves the TextArea text to Local Storage.
  
  // STEP: 20240804: StarTree: Save content to NodeEdit if in that mode.
  var elWidget = SearchPS(elTextArea,"widget");
  var mNodeID = elWidget.getAttribute("NodeEditID");
  if(NotBlank(mNodeID)){ // The Content is for a specific node.
    localStorage.setItem(mNodeID + "-N",elTextArea.value);
    return;
  }
  // STEP: Check for Local Storage enable.
  if(!CookieCheck(elTextArea)){return;}
  localStorage.setItem("TextArea-Value",elTextArea.value);
}
function NMDTC(el){
  // 20240504: StarTree: Creates a DTC or converts the number in Node ID to DTC.
  var elWidget = SearchPS(el,"Widget");
  var mDTS = Default(elWidget.querySelector('[NM-DTS]').value,DTSNow());
  navigator.clipboard.writeText(DTC(mDTS));
}
function NMMsg(el,iIcon,bNoEXP){
  // 20240416: StarTree: Bubble code
  var elControl = SearchPS(el,"Widget");
  var mSPK = Default(elControl.querySelector('[NM-SPK]').value,"");
  var elIcon = elControl.querySelector('[NM-Icon]');

  if(NotBlank(iIcon)){
    elIcon.value = iIcon;
  }else{ 
    iIcon = elIcon.value;
  }
  if(bNoEXP){
    var mEXPStr = "";
  }else{
    mEXPStr = " EXP";
  }
  var mHTML = "<msg DTS=\"" + DTSNow() + "\" SPK=\""+mSPK+"\""+mEXPStr;
  if(NotBlank(iIcon) && !bNoEXP){mHTML += " Icon=\""+iIcon+"\"";}
  mHTML += "></msg>";
  navigator.clipboard.writeText(mHTML);
}
function DTSFormatStr(mYYYYMMDD){
  // 20240426: StarTree: Formats a date object into a DTS string.
  var mYear = mYYYYMMDD.slice(0,4);
  var mMonth = mYYYYMMDD.slice(5,7);
  var mDay = mYYYYMMDD.slice(8,10);
  var mHour = mYYYYMMDD.slice(11,13);
  var mMinute = mYYYYMMDD.slice(14,16);
  return DTSPadding(mYear + mMonth + mDay + mHour + mMinute);
}
function DTSNow(){
  // 20240416: StarTree: Returns the current DTS string.
  var mDate = new Date();
  var mYear = String(mDate.getFullYear());
  var mMonth = String(mDate.getMonth()+1).padStart(2,'0');
  var mDay = String(mDate.getDate()).padStart(2,'0');
  var mHour = String(mDate.getHours()).padStart(2,'0');
  var mMin = String(mDate.getMinutes()).padStart(2,'0');
  var mSec = String(mDate.getSeconds()).padStart(2,'0');
  return mYear + mMonth + mDay + mHour + mMin + mSec;
}
function NMCard(el){
  // 20240416: StarTree: Puts the card code to Clipboard.
  var elControl = SearchPS(el,"Widget");
  var mDTS = Default(elControl.querySelector('[NM-DTS]').value,DTSNow());
  var mTitle = Default(elControl.querySelector('[NM-Title]').value,"Card Title");
  var mSubTitle = Default(elControl.querySelector('[NM-ParentName]').value,"Subtitle");

  var mImg = Default(elControl.querySelector('[NM-URL]').value,"https://cdn.pixabay.com/photo/2014/05/20/21/25/bird-349035_640.jpg");
  
  // 20240427: Skyle: New format
  var mHTML = "<card DTS=\"" + mDTS + "\" title=\"" + mTitle + "\" subtitle=\"" + mSubTitle +"\"";
  mHTML += " img=\"" + mImg + "\"></card>";
  /*var mHTML = "<div class='mbCharCard'>\n";
  mHTML += "\t<div class='mbCharCardTitle2'>"+mTitle+"</div>\n";
  mHTML += "\t<div class='mbCharCardImg' style=\"background-position: 50% 50%; background-image:url('"+mImg+"')\"></div>\n";
  mHTML += "\t<div class='mbCharCardSubtitle'>"+mSubTitle+"</div>\n";
  mHTML += "\t<div class='mbCharCardDesc'>\n";
  mHTML += "\t\t<center>\n";
  mHTML += "\t\t\t<div class='mbCharCardDescInner'>\n";
  mHTML += "\t\t\t</div>\n";
  mHTML += "\t\t</center>\n";
  mHTML += "\t</div>\n";
  mHTML += "</div>";*/

  navigator.clipboard.writeText(mHTML);
  return mHTML;
}
function NMNote(el){
  // 20240502: Arcacia: Notes by default don't have icons and only has a subtitle.
  var elWidget = SearchPS(el,"Widget");
  var mDTS = DTSNow(); // Use new DTS by default.
  var mSubTitle = Default(elWidget.querySelector('[NM-Title]').value,"Log");
  var mHTML = "<note dts=\""+mDTS+"\" subtitle=\""+mSubTitle+"\">\n\n</note>";
  navigator.clipboard.writeText(mHTML);
  return mHTML;
}
function NMTopic(el,iSecIcon){
  // 20240416: StarTree: Puts a chat section to Clipboard.
  // 20240420: StarTree: Updated to use tag.
  var elControl = SearchPS(el,"Widget");
  if(IsBlank(iSecIcon)){
    iSecIcon = elControl.querySelector('[NM-Icon]').value;
  }else{
    elControl.querySelector('[NM-Icon]').value = iSecIcon;
  }
  var mDTS = DTSNow(); // 20240502: Arcacia: Use new DTS by default.
  var mTitle = Default(elControl.querySelector('[NM-Title]').value,"New Topic");
  var mHTML = "<topic dts=\""+mDTS+"\" icon=\""+iSecIcon+"\" title=\""+mTitle+"\">\n"
  
  // 20240417: StarTree: Special format for Initate node section.
  // 20240801: Black: Don't need this any more.
  if(false && iSecIcon=="🌱"){
    mHTML += "\t<div class=\"mbpdc\"><b>First</b> word</div><hr class=\"mbCL\">\n";
  }
  
  // 20240425: Kisaragi
  mHTML += "\t<ol>\n\t</ol>\n";
  
  mHTML+="</topic>";
  navigator.clipboard.writeText(mHTML);
  return mHTML;
}
function NMWidgetIcon(){
  // 20240823: Patricia: Returns the icon at the float panel Node Maker Widget.
  var elWidget = document.querySelector(".footer [widget='20240416213800']");
  if(IsBlank(elWidget)){return ""}
  var elIconBox = elWidget.querySelector("[nm-icon]");
  return elIconBox.value;
}
function IsMasteryIcon(iIcon){
  // 20240417: StarTree
  return ((iIcon=="🌱")||(iIcon=="🐤")||(iIcon=="🕊️")||(iIcon=="🦉")||(iIcon=="🦅"));
}
function NMLI(el){
  // 20240417: StarTree
  // 20240420: StarTree: Changing to Bullet tag.
  var elControl = SearchPS(el,"Widget");
  var mIcon = elControl.querySelector('[NM-Icon]').value;
  var mTitle = Default(elControl.querySelector('[NM-Title]').value,"New Bullet");
  var mHTML = "";
  if(NotBlank(mIcon)){
    mHTML = "<bullet icon=\""+mIcon+"\" title=\""+mTitle+"\">\n</bullet>";
  }else{
    mHTML = "<bullet title=\""+mTitle+"\">\n</bullet>";
  }
  
  navigator.clipboard.writeText(mHTML);
  return mHTML;
}
function NMNodeSec(el,iSecIcon){
  // 20240416: StarTree: Puts a chat section to Clipboard.
  var elControl = SearchPS(el,"Widget");
  var mAuthor = Default(elControl.querySelector('[NM-SPK]').value,"");
  if(IsBlank(iSecIcon)){
    iSecIcon = elControl.querySelector('[NM-Icon]').value;
  }else{
    elControl.querySelector('[NM-Icon]').value = iSecIcon;
  }
  var mDTS = Default(elControl.querySelector('[NM-DTS]').value,DTSNow());
  
  var mTitle = "About";
  var mHTML = "<div DTS=\""+mDTS+"\" class=\"mbscroll\">\n";
  mHTML += "\t<div class=\"mbbutton\" onclick=\"ShowNext(this)\">"+iSecIcon+" "+mTitle+"</div>\n\t<hide><hr>";

  // 20240417: StarTree: Special format for Initate node section.
  if(iSecIcon=="🌱"){
    mHTML += "\n\t\t<div class=\"mbpdc\"><b>First</b> word</div><hr class=\"mbCB mbhr\">\n";
  }else if(IsMasteryIcon(iSecIcon)){
    mHTML += "\n";
  }else{
    mHTML += "<div class=\"mbav50r mbCB mb"+mAuthor+"\"></div><b>"+mAuthor+":</b> \n";
  }
  mHTML += "\t\t<ol></ol>\n\t\t<ul></ul>\n";
  mHTML += "\t\t<div class=\"mbCB\"></div>\n";
  mHTML += "\t</hide>\n</div>";

  navigator.clipboard.writeText(mHTML);
  return mHTML;
}
function NMSetParent(el,mParentID,mParentName,mIcon){
  // 20240417: StarTree
  var elControl = SearchPS(el,"Widget");
  elControl.querySelector('[NM-ParentID]').value = mParentID;
  elControl.querySelector('[NM-ParentName]').value = mParentName;
  if(NotBlank(mIcon)){
    elControl.querySelector('[NM-Icon]').value = mIcon;
  }
  if(mParentName=="Alchemist" || mParentName=="Cleric" || mParentName=="Herald" || mParentName=="Magician" || mParentName=="Oracle" || mParentName=="Paladin"){
    elControl.querySelector('[NM-Tags]').value = "data-skill data-" + mParentName;
  }else if(NotBlank(mParentName)){    
    elControl.querySelector('[NM-Tags]').value = "data-" + mParentName;
  }else{
    // 20240620: Mikela: Erase the Tags field if mParentName is blank.
    elControl.querySelector('[NM-Tags]').value = "";
    return; // Mikela: Do not copy to clipboard after clearing.
  }  
  return NMNode(el);
}
function NMAddSPK(el){
  // 29249423: StarTree
  var curSPK = el.value.replaceAll(/[\W_]+/g,"");
  el.select();  
  if(IsBlank(curSPK)){curSPK = RandomMember();}
  if(NotBlank(el.value) && (el.value != curSPK)){el.value = curSPK;}

  // STEP: Check if the entered SPK is already on the list and if the list is full.
  var elWidget = SearchPS(el,"Widget");
  var elList = elWidget.querySelector('[NM-SPKList]');
  var mCount = 0;
  var mExist = false;
  elList.querySelectorAll('a').forEach((mTag)=>{
    if(mTag.firstElementChild.classList.contains('mb'+curSPK)){
      mTag.firstElementChild.classList.remove('mbav50t');
      mTag.firstElementChild.classList.add('mbav50trg');
      mExist = true;
    }else{
      mTag.firstElementChild.classList.remove('mbav50trg');
      mTag.firstElementChild.classList.add('mbav50t');
    }
    mCount++;
  });
  if(mExist){
    // 20240429: Also call EXP creation
    NMMsg(el);
    return;
  }
  //if(mCount >= 12){return;} // The cache list only fits 6 icons.

  // STEP: Add a new button. Highlight it only if it matches the name in the box.
  var mAVStyle = "mbav50trg";
  if(IsBlank(el.value)|| (el.value != curSPK)){mAVStyle= "mbav50t";}
  var mHTML = "<a onclick=\"NMSetSPK(this,'"+curSPK+"')\"><div class='"+mAVStyle+" mb"+curSPK+"' ></div></a>";
  elList.innerHTML = mHTML + elList.innerHTML;
  NMMsg(el);
}
function NMAddSPKev(e,el){
  // 20240423: StarTree: Assumes that the Enter key was pressed at the SPK input box.
  if(e.code!='Enter'){return;}
  NMAddSPK(el);
}
function NMNSPKRmv(el){
  // 20240429: Arcacia: Remove the selected speaker from the list.
  var elWidget = SearchPS(el,"Widget");
  var elFrame = elWidget.querySelector('[NM-SPKList]');
  elFrame.querySelectorAll('a').forEach((mTag)=>{
    if(mTag.firstElementChild.classList.contains('mbav50trg')){
      mTag.remove();
      // 20240429: Arcacia: The name in the SPK input box is not removed so that after removing a SPK, clicking on their name again will add them to the top of the queue.
      return;
    }
  });
}
function NMSetSPK(el,mSPK){
  // 20240423: StarTree: This is for when the user clicked on a SPK cache button.
  var elControl = SearchPS(el,"Widget");
  var curSPK = elControl.querySelector('[NM-SPK]').value;

  // STEP: If the button is already highlighted, and same as the input box, 
  // Clear the input box and remove the SPK cache button.
  var elSPK = el.firstElementChild;
  
  
  /* 20240429: Arcacia: This feature is annoying so it is removed.
  if(curSPK == mSPK && bHighlighted){
    elControl.querySelector('[NM-SPK]').value = "";
    el.remove();
    return;
  }*/

  // STEP: Otherwise, set the SPK and set the highlight.
  elControl.querySelector('[NM-SPK]').value = mSPK;
  var elFrame = SearchPS(el,'NM-SPKList');
  elFrame.querySelectorAll('a').forEach((mTag)=>{
    if(mTag == el){
      mTag.firstElementChild.classList.remove('mbav50t');
      mTag.firstElementChild.classList.add('mbav50trg');
    }else{
      mTag.firstElementChild.classList.remove('mbav50trg');
      mTag.firstElementChild.classList.add('mbav50t');
    }
  });

  // 20240429: Also call EXP creation
  NMMsg(el);
}
function NMGetDTS(){
  // 20240423: StarTree: Puts DTS to the clipboard.
  var mHTML = DTSNow();
  navigator.clipboard.writeText(mHTML);
  return mHTML;
}
function NMNode(el,bChatChannel){
  // 20240416: StarTree: Put the code of a new node to Clipboard.
  var elControl = SearchPS(el,"Widget");
  var mDTS = Default(elControl.querySelector('[NM-DTS]').value,DTSNow());
  mDTS = mDTS.padEnd(14,"0");
  var mPrevID=elControl.querySelector('[NM-PrevID]').value;
  var mNextID=elControl.querySelector('[NM-NextID]').value;
  var mAuthor=Default(elControl.querySelector('[NM-SPK]').value,""); 
  var mParentID=Default(elControl.querySelector('[NM-ParentID]').value,"202404162138"); 
  var mParent=Default(elControl.querySelector('[NM-ParentName]').value,"Node Maker"); 
  var mIcon=Default(elControl.querySelector('[NM-Icon]').value,"🐣"); 
  var mImg = Default(elControl.querySelector('[NM-URL]').value,"");
  if(bChatChannel){mImg=""};

  var mID = mDTS.slice(0,12);
  var mYYYYMMDD = mDTS.slice(0,8);
  var mHHMM = mDTS.slice(8,12);

  var mTitle=Default(elControl.querySelector('[NM-Title]').value,"P" + mID); 
  var mTags=Default(elControl.querySelector('[NM-Tags]').value,""); 
  if(NotBlank(mTags)){mTags = " " + mTags;}
  // 20240426: Kisaragi
  if(bChatChannel && NotBlank(mParentID)){mTags += " data-" + mParentID;}
  if(bChatChannel){if(NotBlank(mPrevID)){mTags += " data-" + mPrevID;}}

  //var mSubTitle = "Subtitle"; // 20240801: Black Removed.
  var mKids="";
  var mMusic="";
  var mHTML = "<div id=\"P" + mID + "\" date=\"" + mYYYYMMDD +"\" time=\"" + mHHMM + "\"" + mTags;
  if(bChatChannel){mHTML += " data-chat data-happy";}
  mHTML += ">\n";

  mHTML += "\t<content>";
  if(bChatChannel){
    mHTML += "\n";
    mHTML += "\t\t<msg DTS=\"" + mDTS + "\" SPK=\"" + mAuthor +"\" EXP Icon=\"" + mIcon + "\"><b>First</b> word</msg>\n"

    //mHTML += "\t\t<div class='mbav50r mbCB mb"+mAuthor+"'></div>\n";
    //mHTML += "\t\t<div class='mbpdc'><b>First</b> word</div><hr class='mbCB mbhr'>\n";
    mHTML += "\n";
    mHTML += "\t\t<mbKudo></mbKudo>\n";
    mHTML += "\t";
  }else{
    // 20240726: Evelyn: I think it is more convenient to have this.
    // 20240729: Evelyn: This is covered by the first message in RenderStart
    //mHTML += "\t\t<div class='mbpdc'><b>First</b> word</div>\n";
  }
  mHTML += "</content>\n";
  if(!bChatChannel){
    mHTML += "\t<inv></inv>\n";
  }  
  mHTML += "\t<ref></ref>\n";

  // 20240801: Black Removed subtitle.
  mHTML += "\t<node>{\"id\":\""+mID+"\",\"parentid\":\""+mParentID+"\",\"parentname\":\""+mParent+"\",\"icon\":\""+mIcon+"\",\"title\":\""+mTitle+"\",\"kids\":\""+mKids+"\",\"img\":\""+mImg+"\",\"music\":\""+mMusic+"\",\"author\":\""+mAuthor+"\"";
  if(bChatChannel){
    mHTML += ",\"prev\":\"" + mPrevID + "\"";
    mHTML += ",\"next\":\"" + mNextID + "\"";
    mHTML += ",\"participants\":\"" + mAuthor + "\"";
  }
  mHTML += "}</node>\n";
  mHTML += "</div><!--" +mTitle+"-->";

  navigator.clipboard.writeText(mHTML);
  return mHTML;
}
function NMRES(el){
  // 20240728: StarTree: Makes a generic RES object with the item code filled.
  var elWidget = SearchPS(el,"Widget");
  var mDTS = Default(elWidget.querySelector('[NM-DTS]').value,DTSNow());
  // 20240802: StarTere: Don't add an icon by default.
  //var mIcon = Default(elWidget.querySelector('[NM-Icon]').value,"📌"); 
  //var mHTML = "<res icon=\""+mIcon+"\" item=\""+DTC(mDTS)+"\" title=\"Title\" tags=\"\">\n</res>";
  var mHTML = "<res item=\""+DTC(mDTS)+"\" title=\"Title\" star=\"\" tags=\"\">\n</res>";
  navigator.clipboard.writeText(mHTML);
}
function NMURL(el,mCBText){
  // 20241026: StarTree: This creates the URL html string and put it in the clipboard.
  var mURL = "";  
  // 20241026: StarTree: If the mCBText field is specified, use it and trim off the part with a question mark.
  if(NotBlank(mCBText)){
    var mSplit = mCBText.split("?");
    mURL = mSplit[0];
  }else{
    var elControl = SearchPS(el,"Widget");
    mURL = elControl.querySelector('[NM-URL]').value;
  }
  
  // 20241026: StarTree: If the URL text box is blank, get the content from clipboard
  if(IsBlank(mURL)){
    mURL = navigator.clipboard.readText().then((mCBText)=>{
      if(NotBlank(mCBText)){NMURL(el,mCBText)}
    })
    return;
  }
  var mIcon="";//elControl.querySelector('[NM-Icon]').value;
  if(IsBlank(mIcon)){
    if(mURL.includes("&list=")){
      mIcon = "🎧";
    }else if(mURL.includes("youtube.com")){
      mIcon = "📺";
    }else if(mURL.includes("podcast")){
      mIcon = "📻";
    }else if(mURL.includes("nextdoor")){
      mIcon = "🏡";      
    }else{
      mIcon = "🔗";
    }
  }
  //var mHTML = "<macro>{\"cmd\":\"url\",\"url\":\""+mURL+"\",\"desc\":\""+mIcon+"\"}</macro>";  
  var mHTML = "<url>" + mURL+ "</url>";  
  navigator.clipboard.writeText(mHTML);
  return mHTML;
}
function NodeMarkCycle(el,iNodeID){
  // 20240330: StarTree: For saving the node marking
  
  var curMark = el.innerHTML; 
  // 20240823: Patricia: Get the icon at Node Maker widget.
  var nextMark = Default(NMWidgetIcon(),"✅");
  


  // 20240823: Ledia: Simplified List □
  if(curMark.indexOf(nextMark)==-1){ // 20240810: Natalie: Need to work with custom icon.
    curMark = nextMark;
  }else{
    curMark = "□"
  }

  /*
  if(curMark.indexOf("🤍")!=-1){ // 20240810: Natalie: Need to work with custom icon.
    curMark = "📌"
  }else if(curMark.indexOf("📌")!=-1){
    curMark = "✅"
  }else if(curMark.indexOf("✅")!=-1){
    curMark = "🌱"
  }else if(curMark.indexOf("🌱")!=-1){
    curMark = "🐣"
  }else if(curMark.indexOf("🐣")!=-1){
    curMark = "🐤"
  }else if(curMark.indexOf("🐤")!=-1){
    curMark = "🕊️"
  }else if(curMark.indexOf("🕊️")!=-1){
    curMark = "🦉"
  }else if(curMark.indexOf("🦉")!=-1){
    curMark = "🦅"
  }else if(curMark.indexOf("🦅")!=-1){
    curMark = "❌"
  }else if(curMark.indexOf("❌")!=-1){
    curMark = "🤍"
  }else{
    curMark = "🤍"
  }
  */

  // 20240821: StarTree: To fix a scroll bug.
  curMark = MacroIcons("",curMark); // 20240810: Natalie: For custom icons.

  
  // STEP: 20240402: StarTree: change the icon for all instances on display.
  var mVList = document.querySelectorAll('#P' + iNodeID + "-V");
  for(i=0;i<mVList.length;i++){
    mVList[i].innerHTML = curMark;
    mVList[i].style.filter = "sepia(0%)";
  }
  
  localStorage.setItem(iNodeID + "-V",curMark);
  localStorage.setItem(iNodeID + "-V-DTS",DTSNow());
  
}
function NodeMarkLoad(iNodeID){
  // 20240330: StarTree: For loading the node marking
  if(!NodeMarkCookieCheck){return;}
  var mMark = localStorage.getItem(iNodeID + "-V");
  if(NotBlank(mMark)){
    return mMark;
  }
  return "□";//20240823: Patricia: Set to the blank box.
}
function NodeMarkLoadDTS(iNodeID){
  // 20240426: Zoey: Returns an integer.
  if(!NodeMarkCookieCheck){return;}
  var mMark = localStorage.getItem(iNodeID + "-V-DTS");
  if(NotBlank(mMark)){
    return DTSPadding(mMark);
  }
  return 0;
}
function NodeMarkUseCookie(el,iNoIcon){
  var elMain = document.querySelector('[main]');
  // 20240415: StarTree: When this is called at a banner, just ask once.
  /*if(iNoIcon){
    var mAsked = elMain.getAttribute('asked');
    if(NotBlank(mAsked)){return;}
    elMain.setAttribute('asked',true);
  }*/

  // 20240330: StarTree: For saving the the node marking
  var bCookieEnabled = NodeMarkCookieCheck();
  if(!bCookieEnabled){
    bCookieEnabled = confirm("Would you like to enable marking and showing where you have visited using local storage of your browser?");
  }else{ // Cookie is enabled, does user want to disable?
    bCookieEnabled = !confirm("Would you like to stop showing and saving node visit marking to local storage of your browser?");
  }
  if(bCookieEnabled){
    elMain.setAttribute("CookieEnabled","true");
    if(iNoIcon){return;}
    el.innerHTML = "🍯✅";
  }else{
    elMain.setAttribute("CookieEnabled","false");
    if(iNoIcon){return;}
    el.innerHTML = "🍯⛔";
  }
}
function TACount(el,mInc){
  // 20240423: LRRH
  var elTA = TAGet(el);
  var mCurValue = Number(TAGetSelText(elTA));
  if(mInc == 0){
    TAReplace(elTA,String(0));
    mCurValue = 0;
  }else{
    mCurValue += Number(mInc);
    TAReplace(elTA, String(mCurValue));
  }
}
function TAGet(el){
  // 20240423: LRRH
  return SearchPS(el,"Widget").querySelector('[textarea]')
}
function TAGetSelText(el){
  // 20240423: LRRH: el here is the textarea.
  return el.value.slice(el.selectionStart,el.selectionEnd);;
}
function TAInsert(el,mStr){
  // 20240423: P4
  var mStart = el.selectionStart;
  var mEnd = el.selectionEnd;
  var mText = el.value;
  el.value = mText.slice(0,mStart) + mStr + mText.slice(mEnd);
  el.selectionStart = el.selectionEnd = mEnd + mStr.length;
  el.focus();
}
function TAInsertDocLen(el){
  // 20240427: P4
  var elTA = TAGet(el);
  var mHead = document.head.outerHTML.length;
  var mBody = document.body.outerHTML.length;
  try{
    var mArchive = document.querySelector('archives').outerHTML.length;
  }catch(e){
    mArchive = 0;
  }
  var mHTML = DTSNow() + "|Head:"+ mHead + " Body:"+mBody + " Archive:" + mArchive + "\n";
  TAInsert(elTA,mHTML);
}
function TAInsertDTS(el){
  // 20240423: P4  
  var elTA = TAGet(el);
  TAInsert(elTA,DTSNow());
}
function TAInsertMsg(el){
  // 20240806: StarTree
  // Use the selected speaker and icon at the NodeMaker widget.
  // If the clipboard has an URL, use it as an url in the message.
  // STEP: Locate the footer:
  var mSPK = "";  var mIcon = "";
  try{
    var elWidget = document.querySelector(".footer div[widget='20240416213800']");
    var elIcon = elWidget.querySelector("input[nm-icon]");
    mIcon = Default(elIcon.value,"📌");
    var mSPK2 = elWidget.querySelector("div.mbav50trg");
    var mSPKs = mSPK2.outerHTML.split(" ");
    mSPK = mSPKs[1].slice(9);
  }catch{}
  navigator.clipboard.readText().then((mCBText)=>{
    var mHTML = "<msg DTS=\"" + DTSNow() + "\" SPK=\"" + mSPK +"\" EXP Icon=\"" + mIcon +"\">";
    if(mCBText.slice(0,4)=="http"){
      mHTML += " <url>" + mCBText + "</url>";
    }
    mHTML += "</msg>\n";
    TAInsert(TAGet(el),mHTML);
  });
}
function TAInsertResource(el){
  // 20240806: StarTree
  // If the clipboard has an URL, use it for the src field.
  navigator.clipboard.readText().then((mCBText)=>{
    var mHTML = "<res item=\""+DTC(DTSNow())+"\" title=\"Title\" tags=\"\"";
    if(mCBText.slice(0,4)=="http"){
      mHTML += " src=\"" + mCBText + "\"";
    }
    mHTML += ">\n";
    mHTML += "</res>\n";
    TAInsert(TAGet(el),mHTML);
  });
}
function TAInsertURL(el){
  // 20240806: StarTree: Assumes that the clipboard has an URL.
  navigator.clipboard.readText().then((mCBText)=>{
    var mHTML = "<url>" + mCBText + "</url>";
    TAInsert(TAGet(el),mHTML);
  });
}
function TAReplace(el,mStr){
  // 20240423: LRRH
  mStr = String(mStr);
  var mStart = el.selectionStart;
  var mEnd = el.selectionEnd;
  var mText = el.value;
  el.value = mText.slice(0,mStart) + mStr + mText.slice(mEnd);
  el.selectionStart = mStart;
  el.selectionEnd = mStart + mStr.length;
  el.focus();
}
function TextAreaUseCookie(el){
  // 20240330: StarTree: Cookie TextArea
  var elWidget = SearchPS(el,"Widget");
  var elTextArea = elWidget.querySelector('[textarea]');
  var bCookieEnabled = (elWidget.getAttribute('CookieEnabled')=="true");

  // 20240804: StarTree: Check if the current area has NodeEdit content.
  if(NotBlank(elWidget.getAttribute("NodeEditID"))){
    bCookieEnabled = confirm("Switch to the regular local storage Notepad?");
    if(!bCookieEnabled){return;}
  }else{
    if(!bCookieEnabled){
      bCookieEnabled = confirm("Would you allow saving notepad content to local storage on your browser?");
    }else{ // Cookie is enabled, does user want to disable?
      bCookieEnabled = !confirm("Would you like to stop saving notepad content to local storage on your browser?");
    }
  }
  if(bCookieEnabled){
    elWidget.setAttribute("CookieEnabled","true");
    elWidget.setAttribute("NodeEditID","");
    el.innerHTML = MacroIcons(null,"🍯✅");
    TextAreaLoad(elTextArea);
  }else{
    elWidget.setAttribute("CookieEnabled","false");
    el.innerHTML = MacroIcons(null,"🍯⛔");
  }
}
function ToggleHeight(el,iDefault){
  // 20240827: James: Toggle the height between the default and the full height.
  iDefault = Default(iDefault,"263px");
  var elControl = SearchPS(el,"control");
  var elContainer = elControl.nextElementSibling;
  if(elContainer.style.overflowY=="auto"){
    elContainer.style.overflowY = "visible";
    elContainer.style.resize = "none";
    elContainer.style.maxHeight = "none";
  }else{
    elContainer.style.overflowY = "auto";
    elContainer.style.resize = "vertical";
    elContainer.style.maxHeight = iDefault;
  }

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
  ToggleTS(elSource,elTarget)
}
function ToggleNextPP(elThis){
  // 20240728: StarTree
  var elTarget = elThis.parentNode.previousElementSibling;
  var elSource = elThis.nextElementSibling;
  ToggleTS(elSource,elTarget)
}
function ToggleTS(elSource,elTarget){
  // 20240728: StarTree
  if(elTarget.innerHTML != elSource.innerHTML){
    elTarget.innerHTML = elSource.innerHTML;
    elTarget.classList.remove("mbhide");
  }else{
    ToggleHide(elTarget);
  }
}
function ShowLCInline(el){
  // 20240501: Cardinal
  ShowElInline(el.lastElementChild);
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
function ShowEl(eTar,bNoMacro){
  //20230220: StarTree: Fixed the double click bug with getComputedStyle
  // 20240827: James: Check flex direction to fix the scroll bug.
  var elFrame = SearchPS(eTar,"sortby");  
  var mSH1, mST, mSH2, mDiff;
  if(NotBlank(elFrame)){
    mSH1 = elFrame.scrollHeight;
    mST = elFrame.scrollTop    ;
    //DEBUG(mST + "|" + mSH1);
  }
  
  
  if(window.getComputedStyle(eTar).display === "none"){
    if(!(bNoMacro==true)){
      Macro(eTar);
    }
    
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
  if(NotBlank(elFrame)){
    mSH2 = elFrame.scrollHeight;
    mDiff = mSH2 - mSH1;
    if(elFrame.style.flexDirection=="column-reverse"){
      elFrame.scrollTop = mST - mDiff;
      
    }
  }
}
function ShowElInline(eTar){
  // 20240827: James: Check flex direction to fix the scroll bug.
  var elFrame = SearchPS(eTar,"sortby");  
  var mSH1, mST, mSH2, mDiff;
  if(NotBlank(elFrame)){
    mSH1 = elFrame.scrollHeight;
    mST = elFrame.scrollTop    ;
  }
  
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
  if(NotBlank(elFrame)){
    mSH2 = elFrame.scrollHeight;
    mDiff = mSH2 - mSH1;
    if(elFrame.style.flexDirection=="column-reverse"){
      elFrame.scrollTop = mST - mDiff;
    }
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
  // 20231224: StarTree: Also hide the last child of a board, which is the display area for discussion.
  ShowNextInline(el);
  var mBoard = SearchPS(el,'board');
  // 20240909: StarTree: It is not cear what the following is for. Disabled it for profile node display.
  //ShowEl(mBoard.lastElementChild.previousElementSibling.lastElementChild,true);
}
function ShowPrep(el){
  // 20230226: StarTree: Created for Side Listing layout.
  //           If the current next element is visible, show the next next element.
  // 20230307: StarTree: Search for the child of class "mbPrep" and swap its content with the next2 sibling.
  var elNext = el.nextElementSibling;
  var elPrep = elNext.getElementsByClassName("mbPrep");

  
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
	elThis.innerHTML = "📙"
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
          el.classList.add("mbhide");
        } else {      
          el.style.display= "";
          el.classList.remove("mbhide");
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

function TextQSL(elButton){
  // 20240401: StarTree: Run QSL with the text in the first input box in the control.
  var elControl = SearchPS(elButton,'control');
  var elInput = elControl.querySelector('input');
  // 20240410: StarTree: Changed implementation to do a general text search.
  QSL(elButton,"[id][date][time]:contains(" + elInput.value +")");
  return;
}
function TextQSLTag(elButton){
  // 20240401: StarTree: Run QSL with the text in the first input box in the control.
  var elControl = SearchPS(elButton,'control');
  var elInput = elControl.querySelector('input');
  var mQuery = "[data-" + elInput.value + "]";
  QSL(elButton,mQuery);
}
function TextSearchPN(elSearchBox){  
  var mKeyword = elSearchBox.value.toUpperCase().trim();
  var mScope = elSearchBox.parentNode.nextElementSibling;
  TextSearchEL(mScope,mKeyword);
  SearchRecount(elSearchBox);
}
function TextSearchPS(elSearchBox,iKeyword){  
  // 20240609: Black: Overload: when the iKeyword is present, use it verbatim.
  if(IsBlank(iKeyword)){
    iKeyword = elSearchBox.value.toUpperCase().trim();
  } else{
    iKeyword = iKeyword.toUpperCase();
  }
  var mScope = SearchPS(elSearchBox,'control').nextElementSibling;
  TextSearchEL(mScope,iKeyword);
  QSLShowTag(mScope);
  SearchRecount(elSearchBox);
}

function TextSearchPNEV(e,elSearchBox){
  // 20240401: StarTree: 
  if(e.code=='Enter'){
    TextQSL(elSearchBox);
    return;
  }
  var mKeyword = elSearchBox.value.toUpperCase().trim();
  var mScope = elSearchBox.parentNode.nextElementSibling;
  TextFilter(mScope,mKeyword,"div");
  TextFilter(mScope,mKeyword,"mbNote");
  TextFilter(mScope,mKeyword,"li");
}
function TextSearchEL(mScope,mKeyword){
  // 20240608: Sasha
  
  TextFilter(mScope,mKeyword,"div");
  TextFilter(mScope,mKeyword,"mbNote");
  TextFilter(mScope,mKeyword,"li");
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
function getRandomInt(min, max, bTop) {
  // 20230412: Evelyn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  min = Math.ceil(min);
  max = Math.floor(max);
  if(bTop){ // 20240909: StarTree: Adds the option to include the max number.
    return Math.round(Math.random() * (max - min) + min);  
  }
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
// WIDGETS.JS
Function&&Function.prototype&&Function.prototype.bind&&(/(MSIE ([6789]|10|11))|Trident/.test(navigator.userAgent)||(window.__twttr&&window.__twttr.widgets&&window.__twttr.widgets.loaded&&window.twttr.widgets.load&&window.twttr.widgets.load(),window.__twttr&&window.__twttr.widgets&&window.__twttr.widgets.init||function(t){function e(e){for(var n,i,o=e[0],s=e[1],a=0,c=[];a<o.length;a++)i=o[a],r[i]&&c.push(r[i][0]),r[i]=0;for(n in s)Object.prototype.hasOwnProperty.call(s,n)&&(t[n]=s[n]);for(u&&u(e);c.length;)c.shift()()}var n={},r={0:0};function i(e){if(n[e])return n[e].exports;var r=n[e]={i:e,l:!1,exports:{}};return t[e].call(r.exports,r,r.exports,i),r.l=!0,r.exports}i.e=function(t){var e=[],n=r[t];if(0!==n)if(n)e.push(n[2]);else{var o=new Promise(function(e,i){n=r[t]=[e,i]});e.push(n[2]=o);var s,a=document.getElementsByTagName("head")[0],u=document.createElement("script");u.charset="utf-8",u.timeout=120,i.nc&&u.setAttribute("nonce",i.nc),u.src=function(t){return i.p+"js/"+({1:"dm_button",2:"button",3:"moment",4:"periscope_on_air",5:"timeline",6:"tweet"}[t]||t)+"."+{1:"f53535f7e1a7738ec410842054f2de1c",2:"856debeac157d9669cf51e73a08fbc93",3:"cd19c6b67c2f5cf62643a0c94915ac9a",4:"59d430bc7d44af5536b78dbdd566058f",5:"e108540dddc96e4b707f5cf259a582d7",6:"d7aeb21a88e025d2ea5f5431a103f586"}[t]+".js"}(t),s=function(e){u.onerror=u.onload=null,clearTimeout(c);var n=r[t];if(0!==n){if(n){var i=e&&("load"===e.type?"missing":e.type),o=e&&e.target&&e.target.src,s=new Error("Loading chunk "+t+" failed.\n("+i+": "+o+")");s.type=i,s.request=o,n[1](s)}r[t]=void 0}};var c=setTimeout(function(){s({type:"timeout",target:u})},12e4);u.onerror=u.onload=s,a.appendChild(u)}return Promise.all(e)},i.m=t,i.c=n,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)i.d(n,r,function(e){return t[e]}.bind(null,r));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="https://platform.twitter.com/",i.oe=function(t){throw console.error(t),t};var o=window.__twttrll=window.__twttrll||[],s=o.push.bind(o);o.push=e,o=o.slice();for(var a=0;a<o.length;a++)e(o[a]);var u=s;i(i.s=82)}([function(t,e,n){var r=n(1);function i(t,e){var n;for(n in t)t.hasOwnProperty&&!t.hasOwnProperty(n)||e(n,t[n]);return t}function o(t){return{}.toString.call(t).match(/\s([a-zA-Z]+)/)[1].toLowerCase()}function s(t){return t===Object(t)}function a(t){var e;if(!s(t))return!1;if(Object.keys)return!Object.keys(t).length;for(e in t)if(t.hasOwnProperty(e))return!1;return!0}function u(t){return t?Array.prototype.slice.call(t):[]}t.exports={aug:function(t){return u(arguments).slice(1).forEach(function(e){i(e,function(e,n){t[e]=n})}),t},async:function(t,e){r.setTimeout(function(){t.call(e||null)},0)},compact:function t(e){return i(e,function(n,r){s(r)&&(t(r),a(r)&&delete e[n]),void 0!==r&&null!==r&&""!==r||delete e[n]}),e},contains:function(t,e){return!(!t||!t.indexOf)&&t.indexOf(e)>-1},forIn:i,isObject:s,isEmptyObject:a,toType:o,isType:function(t,e){return t==o(e)},toRealArray:u}},function(t,e){t.exports=window},function(t,e,n){var r=n(16),i=/(?:^|(?:https?:)?\/\/(?:www\.)?twitter\.com(?::\d+)?(?:\/intent\/(?:follow|user)\/?\?screen_name=|(?:\/#!)?\/))@?([\w]+)(?:\?|&|$)/i,o=/(?:^|(?:https?:)?\/\/(?:www\.)?twitter\.com(?::\d+)?\/(?:#!\/)?[\w_]+\/status(?:es)?\/)(\d+)/i,s=/^http(s?):\/\/(\w+\.)*twitter\.com([:/]|$)/i,a=/^http(s?):\/\/(ton|pbs)\.twimg\.com/,u=/^#?([^.,<>!\s/#\-()'"]+)$/,c=/twitter\.com(?::\d{2,4})?\/intent\/(\w+)/,d=/^https?:\/\/(?:www\.)?twitter\.com\/\w+\/timelines\/(\d+)/i,f=/^https?:\/\/(?:www\.)?twitter\.com\/i\/moments\/(\d+)/i,l=/^https?:\/\/(?:www\.)?twitter\.com\/(\w+)\/(?:likes|favorites)/i,h=/^https?:\/\/(?:www\.)?twitter\.com\/(\w+)\/lists\/([\w-%]+)/i,p=/^https?:\/\/(?:www\.)?twitter\.com\/i\/live\/(\d+)/i,m=/^https?:\/\/syndication\.twitter\.com\/settings/i,v=/^https?:\/\/(localhost|platform)\.twitter\.com(?::\d+)?\/widgets\/widget_iframe\.(.+)/i,g=/^https?:\/\/(?:www\.)?twitter\.com\/search\?q=(\w+)/i;function w(t){return"string"==typeof t&&i.test(t)&&RegExp.$1.length<=20}function y(t){if(w(t))return RegExp.$1}function b(t,e){var n=r.decodeURL(t);if(e=e||!1,n.screen_name=y(t),n.screen_name)return r.url("https://twitter.com/intent/"+(e?"follow":"user"),n)}function _(t){return"string"==typeof t&&u.test(t)}function E(t){return"string"==typeof t&&o.test(t)}t.exports={isHashTag:_,hashTag:function(t,e){if(e=void 0===e||e,_(t))return(e?"#":"")+RegExp.$1},isScreenName:w,screenName:y,isStatus:E,status:function(t){return E(t)&&RegExp.$1},intentForProfileURL:b,intentForFollowURL:function(t){return b(t,!0)},isTwitterURL:function(t){return s.test(t)},isTwimgURL:function(t){return a.test(t)},isIntentURL:function(t){return c.test(t)},isSettingsURL:function(t){return m.test(t)},isWidgetIframeURL:function(t){return v.test(t)},isSearchUrl:function(t){return g.test(t)},regexen:{profile:i},momentId:function(t){return f.test(t)&&RegExp.$1},collectionId:function(t){return d.test(t)&&RegExp.$1},intentType:function(t){return c.test(t)&&RegExp.$1},likesScreenName:function(t){return l.test(t)&&RegExp.$1},listScreenNameAndSlug:function(t){var e,n,r;if(h.test(t)){e=RegExp.$1,n=RegExp.$2;try{r=decodeURIComponent(n)}catch(t){}return{ownerScreenName:e,slug:r||n}}return!1},eventId:function(t){return p.test(t)&&RegExp.$1}}},function(t,e,n){var r=n(6);t.exports=function(){var t=this;this.promise=new r(function(e,n){t.resolve=e,t.reject=n})}},function(t,e){t.exports=document},function(t,e,n){var r=n(0),i=[!0,1,"1","on","ON","true","TRUE","yes","YES"],o=[!1,0,"0","off","OFF","false","FALSE","no","NO"];function s(t){return void 0!==t&&null!==t&&""!==t}function a(t){return c(t)&&t%1==0}function u(t){return c(t)&&!a(t)}function c(t){return s(t)&&!isNaN(t)}function d(t){return r.contains(o,t)}function f(t){return r.contains(i,t)}t.exports={hasValue:s,isInt:a,isFloat:u,isNumber:c,isString:function(t){return"string"===r.toType(t)},isArray:function(t){return s(t)&&"array"==r.toType(t)},isTruthValue:f,isFalseValue:d,asInt:function(t){if(a(t))return parseInt(t,10)},asFloat:function(t){if(u(t))return t},asNumber:function(t){if(c(t))return t},asBoolean:function(t){return!(!s(t)||!f(t)&&(d(t)||!t))}}},function(t,e,n){var r=n(1),i=n(20),o=n(45);i.hasPromiseSupport()||(r.Promise=o),t.exports=r.Promise},function(t,e,n){var r=n(0);t.exports=function(t,e){var n=Array.prototype.slice.call(arguments,2);return function(){var i=r.toRealArray(arguments);return t.apply(e,n.concat(i))}}},function(t,e){t.exports=location},function(t,e,n){var r=n(47);t.exports=new r("__twttr")},function(t,e,n){var r=n(0),i=/\b([\w-_]+)\b/g;function o(t){return new RegExp("\\b"+t+"\\b","g")}function s(t,e){t.classList?t.classList.add(e):o(e).test(t.className)||(t.className+=" "+e)}function a(t,e){t.classList?t.classList.remove(e):t.className=t.className.replace(o(e)," ")}function u(t,e){return t.classList?t.classList.contains(e):r.contains(c(t),e)}function c(t){return r.toRealArray(t.classList?t.classList:t.className.match(i))}t.exports={add:s,remove:a,replace:function(t,e,n){if(t.classList&&u(t,e))return a(t,e),void s(t,n);t.className=t.className.replace(o(e),n)},toggle:function(t,e,n){return void 0===n&&t.classList&&t.classList.toggle?t.classList.toggle(e,n):(n?s(t,e):a(t,e),n)},present:u,list:c}},function(t,e,n){var r=n(19),i=n(5),o=n(16),s=n(0),a=n(108);t.exports=function(t){var e=t.href&&t.href.split("?")[1],n=e?o.decode(e):{},u={lang:a(t),width:t.getAttribute("data-width")||t.getAttribute("width"),height:t.getAttribute("data-height")||t.getAttribute("height"),related:t.getAttribute("data-related"),partner:t.getAttribute("data-partner")};return i.asBoolean(t.getAttribute("data-dnt"))&&r.setOn(),s.forIn(u,function(t,e){var r=n[t];n[t]=i.hasValue(r)?r:e}),s.compact(n)}},function(t,e,n){var r=n(109),i=n(21);t.exports=function(){var t="data-twitter-extracted-"+i.generate();return function(e,n){return r(e,n).filter(function(e){return!e.hasAttribute(t)}).map(function(e){return e.setAttribute(t,"true"),e})}}},function(t,e){function n(t,e,n,r,i,o,s){this.factory=t,this.Sandbox=e,this.srcEl=o,this.targetEl=i,this.parameters=r,this.className=n,this.options=s}n.prototype.destroy=function(){this.srcEl=this.targetEl=null},t.exports=n},function(t,e){t.exports={DM_BUTTON:"twitter-dm-button",FOLLOW_BUTTON:"twitter-follow-button",HASHTAG_BUTTON:"twitter-hashtag-button",MENTION_BUTTON:"twitter-mention-button",MOMENT:"twitter-moment",PERISCOPE:"periscope-on-air",SHARE_BUTTON:"twitter-share-button",TIMELINE:"twitter-timeline",TWEET:"twitter-tweet"}},function(t,e,n){var r=n(6),i=n(19),o=n(50),s=n(34),a=n(5),u=n(0);t.exports=function(t,e,n){var c;return t=t||[],e=e||{},c="ƒ("+t.join(", ")+", target, [options]);",function(){var d,f,l,h,p=Array.prototype.slice.apply(arguments,[0,t.length]),m=Array.prototype.slice.apply(arguments,[t.length]);return m.forEach(function(t){t&&(t.nodeType!==Node.ELEMENT_NODE?u.isType("function",t)?d=t:u.isType("object",t)&&(f=t):l=t)}),p.length!==t.length||0===m.length?(d&&u.async(function(){d(!1)}),r.reject(new Error("Not enough parameters. Expected: "+c))):l?(f=u.aug({},f||{},e),t.forEach(function(t){f[t]=p.shift()}),a.asBoolean(f.dnt)&&i.setOn(),h=s.getExperiments().then(function(t){return o.addWidget(n(f,l,void 0,t))}),d&&h.then(d,function(){d(!1)}),h):(d&&u.async(function(){d(!1)}),r.reject(new Error("No target element specified. Expected: "+c)))}}},function(t,e,n){var r=n(5),i=n(0);function o(t){return encodeURIComponent(t).replace(/\+/g,"%2B").replace(/'/g,"%27")}function s(t){return decodeURIComponent(t)}function a(t){var e=[];return i.forIn(t,function(t,n){var s=o(t);i.isType("array",n)||(n=[n]),n.forEach(function(t){r.hasValue(t)&&e.push(s+"="+o(t))})}),e.sort().join("&")}function u(t){var e={};return t?(t.split("&").forEach(function(t){var n=t.split("="),r=s(n[0]),o=s(n[1]);if(2==n.length){if(!i.isType("array",e[r]))return r in e?(e[r]=[e[r]],void e[r].push(o)):void(e[r]=o);e[r].push(o)}}),e):{}}t.exports={url:function(t,e){return a(e).length>0?i.contains(t,"?")?t+"&"+a(e):t+"?"+a(e):t},decodeURL:function(t){var e=t&&t.split("?");return 2==e.length?u(e[1]):{}},decode:u,encode:a,encodePart:o,decodePart:s}},function(t,e,n){var r=n(90),i=n(3),o=n(0);function s(t,e){return function(){try{e.resolve(t.call(this))}catch(t){e.reject(t)}}}t.exports={sync:function(t,e){t.call(e)},read:function(t,e){var n=new i;return r.read(s(t,n),e),n.promise},write:function(t,e){var n=new i;return r.write(s(t,n),e),n.promise},defer:function(t,e,n){var a=new i;return o.isType("function",t)&&(n=e,e=t,t=1),r.defer(t,s(e,a),n),a.promise}}},function(t,e,n){var r=n(8),i=n(1),o=n(0),s={},a=o.contains(r.href,"tw_debug=true");function u(){}function c(){}function d(){return i.performance&&+i.performance.now()||+new Date}function f(t,e){if(i.console&&i.console[t])switch(e.length){case 1:i.console[t](e[0]);break;case 2:i.console[t](e[0],e[1]);break;case 3:i.console[t](e[0],e[1],e[2]);break;case 4:i.console[t](e[0],e[1],e[2],e[3]);break;case 5:i.console[t](e[0],e[1],e[2],e[3],e[4]);break;default:0!==e.length&&i.console.warn&&i.console.warn("too many params passed to logger."+t)}}t.exports={devError:u,devInfo:c,devObject:function(t,e){},publicError:function(){f("error",o.toRealArray(arguments))},publicLog:function(){f("info",o.toRealArray(arguments))},publicWarn:function(){f("warn",o.toRealArray(arguments))},time:function(t){a&&(s[t]=d())},timeEnd:function(t){a&&s[t]&&(d(),s[t])}}},function(t,e,n){var r=n(4),i=n(8),o=n(38),s=n(94),a=n(5),u=n(33),c=!1,d=/https?:\/\/([^/]+).*/i;t.exports={setOn:function(){c=!0},enabled:function(t,e){return!!(c||a.asBoolean(u.val("dnt"))||s.isUrlSensitive(e||i.host)||o.isFramed()&&s.isUrlSensitive(o.rootDocumentLocation())||(t=d.test(t||r.referrer)&&RegExp.$1)&&s.isUrlSensitive(t))}}},function(t,e,n){var r=n(4),i=n(83),o=n(1),s=n(0),a=i.userAgent;function u(t){return/(Trident|MSIE|Edge[/ ]?\d)/.test(t=t||a)}t.exports={retina:function(t){return(t=t||o).devicePixelRatio?t.devicePixelRatio>=1.5:!!t.matchMedia&&t.matchMedia("only screen and (min-resolution: 144dpi)").matches},anyIE:u,ie9:function(t){return/MSIE 9/.test(t=t||a)},ie10:function(t){return/MSIE 10/.test(t=t||a)},ios:function(t){return/(iPad|iPhone|iPod)/.test(t=t||a)},android:function(t){return/^Mozilla\/5\.0 \(Linux; (U; )?Android/.test(t=t||a)},canPostMessage:function(t,e){return t=t||o,e=e||a,t.postMessage&&!(u(e)&&t.opener)},touch:function(t,e,n){return t=t||o,e=e||i,n=n||a,"ontouchstart"in t||/Opera Mini/.test(n)||e.msMaxTouchPoints>0},cssTransitions:function(){var t=r.body.style;return void 0!==t.transition||void 0!==t.webkitTransition||void 0!==t.mozTransition||void 0!==t.oTransition||void 0!==t.msTransition},hasPromiseSupport:function(){return!!(o.Promise&&o.Promise.resolve&&o.Promise.reject&&o.Promise.all&&o.Promise.race&&(new o.Promise(function(e){t=e}),s.isType("function",t)));var t},hasIntersectionObserverSupport:function(){return!!o.IntersectionObserver},hasPerformanceInformation:function(){return o.performance&&o.performance.getEntriesByType}}},function(t,e){var n="i",r=0,i=0;t.exports={generate:function(){return n+String(+new Date)+Math.floor(1e5*Math.random())+r++},deterministic:function(){return n+String(i++)}}},function(t,e,n){var r=n(46),i=n(49),o=n(0);t.exports=o.aug(r.get("events")||{},i.Emitter)},function(t,e,n){var r=n(6),i=n(3);function o(t,e){return t.then(e,e)}function s(t){return t instanceof r}t.exports={always:o,allResolved:function(t){var e;return void 0===t?r.reject(new Error("undefined is not an object")):Array.isArray(t)?(e=t.length)?new r(function(n,r){var i=0,o=[];function a(){(i+=1)===e&&(0===o.length?r():n(o))}function u(t){o.push(t),a()}t.forEach(function(t){s(t)?t.then(u,a):u(t)})}):r.resolve([]):r.reject(new Error("Type error"))},some:function(t){var e;return e=(t=t||[]).length,t=t.filter(s),e?e!==t.length?r.reject("non-Promise passed to .some"):new r(function(e,n){var r=0;function i(){(r+=1)===t.length&&n()}t.forEach(function(t){t.then(e,i)})}):r.reject("no promises passed to .some")},isPromise:s,allSettled:function(t){function e(){}return r.all((t||[]).map(function(t){return o(t,e)}))},timeout:function(t,e){var n=new i;return setTimeout(function(){n.reject(new Error("Promise timed out"))},e),t.then(function(t){n.resolve(t)},function(t){n.reject(t)}),n.promise}}},function(t,e,n){var r=n(1).JSON;t.exports={stringify:r.stringify||r.encode,parse:r.parse||r.decode}},function(t,e,n){var r=n(39),i=n(97),o=n(7);(r=Object.create(r)).build=o(r.build,null,i),t.exports=r},function(t,e,n){var r=n(49).makeEmitter();t.exports={emitter:r,START:"start",ALL_WIDGETS_RENDER_START:"all_widgets_render_start",ALL_WIDGETS_RENDER_END:"all_widgets_render_end",ALL_WIDGETS_AND_IMAGES_LOADED:"all_widgets_and_images_loaded"}},function(t,e,n){var r=n(9),i=n(102),o="https://syndication.twitter.com",s="https://platform.twitter.com",a=["https://syndication.twitter.com","https://cdn.syndication.twimg.com","https://localhost.twitter.com:8444"],u=["https://syndication.twitter.com","https://localhost.twitter.com:8445"],c=["https://platform.twitter.com","https://localhost.twitter.com",/^https:\/\/ton\.local\.twitter\.com\/syndication-internal\/embed-iframe\/[0-9A-Za-z_-]+\/app/],d=function(t,e){return t.some(function(t){return t instanceof RegExp?t.test(e):t===e})},f=function(){var t=r.get("backendHost");return t&&d(a,t)?t:"https://cdn.syndication.twimg.com"},l=function(){var t=r.get("settingsSvcHost");return t&&d(u,t)?t:o};function h(t,e){var n=[t];return e.forEach(function(t){n.push(function(t){var e=(t||"").toString(),n="/"===e.slice(0,1)?1:0,r=function(t){return"/"===t.slice(-1)}(e)?-1:void 0;return e.slice(n,r)}(t))}),n.join("/")}t.exports={cookieConsent:function(t){var e=t||[];return e.unshift("cookie/consent"),h(l(),e)},embedIframe:function(t,e){var n=t||[],o=s,a=r.get("embedIframeURL");return a&&d(c,a)?h(a,n)+".html":(n.unshift(i.getBaseURLPath(e)),h(o,n)+".html")},embedService:function(t){var e=t||[],n=o;return e.unshift("srv"),h(n,e)},eventVideo:function(t){var e=t||[];return e.unshift("video/event"),h(f(),e)},grid:function(t){var e=t||[];return e.unshift("grid/collection"),h(f(),e)},moment:function(t){var e=t||[];return e.unshift("moments"),h(f(),e)},settings:function(t){var e=t||[];return e.unshift("settings"),h(l(),e)},settingsScribe:function(t){var e=t||[];return e.unshift("i/jot/embeds"),h(l(),e)},timeline:function(t){var e=t||[];return e.unshift("timeline"),h(f(),e)},tweetBatch:function(t){var e=t||[];return e.unshift("tweets.json"),h(f(),e)},video:function(t){var e=t||[];return e.unshift("widgets/video"),h(f(),e)}}},function(t,e,n){var r=n(4),i=n(0);t.exports=function(t,e,n){var o;if(n=n||r,t=t||{},e=e||{},t.name){try{o=n.createElement('<iframe name="'+t.name+'"></iframe>')}catch(e){(o=n.createElement("iframe")).name=t.name}delete t.name}else o=n.createElement("iframe");return t.id&&(o.id=t.id,delete t.id),o.allowtransparency="true",o.scrolling="no",o.setAttribute("frameBorder",0),o.setAttribute("allowTransparency",!0),i.forIn(t,function(t,e){o.setAttribute(t,e)}),i.forIn(e,function(t,e){o.style[t]=e}),o}},function(t,e,n){var r=n(25),i=n(100);t.exports=r.build([i])},function(t,e,n){var r=n(25),i=n(116);t.exports=r.build([i])},function(t,e,n){var r=n(39),i=n(40),o=n(7);(r=Object.create(r)).build=o(r.build,null,i),t.exports=r},function(t,e,n){var r=n(70),i=n(19),o=n(5),s=n(21),a=n(0);t.exports=function(t){t.params({chrome:{},height:{transform:o.asInt},instanceId:{required:!0,fallback:s.deterministic},isPreconfigured:{},lang:{required:!0,transform:r.matchLanguage,fallback:"en"},theme:{},tweetLimit:{transform:o.asInt}}),t.defineProperty("endpoint",{get:function(){throw new Error("endpoint not specified")}}),t.define("queryParams",function(){return a.compact({dnt:i.enabled(),limit:this.params.tweetLimit,lang:this.params.lang})})}},function(t,e,n){var r,i=n(4);function o(t){var e,n,o,s=0;for(r={},e=(t=t||i).getElementsByTagName("meta");e[s];s++){if(n=e[s],/^twitter:/.test(n.getAttribute("name")))o=n.getAttribute("name").replace(/^twitter:/,"");else{if(!/^twitter:/.test(n.getAttribute("property")))continue;o=n.getAttribute("property").replace(/^twitter:/,"")}r[o]=n.getAttribute("content")||n.getAttribute("value")}}o(),t.exports={init:o,val:function(t){return r[t]}}},function(t,e,n){var r=n(104),i=n(24),o=n(1);function s(t){var e="";if(!t)return"";try{return e=i.stringify(t),o.btoa(e)}catch(t){return""}}function a(t){return r.settingsLoaded().then(function(e){return e[t]})}function u(){return a("features")}t.exports={encodeFeatures:s,shouldObtainCookieConsent:function(){return a("shouldObtainCookieConsent")},getExperiments:u,getExperiment:function(t){return u().then(function(e){if(!e[t])throw new Error("Experiment not found");return e[t]})},getHorizonSettings:function(){return r.settingsLoaded().then(function(t){return{features:t.features,sessionId:t.sessionId}})},getActiveExperimentDataString:function(){return u().then(function(t){return s(t)})},getExperimentKeys:function(){return u().then(function(t){return Object.keys(t)})},load:function(){r.load()}}},function(t,e,n){var r=n(10),i={},o=-1,s={};function a(t){var e=t.getAttribute("data-twitter-event-id");return e||(t.setAttribute("data-twitter-event-id",++o),o)}function u(t,e,n){var r=0,i=t&&t.length||0;for(r=0;r<i;r++)if(t[r].call(e,n,e),n.ceaseImmediately)return!1}function c(t,e,n){for(var i=n||t.target||t.srcElement,o=r.list(i).map(function(t){return"."+t}).concat(i.tagName),s=0,a=o.length;s<a;s++)if(!1===u(e[o[s]],i,t))return;t.cease||i!==this&&c.call(this,t,e,i.parentElement||i.parentNode)}function d(t,e,n,r){function i(r){c.call(t,r,n[e])}!function(t,e,n,r){t.id&&(s[t.id]=s[t.id]||[],s[t.id].push({el:t,listener:e,type:n,rootId:r}))}(t,i,e,r),t.addEventListener(e,i,!1)}function f(t){t&&t.preventDefault?t.preventDefault():t.returnValue=!1}function l(t){t&&(t.cease=!0)&&t.stopPropagation?t.stopPropagation():t.cancelBubble=!0}t.exports={stop:function(t){return l(t),f(t),!1},stopPropagation:l,stopImmediatePropagation:function(t){t&&(t.ceaseImmediately=!0,l(t),t.stopImmediatePropagation())},preventDefault:f,delegate:function(t,e,n,r){var o=a(t);i[o]=i[o]||{},i[o][e]||(i[o][e]={},d(t,e,i[o],o)),i[o][e][n]=i[o][e][n]||[],i[o][e][n].push(r)},simulate:function(t,e,n){var r=a(e),o=i[r]&&i[r];c.call(e,{target:n},o[t])},removeDelegatesForWidget:function(t){var e=s[t];e&&(e.forEach(function(t){t.el.removeEventListener(t.type,t.listener,!1),delete i[t.rootId]}),delete s[t])}}},function(t,e,n){var r=n(0),i=n(48);t.exports={closest:function t(e,n,o){var s;if(n)return o=o||n&&n.ownerDocument,s=r.isType("function",e)?e:function(t){return function(e){return!!e.tagName&&i(e,t)}}(e),n===o?s(n)?n:void 0:s(n)?n:t(s,n.parentNode,o)}}},function(t,e,n){var r=n(42),i=n(4),o=n(19),s=n(36),a=n(74),u=n(24),c=n(9),d=n(2),f=n(0),l=1,h=r.version,p=c.get("clientEventEndpoint")||"https://syndication.twitter.com/i/jot";function m(t){return f.aug({client:"tfw"},t||{})}function v(t,e,n){return e=e||{},f.aug({},e,{_category_:t,triggered_on:e.triggered_on||+new Date,dnt:o.enabled(n)})}t.exports={extractTermsFromDOM:function t(e,n){var r;return n=n||{},e&&e.nodeType===Node.ELEMENT_NODE?((r=e.getAttribute("data-scribe"))&&r.split(" ").forEach(function(t){var e=t.trim().split(":"),r=e[0],i=e[1];r&&i&&!n[r]&&(n[r]=i)}),t(e.parentNode,n)):n},clickEventElement:function(t){var e=s.closest("[data-expanded-url]",t),n=e&&e.getAttribute("data-expanded-url");return n&&d.isTwitterURL(n)?"twitter_url":"url"},flattenClientEventPayload:function(t,e){return f.aug({},e,{event_namespace:t})},formatGenericEventData:v,formatClientEventData:function(t,e,n){var r=t&&t.widget_origin||i.referrer;return(t=v("tfw_client_event",t,r)).client_version=h,t.format_version=void 0!==n?n:1,e||(t.widget_origin=r),t},formatClientEventNamespace:m,formatHorizonTweetData:function(t){var e={item_ids:[],item_details:{}};return e.item_ids.push(t),e.item_details[t]={item_type:a.TWEET},e},formatTweetAssociation:function(t,e){var n={};return(e=e||{}).association_namespace=m(t),n[l]=e,n},noticeSeen:function(t){return"notice"===t.element&&"seen"===t.action},splitLogEntry:function(t){var e,n,r,i,o;return t.item_ids&&t.item_ids.length>1?(e=Math.floor(t.item_ids.length/2),n=t.item_ids.slice(0,e),r={},i=t.item_ids.slice(e),o={},n.forEach(function(e){r[e]=t.item_details[e]}),i.forEach(function(e){o[e]=t.item_details[e]}),[f.aug({},t,{item_ids:n,item_details:r}),f.aug({},t,{item_ids:i,item_details:o})]):[t]},stringify:function(t){var e,n=Array.prototype.toJSON;return delete Array.prototype.toJSON,e=u.stringify(t),n&&(Array.prototype.toJSON=n),e},CLIENT_EVENT_ENDPOINT:p,RUFOUS_REDIRECT:"https://platform.twitter.com/jot.html"}},function(t,e,n){var r=n(8),i=n(73),o=n(0),s=i.getCanonicalURL()||r.href,a=s;t.exports={isFramed:function(){return s!==a},rootDocumentLocation:function(t){return t&&o.isType("string",t)&&(s=t),s},currentDocumentLocation:function(){return a}}},function(t,e,n){var r=n(95),i=n(96),o=n(0);t.exports={couple:function(){return o.toRealArray(arguments)},build:function(t,e,n){var o=new t;return(e=i(r(e||[]))).forEach(function(t){t.call(null,o)}),o.build(n)}}},function(t,e,n){var r=n(98),i=n(0),o=n(41);function s(){this.Component=this.factory(),this._adviceArgs=[],this._lastArgs=[]}i.aug(s.prototype,{factory:o,build:function(t){var e=this;return this.Component,i.aug(this.Component.prototype.boundParams,t),this._adviceArgs.concat(this._lastArgs).forEach(function(t){(function(t,e,n){var r=this[e];if(!r)throw new Error(e+" does not exist");this[e]=t(r,n)}).apply(e.Component.prototype,t)}),delete this._lastArgs,delete this._adviceArgs,this.Component},params:function(t){var e=this.Component.prototype.paramConfigs;t=t||{},this.Component.prototype.paramConfigs=i.aug({},t,e)},define:function(t,e){if(t in this.Component.prototype)throw new Error(t+" has previously been defined");this.override(t,e)},defineStatic:function(t,e){this.Component[t]=e},override:function(t,e){this.Component.prototype[t]=e},defineProperty:function(t,e){if(t in this.Component.prototype)throw new Error(t+" has previously been defined");this.overrideProperty(t,e)},overrideProperty:function(t,e){var n=i.aug({configurable:!0},e);Object.defineProperty(this.Component.prototype,t,n)},before:function(t,e){this._adviceArgs.push([r.before,t,e])},after:function(t,e){this._adviceArgs.push([r.after,t,e])},around:function(t,e){this._adviceArgs.push([r.around,t,e])},last:function(t,e){this._lastArgs.push([r.after,t,e])}}),t.exports=s},function(t,e,n){var r=n(0);function i(){return!0}function o(t){return t}t.exports=function(){function t(t){var e=this;t=t||{},this.params=Object.keys(this.paramConfigs).reduce(function(n,s){var a=[],u=e.boundParams,c=e.paramConfigs[s],d=c.validate||i,f=c.transform||o;if(s in u&&a.push(u[s]),s in t&&a.push(t[s]),a="fallback"in c?a.concat(c.fallback):a,n[s]=function(t,e,n){var i=null;return t.some(function(t){if(t=r.isType("function",t)?t():t,e(t))return i=n(t),!0}),i}(a,d,f),c.required&&null==n[s])throw new Error(s+" is a required parameter");return n},{}),this.initialize()}return r.aug(t.prototype,{paramConfigs:{},boundParams:{},initialize:function(){}}),t}},function(t){t.exports={version:"2615f7e52b7e0:1702314776716"}},function(t,e,n){var r=n(1);t.exports=function(t,e,n){var i,o=0;return n=n||null,function s(){var a=n||this,u=arguments,c=+new Date;if(r.clearTimeout(i),c-o>e)return o=c,void t.apply(a,u);i=r.setTimeout(function(){s.apply(a,u)},e)}}},function(t,e,n){var r=n(18);t.exports=function(){r.publicError("Error: This Timeline type is no longer supported (Likes, Collections, & Moments). \n\t","* Twitter still supports Profile and List Timelines \n\t","* You can learn more about this change in our announcement: \n\t","https://twittercommunity.com/t/removing-support-for-embedded-like-collection-and-moment-timelines/150313 \n\t","* In order to create a new Embedded Timeline, visit: https://publish.twitter.com")}},function(t,e,n){
  /*!
   * @overview es6-promise - a tiny implementation of Promises/A+.
   * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
   * @license   Licensed under MIT license
   *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
   * @version   v4.2.5+7f2b526d
   */var r;r=function(){"use strict";function t(t){return"function"==typeof t}var e=Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)},n=0,r=void 0,i=void 0,o=function(t,e){l[n]=t,l[n+1]=e,2===(n+=2)&&(i?i(h):w())},s="undefined"!=typeof window?window:void 0,a=s||{},u=a.MutationObserver||a.WebKitMutationObserver,c="undefined"==typeof self&&"undefined"!=typeof process&&"[object process]"==={}.toString.call(process),d="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel;function f(){var t=setTimeout;return function(){return t(h,1)}}var l=new Array(1e3);function h(){for(var t=0;t<n;t+=2)(0,l[t])(l[t+1]),l[t]=void 0,l[t+1]=void 0;n=0}var p,m,v,g,w=void 0;function y(t,e){var n=this,r=new this.constructor(E);void 0===r[_]&&k(r);var i=n._state;if(i){var s=arguments[i-1];o(function(){return D(i,r,s,n._result)})}else I(n,r,t,e);return r}function b(t){if(t&&"object"==typeof t&&t.constructor===this)return t;var e=new this(E);return C(e,t),e}c?w=function(){return process.nextTick(h)}:u?(m=0,v=new u(h),g=document.createTextNode(""),v.observe(g,{characterData:!0}),w=function(){g.data=m=++m%2}):d?((p=new MessageChannel).port1.onmessage=h,w=function(){return p.port2.postMessage(0)}):w=void 0===s?function(){try{var t=Function("return this")().require("vertx");return void 0!==(r=t.runOnLoop||t.runOnContext)?function(){r(h)}:f()}catch(t){return f()}}():f();var _=Math.random().toString(36).substring(2);function E(){}var x=void 0,T=1,A=2,S={error:null};function R(t){try{return t.then}catch(t){return S.error=t,S}}function N(e,n,r){n.constructor===e.constructor&&r===y&&n.constructor.resolve===b?function(t,e){e._state===T?P(t,e._result):e._state===A?j(t,e._result):I(e,void 0,function(e){return C(t,e)},function(e){return j(t,e)})}(e,n):r===S?(j(e,S.error),S.error=null):void 0===r?P(e,n):t(r)?function(t,e,n){o(function(t){var r=!1,i=function(t,e,n,r){try{t.call(e,n,r)}catch(t){return t}}(n,e,function(n){r||(r=!0,e!==n?C(t,n):P(t,n))},function(e){r||(r=!0,j(t,e))},t._label);!r&&i&&(r=!0,j(t,i))},t)}(e,n,r):P(e,n)}function C(t,e){var n,r;t===e?j(t,new TypeError("You cannot resolve a promise with itself")):(r=typeof(n=e),null===n||"object"!==r&&"function"!==r?P(t,e):N(t,e,R(e)))}function L(t){t._onerror&&t._onerror(t._result),O(t)}function P(t,e){t._state===x&&(t._result=e,t._state=T,0!==t._subscribers.length&&o(O,t))}function j(t,e){t._state===x&&(t._state=A,t._result=e,o(L,t))}function I(t,e,n,r){var i=t._subscribers,s=i.length;t._onerror=null,i[s]=e,i[s+T]=n,i[s+A]=r,0===s&&t._state&&o(O,t)}function O(t){var e=t._subscribers,n=t._state;if(0!==e.length){for(var r=void 0,i=void 0,o=t._result,s=0;s<e.length;s+=3)r=e[s],i=e[s+n],r?D(n,r,i,o):i(o);t._subscribers.length=0}}function D(e,n,r,i){var o=t(r),s=void 0,a=void 0,u=void 0,c=void 0;if(o){if((s=function(t,e){try{return t(e)}catch(t){return S.error=t,S}}(r,i))===S?(c=!0,a=s.error,s.error=null):u=!0,n===s)return void j(n,new TypeError("A promises callback cannot return that same promise."))}else s=i,u=!0;n._state!==x||(o&&u?C(n,s):c?j(n,a):e===T?P(n,s):e===A&&j(n,s))}var z=0;function k(t){t[_]=z++,t._state=void 0,t._result=void 0,t._subscribers=[]}var M=function(){function t(t,n){this._instanceConstructor=t,this.promise=new t(E),this.promise[_]||k(this.promise),e(n)?(this.length=n.length,this._remaining=n.length,this._result=new Array(this.length),0===this.length?P(this.promise,this._result):(this.length=this.length||0,this._enumerate(n),0===this._remaining&&P(this.promise,this._result))):j(this.promise,new Error("Array Methods must be provided an Array"))}return t.prototype._enumerate=function(t){for(var e=0;this._state===x&&e<t.length;e++)this._eachEntry(t[e],e)},t.prototype._eachEntry=function(t,e){var n=this._instanceConstructor,r=n.resolve;if(r===b){var i=R(t);if(i===y&&t._state!==x)this._settledAt(t._state,e,t._result);else if("function"!=typeof i)this._remaining--,this._result[e]=t;else if(n===U){var o=new n(E);N(o,t,i),this._willSettleAt(o,e)}else this._willSettleAt(new n(function(e){return e(t)}),e)}else this._willSettleAt(r(t),e)},t.prototype._settledAt=function(t,e,n){var r=this.promise;r._state===x&&(this._remaining--,t===A?j(r,n):this._result[e]=n),0===this._remaining&&P(r,this._result)},t.prototype._willSettleAt=function(t,e){var n=this;I(t,void 0,function(t){return n._settledAt(T,e,t)},function(t){return n._settledAt(A,e,t)})},t}(),U=function(){function e(t){this[_]=z++,this._result=this._state=void 0,this._subscribers=[],E!==t&&("function"!=typeof t&&function(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}(),this instanceof e?function(t,e){try{e(function(e){C(t,e)},function(e){j(t,e)})}catch(e){j(t,e)}}(this,t):function(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}())}return e.prototype.catch=function(t){return this.then(null,t)},e.prototype.finally=function(e){var n=this.constructor;return t(e)?this.then(function(t){return n.resolve(e()).then(function(){return t})},function(t){return n.resolve(e()).then(function(){throw t})}):this.then(e,e)},e}();return U.prototype.then=y,U.all=function(t){return new M(this,t).promise},U.race=function(t){var n=this;return e(t)?new n(function(e,r){for(var i=t.length,o=0;o<i;o++)n.resolve(t[o]).then(e,r)}):new n(function(t,e){return e(new TypeError("You must pass an array to race."))})},U.resolve=b,U.reject=function(t){var e=new this(E);return j(e,t),e},U._setScheduler=function(t){i=t},U._setAsap=function(t){o=t},U._asap=o,U.polyfill=function(){var t=void 0;if("undefined"!=typeof global)t=global;else if("undefined"!=typeof self)t=self;else try{t=Function("return this")()}catch(t){throw new Error("polyfill failed because global object is unavailable in this environment")}var e=t.Promise;if(e){var n=null;try{n=Object.prototype.toString.call(e.resolve())}catch(t){}if("[object Promise]"===n&&!e.cast)return}t.Promise=U},U.Promise=U,U},t.exports=r()},function(t,e,n){var r=n(47);t.exports=new r("twttr")},function(t,e,n){var r=n(1),i=n(0);function o(t){return i.isType("string",t)?t.split("."):i.isType("array",t)?t:[]}function s(t,e){(e=e||r)[t]=e[t]||{},Object.defineProperty(this,"base",{value:e[t]}),Object.defineProperty(this,"name",{value:t})}i.aug(s.prototype,{get:function(t){return o(t).reduce(function(t,e){if(i.isObject(t))return t[e]},this.base)},set:function(t,e,n){var r=o(t),s=function(t,e){var n=o(e).slice(0,-1);return n.reduce(function(t,e,r){if(t[e]=t[e]||{},!i.isObject(t[e]))throw new Error(n.slice(0,r+1).join(".")+" is already defined with a value.");return t[e]},t)}(this.base,t),a=r.slice(-1);return n&&a in s?s[a]:s[a]=e},init:function(t,e){return this.set(t,e,!0)},unset:function(t){var e=o(t),n=this.get(e.slice(0,-1));n&&delete n[e.slice(-1)]},aug:function(t){var e=this.get(t),n=i.toRealArray(arguments).slice(1);if(e=void 0!==e?e:{},n.unshift(e),!n.every(i.isObject))throw new Error("Cannot augment non-object.");return this.set(t,i.aug.apply(null,n))},call:function(t){var e=this.get(t),n=i.toRealArray(arguments).slice(1);if(!i.isType("function",e))throw new Error("Function "+t+"does not exist.");return e.apply(null,n)},fullPath:function(t){var e=o(t);return e.unshift(this.name),e.join(".")}}),t.exports=s},function(t,e,n){var r=n(1).HTMLElement,i=r.prototype.matches||r.prototype.matchesSelector||r.prototype.webkitMatchesSelector||r.prototype.mozMatchesSelector||r.prototype.msMatchesSelector||r.prototype.oMatchesSelector;t.exports=function(t,e){if(i)return i.call(t,e)}},function(t,e,n){var r=n(0),i=n(7),o={bind:function(t,e){return this._handlers=this._handlers||{},this._handlers[t]=this._handlers[t]||[],this._handlers[t].push(e)},unbind:function(t,e){var n;this._handlers&&this._handlers[t]&&(e?(n=this._handlers[t].indexOf(e))>=0&&this._handlers[t].splice(n,1):this._handlers[t]=[])},trigger:function(t,e){var n=this._handlers&&this._handlers[t];(e=e||{}).type=t,n&&n.forEach(function(t){r.async(i(t,this,e))})}};t.exports={Emitter:o,makeEmitter:function(){return r.aug(function(){},o)}}},function(t,e,n){var r=n(89),i=n(91),o=n(6),s=n(23),a=n(7),u=n(0),c=new i(function(t){var e=function(t){return t.reduce(function(t,e){return t[e._className]=t[e._className]||[],t[e._className].push(e),t},{})}(t.map(r.fromRawTask));u.forIn(e,function(t,e){s.allSettled(e.map(function(t){return t.initialize()})).then(function(){e.forEach(function(t){o.all([t.hydrate(),t.insertIntoDom()]).then(a(t.render,t)).then(a(t.success,t),a(t.fail,t))})})})});t.exports={addWidget:function(t){return c.add(t)}}},function(t,e,n){var r=n(17);t.exports=function(t){return r.write(function(){t&&t.parentNode&&t.parentNode.removeChild(t)})}},function(t,e,n){var r=n(93),i=n(71),o=new(n(103))(function(t){(!function(t){return 1===t.length&&i.canFlushOneItem(t[0])}(t)?function(t){r.init(),t.forEach(function(t){var e=t.input.namespace,n=t.input.data,i=t.input.offsite,o=t.input.version;r.clientEvent(e,n,i,o)}),r.flush().then(function(){t.forEach(function(t){t.taskDoneDeferred.resolve()})},function(){t.forEach(function(t){t.taskDoneDeferred.reject()})})}:function(t){t.forEach(function(t){var e=t.input.namespace,n=t.input.data,r=t.input.offsite,o=t.input.version;i.clientEvent(e,n,r,o),t.taskDoneDeferred.resolve()})})(t)});t.exports={scribe:function(t,e,n,r){return o.add({namespace:t,data:e,offsite:n,version:r})},pause:function(){o.pause()},resume:function(){o.resume()}}},function(t,e,n){n(18),t.exports={log:function(t,e){}}},function(t,e,n){var r=n(1);function i(t){return(t=t||r).getSelection&&t.getSelection()}t.exports={getSelection:i,getSelectedText:function(t){var e=i(t);return e?e.toString():""}}},function(t,e,n){var r=n(4),i=n(1),o=n(3),s=2e4;t.exports=function(t){var e=new o,n=r.createElement("img");return n.onload=n.onerror=function(){i.setTimeout(e.resolve,50)},n.src=t,i.setTimeout(e.reject,s),e.promise}},function(t,e,n){var r,i=n(10),o=n(4),s=n(1),a=n(33),u=n(51),c=n(5),d=n(21),f="csptest";t.exports={inlineStyle:function(){var t=f+d.generate(),e=o.createElement("div"),n=o.createElement("style"),l="."+t+" { visibility: hidden; }";return!!o.body&&(c.asBoolean(a.val("widgets:csp"))&&(r=!1),void 0!==r?r:(e.style.display="none",i.add(e,t),n.type="text/css",n.appendChild(o.createTextNode(l)),o.body.appendChild(n),o.body.appendChild(e),r="hidden"===s.getComputedStyle(e).visibility,u(e),u(n),r))}}},function(t,e){t.exports=function(t){var e=t.getBoundingClientRect();return{width:e.width,height:e.height}}},function(t,e,n){var r=n(101);t.exports=function(t){t.define("createElement",r),t.define("createFragment",r),t.define("htmlToElement",r),t.define("hasSelectedText",r),t.define("addRootClass",r),t.define("removeRootClass",r),t.define("hasRootClass",r),t.define("prependStyleSheet",r),t.define("appendStyleSheet",r),t.define("prependCss",r),t.define("appendCss",r),t.define("makeVisible",r),t.define("injectWidgetEl",r),t.define("matchHeightToContent",r),t.define("matchWidthToContent",r)}},function(t,e){t.exports=function(t){var e,n=!1;return function(){return n?e:(n=!0,e=t.apply(this,arguments))}}},function(t,e,n){var r=n(13),i=n(110),o=n(111),s=n(14);t.exports=function(t,e,n){return new r(i,o,s.DM_BUTTON,t,e,n)}},function(t,e,n){var r=n(25),i=n(112);t.exports=r.build([i])},function(t,e,n){var r=n(13),i=n(115),o=n(30),s=n(14);t.exports=function(t,e,n){return new r(i,o,s.FOLLOW_BUTTON,t,e,n)}},function(t,e,n){var r=n(13),i=n(123),o=n(29),s=n(14);t.exports=function(t,e,n){return new r(i,o,s.MOMENT,t,e,n)}},function(t,e,n){var r=n(13),i=n(125),o=n(29),s=n(14);t.exports=function(t,e,n){return new r(i,o,s.PERISCOPE,t,e,n)}},function(t,e,n){var r=n(127),i=n(128),o=n(132),s=n(134),a=n(136),u={collection:i,likes:o,list:s,profile:a,url:d},c=[a,o,i,s];function d(t){return r(c,function(e){try{return new e(t)}catch(t){}})}t.exports=function(t){return t?function(t){var e,n;return e=(t.sourceType+"").toLowerCase(),(n=u[e])?new n(t):null}(t)||d(t):null}},function(t,e,n){var r=n(4),i=n(13),o=n(30),s=n(138),a=n(14);t.exports=function(t,e,n){var u=r.createElement("div");return new i(s,o,a.TIMELINE,t,e,n,{sandboxWrapperEl:u})}},function(t,e,n){var r=n(4),i=n(13),o=n(30),s=n(140),a=n(14);t.exports=function(t,e,n){return new i(s,o,a.TWEET,t,e,n,{sandboxWrapperEl:r.createElement("div")})}},function(t,e,n){var r=n(13),i=n(142),o=n(30),s=n(14);t.exports=function(t,e,n){var a=t&&t.type||"share",u="hashtag"==a?s.HASHTAG_BUTTON:"mention"==a?s.MENTION_BUTTON:s.SHARE_BUTTON;return new r(i,o,u,t,e,n)}},function(t,e,n){var r=n(52),i=n(38),o=n(0);t.exports=function(t){var e={widget_origin:i.rootDocumentLocation(),widget_frame:i.isFramed()?i.currentDocumentLocation():null,duration_ms:t.duration,item_ids:t.widgetIds||[]},n=o.aug(t.namespace,{page:"page",component:"performance"});r.scribe(n,e)}},function(t,e,n){var r=n(0),i=n(129),o=["ar","fa","he","ur"];t.exports={isRtlLang:function(t){return t=String(t).toLowerCase(),r.contains(o,t)},matchLanguage:function(t){return t=(t=(t||"").toLowerCase()).replace("_","-"),i(t)?t:(t=t.replace(/-.*/,""),i(t)?t:"en")}}},function(t,e,n){var r=n(53),i=n(16),o=n(37),s=n(27),a=n(0),u=n(9),c=n(6),d=u.get("scribeCallback"),f=2083,l=[],h=i.url(o.CLIENT_EVENT_ENDPOINT,{dnt:0,l:""}),p=encodeURIComponent(h).length;function m(t,e,n,r,i){var u=!a.isObject(t),f=!!e&&!a.isObject(e);if(!u&&!f)return d&&d(arguments),e=e||{},c.resolve(v(o.formatClientEventNamespace(t),o.formatClientEventData(e,n,r),s.settingsScribe(),i))}function v(t,e,n,s){var u;n&&a.isObject(t)&&a.isObject(e)&&(r.log(t,e),u=o.flattenClientEventPayload(t,e),s=a.aug({},s,{l:o.stringify(u)}),u.dnt&&(s.dnt=1),w(i.url(n,s)))}function g(t){return l.push(t),l}function w(t){return(new Image).src=t}t.exports={canFlushOneItem:function(t){var e=o.stringify(t),n=encodeURIComponent(e).length+3;return p+n<f},_enqueueRawObject:g,scribe:v,clientEvent:m,enqueueClientEvent:function(t,e,n,r){var i=!a.isObject(t),s=!!e&&!a.isObject(e);if(!i&&!s)return g(o.flattenClientEventPayload(o.formatClientEventNamespace(t),o.formatClientEventData(e,n,r)))},interaction:function(t,e,n,r){var i=o.extractTermsFromDOM(t.target||t.srcElement);return i.action=r||"click",m(i,e,n)},placePixel:w}},function(t){t.exports={tweetButtonHtmlPath:"/widgets/tweet_button.2f70fb173b9000da126c79afe2098f02.{{lang}}.html",followButtonHtmlPath:"/widgets/follow_button.2f70fb173b9000da126c79afe2098f02.{{lang}}.html",hubHtmlPath:"/widgets/hub.html",widgetIframeHtmlPath:"/widgets/widget_iframe.2f70fb173b9000da126c79afe2098f02.html",resourceBaseUrl:"https://platform.twitter.com"}},function(t,e,n){var r=n(4),i=n(8),o=n(2);function s(t,e){var n,r;return e=e||i,/^https?:\/\//.test(t)?t:/^\/\//.test(t)?e.protocol+t:(n=e.host+(e.port.length?":"+e.port:""),0!==t.indexOf("/")&&((r=e.pathname.split("/")).pop(),r.push(t),t="/"+r.join("/")),[e.protocol,"//",n,t].join(""))}t.exports={absolutize:s,getCanonicalURL:function(){for(var t,e=r.getElementsByTagName("link"),n=0;e[n];n++)if("canonical"==(t=e[n]).rel)return s(t.href)},getScreenNameFromPage:function(){for(var t,e,n,i=[r.getElementsByTagName("a"),r.getElementsByTagName("link")],s=0,a=0,u=/\bme\b/;t=i[s];s++)for(a=0;e=t[a];a++)if(u.test(e.rel)&&(n=o.screenName(e.href)))return n},getHostname:function(t){var e=r.createElement("a");return e.setAttribute("href",t),e.hostname}}},function(t){t.exports={TWEET:0,RETWEET:10,CUSTOM_TIMELINE:17,LIVE_VIDEO_EVENT:28,QUOTE_TWEET:23}},,,,,,,,function(t,e,n){var r,i=n(3),o=n(4),s=n(84),a=n(46),u=n(9),c=n(85),d=n(22),f=n(88),l=n(143),h=n(151),p=n(152),m=n(26),v=n(34);n(153),m.emitter.trigger(m.START),u.set("widgets.init",!0),a.set("init",!0),p(),r=new i,s.exposeReadyPromise(r.promise,a.base,"_e"),a.set("widgets",l),a.set("widgets.load",f.load),a.set("events",d),h(function(){v.load(),r.resolve(a.base),c.attachTo(o),f.loadPage()})},function(t,e){t.exports=navigator},function(t,e,n){var r=n(7);t.exports={exposeReadyPromise:function(t,e,n){e.ready=r(t.then,t),n&&Array.isArray(e[n])&&(e[n].forEach(r(t.then,t)),delete e[n])}}},function(t,e,n){var r=n(8),i=n(35),o=n(36),s=n(86),a=n(2);function u(t){var e,n,u;t.altKey||t.metaKey||t.shiftKey||(e=o.closest(function(t){return"A"===t.tagName||"AREA"===t.tagName},t.target))&&a.isIntentURL(e.href)&&(n=(n=(n=[u=e.href,"original_referer="+r.href].join(-1==u.indexOf("?")?"?":"&")).replace(/^http[:]/,"https:")).replace(/^\/\//,"https://"),s.open(n,e),i.preventDefault(t))}t.exports={attachTo:function(t){t.addEventListener("click",u,!1)}}},function(t,e,n){var r=n(2),i=n(87),o=n(22),s=n(16),a={favorite:["favorite","like"],follow:["follow"],like:["favorite","like"],retweet:["retweet"],tweet:["tweet"]};function u(t){this.srcEl=[],this.element=t}u.open=function(t,e,n){var u=(r.intentType(t)||"").toLowerCase();r.isTwitterURL(t)&&(function(t,e){i.open(t,e)}(t,n),e&&o.trigger("click",{target:e,region:"intent",type:"click",data:{}}),e&&a[u]&&a[u].forEach(function(n){o.trigger(n,{target:e,region:"intent",type:n,data:function(t,e){var n=s.decodeURL(e);switch(t){case"favorite":case"like":return{tweet_id:n.tweet_id};case"follow":return{screen_name:n.screen_name,user_id:n.user_id};case"retweet":return{source_tweet_id:n.tweet_id};default:return{}}}(u,t)})}))},t.exports=u},function(t,e,n){var r=n(1),i=n(35),o=n(36),s=n(20),a=n(2),u=n(21),c="intent_";function d(t){this.win=t}d.prototype.open=function(t,e){var n=e&&"click"==e.type&&o.closest("a",e.target),r=e&&(e.altKey||e.metaKey||e.shiftKey),d=n&&(s.ios()||s.android());if(a.isTwitterURL(t))return r||d?this:(this.name=c+u.generate(),this.popup=this.win.open(t,this.name),e&&i.preventDefault(e),this)},d.open=function(t,e){return new d(r).open(t,e)},t.exports=d},function(t,e,n){var r=n(4),i=n(6),o=n(23),s=n(50),a=n(33),u=n(9),c=n(52),d=n(22),f=n(5),l=n(0),h=n(34),p=n(106),m=n(26);function v(){var t=a.val("widgets:autoload")||!0;return!f.isFalseValue(t)&&(f.isTruthValue(t)?r.body:r.querySelectorAll(t))}function g(t,e){var n,i;return t=(t=t||r.body).length?l.toRealArray(t):[t],c.pause(),i=function(t,e){return t.reduce(function(t,n){return t.concat(p.reduce(function(t,r){return t.concat(r(n,e))},[]))},[])}(t,e),m.emitter.trigger(m.ALL_WIDGETS_RENDER_START,{widgets:i}),n=o.allResolved(i.map(function(t){return s.addWidget(t)})).then(function(t){d.trigger("loaded",{widgets:t}),t&&t.length&&m.emitter.trigger(m.ALL_WIDGETS_RENDER_END,{widgets:t})}),o.always(n,function(){c.resume()}),n}function w(t){return h.getExperiments().then(function(e){return g(t,e)})}t.exports={load:w,loadPage:function(){var t=v();return!1===t?i.resolve():(u.set("widgets.loaded",!0),w(t))},_getPageLoadTarget:v}},function(t,e,n){var r=n(10),i=n(17),o=n(22),s=n(51),a=n(6),u=n(23);function c(t,e){this._widget=null,this._sandbox=null,this._hydrated=!1,this._insertedIntoDom=!1,this._Sandbox=t.Sandbox,this._factory=t.factory,this._widgetParams=t.parameters,this._resolve=e,this._className=t.className,this._renderedClassName=t.className+"-rendered",this._errorClassName=t.className+"-error",this._srcEl=t.srcEl,this._targetGlobal=function(t){return(t.srcEl||t.targetEl).ownerDocument.defaultView}(t),this._sandboxWrapperEl=t.options?t.options.sandboxWrapperEl:null,this._insertionStrategy=function(e){var n,r=t.srcEl,i=t.targetEl,o=t.className,s=t.className+"-rendered",a=t.options?t.options.sandboxWrapperEl:null;a?(a.appendChild(e),a.classList.add(o,s),n=a):n=e,r?i.insertBefore(n,r):i.appendChild(n)}}c.fromRawTask=function(t){return new c(t.input,t.taskDoneDeferred.resolve)},c.prototype.initialize=function(){var t=this,e=new this._Sandbox(this._targetGlobal);return this._factory(this._widgetParams,e).then(function(n){return t._widget=n,t._sandbox=e,n._sandboxWrapperEl=t._sandboxWrapperEl,n})},c.prototype.insertIntoDom=function(){var t=this,e=this._sandboxWrapperEl?"":[this._className,this._renderedClassName].join(" ");return this._widget?this._sandbox.insert(this._widget.id,{class:e},null,this._insertionStrategy).then(function(){t._insertedIntoDom=!0}):a.reject(new Error("cannot insert widget into DOM before it is initialized"))},c.prototype.hydrate=function(){var t=this;return this._widget?this._widget.hydrate().then(function(){t._hydrated=!0}):a.reject(new Error("cannot hydrate widget before it is initialized"))},c.prototype.render=function(){var t=this;function e(e){var n=t._sandboxWrapperEl?t._sandboxWrapperEl:t._sandbox.sandboxEl;return s(n).then(function(){return a.reject(e)})}return this._hydrated?this._insertedIntoDom?t._widget.render(t._sandbox).then(function(){return t._sandbox.onResize(function(){return t._widget.resize().then(function(){var e=t._sandboxWrapperEl?t._sandboxWrapperEl:t._sandbox.sandboxEl;o.trigger("resize",{target:e})})}),t._widget.show()}).then(function(){return s(t._srcEl).then(function(){return t._sandbox.sandboxEl})},e):e(new Error("cannot render widget before DOM insertion")):e(new Error("cannot render widget before hydration"))},c.prototype.fail=function(){var t=this,e=t._errorClassName,n=t._sandboxWrapperEl?t._sandboxWrapperEl:t._srcEl;return this._srcEl?u.always(i.write(function(){r.add(n,e)}),function(){o.trigger("rendered",{target:n}),t._resolve(n)}):(t._resolve(),a.resolve())},c.prototype.success=function(){var t=this._sandboxWrapperEl?this._sandboxWrapperEl:this._sandbox.sandboxEl;o.trigger("rendered",{target:t}),this._resolve(t)},t.exports=c},function(t,e,n){var r;!function(){"use strict";var i=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||function(t){return window.setTimeout(t,1e3/60)};function o(){this.frames=[],this.lastId=0,this.raf=i,this.batch={hash:{},read:[],write:[],mode:null}}o.prototype.read=function(t,e){var n=this.add("read",t,e),r=n.id;return this.batch.read.push(n.id),"reading"===this.batch.mode||this.batch.scheduled?r:(this.scheduleBatch(),r)},o.prototype.write=function(t,e){var n=this.add("write",t,e),r=this.batch.mode,i=n.id;return this.batch.write.push(n.id),"writing"===r||"reading"===r||this.batch.scheduled?i:(this.scheduleBatch(),i)},o.prototype.defer=function(t,e,n){"function"==typeof t&&(n=e,e=t,t=1);var r=this,i=t-1;return this.schedule(i,function(){r.run({fn:e,ctx:n})})},o.prototype.clear=function(t){if("function"==typeof t)return this.clearFrame(t);t=Number(t);var e=this.batch.hash[t];if(e){var n=this.batch[e.type],r=n.indexOf(t);delete this.batch.hash[t],~r&&n.splice(r,1)}},o.prototype.clearFrame=function(t){var e=this.frames.indexOf(t);~e&&this.frames.splice(e,1)},o.prototype.scheduleBatch=function(){var t=this;this.schedule(0,function(){t.batch.scheduled=!1,t.runBatch()}),this.batch.scheduled=!0},o.prototype.uniqueId=function(){return++this.lastId},o.prototype.flush=function(t){for(var e;e=t.shift();)this.run(this.batch.hash[e])},o.prototype.runBatch=function(){try{this.batch.mode="reading",this.flush(this.batch.read),this.batch.mode="writing",this.flush(this.batch.write),this.batch.mode=null}catch(t){throw this.runBatch(),t}},o.prototype.add=function(t,e,n){var r=this.uniqueId();return this.batch.hash[r]={id:r,fn:e,ctx:n,type:t}},o.prototype.run=function(t){var e=t.ctx||this,n=t.fn;if(delete this.batch.hash[t.id],!this.onError)return n.call(e);try{n.call(e)}catch(t){this.onError(t)}},o.prototype.loop=function(){var t,e=this,n=this.raf,r=!1;function i(){var t=e.frames.shift();e.frames.length?n(i):e.looping=!1,t&&t()}this.looping||(t=setTimeout(function(){r=!0,i()},500),n(function(){r||(clearTimeout(t),i())}),this.looping=!0)},o.prototype.schedule=function(t,e){return this.frames[t]?this.schedule(t+1,e):(this.loop(),this.frames[t]=e)};var s=new o;void 0!==t&&t.exports?t.exports=s:void 0===(r=function(){return s}.call(e,n,e,t))||(t.exports=r)}()},function(t,e,n){var r=n(3),i=n(92),o=n(7);function s(t){this._inputsQueue=[],this._task=t,this._hasFlushBeenScheduled=!1}s.prototype.add=function(t){var e=new r;return this._inputsQueue.push({input:t,taskDoneDeferred:e}),this._hasFlushBeenScheduled||(this._hasFlushBeenScheduled=!0,i(o(this._flush,this))),e.promise},s.prototype._flush=function(){try{this._task.call(null,this._inputsQueue)}catch(t){this._inputsQueue.forEach(function(e){e.taskDoneDeferred.reject(t)})}this._inputsQueue=[],this._hasFlushBeenScheduled=!1},t.exports=s},function(t,e,n){var r=n(45).Promise;t.exports=r._asap},function(t,e,n){var r,i,o,s=n(4),a=n(1),u=n(28),c=n(19),d=n(3),f=n(6),l=n(53),h=n(37),p=n(0),m=n(29),v=n(9).get("scribeCallback"),g=Math.floor(1e3*Math.random())+"_",w="rufous-frame-"+g+"-",y="rufous-form-"+g+"-",b=0,_=!1,E=new d;function x(){var t=o.createElement("form"),e=o.createElement("input"),n=o.createElement("input");return b++,t.action=h.CLIENT_EVENT_ENDPOINT,t.method="POST",t.target=w+b,t.id=y+b,e.type="hidden",e.name="dnt",e.value=c.enabled(),n.type="hidden",n.name="tfw_redirect",n.value=h.RUFOUS_REDIRECT,t.appendChild(e),t.appendChild(n),t}function T(){var t=w+b;return u({id:t,name:t,width:0,height:0,border:0},{display:"none"},o.doc)}t.exports={clientEvent:function(t,e,n,i){(function(t,e){var n=!p.isObject(t),r=!!e&&!p.isObject(e),i=n||r;return i})(t,e)||(v&&v(arguments),E.promise.then(function(){!function(t,e){var n,i,s;p.isObject(t)&&p.isObject(e)&&(l.log(t,e),s=h.flattenClientEventPayload(t,e),(n=r.firstChild).value=+(+n.value||s.dnt||0),(i=o.createElement("input")).type="hidden",i.name="l",i.value=h.stringify(s),r.appendChild(i))}(h.formatClientEventNamespace(t),h.formatClientEventData(e,n,i))}))},flush:function(){return E.promise.then(function(){var t;return r.children.length<=2?f.reject():(t=f.all([o.doc.body.appendChild(r),o.doc.body.appendChild(i)]).then(function(t){var e=t[0],n=t[1];return n.addEventListener("load",function(){!function(t,e){return function(){var n=t.parentNode;n&&(n.removeChild(t),n.removeChild(e))}}(e,n)()}),e.submit(),t}),r=x(),i=T(),t)})},init:function(){return _?E.promise:((o=new m(a)).insert("rufous-sandbox",null,{display:"none"},function(t){s.body.appendChild(t)}).then(function(){o.setTitle("Twitter analytics iframe"),r=x(),i=T(),E.resolve([r,i])}),_=!0,E.promise)}}},function(t,e,n){var r=n(8),i=/^[^#?]*\.(gov|mil)(:\d+)?([#?].*)?$/i,o={};function s(t){return t in o?o[t]:o[t]=i.test(t)}t.exports={isUrlSensitive:s,isHostPageSensitive:function(){return s(r.host)}}},function(t,e,n){var r=n(0);t.exports=function t(e){var n=[];return e.forEach(function(e){var i=r.isType("array",e)?t(e):[e];n=n.concat(i)}),n}},function(t,e){t.exports=function(t){return t.filter(function(e,n){return t.indexOf(e)===n})}},function(t,e,n){var r=n(40),i=n(0),o=n(99);function s(){r.apply(this,arguments)}s.prototype=Object.create(r.prototype),i.aug(s.prototype,{factory:o}),t.exports=s},function(t,e,n){var r=n(23),i=n(0),o=n(7);t.exports={before:function(t,e){return function(){var n,i=this,o=arguments;return n=e.apply(this,arguments),r.isPromise(n)?n.then(function(){return t.apply(i,o)}):t.apply(this,arguments)}},after:function(t,e){return function(){var n,i=this,o=arguments;function s(t,e){return r.isPromise(e)?e.then(function(){return t}):t}return n=t.apply(this,arguments),r.isPromise(n)?n.then(function(t){return s(t,e.apply(i,o))}):s(n,e.apply(this,arguments))}},around:function(t,e){return function(){var n=i.toRealArray(arguments);return n.unshift(o(t,this)),e.apply(this,n)}}}},function(t,e,n){var r=n(10),i=n(17),o=n(41),s=n(6),a=n(0);t.exports=function(){var t=o();function e(e){t.apply(this,arguments),Object.defineProperty(this,"targetGlobal",{value:e})}return e.prototype=Object.create(t.prototype),a.aug(e.prototype,{id:null,initialized:!1,width:0,height:0,sandboxEl:null,insert:function(){return s.reject()},onResize:function(){},addClass:function(t){var e=this.sandboxEl;return t=Array.isArray(t)?t:[t],i.write(function(){t.forEach(function(t){r.add(e,t)})})},removeClass:function(t){var e=this.sandboxEl;return t=Array.isArray(t)?t:[t],i.write(function(){t.forEach(function(t){r.remove(e,t)})})},styleSelf:function(t){var e=this;return i.write(function(){a.forIn(t,function(t,n){e.sandboxEl.style[t]=n})})}}),e}},function(t,e,n){var r=n(4),i=n(10),o=n(17),s=n(54),a=n(25),u=n(55),c=n(56),d=n(43),f=n(28),l=n(18),h=n(57),p=n(3),m=n(6),v=n(0),g=n(9),w=n(21),y=n(7),b={allowfullscreen:"true"},_={position:"absolute",visibility:"hidden",display:"block",width:"0px",height:"0px",padding:"0",border:"none"},E={position:"static",visibility:"visible"},x="SandboxRoot",T=".SandboxRoot { display: none; }",A=50;function S(t,e,n,r){return e=v.aug({id:t},b,e),n=v.aug({},_,n),f(e,n,r)}function R(t,e,n,i,s){var a=new p,u=w.generate(),c=S(t,e,n,s);return g.set(["sandbox",u],function(){var t=c.contentWindow.document;o.write(function(){t.write("<!DOCTYPE html><html><head></head><body></body></html>")}).then(function(){t.close(),a.resolve(c)})}),c.src=["javascript:",'document.write("");',"try { window.parent.document; }",'catch (e) { document.domain="'+r.domain+'"; }',"window.parent."+g.fullPath(["sandbox",u])+"();"].join(""),c.addEventListener("error",a.reject,!1),o.write(function(){i.parentNode.replaceChild(c,i)}),a.promise}t.exports=a.couple(n(58),function(t){t.overrideProperty("id",{get:function(){return this.sandboxEl&&this.sandboxEl.id}}),t.overrideProperty("initialized",{get:function(){return!!this.win}}),t.overrideProperty("width",{get:function(){return this._width}}),t.overrideProperty("height",{get:function(){return this._height}}),t.overrideProperty("sandboxEl",{get:function(){return this.iframeEl}}),t.defineProperty("iframeEl",{get:function(){return this._iframe}}),t.defineProperty("rootEl",{get:function(){return this.doc&&this.doc.documentElement}}),t.defineProperty("widgetEl",{get:function(){return this.doc&&this.doc.body.firstElementChild}}),t.defineProperty("win",{get:function(){return this.iframeEl&&this.iframeEl.contentWindow}}),t.defineProperty("doc",{get:function(){return this.win&&this.win.document}}),t.define("_updateCachedDimensions",function(){var t=this;return o.read(function(){var e,n=h(t.sandboxEl);"visible"==t.sandboxEl.style.visibility?t._width=n.width:(e=h(t.sandboxEl.parentElement).width,t._width=Math.min(n.width,e)),t._height=n.height})}),t.define("_setTargetToBlank",function(){var t=this.createElement("base");t.target="_blank",this.doc.head.appendChild(t)}),t.define("_didResize",function(){var t=this,e=this._resizeHandlers.slice(0);return this._updateCachedDimensions().then(function(){e.forEach(function(e){e(t)})})}),t.define("setTitle",function(t){this.iframeEl.title=t}),t.override("createElement",function(t){return this.doc.createElement(t)}),t.override("createFragment",function(){return this.doc.createDocumentFragment()}),t.override("htmlToElement",function(t){var e;return(e=this.createElement("div")).innerHTML=t,e.firstElementChild}),t.override("hasSelectedText",function(){return!!s.getSelectedText(this.win)}),t.override("addRootClass",function(t){var e=this.rootEl;return t=Array.isArray(t)?t:[t],this.initialized?o.write(function(){t.forEach(function(t){i.add(e,t)})}):m.reject(new Error("sandbox not initialized"))}),t.override("removeRootClass",function(t){var e=this.rootEl;return t=Array.isArray(t)?t:[t],this.initialized?o.write(function(){t.forEach(function(t){i.remove(e,t)})}):m.reject(new Error("sandbox not initialized"))}),t.override("hasRootClass",function(t){return i.present(this.rootEl,t)}),t.define("addStyleSheet",function(t,e){var n,r=new p;return this.initialized?((n=this.createElement("link")).type="text/css",n.rel="stylesheet",n.href=t,n.addEventListener("load",r.resolve,!1),n.addEventListener("error",r.reject,!1),o.write(y(e,null,n)).then(function(){return u(t).then(r.resolve,r.reject),r.promise})):m.reject(new Error("sandbox not initialized"))}),t.override("prependStyleSheet",function(t){var e=this.doc;return this.addStyleSheet(t,function(t){var n=e.head.firstElementChild;return n?e.head.insertBefore(t,n):e.head.appendChild(t)})}),t.override("appendStyleSheet",function(t){var e=this.doc;return this.addStyleSheet(t,function(t){return e.head.appendChild(t)})}),t.define("addCss",function(t,e){var n;return c.inlineStyle()?((n=this.createElement("style")).type="text/css",n.appendChild(this.doc.createTextNode(t)),o.write(y(e,null,n))):(l.devError("CSP enabled; cannot embed inline styles"),m.resolve())}),t.override("prependCss",function(t){var e=this.doc;return this.addCss(t,function(t){var n=e.head.firstElementChild;return n?e.head.insertBefore(t,n):e.head.appendChild(t)})}),t.override("appendCss",function(t){var e=this.doc;return this.addCss(t,function(t){return e.head.appendChild(t)})}),t.override("makeVisible",function(){var t=this;return this.styleSelf(E).then(function(){t._updateCachedDimensions()})}),t.override("injectWidgetEl",function(t){var e=this;return this.initialized?this.widgetEl?m.reject(new Error("widget already injected")):o.write(function(){e.doc.body.appendChild(t)}):m.reject(new Error("sandbox not initialized"))}),t.override("matchHeightToContent",function(){var t,e=this;return o.read(function(){t=e.widgetEl?h(e.widgetEl).height:0}),o.write(function(){e.sandboxEl.style.height=t+"px"}).then(function(){return e._updateCachedDimensions()})}),t.override("matchWidthToContent",function(){var t,e=this;return o.read(function(){t=e.widgetEl?h(e.widgetEl).width:0}),o.write(function(){e.sandboxEl.style.width=t+"px"}).then(function(){return e._updateCachedDimensions()})}),t.after("initialize",function(){this._iframe=null,this._width=this._height=0,this._resizeHandlers=[]}),t.override("insert",function(t,e,n,r){var i=this,s=new p,a=this.targetGlobal.document,u=S(t,e,n,a);return o.write(y(r,null,u)),u.addEventListener("load",function(){(function(t){try{t.contentWindow.document}catch(t){return m.reject(t)}return m.resolve(t)})(u).then(null,y(R,null,t,e,n,u,a)).then(s.resolve,s.reject)},!1),u.addEventListener("error",s.reject,!1),s.promise.then(function(t){var e=d(i._didResize,A,i);return i._iframe=t,i.win.addEventListener("resize",e,!1),m.all([i._setTargetToBlank(),i.addRootClass(x),i.prependCss(T)])})}),t.override("onResize",function(t){this._resizeHandlers.push(t)}),t.after("styleSelf",function(){return this._updateCachedDimensions()})})},function(t,e){t.exports=function(){throw new Error("unimplemented method")}},function(t,e){t.exports={getBaseURLPath:function(t){switch(t&&t.tfw_team_holdback_11929&&t.tfw_team_holdback_11929.bucket){case"control":return"embed-holdback";case"holdback_prod":return"embed-holdback-prod";default:return"embed"}}}},function(t,e,n){var r=n(3),i=n(7),o=100,s=3e3;function a(t,e){this._inputsQueue=[],this._task=t,this._isPaused=!1,this._flushDelay=e&&e.flushDelay||o,this._pauseLength=e&&e.pauseLength||s,this._flushTimeout=void 0}a.prototype.add=function(t){var e=new r;return this._inputsQueue.push({input:t,taskDoneDeferred:e}),this._scheduleFlush(),e.promise},a.prototype._scheduleFlush=function(){this._isPaused||(clearTimeout(this._flushTimeout),this._flushTimeout=setTimeout(i(this._flush,this),this._flushDelay))},a.prototype._flush=function(){try{this._task.call(null,this._inputsQueue)}catch(t){this._inputsQueue.forEach(function(e){e.taskDoneDeferred.reject(t)})}this._inputsQueue=[],this._flushTimeout=void 0},a.prototype.pause=function(t){clearTimeout(this._flushTimeout),this._isPaused=!0,!t&&this._pauseLength&&setTimeout(i(this.resume,this),this._pauseLength)},a.prototype.resume=function(){this._isPaused=!1,this._scheduleFlush()},t.exports=a},function(t,e,n){var r=n(72),i=n(28),o=n(3),s=n(4),a=n(27),u=n(20),c=n(24),d=n(8),f=n(18),l=n(105),h=n(59),p=n(9),m=n(16),v=n(2),g=n(0),w=n(1),y=h(function(){return new o}),b={shouldObtainCookieConsent:!1,features:{}};t.exports={load:function(){var t,e,n,o;if(u.ie9()||u.ie10()||"http:"!==d.protocol&&"https:"!==d.protocol)return f.devError("Using default settings due to unsupported browser or protocol."),void y().resolve();t={origin:d.origin},a.settings().indexOf("localhost")>-1&&(t.localSettings=!0),e=m.url(r.resourceBaseUrl+r.widgetIframeHtmlPath,t),n=function(t){var n,r,i,o;if(r=v.isTwitterURL(t.origin),i=e.substr(0,t.origin.length)===t.origin,o=v.isTwimgURL(t.origin),i&&r||o)try{(n="string"==typeof t.data?c.parse(t.data):t.data).namespace===l.settings&&(b=g.aug(b,{features:n.settings.features,sessionId:n.sessionId}),y().resolve())}catch(t){f.devError(t)}},w.addEventListener("message",n),o=i({src:e,title:"Twitter settings iframe"},{display:"none"}),s.body.appendChild(o)},settingsLoaded:function(){var t,e;return t=p.get("experimentOverride"),y().promise.then(function(){return t&&t.name&&t.assignment&&((e={})[t.name]={bucket:t.assignment},b.features=g.aug(b.features,e)),b})}}},function(t,e){t.exports={settings:"twttr.settings"}},function(t,e,n){t.exports=[n(107),n(114),n(122),n(124),n(126),n(139),n(141)]},function(t,e,n){var r=n(16),i=n(5),o=n(0),s=n(11),a=n(12)(),u=n(60),c="a.twitter-dm-button";t.exports=function(t){return a(t,c).map(function(t){return u(function(t){var e=t.getAttribute("data-show-screen-name"),n=s(t),a=t.getAttribute("href"),u=t.getAttribute("data-screen-name"),c=e?i.asBoolean(e):null,d=t.getAttribute("data-size"),f=r.decodeURL(a),l=f.recipient_id,h=t.getAttribute("data-text")||f.text,p=t.getAttribute("data-welcome-message-id")||f.welcomeMessageId;return o.aug(n,{screenName:u,showScreenName:c,size:d,text:h,userId:l,welcomeMessageId:p})}(t),t.parentNode,t)})}},function(t,e,n){var r=n(0);t.exports=function t(e){var n;if(e)return n=e.lang||e.getAttribute("data-lang"),r.isType("string",n)?n:t(e.parentElement)}},function(t,e,n){var r=n(0),i=n(48);t.exports=function(t,e){return i(t,e)?[t]:r.toRealArray(t.querySelectorAll(e))}},function(t,e,n){var r=n(3);t.exports=function(t,e){var i=new r;return n.e(1).then(function(r){var o;try{o=n(75),i.resolve(new o(t,e))}catch(t){i.reject(t)}}.bind(null,n)).catch(function(t){i.reject(t)}),i.promise}},function(t,e,n){var r=n(61),i=n(29);t.exports=r.isSupported()?r:i},function(t,e,n){var r=n(113),i=n(1),o=n(10),s=n(35),a=n(17),u=n(54),c=n(25),d=n(55),f=n(56),l=n(57),h=n(7),p=n(43),m=n(6),v=n(0),g=50,w={position:"absolute",visibility:"hidden",display:"block",transform:"rotate(0deg)"},y={position:"static",visibility:"visible"},b="twitter-widget",_="open",E="SandboxRoot",x=".SandboxRoot { display: none; max-height: 10000px; }";t.exports=c.couple(n(58),function(t){t.defineStatic("isSupported",function(){return!!i.HTMLElement.prototype.attachShadow&&f.inlineStyle()}),t.overrideProperty("id",{get:function(){return this.sandboxEl&&this.sandboxEl.id}}),t.overrideProperty("initialized",{get:function(){return!!this._shadowHost}}),t.overrideProperty("width",{get:function(){return this._width}}),t.overrideProperty("height",{get:function(){return this._height}}),t.overrideProperty("sandboxEl",{get:function(){return this._shadowHost}}),t.define("_updateCachedDimensions",function(){var t=this;return a.read(function(){var e,n=l(t.sandboxEl);"visible"==t.sandboxEl.style.visibility?t._width=n.width:(e=l(t.sandboxEl.parentElement).width,t._width=Math.min(n.width,e)),t._height=n.height})}),t.define("_didResize",function(){var t=this,e=this._resizeHandlers.slice(0);return this._updateCachedDimensions().then(function(){e.forEach(function(e){e(t)})})}),t.override("createElement",function(t){return this.targetGlobal.document.createElement(t)}),t.override("createFragment",function(){return this.targetGlobal.document.createDocumentFragment()}),t.override("htmlToElement",function(t){var e;return(e=this.createElement("div")).innerHTML=t,e.firstElementChild}),t.override("hasSelectedText",function(){return!!u.getSelectedText(this.targetGlobal)}),t.override("addRootClass",function(t){var e=this._shadowRootBody;return t=Array.isArray(t)?t:[t],this.initialized?a.write(function(){t.forEach(function(t){o.add(e,t)})}):m.reject(new Error("sandbox not initialized"))}),t.override("removeRootClass",function(t){var e=this._shadowRootBody;return t=Array.isArray(t)?t:[t],this.initialized?a.write(function(){t.forEach(function(t){o.remove(e,t)})}):m.reject(new Error("sandbox not initialized"))}),t.override("hasRootClass",function(t){return o.present(this._shadowRootBody,t)}),t.override("addStyleSheet",function(t,e){return this.addCss('@import url("'+t+'");',e).then(function(){return d(t)})}),t.override("prependStyleSheet",function(t){var e=this._shadowRoot;return this.addStyleSheet(t,function(t){var n=e.firstElementChild;return n?e.insertBefore(t,n):e.appendChild(t)})}),t.override("appendStyleSheet",function(t){var e=this._shadowRoot;return this.addStyleSheet(t,function(t){return e.appendChild(t)})}),t.override("addCss",function(t,e){var n;return this.initialized?f.inlineStyle()?((n=this.createElement("style")).type="text/css",n.appendChild(this.targetGlobal.document.createTextNode(t)),a.write(h(e,null,n))):m.resolve():m.reject(new Error("sandbox not initialized"))}),t.override("prependCss",function(t){var e=this._shadowRoot;return this.addCss(t,function(t){var n=e.firstElementChild;return n?e.insertBefore(t,n):e.appendChild(t)})}),t.override("appendCss",function(t){var e=this._shadowRoot;return this.addCss(t,function(t){return e.appendChild(t)})}),t.override("makeVisible",function(){return this.styleSelf(y)}),t.override("injectWidgetEl",function(t){var e=this;return this.initialized?this._shadowRootBody.firstElementChild?m.reject(new Error("widget already injected")):a.write(function(){e._shadowRootBody.appendChild(t)}).then(function(){return e._updateCachedDimensions()}).then(function(){var t=p(e._didResize,g,e);new r(e._shadowRootBody,t)}):m.reject(new Error("sandbox not initialized"))}),t.override("matchHeightToContent",function(){return m.resolve()}),t.override("matchWidthToContent",function(){return m.resolve()}),t.override("insert",function(t,e,n,r){var i=this.targetGlobal.document,o=this._shadowHost=i.createElement(b),u=this._shadowRoot=o.attachShadow({mode:_}),c=this._shadowRootBody=i.createElement("div");return v.forIn(e||{},function(t,e){o.setAttribute(t,e)}),o.id=t,u.appendChild(c),s.delegate(c,"click","A",function(t,e){e.hasAttribute("target")||e.setAttribute("target","_blank")}),m.all([this.styleSelf(w),this.addRootClass(E),this.prependCss(x),a.write(r.bind(null,o))])}),t.override("onResize",function(t){this._resizeHandlers.push(t)}),t.after("initialize",function(){this._shadowHost=this._shadowRoot=this._shadowRootBody=null,this._width=this._height=0,this._resizeHandlers=[]}),t.after("styleSelf",function(){return this._updateCachedDimensions()})})},function(t,e){var n;(n=function(t,e){function r(t,e){if(t.resizedAttached){if(t.resizedAttached)return void t.resizedAttached.add(e)}else t.resizedAttached=new function(){var t,e;this.q=[],this.add=function(t){this.q.push(t)},this.call=function(){for(t=0,e=this.q.length;t<e;t++)this.q[t].call()}},t.resizedAttached.add(e);t.resizeSensor=document.createElement("div"),t.resizeSensor.className="resize-sensor";var n="position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;",r="position: absolute; left: 0; top: 0; transition: 0s;";t.resizeSensor.style.cssText=n,t.resizeSensor.innerHTML='<div class="resize-sensor-expand" style="'+n+'"><div style="'+r+'"></div></div><div class="resize-sensor-shrink" style="'+n+'"><div style="'+r+' width: 200%; height: 200%"></div></div>',t.appendChild(t.resizeSensor),{fixed:1,absolute:1}[function(t,e){return t.currentStyle?t.currentStyle[e]:window.getComputedStyle?window.getComputedStyle(t,null).getPropertyValue(e):t.style[e]}(t,"position")]||(t.style.position="relative");var i,o,s=t.resizeSensor.childNodes[0],a=s.childNodes[0],u=t.resizeSensor.childNodes[1],c=(u.childNodes[0],function(){a.style.width=s.offsetWidth+10+"px",a.style.height=s.offsetHeight+10+"px",s.scrollLeft=s.scrollWidth,s.scrollTop=s.scrollHeight,u.scrollLeft=u.scrollWidth,u.scrollTop=u.scrollHeight,i=t.offsetWidth,o=t.offsetHeight});c();var d=function(t,e,n){t.attachEvent?t.attachEvent("on"+e,n):t.addEventListener(e,n)},f=function(){t.offsetWidth==i&&t.offsetHeight==o||t.resizedAttached&&t.resizedAttached.call(),c()};d(s,"scroll",f),d(u,"scroll",f)}var i=Object.prototype.toString.call(t),o="[object Array]"===i||"[object NodeList]"===i||"[object HTMLCollection]"===i||"undefined"!=typeof jQuery&&t instanceof jQuery||"undefined"!=typeof Elements&&t instanceof Elements;if(o)for(var s=0,a=t.length;s<a;s++)r(t[s],e);else r(t,e);this.detach=function(){if(o)for(var e=0,r=t.length;e<r;e++)n.detach(t[e]);else n.detach(t)}}).detach=function(t){t.resizeSensor&&(t.removeChild(t.resizeSensor),delete t.resizeSensor,delete t.resizedAttached)},void 0!==t&&void 0!==t.exports?t.exports=n:window.ResizeSensor=n},function(t,e,n){var r=n(2),i=n(0),o=n(11),s=n(12)(),a=n(62),u=n(5),c="a.twitter-follow-button";t.exports=function(t){return s(t,c).map(function(t){return a(function(t){var e=o(t),n={screenName:r.screenName(t.href),showScreenName:"false"!==t.getAttribute("data-show-screen-name"),showCount:"false"!==t.getAttribute("data-show-count"),size:t.getAttribute("data-size"),count:t.getAttribute("data-count"),preview:t.getAttribute("data-preview")};return i.forIn(n,function(t,n){var r=e[t];e[t]=u.hasValue(r)?r:n}),e.screenName=e.screenName||e.screen_name,e}(t),t.parentNode,t)})}},function(t,e,n){var r=n(3);t.exports=function(t,e){var i=new r;return n.e(2).then(function(r){var o;try{o=n(76),i.resolve(new o(t,e))}catch(t){i.reject(t)}}.bind(null,n)).catch(function(t){i.reject(t)}),i.promise}},function(t,e,n){var r=n(17),i=n(117),o=n(59),s=n(28),a=n(3),u=n(6),c=n(7),d=n(0),f={allowfullscreen:"true"},l={position:"absolute",visibility:"hidden",width:"0px",height:"0px"},h={position:"static",visibility:"visible"},p={};i(function(t,e,n){var r=p[t];if(r)return e=e||1,n=n||1,r.styleSelf({width:e+"px",height:n+"px"}).then(function(){r.didResize()})},function(t){var e=p[t];if(e)return e._results.resolve()},function(t){var e=p[t];if(e)return e._rendered.resolve()},function(t,e){var n=p[t];n&&e&&n.setIframeVersion(e)},function(t){var e=p[t];if(e)return e._results.reject()}),t.exports=function(t){t.overrideProperty("id",{get:function(){return this.sandboxEl&&this.sandboxEl.id}}),t.overrideProperty("initialized",{get:function(){return!!this.iframeEl}}),t.overrideProperty("width",{get:function(){return this._width}}),t.overrideProperty("height",{get:function(){return this._height}}),t.overrideProperty("sandboxEl",{get:function(){return this.iframeEl}}),t.defineProperty("iframeEl",{get:function(){return this._iframe}}),t.defineProperty("iframeVersion",{get:function(){return this._iframeVersion}}),t.define("updateCachedDimensions",function(){var t=this;return this.initialized?r.read(function(){t._width=t.sandboxEl.offsetWidth,t._height=t.sandboxEl.offsetHeight}):u.resolve()}),t.define("setTitle",function(t){this.iframeEl.title=t}),t.define("setWaitToSwapUntilRendered",function(t){this._waitToSwapUntilRendered=t}),t.define("setIframeVersion",function(t){this._iframeVersion=t}),t.define("getResultsPromise",function(){return this._results.promise}),t.define("getRenderedPromise",function(){return this._rendered.promise}),t.define("makeVisible",function(){return this.styleSelf(h)}),t.define("didResize",function(){var t=this,e=t._resizeHandlers.length>0;return this.updateCachedDimensions().then(function(){e&&t._resizeHandlers.forEach(function(e){e(t)})})}),t.define("loadDocument",function(t){var e=new a;return this.initialized?this.iframeEl.src?u.reject(new Error("widget already loaded")):(this.iframeEl.addEventListener("load",e.resolve,!1),this.iframeEl.addEventListener("error",e.reject,!1),this.iframeEl.src=t,e.promise):u.reject(new Error("sandbox not initialized"))}),t.after("initialize",function(){var t=new a,e=new a;this._iframe=null,this._iframeVersion=null,this._width=this._height=0,this._resizeHandlers=[],this._rendered=t,this._results=e,this._waitToSwapUntilRendered=!1}),t.override("insert",function(t,e,n,i){var a=this;return e=d.aug({id:t},f,e),n=d.aug({},l,n),this._iframe=s(e,n),p[t]=this,a._waitToSwapUntilRendered||this.onResize(o(function(){a.makeVisible()})),r.write(c(i,null,this._iframe))}),t.override("onResize",function(t){this._resizeHandlers.push(t)}),t.after("styleSelf",function(){return this.updateCachedDimensions()})}},function(t,e,n){var r=n(1),i=n(118),o=n(120),s=n(22),a=n(5),u=n(121);t.exports=function(t,e,n,c,d){function f(t){var e=u(this);s.trigger(t.type,{target:e,region:t.region,type:t.type,data:t.data||{}})}function l(e){var n=u(this),r=n&&n.id,i=a.asInt(e.width),o=a.asInt(e.height);r&&void 0!==i&&void 0!==o&&t(r,i,o)}(new i).attachReceiver(new o.Receiver(r,"twttr.button")).bind("twttr.private.trigger",f).bind("twttr.private.resizeButton",l),(new i).attachReceiver(new o.Receiver(r,"twttr.embed")).bind("twttr.private.initialized",function(t){var e=u(this),n=e&&e.id,r=t.iframe_version;n&&r&&c&&c(n,r)}).bind("twttr.private.trigger",f).bind("twttr.private.results",function(){var t=u(this),n=t&&t.id;n&&e&&e(n)}).bind("twttr.private.rendered",function(){var t=u(this),e=t&&t.id;e&&n&&n(e)}).bind("twttr.private.no_results",function(){var t=u(this),e=t&&t.id;e&&d&&d(e)}).bind("twttr.private.resize",l)}},function(t,e,n){var r=n(24),i=n(119),o=n(0),s=n(6),a=n(23),u="2.0";function c(t){this.registry=t||{}}function d(t){var e,n;return e=o.isType("string",t),n=o.isType("number",t),e||n||null===t}function f(t,e){return{jsonrpc:u,id:d(t)?t:null,error:e}}c.prototype._invoke=function(t,e){var n,r,i;n=this.registry[t.method],r=t.params||[],r=o.isType("array",r)?r:[r];try{i=n.apply(e.source||null,r)}catch(t){i=s.reject(t.message)}return a.isPromise(i)?i:s.resolve(i)},c.prototype._processRequest=function(t,e){var n,r;return function(t){var e,n,r;return!!o.isObject(t)&&(e=t.jsonrpc===u,n=o.isType("string",t.method),r=!("id"in t)||d(t.id),e&&n&&r)}(t)?(n="params"in t&&(r=t.params,!o.isObject(r)||o.isType("function",r))?s.resolve(f(t.id,i.INVALID_PARAMS)):this.registry[t.method]?this._invoke(t,{source:e}).then(function(e){return n=t.id,{jsonrpc:u,id:n,result:e};var n},function(){return f(t.id,i.INTERNAL_ERROR)}):s.resolve(f(t.id,i.METHOD_NOT_FOUND)),null!=t.id?n:s.resolve()):s.resolve(f(t.id,i.INVALID_REQUEST))},c.prototype.attachReceiver=function(t){return t.attachTo(this),this},c.prototype.bind=function(t,e){return this.registry[t]=e,this},c.prototype.receive=function(t,e){var n,a,u,c=this;try{u=t,t=o.isType("string",u)?r.parse(u):u}catch(t){return s.resolve(f(null,i.PARSE_ERROR))}return e=e||null,a=((n=o.isType("array",t))?t:[t]).map(function(t){return c._processRequest(t,e)}),n?function(t){return s.all(t).then(function(t){return(t=t.filter(function(t){return void 0!==t})).length?t:void 0})}(a):a[0]},t.exports=c},function(t){t.exports={PARSE_ERROR:{code:-32700,message:"Parse error"},INVALID_REQUEST:{code:-32600,message:"Invalid Request"},INVALID_PARAMS:{code:-32602,message:"Invalid params"},METHOD_NOT_FOUND:{code:-32601,message:"Method not found"},INTERNAL_ERROR:{code:-32603,message:"Internal error"}}},function(t,e,n){var r=n(8),i=n(1),o=n(24),s=n(3),a=n(20),u=n(0),c=n(2),d=n(7),f=a.ie9();function l(t,e,n){var r;t&&t.postMessage&&(f?r=(n||"")+o.stringify(e):n?(r={})[n]=e:r=e,t.postMessage(r,"*"))}function h(t){return u.isType("string",t)?t:"JSONRPC"}function p(t,e){return e?u.isType("string",t)&&0===t.indexOf(e)?t.substring(e.length):t&&t[e]?t[e]:void 0:t}function m(t,e){var n=t.document;this.filter=h(e),this.server=null,this.isTwitterFrame=c.isTwitterURL(n.location.href),t.addEventListener("message",d(this._onMessage,this),!1)}function v(t,e){this.pending={},this.target=t,this.isTwitterHost=c.isTwitterURL(r.href),this.filter=h(e),i.addEventListener("message",d(this._onMessage,this),!1)}u.aug(m.prototype,{_onMessage:function(t){var e,n=this;this.server&&(this.isTwitterFrame&&!c.isTwitterURL(t.origin)||(e=p(t.data,this.filter))&&this.server.receive(e,t.source).then(function(e){e&&l(t.source,e,n.filter)}))},attachTo:function(t){this.server=t},detach:function(){this.server=null}}),u.aug(v.prototype,{_processResponse:function(t){var e=this.pending[t.id];e&&(e.resolve(t),delete this.pending[t.id])},_onMessage:function(t){var e;if((!this.isTwitterHost||c.isTwitterURL(t.origin))&&(e=p(t.data,this.filter))){if(u.isType("string",e))try{e=o.parse(e)}catch(t){return}(e=u.isType("array",e)?e:[e]).forEach(d(this._processResponse,this))}},send:function(t){var e=new s;return t.id?this.pending[t.id]=e:e.resolve(),l(this.target,t,this.filter),e.promise}}),t.exports={Receiver:m,Dispatcher:v,_stringifyPayload:function(t){return arguments.length>0&&(f=!!t),f}}},function(t,e,n){var r=n(4);t.exports=function(t){for(var e,n=r.getElementsByTagName("iframe"),i=0;n[i];i++)if((e=n[i]).contentWindow===t)return e}},function(t,e,n){var r=n(5),i=n(0),o=n(2),s=n(11),a=n(12)(),u=n(63),c="a.twitter-moment";t.exports=function(t){return a(t,c).map(function(t){return u(function(t){var e=s(t),n={momentId:o.momentId(t.href),chrome:t.getAttribute("data-chrome"),limit:t.getAttribute("data-limit")};return i.forIn(n,function(t,n){var i=e[t];e[t]=r.hasValue(i)?i:n}),e}(t),t.parentNode,t)})}},function(t,e,n){var r=n(3);t.exports=function(t,e){var i=new r;return n.e(3).then(function(r){var o;try{o=n(77),i.resolve(new o(t,e))}catch(t){i.reject(t)}}.bind(null,n)).catch(function(t){i.reject(t)}),i.promise}},function(t,e,n){var r=n(0),i=n(11),o=n(12)(),s=n(64),a="a.periscope-on-air",u=/^https?:\/\/(?:www\.)?(?:periscope|pscp)\.tv\/@?([a-zA-Z0-9_]+)\/?$/i;t.exports=function(t){return o(t,a).map(function(t){return s(function(t){var e=i(t),n=t.getAttribute("href"),o=t.getAttribute("data-size"),s=u.exec(n)[1];return r.aug(e,{username:s,size:o})}(t),t.parentNode,t)})}},function(t,e,n){var r=n(3);t.exports=function(t,e){var i=new r;return n.e(4).then(function(r){var o;try{o=n(78),i.resolve(new o(t,e))}catch(t){i.reject(t)}}.bind(null,n)).catch(function(t){i.reject(t)}),i.promise}},function(t,e,n){var r=n(5),i=n(0),o=n(65),s=n(11),a=n(12)(),u=n(66),c=n(2),d=n(18),f="a.twitter-timeline,div.twitter-timeline,a.twitter-grid",l="Embedded Search timelines have been deprecated. See https://twittercommunity.com/t/deprecating-widget-settings/102295.",h="You may have been affected by an update to settings in embedded timelines. See https://twittercommunity.com/t/deprecating-widget-settings/102295.",p="Embedded grids have been deprecated and will now render as timelines. Please update your embed code to use the twitter-timeline class. More info: https://twittercommunity.com/t/update-on-the-embedded-grid-display-type/119564.";t.exports=function(t,e){return a(t,f).map(function(t){return u(function(t){var e=s(t),n=t.getAttribute("data-show-replies"),a={isPreconfigured:!!t.getAttribute("data-widget-id"),chrome:t.getAttribute("data-chrome"),tweetLimit:t.getAttribute("data-tweet-limit")||t.getAttribute("data-limit"),ariaLive:t.getAttribute("data-aria-polite"),theme:t.getAttribute("data-theme"),borderColor:t.getAttribute("data-border-color"),showReplies:n?r.asBoolean(n):null,profileScreenName:t.getAttribute("data-screen-name"),profileUserId:t.getAttribute("data-user-id"),favoritesScreenName:t.getAttribute("data-favorites-screen-name"),favoritesUserId:t.getAttribute("data-favorites-user-id"),likesScreenName:t.getAttribute("data-likes-screen-name"),likesUserId:t.getAttribute("data-likes-user-id"),listOwnerScreenName:t.getAttribute("data-list-owner-screen-name"),listOwnerUserId:t.getAttribute("data-list-owner-id"),listId:t.getAttribute("data-list-id"),listSlug:t.getAttribute("data-list-slug"),customTimelineId:t.getAttribute("data-custom-timeline-id"),staticContent:t.getAttribute("data-static-content"),url:t.href};return a.isPreconfigured&&(c.isSearchUrl(a.url)?d.publicError(l,t):d.publicLog(h,t)),"twitter-grid"===t.className&&d.publicLog(p,t),(a=i.aug(a,e)).dataSource=o(a),a.id=a.dataSource&&a.dataSource.id,a}(t),t.parentNode,t,e)})}},function(t,e){t.exports=function(t,e,n){for(var r,i=0;i<t.length;i++)if(r=e.call(n,t[i],i,t))return r}},function(t,e,n){var r=n(31);t.exports=r.build([n(32),n(131)])},function(t,e,n){var r=n(0),i=n(130);t.exports=function(t){return"en"===t||r.contains(i,t)}},function(t,e){t.exports=["hi","zh-cn","fr","zh-tw","msa","fil","fi","sv","pl","ja","ko","de","it","pt","es","ru","id","tr","da","no","nl","hu","fa","ar","ur","he","th","cs","uk","vi","ro","bn","el","en-gb","gu","kn","mr","ta","bg","ca","hr","sr","sk"]},function(t,e,n){var r=n(2),i=n(44),o="collection:";function s(t,e){return r.collectionId(t)||e}t.exports=function(t){t.params({id:{},url:{}}),t.overrideProperty("id",{get:function(){var t=s(this.params.url,this.params.id);return o+t}}),t.before("initialize",function(){if(!s(this.params.url,this.params.id))throw new Error("one of url or id is required");i()})}},function(t,e,n){var r=n(31);t.exports=r.build([n(32),n(133)])},function(t,e,n){var r=n(2),i=n(44),o="likes:";function s(t){return r.likesScreenName(t.url)||t.screenName}t.exports=function(t){t.params({screenName:{},userId:{},url:{}}),t.overrideProperty("id",{get:function(){var t=s(this.params)||this.params.userId;return o+t}}),t.before("initialize",function(){if(!s(this.params)&&!this.params.userId)throw new Error("screen name or user id is required");i()})}},function(t,e,n){var r=n(31);t.exports=r.build([n(32),n(135)])},function(t,e,n){var r=n(2),i=n(0),o=n(27),s="list:";function a(t){var e=r.listScreenNameAndSlug(t.url)||t;return i.compact({screen_name:e.ownerScreenName,user_id:e.ownerUserId,list_slug:e.slug})}t.exports=function(t){t.params({id:{},ownerScreenName:{},ownerUserId:{},slug:{},url:{}}),t.overrideProperty("id",{get:function(){var t,e,n;return this.params.id?s+this.params.id:(e=(t=a(this.params))&&t.list_slug.replace(/-/g,"_"),n=t&&(t.screen_name||t.user_id),s+(n+":")+e)}}),t.overrideProperty("endpoint",{get:function(){var t,e=["timeline-list"];return this.params.id?e.push("list-id",this.params.id):(t=a(this.params),e.push("screen-name",t.screen_name,"slug",t.list_slug)),o.embedService(e)}}),t.before("initialize",function(){var t=a(this.params);if(i.isEmptyObject(t)&&!this.params.id)throw new Error("qualified slug or list id required")})}},function(t,e,n){var r=n(31);t.exports=r.build([n(32),n(137)])},function(t,e,n){var r=n(2),i=n(5),o=n(0),s=n(27),a="profile:";function u(t,e){return r.screenName(t)||e}t.exports=function(t){t.params({showReplies:{fallback:!1,transform:i.asBoolean},screenName:{},userId:{},url:{}}),t.overrideProperty("id",{get:function(){var t=u(this.params.url,this.params.screenName);return a+(t||this.params.userId)}}),t.overrideProperty("endpoint",{get:function(){var t=["timeline-profile"],e=u(this.params.url,this.params.screenName);return e?t.push("screen-name",e):t.push("user-id",this.params.userId),s.embedService(t)}}),t.around("queryParams",function(t){return o.aug(t(),{showReplies:this.params.showReplies?"true":"false"})}),t.before("initialize",function(){if(!u(this.params.url,this.params.screenName)&&!this.params.userId)throw new Error("screen name or user id is required")})}},function(t,e,n){var r=n(3);t.exports=function(t,e){var i=new r;return n.e(5).then(function(r){var o;try{o=n(79),i.resolve(new o(t,e))}catch(t){i.reject(t)}}.bind(null,n)).catch(function(t){i.reject(t)}),i.promise}},function(t,e,n){var r=n(10),i=n(2),o=n(0),s=n(11),a=n(12)(),u=n(67),c="blockquote.twitter-tweet, blockquote.twitter-video",d=/\btw-align-(left|right|center)\b/;t.exports=function(t,e){return a(t,c).map(function(t){return u(function(t){var e=s(t),n=t.getElementsByTagName("A"),a=n&&n[n.length-1],u=a&&i.status(a.href),c=t.getAttribute("data-conversation"),f="none"==c||"hidden"==c||r.present(t,"tw-hide-thread"),l=t.getAttribute("data-cards"),h="none"==l||"hidden"==l||r.present(t,"tw-hide-media"),p=t.getAttribute("data-media-max-width"),m=t.getAttribute("data-align")||t.getAttribute("align"),v=t.getAttribute("data-theme");return!m&&d.test(t.className)&&(m=RegExp.$1),o.aug(e,{tweetId:u,hideThread:f,hideCard:h,mediaMaxWidth:p,align:m,theme:v,id:u})}(t),t.parentNode,t,e)})}},function(t,e,n){var r=n(3);t.exports=function(t,e){var i=new r;return n.e(6).then(function(r){var o;try{o=n(80),i.resolve(new o(t,e))}catch(t){i.reject(t)}}.bind(null,n)).catch(function(t){i.reject(t)}),i.promise}},function(t,e,n){var r=n(10),i=n(0),o=n(11),s=n(12)(),a=n(68),u=n(5),c="a.twitter-share-button, a.twitter-mention-button, a.twitter-hashtag-button",d="twitter-hashtag-button",f="twitter-mention-button";t.exports=function(t){return s(t,c).map(function(t){return a(function(t){var e=o(t),n={screenName:t.getAttribute("data-button-screen-name"),text:t.getAttribute("data-text"),type:t.getAttribute("data-type"),size:t.getAttribute("data-size"),url:t.getAttribute("data-url"),hashtags:t.getAttribute("data-hashtags"),via:t.getAttribute("data-via"),buttonHashtag:t.getAttribute("data-button-hashtag")};return i.forIn(n,function(t,n){var r=e[t];e[t]=u.hasValue(r)?r:n}),e.screenName=e.screenName||e.screen_name,e.buttonHashtag=e.buttonHashtag||e.button_hashtag||e.hashtag,r.present(t,d)&&(e.type="hashtag"),r.present(t,f)&&(e.type="mention"),e}(t),t.parentNode,t)})}},function(t,e,n){var r=n(3);t.exports=function(t,e){var i=new r;return n.e(2).then(function(r){var o;try{o=n(81),i.resolve(new o(t,e))}catch(t){i.reject(t)}}.bind(null,n)).catch(function(t){i.reject(t)}),i.promise}},function(t,e,n){var r=n(0);t.exports=r.aug({},n(144),n(145),n(146),n(147),n(148),n(149),n(150))},function(t,e,n){var r=n(60),i=n(15)(["userId"],{},r);t.exports={createDMButton:i}},function(t,e,n){var r=n(62),i=n(15)(["screenName"],{},r);t.exports={createFollowButton:i}},function(t,e,n){var r=n(63),i=n(15)(["momentId"],{},r);t.exports={createMoment:i}},function(t,e,n){var r=n(64),i=n(15)(["username"],{},r);t.exports={createPeriscopeOnAirButton:i}},function(t,e,n){var r=n(8),i=n(18),o=n(2),s=n(0),a=n(5),u=n(65),c=n(66),d=n(15)([],{},c),f=n(6),l="Embedded grids have been deprecated. Please use twttr.widgets.createTimeline instead. More info: https://twittercommunity.com/t/update-on-the-embedded-grid-display-type/119564.",h={createTimeline:p,createGridFromCollection:function(t){var e=s.toRealArray(arguments).slice(1),n={sourceType:"collection",id:t};return e.unshift(n),i.publicLog(l),p.apply(this,e)}};function p(t){var e,n=s.toRealArray(arguments).slice(1);return a.isString(t)||a.isNumber(t)?f.reject("Embedded timelines with widget settings have been deprecated. See https://twittercommunity.com/t/deprecating-widget-settings/102295."):s.isObject(t)?(t=t||{},n.forEach(function(t){s.isType("object",t)&&function(t){t.ariaLive=t.ariaPolite}(e=t)}),e||(e={},n.push(e)),t.lang=e.lang,t.tweetLimit=e.tweetLimit,t.showReplies=e.showReplies,e.dataSource=u(t),d.apply(this,n)):f.reject("data source must be an object.")}o.isTwitterURL(r.href)&&(h.createTimelinePreview=function(t,e,n){var r={previewParams:t,useLegacyDefaults:!0,isPreviewTimeline:!0};return r.dataSource=u(r),d(e,r,n)}),t.exports=h},function(t,e,n){var r,i=n(0),o=n(67),s=n(15),a=(r=s(["tweetId"],{},o),function(){return i.toRealArray(arguments).slice(1).forEach(function(t){i.isType("object",t)&&(t.hideCard="none"==t.cards||"hidden"==t.cards,t.hideThread="none"==t.conversation||"hidden"==t.conversation)}),r.apply(this,arguments)});t.exports={createTweet:a,createTweetEmbed:a,createVideo:a}},function(t,e,n){var r=n(0),i=n(68),o=n(15),s=o(["url"],{type:"share"},i),a=o(["buttonHashtag"],{type:"hashtag"},i),u=o(["screenName"],{type:"mention"},i);function c(t){return function(){return r.toRealArray(arguments).slice(1).forEach(function(t){r.isType("object",t)&&(t.screenName=t.screenName||t.screen_name,t.buttonHashtag=t.buttonHashtag||t.button_hashtag||t.hashtag)}),t.apply(this,arguments)}}t.exports={createShareButton:c(s),createHashtagButton:c(a),createMentionButton:c(u)}},function(t,e,n){var r,i,o,s=n(4),a=n(1),u=0,c=[],d=s.createElement("a");function f(){var t,e;for(u=1,t=0,e=c.length;t<e;t++)c[t]()}/^loade|c/.test(s.readyState)&&(u=1),s.addEventListener&&s.addEventListener("DOMContentLoaded",i=function(){s.removeEventListener("DOMContentLoaded",i,!1),f()},!1),d.doScroll&&s.attachEvent("onreadystatechange",r=function(){/^c/.test(s.readyState)&&(s.detachEvent("onreadystatechange",r),f())}),o=d.doScroll?function(t){a.self!=a.top?u?t():c.push(t):function(){try{d.doScroll("left")}catch(e){return setTimeout(function(){o(t)},50)}t()}()}:function(t){u?t():c.push(t)},t.exports=o},function(t,e,n){var r=n(42),i=n(9);t.exports=function(){i.set("buildVersion",r.version)}},function(t,e,n){n(154),n(157),n(158)},function(t,e,n){var r=n(155),i=n(26),o=n(69),s=new r,a=function(t){t.widgets&&1===t.widgets.length&&(s.start(),i.emitter.unbind(i.ALL_WIDGETS_RENDER_START,a))},u=function(t){var e;t.widgets&&1===t.widgets.length&&(e=t.widgets[0],s.end(),e.dataset&&e.dataset.tweetId&&o({duration:s.duration(),namespace:{element:"tweet",action:"render"},widgetIds:[e.dataset.tweetId]})),i.emitter.unbind(i.ALL_WIDGETS_RENDER_END,u)};i.emitter.bind(i.ALL_WIDGETS_RENDER_START,a),i.emitter.bind(i.ALL_WIDGETS_RENDER_END,u)},function(t,e,n){var r=n(156);function i(){}i.prototype.start=function(){this._startTime=r()},i.prototype.end=function(){this._duration=r()-this._startTime},i.prototype.duration=function(){return this._duration},t.exports=i},function(t,e,n){var r=n(1);t.exports=function(){return r.performance&&r.performance.now?r.performance.now():Date.now()}},function(t,e,n){var r,i=n(26),o=0;function s(){r&&r.length===o&&(i.emitter.trigger(i.ALL_WIDGETS_AND_IMAGES_LOADED,r),r=null)}i.emitter.bind(i.ALL_WIDGETS_RENDER_END,function(t){r=t.widgets,s()}),t.exports={reportImagesLoadForAWidget:function(){o++,s()}}},function(t,e,n){var r=n(26),i=n(69),o=n(159),s=n(2),a=n(1),u=n(0),c=n(20),d=n(61);function f(t){return t.performance.getEntriesByType("resource").filter(function(t){return s.isTwimgURL(t.name)||s.isTwitterURL(t.name)}).reduce(function(t,e){return t[e.name]=e.duration,t},{})}r.emitter.bind(r.ALL_WIDGETS_AND_IMAGES_LOADED,function(t){var e,n,r=[];c.hasPerformanceInformation()&&(e=f(a),d.isSupported()||(r=function(t){return t.reduce(function(t,e){return u.aug(t,f(e.contentDocument.defaultView))},{})}(t)),n=u.aug({},e,r),Object.keys(o).forEach(function(t){!function(t,e,n){var r=Object.keys(t).reduce(function(e,r){return n(r)?e+t[r]:e},0);i({duration:r,namespace:{element:e,action:"resource"}})}(n,t,o[t])}))})},function(t,e,n){var r=n(2),i={all:function(){return!0},image:function(t){return r.isTwimgURL(t)},settings:function(t){return r.isSettingsURL(t)},widget_iframe:function(t){return r.isWidgetIframeURL(t)}};t.exports=i}])));
  

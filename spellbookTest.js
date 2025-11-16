(function () {
  const mVersion = "20251115011723";
  const mMBLink ="https://magicbakery.github.io/?id=P202511132257";
  const PANEL_ID = 'mb-spellbook-injection-div'; // This is the ID of the added section.
  
  // State to track if codename mode is active (SET TO TRUE FOR DEFAULT ON)
  let isCodenameMode = true;

  // STEP 0: If the panel already exists, remove it.
  let mPanel;
  let mContent;
  let btnCapture;
  let btnExport;
  let mSource;  
  let threadData = [];  // Storage for comment data, used for export
  let allParticipantLinks = [];
  let mOP = "";
  const mParticipantMap = new Map();
  let mPostMap = new Map();
  let mPostCount = 0;

  // STEP 1: Determine what website the bookmarklet is running for
  const baseUrl = location.href.split("?")[0];  
  const bNextDoor = baseUrl.includes("https://nextdoor.com");
  const bTwitter = baseUrl.includes("https://x.com");

  const BASE_COLOR = '#f0f8ff'; // Light blue background
  if(bTwitter){
    // For Twitter, create a thread exporter panel.
    // Look for a DOM object "article". Then add the new panel above that.
    if(!CreatePanel('[aria-label="Timeline: Trending now"]')){return;}  
    mPanel.style.marginTop = "20px";
    //if(!CreatePanel('[data-testid="SearchBox_Search_Input_label"]')){return;}
    Analyze();
    return;
  }  
  if(bNextDoor){    
    if(!CreatePanel('[data-testid="feed-container"]')){return;}
    // Initial run
    Analyze();
    return;
  }
  


  // HELPER FUNCTIONS
   function Analyze(){
    mPanel.style.backgroundColor = '#f0fff0'; // Light green flash on refresh
    isCodenameMode = true; // Reset codename view state to ON on refresh
    threadData = []; // Clear previous data
    if(bNextDoor){AnalyzeNextDoor();}
    if(bTwitter){AnalyzeTwitter();}
  
  }
  function AnalyzeNextDoor() {}
  function AnalyzeTwitter(){
    btnCapture.style.backgroundColor='#f44336'; // Red
    btnCapture.innerHTML = "Capturing...";


    // STEP 1: Get comment count
    let xReplyButton = document.querySelector("button[data-testid='reply']");
    let xTotalCount = parseInt(xReplyButton.getAttribute('aria-label').split(' ')[0]) + 1;
    
    // STEP 2: Get Participants (OP + Commenters)
    mSource = document.querySelector('section');
    if (mSource) {
      // Remove Ads
      mSource.querySelectorAll("span").forEach(a=>{
        if(a.innerHTML=="Ad"){
          a.closest('article').remove();
        }
      });
      // Remove all Unavailable Posts
      mSource.querySelectorAll("article").forEach(a=>{
        if(!a.querySelector(["[data-testid='User-Name']"])){
          a.remove();
        }
      });
      
      let aCommenterCount = 0;      
      mSource
        .querySelectorAll("[data-testid='User-Name']")
        .forEach(a => {
          let aPost = a.closest('article');
          let aLinks = aPost.querySelectorAll("a");
          let aPostLink = aLinks[3].href;
          let aAuthorName = "@" + aPostLink.split("/")[3];
          // If the post link is new, add the post to the map.
          
          if(!mPostMap.has(aPostLink)){
            
            let aInner = aPost.querySelector("[data-testid='tweetText'] span");
            let aContent = "(No content text.)";
            if(aInner){aContent = escapeHtml(aInner.textContent);}
            mPostMap.set(aPostLink,{
              id: mPostMap.size+1,
              author: aAuthorName,
              time: aPost.querySelector("time").getAttribute('datetime'),
              link: aPostLink,
              content: aContent
            });                
          }

          
          if(!mOP){mOP = aAuthorName};
          
          let bIsOP = (mOP == aAuthorName);
          if(!mParticipantMap.has(aAuthorName)){
            let aCodeName = "";
            if(bIsOP){
              aCodeName = "OP";
            }else{
              aCodeName = `C${String(++aCommenterCount).padStart(3, '0')}`;
            }
            mParticipantMap.set(aAuthorName, {
              codename: aCodeName,
              realName: aAuthorName,
              uniqueId: aAuthorName || 'N/A' // Store the profile ID if available
            });
            
          }
          //allParticipantLinks.push(a.closest('article'));
        });      
    }

    // STEP 5: Build List and Content Boxes (Second pass: populate HTML)
    let authorListHtml = '';    
    let displayIndex = 0;

    // STEP Last: Display / Export the data
    // Status Line Container (Moved below the aligned row)

    
    mPostMap.forEach(a =>{
      mContent.innerHTML += "<div >";
      mContent.innerHTML += "<a style='font-family:consolas' href='"+ a.link+"' target='_blank'>[" + a.id + "]</a> ";
      mContent.innerHTML += "<a toggleNext style='font-family:consolas'>" + formatIsoToCustom(a.time) + " " + a.author + "</a>";
      mContent.innerHTML += "<div style='display:none;padding:0 5px;font-size:12px;background-color: rgba(255, 255, 255, 0.7);border:1px solid teal;'>"+a.content+"</div>";
      mContent.innerHTML += "</div>";
    });
    let aToggles = mContent.querySelectorAll('[toggleNext]');
    aToggles.forEach(a=>{
      a.addEventListener('click',function(event){
        event.preventDefault();
        const elTarget = this.nextElementSibling;
        if(elTarget.style.display ==='none'){
          elTarget.style.display = 'block';
        }else{
          elTarget.style.display = 'none';
        }
      });
    });
    btnCapture.innerHTML = "Captured " + mPostMap.size;   
    btnCapture.style.backgroundColor = '#4CAF50'; // Green
    setTimeout(() => { 
        btnCapture.style.backgroundColor = '#2196F3'; // Blue
    }, 1500);

    

  }
  function ResetTwitter(){
    mPostMap = new Map();
    mContent.innerHTML = "";
    btnCapture.innerHTML = "Capture";


  }
  function ExportForAI(){
  
    let mExportStr = "--- Thread Analysis Data ---\n";
    mPostMap.forEach(a =>{
      mExportStr += "[" + a.id + "] " + a.author + " " + a.time + " " + a.link + "\n";
      mExportStr += escapeForAiExport(a.content) + "\n\n";
    });
    navigator.clipboard.writeText(mExportStr).then(() => {
      btnExport.textContent = 'Copied!';
      btnExport.style.backgroundColor = '#4CAF50'; // Green
      setTimeout(() => { 
          btnExport.textContent = 'Export';
          btnExport.style.backgroundColor = '#2196F3'; // Blue
      }, 1500);
    }).catch(err => {
      console.error('Could not copy text: ', err);
      btnExport.textContent = 'Failed!';
      btnExport.style.backgroundColor = '#f44336'; // Red
      setTimeout(() => { 
          btnExport.textContent = 'Export'; 
          btnExport.style.backgroundColor = '#2196F3';
      }, 1500);
    });
  
  }
  function CreatePanel(iSelector,bAfter){
    // First check if the panel already exists. If so, remove it.
    mPanel = document.getElementById(PANEL_ID);
    if (mPanel) mPanel.remove();

    mSource = document.querySelector(iSelector);
    if(!mSource){
      console.error("Panel Create: Cannot find " + iSelector + ".");
      return false;
    }

    mPanel = document.createElement("div");
    mPanel.id = PANEL_ID;
    // Set overflow to hidden on the panel so only the inner content scrolls
    mPanel.style.cssText =
      `position:relative;max-height:80vh;overflow-y:hidden;padding:10px;padding-top:50px;margin-bottom:1rem;background:${BASE_COLOR};border:1px solid #1e90ff;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);font-family:Inter,sans-serif;transition:background-color 0.5s;`;    

    const mHeader = document.createElement("div");
    mHeader.style.cssText =
      "position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:rgba(255,255,255,.95);border-bottom:1px solid #1e90ff;border-radius:8px 8px 0 0;z-index:10;";

    const mFooter = document.createElement("div");
    mFooter.style.cssText = "font-size: 0.8em; border-top: 1px dashed #ccc; padding-top: 5px; margin-top: 10px;";
    mFooter.innerHTML = 'Please visit <a href="'+mMBLink+'" target="_blank" style="color: #010202ff; text-decoration: none;">Magic Bakery</a> for updates of this bookmarklet.';

    const mTitle = document.createElement("span");
    mTitle.textContent = "Thread Exporter " + mVersion;
    mTitle.style.cssText = "font-weight:bold;color:black;padding:4px;cursor:pointer;";
    mTitle.title = "Click to show/hide content";

    const mControls = document.createElement("div");
    mControls.style.cssText = "display:flex;gap:6px;align-items:center;";

    // Refresh Button (Icon)
    const btnAnalyze = document.createElement("button");
    btnAnalyze.style.cssText =
      "background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:background-color 0.2s;color:#1e90ff;transform:scale(1);";
    btnAnalyze.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.5 9a9 9 0 0 1 14.5-5.5L23 10M1 14l4.5 5.5A9 9 0 0 0 20.5 15"></path></svg>';
    btnAnalyze.title = 'Analyze/Refresh Content';
    btnAnalyze.onclick = Analyze;

    // Close Button (Icon)
    const btnClose = document.createElement("button");
    btnClose.style.cssText =
      "background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:background-color 0.2s;color:#f44336;transform:scale(1);";
    btnClose.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    btnClose.title = 'Close Panel';
    btnClose.onclick = () => mPanel.remove();

    // Export Button
    btnExport = document.createElement("button");
    btnExport.style.cssText = "padding: 5px 10px;background: #2196F3;color: white;border: none;border-radius: 4px;cursor: pointer;font-size: 0.8em;transition: background 0.3s;white-space: nowrap;";
     btnExport.innerHTML = "Export";
     btnExport.title = "Export";
     btnExport.onclick = ExportForAI;

    // Capture Button
    btnCapture = document.createElement("button");
    btnCapture.style.cssText = "padding: 5px 10px;background: #2196F3;color: white;border: none;border-radius: 4px;cursor: pointer;font-size: 0.8em;transition: background 0.3s;white-space: nowrap;margin-right:10px";
     btnCapture.innerHTML = "Capture";
     btnCapture.title = "Capture";
     btnCapture.onclick = AnalyzeTwitter;

    // Content Frame
    mYFrame  = document.createElement("div");
    mYFrame.style.cssText = "padding-bottom: 5px; display: block;";
    mContent = document.createElement("div");
    mContent.style.cssText = "padding-bottom: 5px; display: block; max-height:200px;overflow-y: auto;";
    
    // Assembly
    if(bNextDoor){
      mControls.appendChild(btnAnalyze);
      mControls.appendChild(btnClose);
      mHeader.appendChild(mTitle);
      mHeader.appendChild(mControls);
      mPanel.appendChild(mHeader);
      mPanel.appendChild(mYFrame);
      mYFrame.appendChild(mContent);
      mYFrame.appendChild(mFooter);
    }
    if(bTwitter){
      btnAnalyze.onclick = ResetTwitter;
      btnAnalyze.title = "Reset";
      mControls.appendChild(btnAnalyze);      
      mControls.appendChild(btnClose);
      mHeader.appendChild(mTitle);
      mHeader.appendChild(mControls);
      mPanel.appendChild(mHeader);
      mPanel.appendChild(mYFrame);
      mYFrame.appendChild(mContent);
      mYFrame.appendChild(mFooter);
      mPanel.appendChild(btnCapture);
      mPanel.appendChild(btnExport);
    }

    // Toggle content visibility when title is clicked
    mTitle.addEventListener('click', () => {
      mYFrame.style.display = mYFrame.style.display === 'none' ? 'block' : 'none';
    });
    if(bAfter){
      mSource.after(mPanel);
    }else{
      mSource.before(mPanel);
    }
    
    return mPanel;
  }
  function escapeHtml(str) {
    return str
      ? str
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, ">") // Keep > for formatting purposes in the output text
          .replace(/"/g, '"')
          .replace(/'/g, "'")
      : "";
  }
  // Custom escape function for AI export (simpler, preserves common characters)
  function escapeForAiExport(str) {
      if (!str) return "";
      // Strip leading/trailing whitespace
      let cleaned = str.trim();
      // Replace common newlines with spaces for a single-line block quote, 
      // or just keep them if they are meaningful paragraphs. Let's keep newlines 
      // for better multi-paragraph analysis, but clean up HTML entities.
      return cleaned
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
  }
  function formatIsoToCustom(isoString) {
    const date = new Date(isoString);

    // Helper function to pad single digits with a leading zero
    const pad = (num) => String(num).padStart(2, '0');

    // --- Date Components (UTC) ---
    const YYYY = date.getUTCFullYear();
    // Months are 0-indexed (0 = Jan, 11 = Dec), so add 1
    const MM = pad(date.getUTCMonth() + 1); 
    const DD = pad(date.getUTCDate());

    // --- Time Components (UTC) ---
    const hh = pad(date.getUTCHours());
    const mm = pad(date.getUTCMinutes());
    const ss = pad(date.getUTCSeconds());

    // Combine components into the desired format: YYYYMMDD-hhmmss
    return `${YYYY}${MM}${DD}-${hh}${mm}${ss}`;
  }
  function ShowNext(el){
    const elTarget = el.nextElementSibling;
    if(elTarget.style.display ==='none'){
      elTarget.style.display = 'block';
    }else{
      elTarget.style.display = 'none';
    }
  }
})();
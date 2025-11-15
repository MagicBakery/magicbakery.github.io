(function () {
  const mVersion = "20251115011723";
  const mMBLink ="https://magicbakery.github.io/?id=P202511132257";
  const PANEL_ID = 'mb-spellbook-injection-div'; // This is the ID of the added section.
  
  // State to track if codename mode is active (SET TO TRUE FOR DEFAULT ON)
  let isCodenameMode = true;

  // STEP 0: If the panel already exists, remove it.
  let mPanel =  document.getElementById(PANEL_ID);
  if (mPanel) mPanel.remove();
  let mContent;

  // STEP 1: Determine what website the bookmarklet is running for
  const baseUrl = location.href.split("?")[0];  
  const bNextDoor = baseUrl.includes("https://nextdoor.com");
  const bTwitter = baseUrl.includes("https://x.com");

  const BASE_COLOR = '#f0f8ff'; // Light blue background

  if(bTwitter){
    // For Twitter, create a thread exporter panel.
    // Look for a DOM object "article". Then add the new panel above that.
    let mFirstArticle = document.querySelector('article');
    if(!mFirstArticle){
      console.error(`Thread Exporter: Thread is not found.`);
      return;
    }
    // Create a panel
    CreatePanel();
    mFirstArticle.before(mPanel);
    return;
  }  
  if(!bNextDoor){ 
    
    return; 
  }
  const FEED_SEL = '[data-testid="feed-container"]'; // Specific to NextDoor Thread Exporter  
  const feed = document.querySelector(FEED_SEL);
  if (!feed) {
    console.error(`Thread Exporter: Target feed container not found: ${FEED_SEL}`);
    return;
  }

  // --- Panel Creation ---
  const panel = CreatePanel();

  
  feed.parentNode.insertBefore(panel, feed);

  
  
  // Storage for comment data, used for export
  let threadData = [];

  function analyze() {
    panel.style.backgroundColor = '#f0fff0'; // Light green flash on refresh
    isCodenameMode = true; // Reset codename view state to ON on refresh
    threadData = []; // Clear previous data

    const threadRoot = document.querySelector('div[id^="feedItem"]');

    // --- 1. Get Total Comment Count ---
    const replyBtn = document.querySelector('[data-testid="post-reply-button"]');
    let totalCount = "N/A";
    if (replyBtn) {
      let spans = replyBtn.querySelectorAll("span");
      if (spans.length) {
        totalCount = spans[spans.length - 1].textContent.trim().replace(/\D/g, "") || "N/A";
      }
    }

    // --- 2. Get Participants (OP + Commenters) ---
    let allParticipantLinks = [];
    if (threadRoot) {
      threadRoot
        .querySelectorAll('a[href$="feed_author"],a[href$="feed_commenter"]')
        .forEach(a => {
          if (a.children.length === 0) allParticipantLinks.push(a);
        });
    }

    // --- 3. Map Unique IDs to Codename (OP, C001, C002, etc.) ---
    const participantMap = new Map();
    let commenterCount = 0;
    
    // First pass: build the map of unique users
    allParticipantLinks.forEach(link => {
        const authorName = link.textContent.trim();
        const isOp = link.href.endsWith("feed_author");
        
        // Extract unique ID: from /profile/ID/
        const userProfileId = link.href.match(/\/profile\/([^/?]+)/)?.[1];
        // Use the profile ID as the unique key, or a fallback for the OP if the link is non-standard
        const uniqueKey = userProfileId || (isOp ? 'OP_UNIQUE_KEY' : authorName); 

        if (!participantMap.has(uniqueKey)) {
            let assignedCodename = '';
            if (isOp) {
                assignedCodename = 'OP';
            } else {
                assignedCodename = `C${String(++commenterCount).padStart(3, '0')}`;
            }
            participantMap.set(uniqueKey, {
                codename: assignedCodename,
                realName: authorName,
                uniqueId: userProfileId || 'N/A' // Store the profile ID if available
            });
        }
    });

    // --- 4. Calculate Visible Count (Commenters only) ---
    const visibleCommenters = allParticipantLinks.filter(link => link.href.endsWith("feed_commenter")).length;

    // --- 5. Build List and Content Boxes (Second pass: populate HTML) ---
    let authorListHtml = '';
    
    let displayIndex = 0;

    allParticipantLinks.forEach(link => {
      const authorName = link.textContent.trim();
      const isOp = link.href.endsWith("feed_author");
      const contentId = `c${displayIndex}`;
      
      const userProfileId = link.href.match(/\/profile\/([^/?]+)/)?.[1];
      const uniqueKey = userProfileId || (isOp ? 'OP_UNIQUE_KEY' : authorName);
      
      const participantData = participantMap.get(uniqueKey) || { codename: 'Unknown', realName: authorName, uniqueId: 'N/A' };
      const assignedCodename = participantData.codename;
      const uniqueUserIdDisplay = participantData.uniqueId;
      
      // Determine initial display name based on isCodenameMode (which is true)
      const initialDisplayName = isCodenameMode ? assignedCodename : authorName;


      let commentText = "Comment text not found.";
      let url = "#";

      if (isOp) {
        let opContainer = threadRoot || document;
        let el = opContainer.querySelector('[data-testid="post-body"]');
        if (el) commentText = el.textContent.trim();
        url = baseUrl; // Link to the current page
      } else {
        let box = link.closest('[id^="comment_"]');
        if (box) {
          let body = box.querySelector('[data-testid="comment-detail-body"]');
          if (body) commentText = body.textContent.trim();
          let id = (box.id || "").split("_").pop();
          url = `${baseUrl}/c/${id}`; // Link to the specific comment
        }
      }
      
      // Store data for export
      threadData.push({
          index: displayIndex,
          codename: assignedCodename,
          realName: authorName,
          text: commentText
      });


      // List Item with square bracket numbering - Removed border-bottom
      authorListHtml += `
        <div style="font-size: 0.9em; padding: 0 0; line-height: 1.5; margin-bottom: 4px;">
          [${displayIndex}] <a href="${url}" target="_blank" class="cex-author"
             data-cid="${contentId}"
             data-codename="${assignedCodename}"
             data-realname="${authorName}"
             data-unique-id="${uniqueUserIdDisplay}"
             title="${isCodenameMode ? `Real Name: ${authorName} | ID: ${uniqueUserIdDisplay}` : `Codename: ${assignedCodename}`}"
             style="color: #007bff; text-decoration: none; cursor: pointer;">${initialDisplayName}</a>
        </div>`;

      // Hidden Content Div - Added background color, padding, and explicit margin-bottom
      authorListHtml += `
        <div id="${contentId}" style="display:none;padding:5px;margin-bottom:5px;;max-height:200px;overflow-y:auto;text-indent:0;font-size:0.9em;background-color:white;border-radius:4px;">
          ${escapeHtml(commentText)}
        </div>
      `;

      displayIndex++;
    });
    
    // --- New Aligned Row (Last Analyzed, Checkbox, and Export Button) ---
    const analyzedAndButtonHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 0; padding-bottom: 0.5rem; flex-wrap: wrap;">
            <p style="font-size: 0.8em; margin: 0;">Last Analyzed: ${(new Date()).toLocaleTimeString()}</p>
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" id="toggle-codename-cb" ${isCodenameMode ? 'checked' : ''} title="Toggle Codename/Real Name" style="cursor: pointer;">
                <button id="export-thread-btn" style="
                    padding: 5px 10px;
                    background: #2196F3;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.8em;
                    transition: background 0.3s;
                    white-space: nowrap;
                ">
                    Export
                </button>
            </div>
        </div>
    `;

    // Status Line Container (Moved below the aligned row)
    const statusLineHtml = `
        <div style="margin: 0; padding-bottom: 0.5rem;">
            <p style="margin: 0; font-size: 0.9em;">Loaded <span style="font-weight: bold; color: #4CAF50;">${visibleCommenters}/${totalCount}</span>.</p>
        </div>
    `;



    // --- 6. Assemble Final Output ---
    let errorHtml = '';
    if(!threadRoot){
        errorHtml = '<p style="margin: 1rem 0 0.5rem 0; font-size: 1em; color: #f44336; font-weight: bold;">Error: First thread container (div[id^="feedItem"]) not found.</p>';
    }

    mContent.innerHTML = `
      ${errorHtml}
      ${analyzedAndButtonHtml} 
      ${statusLineHtml}       
      
      <div style="max-height: 40vh; overflow-y: auto; padding-right: 5px; border-top: 1px solid #ddd; margin-top: 5px; padding-top: 5px;">
          ${authorListHtml}
      </div>
    `;

    // --- 7. Implement Toggle Logic ---
    const toggleCb = document.getElementById('toggle-codename-cb');
    const exportBtn = document.getElementById('export-thread-btn');
    
    // Function to handle the name display toggle
    const toggleNames = (isInit = false) => {
        // Only update state if it's not the initial run
        if (!isInit) {
            isCodenameMode = toggleCb.checked;
        }

        document.querySelectorAll(".cex-author").forEach(a => {
            a.textContent = isCodenameMode ? a.dataset.codename : a.dataset.realname;
            // Update tooltip on hover
            a.title = isCodenameMode 
                ? `Real Name: ${a.dataset.realname} | ID: ${a.dataset.uniqueId}` 
                : `Codename: ${a.dataset.codename}`;
        });
    };
    
    // Function to export the data
    const exportData = () => {
        if (!threadData || threadData.length === 0) {
            exportBtn.textContent = 'No Data!';
            setTimeout(() => { exportBtn.textContent = 'Export'; }, 1500);
            return;
        }

        let output = "--- Thread Analysis Data ---\n\n";
        
        threadData.forEach(item => {
            const name = isCodenameMode ? item.codename : item.realName;
            const text = escapeForAiExport(item.text);
            
            output += `[${item.index}] ${name}:\n`;
            output += `> ${text.replace(/\n/g, '\n> ')}\n\n`; // Format text with blockquotes
        });

        // Copy to clipboard
        navigator.clipboard.writeText(output).then(() => {
            exportBtn.textContent = 'Copied!';
            exportBtn.style.backgroundColor = '#4CAF50'; // Green
            setTimeout(() => { 
                exportBtn.textContent = 'Export';
                exportBtn.style.backgroundColor = '#2196F3'; // Blue
            }, 1500);
        }).catch(err => {
            console.error('Could not copy text: ', err);
            exportBtn.textContent = 'Failed!';
            exportBtn.style.backgroundColor = '#f44336'; // Red
            setTimeout(() => { 
                exportBtn.textContent = 'Export'; 
                exportBtn.style.backgroundColor = '#2196F3';
            }, 1500);
        });
    };


    if (toggleCb) {
        // Initial setup to ensure names are codenamed (since isCodenameMode starts as true)
        toggleNames(true);
        
        // Event Listener for the checkbox
        toggleCb.addEventListener('change', () => toggleNames(false));
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }


    // --- 8. Set up Dynamic Click Listeners for Content Toggle ---
    document.querySelectorAll(".cex-author").forEach(a => {
      // Left click to toggle content visibility
      a.addEventListener("click", e => {
        if (e.button !== 0) return;
        e.preventDefault();
        let box = document.getElementById(a.dataset.cid);
        if (box) box.style.display = box.style.display === "none" ? "block" : "none";
      });

      // Right click (auxclick) handler to ensure the context menu works with the link
      a.addEventListener("contextmenu", e => {
          // Allow default context menu action (which handles opening the link)
      });
    });

    setTimeout(() => {
      panel.style.backgroundColor = BASE_COLOR;
    }, 500);
  }

  // Initial run
  analyze();

  // HELPER FUNCTIONS
  function CreatePanel(){
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
    mFooter.innerHTML = 'Please visit <a href="`+mMBLink+`" target="_blank" style="color: #010202ff; text-decoration: none;">Magic Bakery</a> for updates of this bookmarklet.';

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
    btnAnalyze.onclick = analyze;

    // Close Button (Icon)
    const btnClose = document.createElement("button");
    btnClose.style.cssText =
      "background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:background-color 0.2s;color:#f44336;transform:scale(1);";
    btnClose.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    btnClose.title = 'Close Panel';
    btnClose.onclick = () => mPanel.remove();

    // Content Frame
    mContent = document.createElement("div");
    mContent.style.cssText = "padding-bottom: 5px; display: block;"
    mControls.appendChild(btnAnalyze);
    mControls.appendChild(btnClose);
    mHeader.appendChild(mTitle);
    mHeader.appendChild(mControls);
    mPanel.appendChild(mHeader);
    mPanel.appendChild(mContent);
    mPanel.appendChild(mFooter);

    // Toggle content visibility when title is clicked
    mTitle.addEventListener('click', () => {
      mContent.style.display = mContent.style.display === 'none' ? 'block' : 'none';
    });
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
})();
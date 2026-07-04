// qsdk.js
const QuestSDK = {
  // 1. Initialize the SDK with the user's specific configuration
  init(config) {

    // First load from local storage.
    this.publicAPI = localStorage.getItem("questSDKpublicAPI");
    this.guildAPI = localStorage.getItem("questSDKguildAPI");
    this.personalAPI = localStorage.getItem("questSDKpersonalAPI");

    // If public API is blank, load from config.
    if(!this.publicAPI){
      if (!config || !config.API_URL) {
        console.error("QuestSDK Error: API_URL is required inside init().");
        return;
      }
      this.publicAPI = config.API_URL;
    }
  },
  APIGet(bFetch,elSource,elDest){
    // 20260703: StarTree: The control's value specifies the destination.
    // When bFetch is TRUE, return API URL for fetching.
    // When bFetch is FALSE, return the API RUL for sending.
    if(elDest){ this.apiDestControl = elDest; }
    if(elSource){ this.apiSourceControl = elSource; }
    if(bFetch && !this.apiSourceControl){
      confirm('Cannot fetch data because the source scope is unknown.');
      return null;
    }
    if(!bFetch && !this.apiDestControl){
      confirm('Cannot send data because the destination scope is unknown.');
      return null;
    }
    var mScope = bFetch? this.apiSourceControl.value.toLowerCase():this.apiDestControl.value.toLowerCase();
    if(mScope==="public"){
      if(!this.publicAPI){
        confirm("Public API is not set.");
      }
      return this.publicAPI;
    }else if(mScope==="guild"){
      if(!this.guildAPI){
        confirm("Guild API is not set.");
      }
      return this.guildAPI;
    }else if(mScope==="personal"){
      if(!this.personalAPI){
        confirm("Personal API is not set.");
      }
      return this.personalAPI;
    }else if(mScope==="locked"){
      if(bFetch===false){
        confirm("Message sending is locked.");
      }else if(bFetch===null){
        return null;
      }
      
      return null;
    }
    confirm("Destination API is not set.");
    return null;
  },
  APISet(iScope,elTextbox,iURL){
    // 20260703: StarTree: Saves the API URL for the scope.    
    // Read from textbox if iURL is not specified.
    if(!iURL){iURL = elTextbox.value};
    iURL = iURL.trim();
    const lScope = iScope.toLowerCase();
    if(lScope==="public"){
      this.publicAPI = iURL;
      localStorage.setItem("questSDKpublicAPI",iURL);
      return;
    }else if(lScope==="guild"){
      this.guildAPI = iURL;
      localStorage.setItem("questSDKguildAPI",iURL);
      return;
    }else if(lScope==="personal"){
      this.personalAPI = iURL;
      localStorage.setItem("questSDKpersonalAPI",iURL);
      return;
    }
  },
}
// Helper Functions in Alphabetical Order
async function CopyToClipboard(text) {
  // usage:
  //copyToClipboard("hello world").catch(console.error);
  await navigator.clipboard.writeText(text);
}
function DEBUG(iStr){
  console.log(iStr);
};
function EntryDismiss(e, btn){
  e.stopPropagation();
  const logItem = btn.closest('.log-item');
  if (logItem) logItem.classList.add('hidden');
  logItem.classList.add('dismissed');
}
function EntryListComments(questId,btn){
  // 20260702: StarTree: This is run from an entry to list the comments of that entry in that entry. Gather the commetnts and put them 
  const logItem = btn.closest('.log-item');
  if (!logItem) return;

// Ensure comments container exists as the last child
  let commentsSection = logItem.querySelector('.commentsSection');
  commentsSection.classList.remove('hidden');

  // Avoid doing duplicate work if already showing for the same questId
  commentsSection.dataset.questId = questId; 

  const ledgerOutput = document.getElementById('ledgerOutput');
  if (!ledgerOutput) return;


  // Collect all potential comment log items (from bottom) for this questId,
  // excluding the current logItem, and move them into commentsSection.
  const candidates = Array.from(
    ledgerOutput.querySelectorAll(`.log-item[data-quest-id="${questId}"]`)
  );

  // If none exist, show empty state
  if (candidates.length === 0) {
    commentsSection.classList.add('hidden');
    return;
  }

  const frag = document.createDocumentFragment();

  for (const item of candidates) {
    if (item === logItem) continue;
    // don't move a node into a place that is inside it (prevents the cycle)
    if (item.contains(commentsSection)) continue;

    // Move into this entry's comments section
    // (If you want to remove from DOM only once, this does that.)
    frag.appendChild(item);    
    item.classList.remove('hidden');
  }

  // Clear current comments and add moved ones
  commentsSection.innerHTML = '';
  commentsSection.appendChild(frag);

  // Optional: ensure current entry has a visual state
  logItem.classList.add('showing-comments');
}
function EntryStandardButtons(entry){
  // 20260702: StarTree: Every entry has a show comments and a comment button.
  var showBtnHTML = `<button class="btn comment-list" title="Show/Hide Comments" onclick="EntryListComments('${entry.timestamp}',this)"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M2.8 2.8h10.4c.55 0 1 .45 1 1v6.3c0 .55-.45 1-1 1H7.1L4 13.7V11.1H2.8c-.55 0-1-.45-1-1V3.8c0-.55.45-1 1-1z"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M5.2 6h5.6M5.2 8.2h3.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg></button>`;    
  var commentBtnHTML =`<button class="btn comment-add" title="Add a Comment" onclick="FormSetQuest('${entry.timestamp}',this)">
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M3.5 8h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M8 3.5v9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg></button>`;
    var addCommentBtnHTML = `<button class="btn comment-add" title="Add a Comment" onclick="FormSetQuest('${entry.timestamp}',this)">
<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M2.8 2.8h10.4c.55 0 1 .45 1 1v6.3c0 .55-.45 1-1 1H7.1L4 13.7V11.1H2.8c-.55 0-1-.45-1-1V3.8c0-.55.45-1 1-1z"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>


</button>`;   
 // return showBtnHTML + commentBtnHTML;
 return addCommentBtnHTML;
}
function EntryTitle(entry){
    // 20260702: StarTree: Handle the Quest ID field that can start with text followed by quest ID.
    if(!entry.title){
      var tempTitle = entry.submitterId || "Anon Msg";
      return `<span class="entry-title comment">${tempTitle}</span>`;
    }
    const mSplit = entry.title.split("|");
    // If there is no second part, just return the first part.
    let mArg1 = mSplit[0].trim()
    if(mSplit.length==1){
      if(isISOZTimestamp(mArg1)){
        mArg1 = (entry.submitterId || "Anon Msg");
        return `<span class="entry-title comment">${mArg1}</span>`;
      }
      return `<span class="entry-title">${mArg1}</span>`;
    }
    // If there is a second part and it only has digits, assume it is a MB node ID.
    const mArg2 = mSplit[1].trim();
    const isNumeric = /^\d+$/.test(mArg2);    
    const mQuestLink = isNumeric? "https://magicbakery.github.io/?id=P" + mArg2 : mArg2;

    return `<a href="${mQuestLink}" target="_blank" onclick="window.open(this.href, '_blank'); return false;" class="entry-title entry-link" >${mArg1}</a>`;
}
function EntryStatus(entry){
  // 20260702: Fina: Returns the html code for displaying the status.
  if(!entry.status){return "";}
  return `<span class="entry-status">${entry.status}</span>`;
};
function EntryThumbnail(entry,iClass){
  // 20260702: Fina: Returns the html code for displaying a thumbnail of the entry.
  const imageUrl = entry.img || entry.IMG || "";
  if(!imageUrl){return "";}
  return `<div >
          <a href="${imageUrl}" target="_blank" onclick="window.open(this.href, '_blank'); return false;">
          <img class="${iClass}" src="${imageUrl}" alt="Attachment" onerror="this.parentNode.parentNode.classList.add('hidden');">
          </a></div>`;
};
function EntryURL(entry){
  if(!entry.url){return "";}
  return ` <a class="entry-url" href="${entry.url}" target="_blank" onclick="window.open(this.href, '_blank'); return false;">[Link]</a>`;
}
function FormSetQuest(questId, btn){
  // 20260702: StarTree: This is called to set the Quest ID of a form. (such as when the user clicked on the add comment button.)

  const formSection = document.getElementById('formSection');
  if (!formSection) return;
  toggleModule('form', true)

  // Prefill the Form Fields
  document.getElementById('questId').value = questId;
  document.getElementById('tags').value = "comment";

  // Smoothly scroll the logging form view into target viewport view segment if needed
  formSection.scrollIntoView({ behavior: 'smooth' });
  if(btn){
    const logItem = btn.closest('.log-item');
    if(logItem){
      logItem.scrollIntoView({ behavior: 'smooth', block: 'end' });

    }
    
  }
}
function isISOZTimestamp(s) {
  return typeof s === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(s)
    && !Number.isNaN(Date.parse(s));
}

function ToggleNext(el){
  const elNext = el.nextElementSibling;
  elNext.classList.toggle("hidden");
}
// qsdk.js
const modules = {
  map: { elementId: 'mapSection', btnId: 'btnShowMap' },
  query: { elementId: 'querySection', btnId: 'btnShowQuery' },
  form: { elementId: 'formSection', btnId: 'btnShowForm' },
  settings: { elementId: 'settingsSection', btnId: 'btnShowSettings' }
};
const QuestSDK = {
  // 1. Initialize the SDK with the user's specific configuration
  init(config) {

    // First load from local storage.
    this.publicAPI = localStorage.getItem("questSDKpublicAPI");
    this.guildAPI = localStorage.getItem("questSDKguildAPI");
    this.personalAPI = localStorage.getItem("questSDKpersonalAPI");

    // If public API is blank, load from config.
    if (!this.publicAPI) {
      if (!config || !config.API_URL) {
        console.error("QuestSDK Error: API_URL is required inside init().");
        return;
      }
      this.publicAPI = config.API_URL;
    }
  },
  APIGet(bFetch, elSource, elDest) {
    // 20260703: StarTree: The control's value specifies the destination.
    // When bFetch is TRUE, return API URL for fetching.
    // When bFetch is FALSE, return the API RUL for sending.
    if (elDest) { this.apiDestControl = elDest; }
    if (elSource) { this.apiSourceControl = elSource; }
    if (bFetch && !this.apiSourceControl) {
      confirm('Cannot fetch data because the source scope is unknown.');
      return null;
    }
    if (!bFetch && !this.apiDestControl) {
      confirm('Cannot send data because the destination scope is unknown.');
      return null;
    }
    var mScope = bFetch ? this.apiSourceControl.value.toLowerCase() : this.apiDestControl.value.toLowerCase();
    if (mScope === "public") {
      if (!this.publicAPI) {
        confirm("Public API is not set.");
      }
      return this.publicAPI;
    } else if (mScope === "guild") {
      if (!this.guildAPI) {
        confirm("Guild API is not set.");
      }
      return this.guildAPI;
    } else if (mScope === "personal") {
      if (!this.personalAPI) {
        confirm("Personal API is not set.");
      }
      return this.personalAPI;
    } else if (mScope === "draft") {
      if (bFetch === false) {
        confirm("The message is in draft. Please set a destination.");
      } else if (bFetch === null) {
        return null;
      }
      return null;
    } else if (mScope === "all") {
      if (!this.publicAPI && !this.guildAPI && !this.personalAPI) {
        confirm("Destination API is not set.");
        return null;
      }
      return "all";
    }
    confirm("Destination API is not set.");
    return null;
  },
  APISet(iScope, elTextbox, iURL) {
    // 20260703: StarTree: Saves the API URL for the scope.    
    // Read from textbox if iURL is not specified.
    if (!iURL) { iURL = elTextbox.value };
    iURL = iURL.trim();
    const lScope = iScope.toLowerCase();
    if (lScope === "public") {
      this.publicAPI = iURL;
      localStorage.setItem("questSDKpublicAPI", iURL);
      return;
    } else if (lScope === "guild") {
      this.guildAPI = iURL;
      localStorage.setItem("questSDKguildAPI", iURL);
      return;
    } else if (lScope === "personal") {
      this.personalAPI = iURL;
      localStorage.setItem("questSDKpersonalAPI", iURL);
      return;
    }
  },
  BDtoQSID(BD) {
    if (!BD) { return ""; }
    const startDate = new Date(parseInt(BD, 10));
    if (!isNaN(startDate.getTime())) {
      const yyyy = startDate.getUTCFullYear();
      const mm = String(startDate.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(startDate.getUTCDate()).padStart(2, '0');
      const hh = String(startDate.getUTCHours()).padStart(2, '0');
      const min = String(startDate.getUTCMinutes()).padStart(2, '0');
      const ss = String(startDate.getUTCSeconds()).padStart(2, '0');
      const ms = String(startDate.getUTCMilliseconds()).padStart(3, '0');
      BD = `${yyyy}${mm}${dd}${hh}${min}${ss}${ms}`;
    }
    return BD;
  },
  QSID(isoUtc) {
    // isoUtc: ISO string in UTC, e.g. "2026-07-04T06:16:22.713Z"
    // already in intended format?
    if (typeof isoUtc === "string" && /^\d{17}$/.test(isoUtc)) return isoUtc;
    // isoUtc: ISO UTC -> "YYYYMMDDhhmmssuuu"
    if (typeof isoUtc !== "string") throw new Error("Invalid timestamp input");
    const d = new Date(isoUtc);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid ISO timestamp");
    const YYYY = d.getUTCFullYear().toString().padStart(4, "0");
    const MM = (d.getUTCMonth() + 1).toString().padStart(2, "0");
    const DD = d.getUTCDate().toString().padStart(2, "0");
    const hh = d.getUTCHours().toString().padStart(2, "0");
    const mm = d.getUTCMinutes().toString().padStart(2, "0");
    const ss = d.getUTCSeconds().toString().padStart(2, "0");
    const uuu = d.getUTCMilliseconds().toString().padStart(3, "0");
    return `${YYYY}${MM}${DD}${hh}${mm}${ss}${uuu}`;
  },
  UTC(s) {
    // already ISO?
    if (typeof s === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(s)) return s;
    // compact format -> ISO
    if (typeof s !== "string") throw new Error("Invalid timestamp input");
    const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{3})$/.exec(s);
    if (!m) throw new Error("Invalid timestamp format");

    const [, YYYY, MM, DD, hh, mm, ss, uuu] = m;

    const dt = new Date(Date.UTC(
      Number(YYYY),
      Number(MM) - 1,
      Number(DD),
      Number(hh),
      Number(mm),
      Number(ss),
      Number(uuu)
    ));
    return dt.toISOString();
  },
}
// Helper Functions in Alphabetical Order
function CommentsFilterByTag(elBtn) {
  const entry = elBtn.closest('.log-item');
  const comSec = entry.querySelector('.commentsSection');
  const children = comSec.querySelectorAll('.log-item');
  const tagName = elBtn.dataset.tag;
  children.forEach(child => {
    if (child.classList.contains(`tag-${tagName}`)) {
      comSec.append(child);
      child.classList.remove('hidden');
    } else {
      child.classList.add('hidden');
    }
  });
  comSec.classList.remove('hidden');
}
async function CopyToClipboard(text) {
  // usage:
  //copyToClipboard("hello world").catch(console.error);
  await navigator.clipboard.writeText(text);
}
function DateSameLocalDay(UTC1, UTC2) {
  // 20260709: StarTree: Given two date strings in ISO UTC format, return true if they are the same day in the user's local time zone.
  const d1 = new Date(UTC1);
  const d2 = UTC2 == null ? new Date() : new Date(UTC2);

  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return false;

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
function DEBUG(iStr) {
  console.log(iStr);
};
function EntryDismiss(e, btn) {
  e.stopPropagation();
  const logItem = btn.closest('.log-item');
  if (logItem)
    if (logItem.classList.toggle('dismissed')) {
      logItem.classList.add('hidden');
    };
}
function EntryDismissBtnHTML() {
  const html = `<button class="dismiss-post-btn entry-dismiss-btn" title="Dismiss" onclick="EntryDismiss(event,this)">
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
            <line x1="1" y1="1" x2="9" y2="9" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="9" y1="1" x2="1" y2="9" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg></button>`;
  return html;
}
function EntryGeoMarkHTML(entry) {
  // 20260709: StarTree: Show the Geo mark if the entry or its children has coordinates.
  if (!entry.classList.contains('geo') && !entry.classList.contains('tag-mapping')) { return "" }
  return `<button class="btn showLocations" title="Show locations" onclick="showBoloSightings(event,'${entry.dataset.timestamp}')" data-quest-id="${entry.dataset.timestamp}">
    <svg viewBox="0 0 24 24" style="width:15px; height:15px; fill:currentColor;">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  </button>`;
}
function EntryListComments(questId, btn) {
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

    // Don't show a dismissed item.    
    if (item.classList.contains('dismissed')) {
      // Detach the dismissed item.
      ledgerOutput.append(item, ledgerOutput.firstChild);
    } else {
      frag.append(item);
      item.classList.remove('hidden');
    }
  }

  // Clear current comments and add moved ones
  commentsSection.innerHTML = '';
  commentsSection.append(frag);

  // Optional: ensure current entry has a visual state
  logItem.classList.add('showing-comments');
  // 20260709: StarTree: Get a count for quick quest
  EntryQuickQuestCount(logItem);

}
function EntryParentButton() {
  var parentBtnHTML = `<button class="btn parent" title="Show Parent" onclick="EntryParentShow(this)">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 4h12v12H4z" />
      <path d="M16 8h4v12H8v-4" />
    </svg>
  </button>`;
  return parentBtnHTML;
}
function EntryParentShow(elThis) {
  // 20060706: StarTree: Show the parent of this entry
  const thisEntry = elThis.closest(".log-item");
  const parentID = thisEntry.dataset.questId;
  const list = document.getElementById('ledgerOutput');
  const parent = list.querySelector(`.log-item[data-timestamp="${parentID}"]`)
  if (!parent) {
    alert(`The parent ${parentID} is not found.`);
    return;
  }
  const currentParent = thisEntry.parentElement?.closest('.log-item');
  if (currentParent) {
    try {
      currentParent.insertBefore(parent, thisEntry);
    } catch { }
  } else {
    try {
      list.insertBefore(parent, thisEntry);
    } catch { }
  }
  ToggleListComments(parent.firstElementChild, true);
  parent.classList.remove("hidden");
  parent.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function EntryQuickLogBtnHTML(entry) {
  // 20260707: StarTree: Returns the HTML for a quick log button.
  // The quick log button appears only when the entry has the tags #quick and #quest.
  if (!entry.classList.contains("tag-quick")) { return ""; }
  if (!entry.classList.contains("tag-quest")) { return ""; }
  return `<div style="display: inline-block;position:relative"><button class="btn quickLog" title="Quick Log" onclick="QuickLog(event,this)">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
      <path
        d="M50 6
          L61 34
          Q61.6 35.5 63.2 35.6
          L93 37.4
          L69.8 56.2
          Q68.5 57.2 68.9 58.8
          L76.5 88.2
          L51.9 72.8
          Q50.4 71.9 48.9 72.8
          L24.3 88.2
          L31.9 58.8
          Q32.3 57.2 31 56.2
          L7.8 37.4
          L37.6 35.6
          Q39.2 35.5 39.8 34
          Z"
        stroke="currentColor"
        stroke-width="10"
        stroke-linejoin="round"
      />
    </svg>
    <span class="starCount"></span>
  </button></div>`;
}
function EntryQuickQuestCount(entry){
  // 20260709: StarTree: If the entry is Quick Quest, count the log entries for today.
  if(!entry.classList.contains('tag-quick') || !entry.classList.contains('tag-quest')){return;}
  var logs = entry.querySelectorAll('.log-item.tag-quick.tag-log');
  const counter = entry.querySelector('.starCount');
  var count = 0;
  logs.forEach(log=>{
    
    if(DateSameLocalDay(log.dataset.timestamp,null)){
      count++;
    }
  });
  counter.innerHTML = count;
}
function EntryScope(entry) {
  if (entry.classList.contains('public')) { return 'Public'; }
  if (entry.classList.contains('guild')) { return 'Guild'; }
  if (entry.classList.contains('personal')) { return 'Personal'; }
  return "Unknown";
}
function EntrySetActive(entry) {
  // 20260707: StarTree: Mark the entry as active.
  if (!entry) { return; }
  if (activeEntry) { activeEntry.classList.remove('active'); }
  activeEntry = entry;
  activeEntry.classList.add('active');
  activeEntry.classList.remove('hidden');
  reTargetUTC = activeEntry.dataset.timestamp;

  const reTitle = document.getElementById('MsgFormReTitle');
  const reAPI = document.getElementById('MsgFormReAPI');
  reAPI.innerText = EntryScope(activeEntry);
  reTitle.innerText = activeEntry.querySelector('.entry-title').textContent;
  reTitle.classList.remove("hidden");
  reTitle.closest('.form-row').classList.remove("hidden");

}
function EntrySightingsShowHTML(entry) {
  // 20260707: StarTree: Create the show sightings button HTML.
  if (!entry.classList.contains("tag-mapping")) { return ""; }
  return `<button class="btn addLocation" onclick="reportBoloSighting(event,'${entry.dataset.timestamp}',this)" title="Add a location">
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
      <g transform="scale(1)" transform-origin="32 32">
        <rect x="28" y="12" width="8" height="40" rx="1.5" fill="currentColor"/>
        <rect x="12" y="28" width="40" height="8" rx="1.5" fill="currentColor"/>
      </g>
    </svg>
  </button>`;
}
function EntryStandardButtons(entry) {
  // 20260702: StarTree: Every entry has a show comments and a comment button.
  var showBtnHTML = `<button class="btn comment-list" title="Show/Hide Comments" onclick="EntryListComments('${entry.timestamp}',this)"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M2.8 2.8h10.4c.55 0 1 .45 1 1v6.3c0 .55-.45 1-1 1H7.1L4 13.7V11.1H2.8c-.55 0-1-.45-1-1V3.8c0-.55.45-1 1-1z"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M5.2 6h5.6M5.2 8.2h3.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg></button>`;
  var commentBtnHTML = `<button class="btn comment-add" title="Add a Comment" onclick="FormSetQuest('${entry.timestamp}',this)">
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
function EntryStatus(entry) {
  // 20260702: Fina: Returns the html code for displaying the status.
  try {
    return entry.querySelector('.entry-status').textContent;
  } catch { }

  if (!entry.status) { return ""; }
  return `<span class="entry-status">${entry.status}</span>`;
};
function EntryTagsHTML(item, element) {
  // 20260707: Evelyn: Make the tags list.
  // The item is the data item. The element is the HTML element. 
  // Clicking on those tags should show other entries not already on the list 
  var tags = item.tags;
  tags = tags.replace(/ /g, ",");
  tags = tags.replace(",,", ",");
  const tagsSplit = tags.split(',');
  var entryTagsHTML = `<div class="entry-tagsList">`;
  tagsSplit.forEach(tag => {
    tag = tag.trim();
    if (!tag) { return; }
    const lowerTag = tag.toLowerCase();
    if (!element.classList.contains(`tag-${lowerTag}`)) {
      try {
        element.classList.add(`tag-${lowerTag}`);
        entryTagsHTML += `<span class="tag ${lowerTag}" onclick="filterMessageBoard('${lowerTag}')">#${lowerTag}</span>`
      } catch { }
    }
  });
  entryTagsHTML += `</div>`;
  return entryTagsHTML;
}
function EntryTitle(item, entry) {
  // 20260702: StarTree: Handle the Quest ID field that can start with text followed by quest ID.


  if (item && !item.title) {
    var tempTitle = item.submitterId || "Anon Msg";
    return `<span class="entry-title comment">${tempTitle}</span>`;
  }
  if (entry) {
    return `<span class="entry-title comment">${entry.querySelector('.entry-title').textContent}</span>`;
  }
  const titleStr = String(item.title).trim();
  return `<span class="entry-title">${titleStr}</span>`;

  const mSplit = titleStr.split("|");
  // If there is no second part, just return the first part.



  let mArg1 = mSplit[0].trim()
  if (true || mSplit.length == 1) { // 20260709: StarTree: Disabled this feature because a user normally needs to click on the title bar.
    if (isISOZTimestamp(mArg1)) {
      mArg1 = (item.submitterId || "Anon Msg");
      return `<span class="entry-title comment">${mArg1}</span>`;
    }
    return `<span class="entry-title">${mArg1}</span>`;
  }
  // If there is a second part and it only has digits, assume it is a MB node ID.
  const mArg2 = mSplit[1].trim();
  const isNumeric = /^\d+$/.test(mArg2);
  const mQuestLink = isNumeric ? "https://magicbakery.github.io/?id=P" + mArg2 : mArg2;

  return `<a href="${mQuestLink}" target="_blank" onclick="window.open(this.href, '_blank'); return false;" class="entry-title entry-link" >${mArg1}</a>`;
}
function EntryThumbnail(item, iClass, iDOM) {
  // 20260702: Fina: Returns the html code for displaying a thumbnail of the entry.
  var imageUrl = "";
  if (item) {
    imageUrl = item.img || item.IMG || "";
  } else if (iDOM) {
    //const imgItem = iDOM.querySelector(`img.${iClass}`);
    //DEBUG(imgItem);
    imageUrl = iDOM.querySelector(`img`)?.src || "";

  }
  if (!imageUrl) { return ""; }
  return `<div >
          <a href="${imageUrl}" target="_blank" onclick="window.open(this.href, '_blank'); return false;">
          <img class="${iClass}" src="${imageUrl}" alt="Attachment" onerror="this.parentNode.parentNode.classList.add('hidden');">
          </a></div>`;
};
function EntryTimestamp(entry) {
  // 20260706: StarTree: This timestamp should show the time in the user's time zone.
  // On single click, it toggles the selected flag of the entry.
  // On double click, it copies the timestamp to ISO UTC format (for now), so that it is easy to reassign the parent ID
  // on right click, there is the option to open the URL link or copy that link.
  const QID = QuestSDK.QSID(entry.timestamp);
  var locTimeStr = "Unknown Time";
  var shortLocTime = "???";

  if (entry.timestamp) {
    const parsedDate = new Date(entry.timestamp);
    if (!isNaN(parsedDate.getTime())) {
      locTimeStr = parsedDate.toLocaleString();
      const m = parsedDate.getMonth() + 1;
      const d = parsedDate.getDate();
      const hh = String(parsedDate.getHours()).padStart(2, '0');
      const mm = String(parsedDate.getMinutes()).padStart(2, '0');
      shortLocTime = `${m}/${d} ${hh}:${mm}`;
    } else {
      fullTimeStr = entry.timestamp;
    }
  }
  var html = `<div class="timestamp click-to-copy" title="${locTimeStr}"><a href="${URLTrim(document.location.href) + '?id=' + QID}" ondblclick="CopyToClipboard('${QID}')" onclick="event.stopPropagation();event.preventDefault();EntryToggleSelected(this);">${shortLocTime}</a></div>`;
  return html;
}
function EntryURL(entry) {
  if (!entry.url) return "";
  const urls = String(entry.url).split("|").map(s => s.trim()).filter(Boolean);
  return urls.map((url, index) => {
    const label = URLLabel(url, index);
    const safeUrl = encodeURI(url);
    return ` <a class="entry-url" href="${safeUrl}" target="_blank" onclick="window.open(this.href, '_blank'); return false;">${label}</a>`;
  }).join("");
}

function formatUTCYYYMMDDhhmmssuuu(q) {
  const p = parseQidToUTC(q);
  if (!p) return null;

  const pad2 = (n) => String(n).padStart(2, '0');
  const pad3 = (n) => String(n).padStart(3, '0');
  const pad4 = (n) => String(n).padStart(4, '0');
  // spec wants uuu = 3 digits
  // if your input had true 3-digit uuu, good; if derived from ISO ms, it becomes uuu = ms*1000 -> last 3 digits are 000..999
  const uuu3 = pad3(p.uuu % 1000);

  return (
    pad4(p.year) +
    pad2(p.mon) +
    pad2(p.day) +
    pad2(p.hh) +
    pad2(p.mm) +
    pad2(p.ss) +
    uuu3
  );
}

function isISOZTimestamp(s) {
  return typeof s === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(s)
    && !Number.isNaN(Date.parse(s));
}
function ListSolo(id) {
  // 20260706: Sasha: Show a specific entry given the id.
  const list = document.getElementById('ledgerOutput');
  const entries = list.querySelectorAll('.log-item');
  id = QuestSDK.UTC(id);
  var count = 0;
  var first = null;
  entries.forEach(entry => {
    if (entry.dataset.timestamp == id) {
      entry.classList.remove('hidden');
      list.append(entry)
      ToggleListComments(entry.firstElementChild, true);
      first = entry;
      count++;
    } else {
      entry.classList.add('hidden');
    }
  });
  toggleModule('query', true);

  first?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return count;
}
function ListShowReOnly() {
  //20260706: StarTree: Show only the reply target entry.
  const list = document.getElementById('ledgerOutput');
  const entries = list.querySelectorAll('.log-item');
  entries.forEach(entry => {
    if (entry.dataset.timestamp == reTargetUTC) {
      EntrySetActive(entry);
      list.append(entry)
    } else {
      entry.classList.add('hidden');
    }
  });
}
function MEMValue(elID, bLoad) {
  // 20260702: StarTree: save or load the value of a control element.
  const elControl = document.getElementById(elID);
  if (bLoad) {
    elControl.value = localStorage.getItem(elID)
    return elControl.value;
  } else {
    localStorage.setItem(elID, elControl.value);
  }
}
function parseQidToUTC(qid) {
  if (qid == null) return null;
  const s = String(qid).trim();

  // All-digits: YYYYMMDDhhmmss(uuu)
  if (/^\d{14,17}$/.test(s)) {
    const year = Number(s.slice(0, 4));
    const mon = Number(s.slice(4, 6));
    const day = Number(s.slice(6, 8));
    const hh = Number(s.slice(8, 10));
    const mm = Number(s.slice(10, 12));
    const ss = Number(s.slice(12, 14));
    const uuu = s.length >= 17 ? Number(s.slice(14, 17)) : 0; // default if missing

    // Interpret as UTC because it's already UTC-structured in your spec
    const ms = uuu / 1000; // milliseconds fraction
    // Build Date from UTC, then add remaining micro/nano via ms
    const d = new Date(Date.UTC(year, mon - 1, day, hh, mm, ss, 0));
    return {
      year, mon, day, hh, mm, ss,
      uuu,
      date: d, // base UTC second
      msPart: ms
    };
  }

  // ISO: 2026-06-30T08:27:26.814Z (or with offset)
  // new Date(...) parses ISO to an instant (UTC internally)
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;

  // JS Date only tracks milliseconds; for "uuu" we use those ms * 1000 = microseconds (nanos rounded/truncated)
  const year = d.getUTCFullYear();
  const mon = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const hh = d.getUTCHours();
  const mm = d.getUTCMinutes();
  const ss = d.getUTCSeconds();
  const uuu = d.getUTCMilliseconds() * 1000; // 000..999000

  return {
    year, mon, day, hh, mm, ss,
    uuu,
    date: d
  };
}
async function QuickLog(e, elBtn) {
  e.stopPropagation();
  if (elBtn.classList.contains('sending')) { return; }
  elBtn.classList.add('sending');
  const entry = elBtn.closest('.log-item');
  const scope = EntryScope(entry).toLocaleLowerCase();

  var api = "";
  if (scope === "public") { api = QuestSDK.publicAPI; }
  if (scope === "guild") { api = QuestSDK.guildAPI; }
  if (scope === "personal") { api = QuestSDK.personalAPI; }
  if (!api) { alert(`The ${scope} API URL is missing.`); return; }

  // Add a cooldown timer of 5 seconds after each click, so the user cannot click it again immediately.

  // Send the message
  const formData = new URLSearchParams();
  formData.append('submitterId', document.getElementById('MsgFormQuester').value.trim());
  formData.append('questId', entry.dataset.timestamp);
  formData.append('tags', entry.querySelector('.entry-title').textContent + " quick log");
  //formData.append('eventText', entry.querySelector('.entry-title').textContent + " quick log");
  formData.append('cId', QuestSDK.BDtoQSID(localStorage.getItem("clientBD")));
  formData.append('cLv', localStorage.getItem("clientLV"));

  try {
    await fetch(api, {
      method: "POST",
      body: formData.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
  } catch (error) {
    elBtn.classList.add('error');
  } finally {
    const starCounter = elBtn.querySelector('.starCount');
    var count = Number(starCounter.textContent);
    count++;
    elBtn.dataset.count = count;
    starCounter.textContent = count;
    elBtn.classList.remove('error');
    elBtn.classList.remove('sending');
    elBtn.classList.add('done');
  }
}
function URLGuessDomain(url) {
  const host = (() => {
    try { return new URL(url).hostname; } catch { return String(url); }
  })();
  const h = host.replace(/^www\./i, '').toLowerCase();
  // remove common TLDs (kept simple)
  return h.replace(/\.(com|net|org|io|co|edu|gov|uk|us|ca|de|fr|au|in|info|biz|app|dev|ai)\s*$/i, '');
}
function URLLabel(url, index) {
  var label = URLGuessDomain(url);
  if (label) {
    return `[${index + 1}:${label}]`;
  }
  return `[${index + 1}]`;
}
function URLTrim(iURL) {
  // 20260706: StarTree: Trim the ? tail off an URL
  if (iURL) { return iURL.split("?")[0]; }
  // If iURL is blank, use the content from clipboard.
  navigator.clipboard.readText().then((iURL) => {
    if (iURL) {
      iURL = URLTrim(iURL);
      navigator.clipboard.writeText(iURL);
      return iURL;
    }
  });
}
function TEST() {
  navigator.clipboard.readText().then((YYYY) => {
    if (YYYY) {
      var UTC = QuestSDK.UTC(YYYY);
      navigator.clipboard.writeText(UTC);
      return UTC;
    }
  });
}
function ToggleListComments(elBar, bShow) {
  const elEntry = elBar.closest('.log-item');
  const elContent = elEntry.querySelector('.entry-content');

  if (bShow || elContent.classList.contains('hidden')) {
    EntryListComments(elEntry.dataset.timestamp, elBar);
  }

  if (elContent.classList.contains('hidden') || bShow) {
    elContent.classList.toggle('hidden', false);
    elContent.removeAttribute('hidden');
    elEntry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // UPGRADE: Tally tags of the children and show list ordered by descending count.
    const childTagsDiv = elEntry.querySelector('.entry-childTags');
    if (childTagsDiv) {
      childTagsDiv.innerHTML = '';
      const comSec = elEntry.querySelector('.commentsSection');
      const tagEls = comSec.querySelectorAll('.log-item .tag'); // adjust scope if needed
      const counts = new Map();      

      tagEls.forEach(t => {
        const txt = (t.textContent || '').trim(); // expected like "#something"
        if (!txt) return;
        const tagText = txt.startsWith('#') ? txt : `#${txt}`;
        if (tagText.includes(" ")) { return; }
        counts.set(tagText, (counts.get(tagText) || 0) + 1);
      });

      const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

      // Clear the container first
      childTagsDiv.innerHTML = '';

      sorted.forEach(([tagText, count]) => {
        // Extract clean tag text for the data attribute
        const dataTag = tagText.slice(1);

        // Compose the button as a raw HTML text string with an inline onclick attribute
        const btnHtml = `
    <button 
      type="button" 
      class="btn tag" 
      data-tag="${dataTag}" 
      onclick="CommentsFilterByTag(this)"
    >${tagText} (${count})</button>
  `;

        // Append the HTML string directly into the container element
        childTagsDiv.insertAdjacentHTML('beforeend', btnHtml);
      });
    }
  } else {
    elContent.classList.toggle('hidden', true);
  }
}
function toggleModule(moduleKey, bShow) {
  const mod = modules[moduleKey];
  const targetElement = document.getElementById(mod.elementId);
  const targetButton = document.getElementById(mod.btnId);

  if (bShow || targetElement.classList.contains('hidden')) {
    targetElement.classList.remove('hidden');
    targetButton.classList.add('active');
  } else {
    targetElement.classList.add('hidden');
    targetButton.classList.remove('active');
  }

  saveLayoutState();
  if (map) map.invalidateSize();
}
function ToggleNext(el) {
  const elNext = el.nextElementSibling;
  elNext.classList.toggle("hidden");
}
function ToggleTab(elID) {
  const elTab = document.getElementById(elID);
  if (!elTab.classList.contains('hidden')) { return; }
  const elTabGroup = elTab.closest('.tab-group');
  if (!elTabGroup) return;
  elTabGroup.querySelectorAll('.tab').forEach(tab => {
    tab.classList.add('hidden');
  });
  elTab.classList.remove('hidden');
}

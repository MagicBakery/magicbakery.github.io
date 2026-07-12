/***** CONFIG *****/
const SHEET_NAME = "Assets";

/*const COL = {
  gameId: 1,
  assetId: 2,
  name: 3,
  imageUrl: 4,
  facedown: 5,
  region: 6,      // "TABLE" | "HAND"
  ownerId: 7,     // playerId or ""
  x: 8,
  y: 9,
  rotationDeg: 10,
  z: 11,          // number; meaningful for TABLE only
  updatedAt: 12, // ISO string
};*/

function doGet(e) {
  try {
    const action = (e.parameter.action || "").toString();
    const gameId = (e.parameter.gameId || "").toString();
    const playerId = (e.parameter.playerId || "").toString();

    if (action !== "GET_STATE") {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "BAD_ACTION", status: 400 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (!gameId) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "MISSING_GAMEID", status: 400 }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const rows = loadAll_(gameId);

    // Sandbox visibility: TABLE is always visible; HAND is visible only to owner.
    const visible = rows.filter(r => {
      if (r.region !== "HAND") return true;
      return (r.ownerId || "") === playerId;
    });

    return ContentService.createTextOutput(JSON.stringify({ ok: true, assets: visible }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Catch any backend script crashes and return them safely as JSON so CORS doesn't trigger
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "SERVER_CRASH", details: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var params = {};

    // 1. Unpack incoming payload stream safely
    if (e && e.postData && e.postData.contents) {
      var rawContents = e.postData.contents;
      if (e.postData.type === "application/json") {
        params = JSON.parse(rawContents);
      } else {
        var pairs = rawContents.split('&');
        for (var i = 0; i < pairs.length; i++) {
          var pair = pairs[i].split('=');
          var key = decodeURIComponent(pair[0]);
          var val = decodeURIComponent(pair[1] || '');
          params[key] = val;
        }
      }
    }
    
    if (!params.action && e && e.parameter) {
      params = e.parameter;
    }

    var action            = params.action;
    var gameId            = params.gameId;
    var assetId           = params.assetId;
    var expectedUpdatedAt = params.expectedUpdatedAt;
    
    var patch = {};
    if (typeof params.patch === "string") {
      patch = JSON.parse(params.patch);
    } else if (params.patch) {
      patch = params.patch;
    }
    if (action === "BATCH_SHUFFLE") {
      return batchShuffleAssets_(params);
    }
    if (action !== "APPLY_MOVE") {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "Invalid action" }))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Validate Sheet target
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Assets");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "Assets not found" }))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var colMap = {};
    for (var i = 0; i < headers.length; i++) {
      colMap[headers[i].toString().trim()] = i;
    }

    // 3. Match row exactly
    var foundIndex = -1;
    for (var r = 1; r < data.length; r++) {
      if (String(data[r][colMap["gameId"]]).trim() === String(gameId).trim() && 
          String(data[r][colMap["assetId"]]).trim() === String(assetId).trim()) {
        foundIndex = r;
        break;
      }
    }

    if (foundIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "Asset target row missing" }))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // 4. Concurrency matching (ignore if sheet cell is completely empty)
    var currentUpdateCell = sheet.getRange(foundIndex + 1, colMap["updatedAt"] + 1);
    var currentUpdateVal  = String(currentUpdateCell.getValue()).trim();
    var cleanExpected     = String(expectedUpdatedAt || "").trim();
    
    if (cleanExpected && currentUpdateVal && currentUpdateVal !== "0" && currentUpdateVal !== cleanExpected) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "CONFLICT", currentUpdatedAt: currentUpdateVal }))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // 5. Sanitize patch fields to absolute safe primitives before saving
    for (var key in patch) {
      if (colMap[key] !== undefined) {
        var val = patch[key];
        
        // Convert to absolute string representation for booleans
        if (val === true || String(val).toUpperCase() === "TRUE") val = "FALSE"; // baseline
        if (patch[key] === true) val = "TRUE";
        if (patch[key] === false) val = "FALSE";
        
        // CRITICAL: Force coordinate decimals into integers to keep cell math clean
        if (key === "x" || key === "y" || key === "z" || key === "rotationDeg" || key === "rotatingDeg") {
          val = Math.round(Number(val) || 0);
        }

        sheet.getRange(foundIndex + 1, colMap[key] + 1).setValue(val);
      }
    }

    // 6. Set transaction completion timestamp
    var nextVersion = String(Date.now());
    currentUpdateCell.setValue(nextVersion);

    return ContentService.createTextOutput(JSON.stringify({ ok: true, newUpdatedAt: nextVersion }))
                         .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Force transmission of detailed line errors out to the user UI
    return ContentService.createTextOutput(JSON.stringify({ 
      ok: false, 
      error: "SERVER_CRASH", 
      details: err.toString(),
      stack: err.stack 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/***** CORE: APPLY MOVE WITH OPTIMISTIC LOCK + Z-ON-PLACE *****/
function applyMove_(body) {
  const gameId = (body.gameId || "").toString();
  const playerId = (body.playerId || "").toString();
  const assetId = (body.assetId || "").toString();
  const patch = body.patch || {};
  const expectedUpdatedAt = body.expectedUpdatedAt;

  if (!gameId || !assetId || !patch) {
    return json_({ ok: false, error: "MISSING_FIELDS" }, 400);
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) return json_({ ok: false, error: "NO_SHEET" }, 500);

    const data = sh.getDataRange().getValues(); 
    const colMap = getHeaderMap_(data[0]); // <--- 1. Get the dynamic map
    
    // 2. Pass colMap to findRowIndex_
    const rowIndex = findRowIndex_(data, colMap, gameId, assetId); 
    if (rowIndex < 2) return json_({ ok: false, error: "NOT_FOUND" }, 404);

    // 3. Use colMap instead of COL constant
    const currentUpdatedAt = sh.getRange(rowIndex, colMap["updatedAt"]).getValue();
    const currentRegion = (sh.getRange(rowIndex, colMap["region"]).getValue() ?? "").toString();
    const currentOwnerId = (sh.getRange(rowIndex, colMap["ownerId"]).getValue() ?? "").toString();

    // Optimistic locking
    if (expectedUpdatedAt !== undefined && expectedUpdatedAt !== null && expectedUpdatedAt !== "") {
      if ((currentUpdatedAt || "").toString() !== expectedUpdatedAt.toString()) {
        return json_({
          ok: false,
          error: "CONFLICT",
          currentUpdatedAt: currentUpdatedAt || "",
        }, 409);
      }
    }

    const now = new Date().toISOString();
    const wantsPlaceOnTable = !!patch.placeOnTable;
    const nextRegion = (patch.region !== undefined && patch.region !== null) ? String(patch.region) : currentRegion;
    const nextOwnerId = (patch.ownerId !== undefined && patch.ownerId !== null) ? String(patch.ownerId) : currentOwnerId;

    const isHandToTable =
      (currentRegion === "HAND") &&
      (nextRegion === "TABLE") &&
      (wantsPlaceOnTable || (patch.placeOnTable === undefined && (nextOwnerId === "" || nextOwnerId === "null")));

    const allowed = new Set(["facedown", "region", "ownerId", "x", "y", "rotationDeg", "z"]);

    if (isHandToTable) {
      // 4. Pass colMap to helper
      const maxZ = getMaxZOnTable_(sh, colMap, gameId);
      patch.z = (maxZ + 1);
    } else {
      if (patch.z !== undefined) delete patch.z;
    }

    Object.keys(patch).forEach(k => {
      if (!allowed.has(k)) return;
      if (k === "z" && !isHandToTable) return; 

      const colNum = colMap[k];
      if (!colNum) return;

      let v = patch[k];

      if (k === "facedown") v = coerceBool_(v);
      if (k === "x" || k === "y" || k === "rotationDeg" || k === "z") v = Number(v);
      if (k === "ownerId") v = (v === null || v === undefined) ? "" : String(v);
      if (k === "region") v = (v === null || v === undefined) ? "" : String(v);

      sh.getRange(rowIndex, colNum).setValue(v);
    });

    sh.getRange(rowIndex, colMap["updatedAt"]).setValue(now);

    return json_({ ok: true, newUpdatedAt: now });
  } finally {
    lock.releaseLock();
  }
}
function batchShuffleAssets_(body) {
  const gameId = body.gameId;
  const targetTag = body.tag; // Now we use the tag string
  
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME);
    const data = sh.getDataRange().getValues();
    const colMap = getHeaderMap_(data[0]);

    // Safety Check: Ensure "tag" column exists
    if (!colMap["tag"]) {
      return json_({ ok: false, error: "MISSING_TAG_COLUMN" }, 400);
    }

    const targetRows = [];
    const positions = []; 

    // 1. Identify all assets matching the GameID AND the Tag
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const gid = String(row[colMap["gameId"] - 1]);
      const assetTag = String(row[colMap["tag"] - 1] ?? "");
      const assetTagsArray = String(row[colMap["tag"] - 1] ?? "").split(',').map(t => t.trim());

      if (gid === gameId && assetTagsArray.includes(targetTag)) {
        targetRows.push({ rowIndex: i + 1 });
        positions.push({
          x: row[colMap["x"] - 1],
          y: row[colMap["y"] - 1],
          z: row[colMap["z"] - 1],
          ownerId: row[colMap["ownerId"] - 1],
          rotationDeg: row[colMap["rotationDeg"] - 1],
          region: row[colMap["region"] - 1]
        });
      }
    }

    if (targetRows.length === 0) {
      return json_({ ok: false, error: "NO_ASSETS_FOUND_WITH_TAG" }, 404);
    }

    // 2. Shuffle positions (Fisher-Yates)
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // 3. Perform a Bulk Update
    // Instead of looping individual setValue calls, we create an update array
    const now = new Date().toISOString();
    
    targetRows.forEach((row, index) => {
      const newPos = positions[index];
      
      // Update the specific row
      sh.getRange(row.rowIndex, colMap["facedown"]).setValue("TRUE");
      sh.getRange(row.rowIndex, colMap["x"]).setValue(newPos.x);
      sh.getRange(row.rowIndex, colMap["y"]).setValue(newPos.y);
      sh.getRange(row.rowIndex, colMap["z"]).setValue(newPos.z);
      sh.getRange(row.rowIndex, colMap["ownerId"]).setValue(newPos.ownerId);
      sh.getRange(row.rowIndex, colMap["rotationDeg"]).setValue(newPos.rotationDeg);
      sh.getRange(row.rowIndex, colMap["region"]).setValue(newPos.region);
      sh.getRange(row.rowIndex, colMap["updatedAt"]).setValue(now);
    });

    return json_({ ok: true, count: targetRows.length });

  } finally {
    lock.releaseLock();
  }
}

/***** HELPERS *****/
/**
 * Creates a mapping of Header Names to 1-based Column Indices.
 * @param {Array} headerRow - The first row of your data array.
 * @return {Object} An object like { "gameId": 1, "name": 2, ... }
 */
function getHeaderMap_(headerRow) {
  const map = {};
  headerRow.forEach((header, index) => {
    // We store index + 1 because spreadsheet columns are 1-based
    map[header.toString().trim()] = index + 1;
  });
  return map;
}
function loadAll_(gameId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) return [];
  
  const data = sh.getDataRange().getValues(); 
  if (data.length < 2) return []; // No data rows
  
  // 1. Generate the map dynamically from the header row (index 0)
  const colMap = getHeaderMap_(data[0]);
  const out = [];

  for (let i = 1; i < data.length; i++) { 
    const r = data[i];
    // Safe evaluation using Nullish Coalescing (??) instead of Logical OR (||)
    const gid = (r[colMap["gameId"] - 1] ?? "").toString();
    if (gid !== gameId || gid === "") continue;

    out.push({
      gameId: gid,
      assetId: (r[colMap["assetId"] - 1] ?? "").toString(),
      name: (r[colMap["name"] - 1] ?? "").toString(),
      imageUrl: (r[colMap["imageUrl"] - 1] ?? "").toString(),
      facedown: coerceBool_(r[colMap["facedown"] - 1]),
      region: (r[colMap["region"] - 1] ?? "TABLE").toString(),
      ownerId: (r[colMap["ownerId"] - 1] ?? "").toString(),
      x: Number(r[colMap["x"] - 1] || 0),
      y: Number(r[colMap["y"] - 1] || 0),
      rotationDeg: Number(r[colMap["rotationDeg"] - 1] || 0),
      z: Number(r[colMap["z"] - 1] || 0),
      updatedAt: (r[colMap["updatedAt"] - 1] ?? "").toString(),
    });
  }
  return out;
}

function celValue(row, colConfig) {
  return colConfig - 1;
}

function findRowIndex_(data, colMap, gameId, assetId) {
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    // Use colMap here
    const gid = (r[colMap["gameId"] - 1] ?? "").toString();
    const aid = (r[colMap["assetId"] - 1] ?? "").toString();
    if (gid === gameId && aid === assetId) return i + 1; 
  }
  return -1;
}

function getMaxZOnTable_(sh, colMap, gameId) {
  const values = sh.getDataRange().getValues();
  let maxZ = 0;
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    // Use colMap here
    const gid = (r[colMap["gameId"] - 1] ?? "").toString();
    if (gid !== gameId) continue;

    const region = (r[colMap["region"] - 1] ?? "").toString();
    if (region !== "TABLE") continue;

    const z = Number(r[colMap["z"] - 1] || 0);
    if (z > maxZ) maxZ = z;
  }
  return maxZ;
}

function coerceBool_(v) {
  if (v === true || v === "TRUE" || v === "true" || v === 1 || v === "1") return true;
  return false;
}

// Left intact for your doPost routine
function json_(obj, status) {
  const out = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  if (status) out.setContent(JSON.stringify({ ...obj, status }));
  return out;
}

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
      return true; // Fetch all for the hand count.
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

    var action = params.action;
    if (action === "BATCH_SHUFFLE") {
      return batchShuffleAssets_(params);
    }

    if (action === "APPLY_MOVE") {
      params.action = "BATCH_APPLY_MOVE";
      params.updates = JSON.stringify([{
        assetId: params.assetId,
        expectedUpdatedAt: params.expectedUpdatedAt,
        patch: params.patch
      }]);
      return batchApplyMove_(params);
    }
    if (action === "BATCH_APPLY_MOVE") {
      return batchApplyMove_(params);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: "Invalid action" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: "SERVER_CRASH",
      details: err.toString(),
      stack: err.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/***** CORE: APPLY MOVE WITH OPTIMISTIC LOCK + Z-ON-PLACE *****/
function batchApplyMove_(params) {
  return withSheetLock_(() => {
    var gameId = params.gameId;
    var expectedUpdatedAt = params.expectedUpdatedAt; // not used for per-move; here for backwards compatibility if needed

    // moves may arrive as:
    // - params.updates as a stringified JSON
    // - params.updates as an object (already parsed)
    var updates = [];
    try {
      if (typeof params.updates === "string") {
        updates = JSON.parse(params.updates);
      } else if (params.updates && typeof params.updates === "object") {
        updates = params.updates;
      }
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({
        ok: false,
        error: "BAD_UPDATES_JSON",
        details: err.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (!Array.isArray(updates)) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "BAD_UPDATES" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

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

    // Build a quick lookup: (gameId|assetId) -> row index in sheet data
    var indexMap = {};
    for (var r = 1; r < data.length; r++) {
      var g = String(data[r][colMap["gameId"]]).trim();
      var a = String(data[r][colMap["assetId"]]).trim();
      indexMap[g + "|" + a] = r;
    }

    // For atomicity, do conflicts first; only then apply writes
    var results = [];
    var conflicts = [];

    for (var u = 0; u < updates.length; u++) {
      var upd = updates[u] || {};

      var assetId = upd.assetId;
      var exp = upd.expectedUpdatedAt; // per-move
      var patch = {};

      try {
        if (typeof upd.patch === "string") {
          if (!upd.patch || upd.patch === "undefined") patch = {};
          else patch = JSON.parse(upd.patch);
        } else if (upd.patch && typeof upd.patch === "object") {
          patch = upd.patch;
        }
      } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({
          ok: false,
          error: "BAD_PATCH_JSON",
          details: err.toString(),
          at: u
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var rowIndex = indexMap[String(gameId).trim() + "|" + String(assetId).trim()];
      if (rowIndex === undefined) {
        conflicts.push({
          ok: false,
          error: "Asset target row missing",
          at: u,
          assetId: assetId
        });
        continue;
      }

      var currentUpdateCell = sheet.getRange(rowIndex + 1, colMap["updatedAt"] + 1);
      var currentUpdateVal = String(currentUpdateCell.getValue()).trim();
      var cleanExpected = String(exp || "").trim();

      if (cleanExpected && currentUpdateVal && currentUpdateVal !== "0" && currentUpdateVal !== cleanExpected) {
        conflicts.push({
          ok: false,
          error: "CONFLICT",
          currentUpdatedAt: currentUpdateVal,
          at: u,
          assetId: assetId
        });
        continue;
      }

      results.push({
        at: u,
        assetId: assetId,
        rowIndex: rowIndex,
        patch: patch,
        expectedUpdatedAt: cleanExpected
      });
    }

    if (conflicts.length) {
      // Keep the response shape similar to APPLY_MOVE conflict
      // If you want per-move conflicts, you can return conflicts instead.
      return ContentService.createTextOutput(JSON.stringify({
        ok: false,
        error: "CONFLICT",
        conflicts: conflicts
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Apply all patches (no conflicts found)
    var newUpdatedAtByAsset = [];
    for (var k = 0; k < results.length; k++) {
      var r = results[k];
      var patch2 = r.patch;

      for (var key in patch2) {
        if (colMap[key] !== undefined) {
          var val = patch2[key];

          if (val === true || String(val).toUpperCase() === "TRUE") val = "FALSE"; // baseline
          if (patch2[key] === true) val = "TRUE";
          if (patch2[key] === false) val = "FALSE";

          if (key === "x" || key === "y" || key === "z" || key === "rotationDeg" || key === "rotatingDeg") {
            val = Math.round(Number(val) || 0);
          }

          sheet.getRange(r.rowIndex + 1, colMap[key] + 1).setValue(val);
        }
      }

      var currentUpdateCell2 = sheet.getRange(r.rowIndex + 1, colMap["updatedAt"] + 1);
      var nextVersion = String(Date.now());
      currentUpdateCell2.setValue(nextVersion);

      newUpdatedAtByAsset.push({ assetId: r.assetId, newUpdatedAt: nextVersion });
    }

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      newUpdatedAtByAsset: newUpdatedAtByAsset
    })).setMimeType(ContentService.MimeType.JSON);
  });
}
function batchShuffleAssets_(body) {
  return withSheetLock_(() => {
    const gameId = body.gameId;
    const targetTag = body.tag; // Now we use the tag string
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
      const positions = []; // will store spatial/rotation + original ownerId/region for inspection

      // 1) Identify all assets matching the GameID AND the Tag
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const gid = String(row[colMap["gameId"] - 1]);
        const assetTagsArray = String(row[colMap["tag"] - 1] ?? "")
          .split(',')
          .map(t => t.trim());

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

      // ---- NEW: OwnerId assignment before spatial shuffle ----

      const m = positions.length;

      // list of existing ownerId values among the shuffle objects
      // (distinct, non-empty-ish)
      const ownerIdSet = new Set();
      positions.forEach(p => {
        if (p.ownerId !== null && p.ownerId !== "" && p.ownerId !== undefined) {
          ownerIdSet.add(String(p.ownerId));
        }
      });

      const ownerIds = Array.from(ownerIdSet); // e.g. ["A","B","C"]
      if (ownerIds.length === 0) {
        // If there are no ownerIds present, keep behavior predictable:
        // just shuffle spatial values and set region to HAND.
      }

      // Randomize order of ownerIds used for the "remainder" distribution
      // so "evenly assign" is not biased by ownerId ordering.
      for (let i = ownerIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ownerIds[i], ownerIds[j]] = [ownerIds[j], ownerIds[i]];
      }

      // Evenly assign ownerId to each shuffle object
      // base: how many each owner gets, remainder: the first `rem` owners get +1
      const ownerAssignments = new Array(m);

      if (ownerIds.length > 0) {
        const k = ownerIds.length;
        const base = Math.floor(m / k);
        const rem = m % k;

        // Build assignment list
        let idx = 0;
        for (let o = 0; o < k; o++) {
          const count = base + (o < rem ? 1 : 0);
          for (let c = 0; c < count; c++) {
            ownerAssignments[idx++] = ownerIds[o];
          }
        }

        // Randomly permute assignments across the target rows
        // so the assignment isn't tied to any sheet ordering.
        for (let i = m - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [ownerAssignments[i], ownerAssignments[j]] = [ownerAssignments[j], ownerAssignments[i]];
        }
      }

      // 3) Perform a Bulk Update (still using setValue per cell)
      const now = new Date().toISOString();

      targetRows.forEach((row, index) => {
        sh.getRange(row.rowIndex, colMap["facedown"]).setValue("TRUE");
        sh.getRange(row.rowIndex, colMap["x"]).setValue(0);
        sh.getRange(row.rowIndex, colMap["y"]).setValue(0);
        sh.getRange(row.rowIndex, colMap["z"]).setValue(0);

        // Apply even/random ownerId assignment
        if (ownerAssignments.length > 0) {
          sh.getRange(row.rowIndex, colMap["ownerId"]).setValue(ownerAssignments[index]);
        }

        sh.getRange(row.rowIndex, colMap["rotationDeg"]).setValue(0);

        // Set region to HAND for every shuffle object
        sh.getRange(row.rowIndex, colMap["region"]).setValue("HAND");

        sh.getRange(row.rowIndex, colMap["updatedAt"]).setValue(now);
      });

      return json_({ ok: true, count: targetRows.length });
    } finally {
    }
  });
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
      tag: (r[colMap["tag"] - 1] ?? "").toString(),
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

function json_(obj, status) {
  const out = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  if (status) out.setContent(JSON.stringify({ ...obj, status }));
  return out;
}
function withSheetLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000); // or shorter, like 5000–10000
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

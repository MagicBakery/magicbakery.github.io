/***** CONFIG *****/
const SHEET_NAME = "Assets";

const COL = {
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
};

function doGet(e) {
  const action = (e.parameter.action || "").toString();
  const gameId = (e.parameter.gameId || "").toString();
  const playerId = (e.parameter.playerId || "").toString();

  // FIX 1: Use direct JSON objects for errors, not your custom json_() helper
  if (action !== "GET_STATE") {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "BAD_ACTION" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  if (!gameId) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "MISSING_GAMEID" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const rows = loadAll_(gameId);

  // Sandbox visibility: TABLE is always visible; HAND is visible only to owner.
  const visible = rows.filter(r => {
    if (r.region !== "HAND") return true;
    return (r.ownerId || "") === playerId;
  });

  // FIX 2: Stringify the direct data object directly. Remove the json_() wrapper.
  const responseData = { ok: true, assets: visible };

  return ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents || "{}");
  const action = (body.action || "").toString();

  if (action !== "APPLY_MOVE") {
    return json_({ ok: false, error: "BAD_ACTION" }, 400);
  }

  return applyMove_(body);
}

/***** CORE: APPLY MOVE WITH OPTIMISTIC LOCK + Z-ON-PLACE *****/
function applyMove_(body) {
  const gameId = (body.gameId || "").toString();
  const playerId = (body.playerId || "").toString();
  const assetId = (body.assetId || "").toString();
  const patch = body.patch || {};
  const expectedUpdatedAt = body.expectedUpdatedAt; // may be undefined/null/"" for no lock

  if (!gameId || !assetId || !patch) {
    return json_({ ok: false, error: "MISSING_FIELDS" }, 400);
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) return json_({ ok: false, error: "NO_SHEET" }, 500);

    const data = sh.getDataRange().getValues(); // includes header
    const rowIndex = findRowIndex_(data, gameId, assetId); // 1-based Sheets row index
    if (rowIndex < 2) return json_({ ok: false, error: "NOT_FOUND" }, 404);

    const currentUpdatedAt = sh.getRange(rowIndex, COL.updatedAt).getValue();
    const currentRegion = (sh.getRange(rowIndex, COL.region).getValue() || "").toString();
    const currentOwnerId = (sh.getRange(rowIndex, COL.ownerId).getValue() || "").toString();

    // Optimistic locking
    if (expectedUpdatedAt !== undefined && expectedUpdatedAt !== null && expectedUpdatedAt !== "") {
      if ((currentUpdatedAt || "") !== (expectedUpdatedAt || "")) {
        return json_({
          ok: false,
          error: "CONFLICT",
          currentUpdatedAt: currentUpdatedAt || "",
        }, 409);
      }
    }

    const now = new Date().toISOString();

    // Decide whether this move is HAND -> TABLE placement (assign z = maxZ + 1).
    // We use the intent flag patch.placeOnTable (recommended).
    // If you omit that flag, it will also infer by seeing region change.
    const wantsPlaceOnTable = !!patch.placeOnTable;

    const nextRegion = (patch.region !== undefined && patch.region !== null) ? String(patch.region) : currentRegion;
    const nextOwnerId = (patch.ownerId !== undefined && patch.ownerId !== null) ? String(patch.ownerId) : currentOwnerId;

    const isHandToTable =
      (currentRegion === "HAND") &&
      (nextRegion === "TABLE") &&
      (
        wantsPlaceOnTable || // explicit
        ((patch.placeOnTable === undefined) && (nextOwnerId === "" || nextOwnerId === "null")) // inferred
      );

    // Prepare the applied changes
    const allowed = new Set([
      "facedown",
      "region",
      "ownerId",
      "x",
      "y",
      "rotationDeg",
      "z", // only set by server when isHandToTable; but allowed to keep generic patch
      // do NOT allow placeOnTable to be persisted
    ]);

    // Assign z only on place-to-table; moving within table must NOT change z.
    if (isHandToTable) {
      const maxZ = getMaxZOnTable_(sh, gameId);
      patch.z = (maxZ + 1);
    } else {
      // Strip any client-provided z so dragging across table keeps original z.
      if (patch.z !== undefined) delete patch.z;
    }

    // Apply patch fields
    Object.keys(patch).forEach(k => {
      if (!allowed.has(k)) return;
      if (k === "z" && !isHandToTable) return; // safety

      const colNum = COL[k];
      if (!colNum) return;

      let v = patch[k];

      if (k === "facedown") v = coerceBool_(v);
      if (k === "x" || k === "y" || k === "rotationDeg" || k === "z") v = Number(v);

      if (k === "ownerId") v = (v === null || v === undefined) ? "" : String(v);
      if (k === "region") v = (v === null || v === undefined) ? "" : String(v);

      sh.getRange(rowIndex, colNum).setValue(v);
    });

    sh.getRange(rowIndex, COL.updatedAt).setValue(now);

    return json_({ ok: true, newUpdatedAt: now });
  } finally {
    lock.releaseLock();
  }
}

/***** HELPERS *****/
function loadAll_(gameId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME);
  const data = sh.getDataRange().getValues(); // includes header
  const out = [];

  for (let i = 1; i < data.length; i++) { // skip header row
    const r = data[i];
    const gid = (r[COL.gameId - 1] || "").toString();
    if (gid !== gameId) continue;

    out.push({
      gameId: gid,
      assetId: (r[COL.assetId - 1] || "").toString(),
      name: (r[COL.name - 1] || "").toString(),
      imageUrl: (r[COL.imageUrl - 1] || "").toString(),
      facedown: coerceBool_(r[COL.facedown - 1]),
      region: (r[COL.region - 1] || "TABLE").toString(),
      ownerId: (r[COL.ownerId - 1] || "").toString(),
      x: Number(r[COL.x - 1] || 0),
      y: Number(r[COL.y - 1] || 0),
      rotationDeg: Number(r[COL.rotationDeg - 1] || 0),
      z: Number(r[COL.z - 1] || 0),
      updatedAt: (r[COL.updatedAt - 1] || "").toString(),
    });
  }
  return out;
}

function findRowIndex_(data, gameId, assetId) {
  // data includes header at index 0; Sheets row index = i+1
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    const gid = (r[COL.gameId - 1] || "").toString();
    const aid = (r[COL.assetId - 1] || "").toString();
    if (gid === gameId && aid === assetId) return i + 1; // 1-based Sheets row
  }
  return -1;
}

function getMaxZOnTable_(sh, gameId) {
  // Scan all rows; sandbox/simple. If performance becomes an issue, we can index/cached by Apps Script Cache.
  const range = sh.getDataRange();
  const values = range.getValues();

  let maxZ = 0;
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    const gid = (r[COL.gameId - 1] || "").toString();
    if (gid !== gameId) continue;

    const region = (r[COL.region - 1] || "").toString();
    if (region !== "TABLE") continue;

    const z = Number(r[COL.z - 1] || 0);
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
  // Apps Script doesn't support setting status code directly in ContentService for doPost;
  // we include "status" in payload when needed.
  if (status) out.setContent(JSON.stringify({ ...obj, status }));
  return out;
}

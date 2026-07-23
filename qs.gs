function doPost(e) {
  try {
    var params = e.parameter;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("AIR");
    var accessSheet = ss.getSheetByName("Access");

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = new Array(headers.length);


    var action = (params.action || "").toLowerCase();
    var clientBD = params.cId || params.clientBD || "";
    var clientLevel = parseInt(params.cLv || "0", 10);
    var visibilityStatus = "Private";
    var approvalComment = "";




    if (!isNaN(clientLevel) && clientLevel >= 1) {
      visibilityStatus = "Public";
      approvalComment = "Auto Approve Lv 1";
    }

    var sheetTimeZone = ss.getSpreadsheetTimeZone();
    var formattedDate = Utilities.formatDate(new Date(), sheetTimeZone, "yyyy-MM-dd HH:mm:ss.SSS");
    //logAir(29 + " " + params.timestamp);
    if(params.timestamp){
      formattedDate = Utilities.formatDate(new Date(params.timestamp), sheetTimeZone, "yyyy-MM-dd HH:mm:ss.SSS");
      //logAir(32 + " " + formattedDate);
    }

    var payloadMap = {
      "Timestamp": formattedDate,
      "Submitter ID": params.submitterId,
      "Quest ID": params.questId,
      "URL": params.url,
      "Event Text": params.eventText,
      "IMG": params.img,
      "Comments": approvalComment,
      "Status": params.status,
      "Tags": params.tags,
      "Title": params.title,
      "Visibility": visibilityStatus,
      "Latitude": params.lat || params.latitude || params.latField || "",
      "Longitude": params.lng || params.longitude || params.lngField || "",
      "Client BD": params.cId || params.clientBD,
      "Client LV": params.cLv || params.clientLV,
    };

    for (var i = 0; i < headers.length; i++) {
      var headerName = headers[i];
      newRow[i] = payloadMap.hasOwnProperty(headerName) ? payloadMap[headerName] : "";
    }


    // ---- EDIT AUTH + LOOKUP (from Access sheet) ----        
    if (action === "edit") {
      if (!clientBD) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          error: "Missing clientBD (parameter 'cId' or 'clientBD') for edit."
        })).setMimeType(ContentService.MimeType.JSON);
      }
      if (!accessSheet) {
        throw new Error("Sheet 'Access' not found.");
      }
      var accessHeaders = accessSheet.getRange(1, 1, 1, accessSheet.getLastColumn()).getValues()[0];
      var clientBdColIdx = accessHeaders.indexOf("Client BD");
      // Try common names for the level column; adjust if your header differs.
      var levelColIdx =
        accessHeaders.indexOf("Level") !== -1 ? accessHeaders.indexOf("Level") : -1;

      if (clientBdColIdx === -1) throw new Error("No 'Client BD' column found in 'Access' header row.");
      if (levelColIdx === -1) throw new Error("No level column found in 'Access' header row (expected 'Level').");
      var accessLastRow = accessSheet.getLastRow();
      var accessStartRow = 2; // assume headers in row 1
      var accessNumRows = accessLastRow >= accessStartRow ? (accessLastRow - accessStartRow + 1) : 0;

      var permittedLevel = null;

      if (accessNumRows > 0) {
        var accessRange = accessSheet.getRange(accessStartRow, 1, accessNumRows, accessSheet.getLastColumn());
        var accessValues = accessRange.getValues(); // 2D

        for (var r = 0; r < accessValues.length; r++) {
          var rowClientBD = accessValues[r][clientBdColIdx];
          if (String(rowClientBD) === String(clientBD)) {
            permittedLevel = parseInt(accessValues[r][levelColIdx], 10);
            break;
          }
        }
      }
      if (permittedLevel === null || isNaN(permittedLevel) || permittedLevel < 5) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          error: "Edit not permitted. Client BD Level must be >= 5."
        })).setMimeType(ContentService.MimeType.JSON);
      }

      // ---- Timestamp lookup + row update ----
      var timestampToFind = params.timestamp || params.timeStamp || params.Timestamp;
      if (!timestampToFind) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          error: "Missing required 'timestamp' parameter for edit."
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var timestampColIndex = headers.indexOf("Timestamp"); // 0-based
      if (timestampColIndex === -1) throw new Error("No 'Timestamp' column found in 'AIR' header row.");

      var lastRow = sheet.getLastRow();
      var startRow = 3; // never touch row 2
      if (lastRow >= startRow) {
        var numRows = lastRow - startRow + 1;

        var timestampRange = sheet.getRange(startRow, timestampColIndex + 1, numRows, 1);
        var timestampValues = timestampRange.getValues(); // [ [ts], [ts], ... ]

        var targetRowOffset = -1;
        //logAir(122+ " " + timestampToFind);
        for (var rr = 0; rr < timestampValues.length; rr++) {
          if (toIsoUtc_(timestampValues[rr][0]) === timestampToFind) {
            targetRowOffset = rr;
            break;
          }
        }
        //logAir(129+ " " + targetRowOffset);
        if (targetRowOffset !== -1) {
          var targetRow = startRow + targetRowOffset;

          sheet.getRange(targetRow, 1, 1, newRow.length).setValues([newRow]);

          return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      // If timestamp not found, append (still never touches row 2)
      // (Remove this block and return an error instead if you prefer strict editing.)
    } else {
      // ---- APPEND LOGIC (default) ----
      var nextRow = Math.max(3, sheet.getLastRow() + 1);
      sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
    }



    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


function doGet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("AIR");
    var lastRow = sheet.getLastRow();

    // Dynamically retrieve the spreadsheet's exact time zone
    var sheetTimeZone = ss.getSpreadsheetTimeZone();

    // Total data rows starting from the 3rd row (skips Header Row 1 and Unused Filter Row 2)
    var totalRowsCount = Math.max(0, lastRow - 2);
    var pendingReviewCount = 0;
    var publicEntries = [];

    if (lastRow <= 2) {
      return ContentService.createTextOutput(JSON.stringify({ "status": "success", "totalRows": 0, "pendingCount": 0, "data": [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Step 1: Scan the entire 'Visibility' column quickly just to count totals
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var viewSettingIndex = headers.indexOf("Visibility");
    if (viewSettingIndex === -1) throw new Error("Could not find 'Visibility' column.");

    // Low-overhead call: grabs the single column containing statuses starting at Row 3
    var statusColumnValues = sheet.getRange(3, viewSettingIndex + 1, totalRowsCount, 1).getValues();
    for (var k = 0; k < statusColumnValues.length; k++) {
      if (statusColumnValues[k][0] === "Private") {
        pendingReviewCount++;
      }
    }

    // Step 2: Extract data chunks from the bottom up to isolate the public logs
    var chunkSize = 200;
    var endRow = lastRow;

    while (publicEntries.length < chunkSize && endRow > 2) {
      var startRow = Math.max(3, endRow - chunkSize + 1);
      var numRows = (endRow - startRow) + 1;

      // Pull only this chunk into memory
      var chunkRows = sheet.getRange(startRow, 1, numRows, sheet.getLastColumn()).getValues();

      // Process this chunk backwards (bottom-up execution)
      for (var i = chunkRows.length - 1; i >= 0; i--) {
        var row = chunkRows[i];

        if (row[viewSettingIndex] === "Public") {
          var entry = {};
          for (var j = 0; j < headers.length; j++) {

            var headerName = headers[j];
            if (headerName === "ClientBD" || headerName === "ClientLV" || headerName === "Visibility" || headerName === "Comments") {
              continue;
            }

            var camelKey = headers[j].toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

            // --- TIMEZONE FIX ---
            // If the cell contains a JavaScript Date object, force-format it from the Sheet's Timezone to UTC
            if (row[j] instanceof Date) {
              entry[camelKey] = Utilities.formatDate(row[j], "UTC", "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
            } else {
              entry[camelKey] = row[j];
            }
          }

          publicEntries.push(entry);
        }
      }

      // Move the window upward for the next iteration loop if needed
      endRow = startRow - 1;
    }

    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "totalRows": totalRowsCount,
      "pendingCount": pendingReviewCount,
      "data": publicEntries
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
function isoToNumber_(isoString) {
  var d = new Date(isoString);
  if (isNaN(d.getTime())) throw new Error("Invalid ISO string");
  return d.getTime(); // number (milliseconds)
}
function toIsoUtc_(str) {
  // Example input:
  // "Sat Jul 04 2026 06:33:31 GMT-0700 (Pacific Daylight Time)"
  var d = new Date(str);
  if (isNaN(d.getTime())) throw new Error("Invalid date string");
  return d.toISOString(); // e.g. "2026-07-04T13:33:31.000Z"
}
function logToAIR_(message, sheet, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = ss.getSpreadsheetTimeZone();

  const timestampColIndex = headers.indexOf("Timestamp"); // 0-based
  const commentsColIndex = headers.indexOf("Comments");   // 0-based

  if (timestampColIndex === -1 || commentsColIndex === -1) {
    // Fall back to console if headers aren't what we expect
    console.log("logToAIR_: Missing Timestamp/Comments headers");
    return;
  }

  const nextRow = Math.max(3, sheet.getLastRow() + 1);
  const row = new Array(headers.length).fill("");

  row[timestampColIndex] = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd HH:mm:ss.SSS");
  row[commentsColIndex] = message;

  sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
}
function logAir(message) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("AIR");
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  logToAIR_(message, sheet, headers);
}

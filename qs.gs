function doPost(e) {
  try {
    // Read directly from the incoming form parameters
    var params = e.parameter;
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("AIR");
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = new Array(headers.length);

    var clientLevel = parseInt(params.cLv || "0", 10);
    var visibilityStatus = "Private";
    var approvalComment = "";

    if (!isNaN(clientLevel) && clientLevel >= 1) {
      visibilityStatus = "Public";
      approvalComment = "Auto Approve Lv 1";
    }

    // --- FIX: Get the active spreadsheet's specific timezone (California) ---
    var sheetTimeZone = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
    
    // Format the date string matching the Sheet's timezone precisely
    var formattedDate = Utilities.formatDate(new Date(), sheetTimeZone, "yyyy-MM-dd HH:mm:ss.SSS");
    // Map the incoming keys to the exact sheet headers dynamically
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
      "Client LV": params.cLv ||params.clientLV,
    };

    for (var i = 0; i < headers.length; i++) {
      var headerName = headers[i];
      if (payloadMap.hasOwnProperty(headerName)) {
        newRow[i] = payloadMap[headerName];
      } else {
        newRow[i] = "";
      }
    }
    
    // Instead of appendRow, manually find the next row ensuring we never touch Row 2
    var nextRow = Math.max(3, sheet.getLastRow() + 1);
    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
    
    // Return a clean CORS-approved response wrapper
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "error": error.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("AIR");
    var lastRow = sheet.getLastRow();
    
    // Total data rows starting from the 3rd row (skips Header Row 1 and Unused Filter Row 2)
    var totalRowsCount = Math.max(0, lastRow - 2);
    var pendingReviewCount = 0;
    var publicEntries = [];

    if (lastRow <= 2) {
      return ContentService.createTextOutput(JSON.stringify({"status": "success", "totalRows": 0, "pendingCount": 0, "data": []}))
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
    var chunkSize = 20000;
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
            
            entry[camelKey] = row[j];
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
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "error": error.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

const SHEET_NAME = 'RSVP';
const HEADERS = ['ID','Timestamp','Name','Attendance','Guests','Wish','Invitee','Page'];

function getSheet_(){
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if(!sheet){
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  if(sheet.getLastRow() === 0){
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e){
  try{
    const payload = JSON.parse((e && e.parameter && e.parameter.payload) || '{}');
    const row = [
      clean_(payload.id,120),
      clean_(payload.timestamp,80) || new Date().toISOString(),
      clean_(payload.name,120),
      clean_(payload.attendance,40),
      clean_(payload.guests,30),
      clean_(payload.wish,1000),
      clean_(payload.invitee,120),
      clean_(payload.page,500)
    ];

    if(!row[2] || !row[3] || !row[5]){
      return json_({ok:false,error:'Required fields are missing.'});
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try{
      getSheet_().appendRow(row);
    }finally{
      lock.releaseLock();
    }

    return json_({ok:true,id:row[0]});
  }catch(error){
    return json_({ok:false,error:String(error)});
  }
}

function doGet(e){
  const action = String((e && e.parameter && e.parameter.action) || 'list');
  if(action !== 'list') return output_(e,{ok:false,items:[]});

  const limit = Math.max(1,Math.min(Number((e && e.parameter && e.parameter.limit) || 50),100));
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if(lastRow < 2) return output_(e,{ok:true,items:[]});

  const count = Math.min(limit,lastRow - 1);
  const start = Math.max(2,lastRow - count + 1);
  const values = sheet.getRange(start,1,count,HEADERS.length).getDisplayValues();

  const items = values.reverse().map(function(row){
    return {
      id:row[0],
      timestamp:row[1],
      name:row[2],
      attendance:row[3],
      guests:row[4],
      wish:row[5],
      invitee:row[6]
    };
  });

  return output_(e,{ok:true,items:items});
}

function clean_(value,maxLength){
  return String(value == null ? '' : value).trim().slice(0,maxLength);
}

function json_(payload){
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function output_(e,payload){
  const callback = String((e && e.parameter && e.parameter.callback) || '');
  if(/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)){
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(payload) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(payload);
}

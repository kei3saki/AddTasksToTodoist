//-------------------------------------------------------------------------------
// todoist_batch
// This GAS is batch source in order to add tasks automaticaly.
// 1. Read tasks from todoist_tasks on Google Spead Sheet.
// 2. Add tasks to personal todoist.
//    Target scope are night_tasks and morning_tasks
//
// 14th November 2018 | Created by Kei Sasaki @keis00059
// 27th November 2018 | Updated by Kei Sasaki @keis00059 | Set 20 for task upper limit.
//
//-------------------------------------------------------------------------------

//===============================================================================
// constants
//===============================================================================
// Todoist
var URL = "https://todoist.com/API/v7/sync";
var TODOIST_TOKEN = "**set your todoist token**";
var NIGHT_TASKS1 = "night_tasks1"; //project name on todoist
var NIGHT_TASKS2 = "night_tasks2"; //project name on todoist
var PRJECT_ID_NIGHT_TASKS = "**set your project id**"; //project id on todoist
var MORNING_TASKS1 = "morning_tasks1";
var MORNING_TASKS2 = "morning_tasks2";
var PRJECT_ID_MORNING_TASKS = "**set your project id**";

// Google Spread Sheet
var SHEET_ID = ""
var SHEET_NAME = "task_list"

//===============================================================================
// funtions
//===============================================================================
function init(){
  getTaskList(NIGHT_TASKS);
  getTaskList(MORNING_TASKS1);
  getTaskList(MORNING_TASKS2);
}

function initNight1(){
  getTaskList(NIGHT_TASKS1);
}
function initNight2(){
  getTaskList(NIGHT_TASKS2);
}
function initMorning1(){
  getTaskList(MORNING_TASKS1);
}
function initMorning2(){
  getTaskList(MORNING_TASKS2);
}

function getTaskList(taskType) { 
  Logger.log("getTaskList");    
  
  // get task list
  var taskList = readSpreadSheet(taskType);
  
  for (var i = 0; i < taskList.length; i++) {
    Logger.log("getTaskList for "+i);
    Logger.log(taskList[i]);
    addTasks(taskType, taskList[i].toString());
    //Utilities.sleep(500);
  }

}

function addTasks(taskType, taskName) {
  Logger.log("addTasks");
  Logger.log(taskName);
  
  var uuid = Utilities.getUuid();
  var tempId = Utilities.getUuid();
  var task = getDate()+"_"+taskName;
  var formData, response;
  var projectId;
  
  switch(taskType){
    case NIGHT_TASKS1:
    case NIGHT_TASKS2:
      projectId = PRJECT_ID_NIGHT_TASKS;
      break
      
    case MORNING_TASKS1:
    case MORNING_TASKS2:
      projectId = PRJECT_ID_MORNING_TASKS;
      break
  }
  
  formData = {
    "token": TODOIST_TOKEN,
    "commands": JSON.stringify([{
      "type": "item_add",
      "temp_id": tempId,
      "uuid": uuid,
      "args": {
        "priority" : 1,
        "content": task,
        "project_id": projectId, 
        "due": {
          "string": "",
        },
      }
    }])
  };
  
  response = UrlFetchApp.fetch(URL, {
    "method" : "post",
    "payload" : formData
  });
}

function readSpreadSheet(taskType) {
  Logger.log("readSpreadSheet");
  Logger.log("readSpreadSheet "+taskType);

  // シートの取得
  var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  // get task list
  var tasksCount; // タスク数
  var tasksRange; // range of spreadsheet
  var taskList;
   
  switch(taskType){
    case NIGHT_TASKS1:
      tasksCount = sheet.getRange("c2").getValue();
      tasksRange = "a3:a"+tasksCount;
      break
      
    case NIGHT_TASKS2:
      tasksCount = sheet.getRange("f2").getValue();
      tasksRange = "d3:d"+tasksCount;
      break
      
    case MORNING_TASKS1:
      tasksCount = sheet.getRange("i2").getValue();
      tasksRange = "g3:g"+tasksCount;
      break
      
    case MORNING_TASKS2:
      tasksCount = sheet.getRange("l2").getValue();
      tasksRange = "j3:j"+tasksCount;
      break
  }
  
  taskList = sheet.getRange(tasksRange).getValues();
  return taskList;

}

//===============================================================================
// utilities
//===============================================================================
function getDate(){
  var dt = new Date();

  //年
  var year = dt.getFullYear();
  
  //月
  //1月が0、12月が11。そのため+1をする。
  var month = dt.getMonth()+1;
  
  //日
  var date = dt.getDate();
  
  //曜日
  //日曜が0、土曜日が6。配列を使い曜日に変換する。
  dateT = ["日","月","火","水","木","金","土"];
  var day = dateT[dt.getDay()];
  
  return month+"/"+date+"("+day+")";
  
}

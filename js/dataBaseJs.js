var db = null;
var stmt = null

var NONE = -1;
var CREATE_SCHEMA = 0;
var SELECT_DATA = 1;
var INSERT_CALENDAR = 2;
var DELETE_CALENDAR = 3;
var UPDATE_CALENDAR = 4;
var SHOW_EVENTS = 5;

var state = NONE;
var flag = 0;
function doDbOpen(event) {
    stmt = new air.SQLStatement();
    stmt.addEventListener(air.SQLErrorEvent.ERROR, doStmtError);
    stmt.addEventListener(air.SQLEvent.RESULT, doStmtResult);

    stmt.sqlConnection = db;
    stmt.text = 'CREATE TABLE IF NOT EXISTS calender ( ' +
                    'id INTEGER PRIMARY KEY, ' +
					'serverId INTEGER, ' +
					'userId INTEGER,' +
                    'title VARCHAR,' +
                    'start VARCHAR,' +
					'end VARCHAR,' +
					'startTimeStamp VARCHAR,' +
					'reminder VARCHAR,' +
					'reminderText VARCHAR,' +
					'reminderDateTime VARCHAR,' +
					'taskDone VARCHAR,' +
					'createFlag BIT,' +
					'deleteFlag BIT,' +
                    'updateFlag BIT)';
    state = CREATE_SCHEMA;
    stmt.execute();
    doCreateBackgroundImage();
    doCreateTempDataForOnlineTest();
    doCreateOverallPerformance();
    doCreateQueryLogs();
    doCreateNotes();
    doCreateHighLight();
    doCreateStudentLogin();
    doCreateLastSyncDate();
    doCreateFactOfMatter();
    doCreateFactOfThoughtoftheDay();
    doCreateVideo();
}

function doLoad() {
    //var file = air.File.applicationStorageDirectory.resolvePath('DesktopAppClient1.db');
    var file = air.File.applicationDirectory.resolvePath('DesktopAppClient2.db');
    db = new air.SQLConnection();
    db.addEventListener(air.SQLEvent.OPEN, doDbOpen);
    db.open(file, air.SQLMode.CREATE);
}

//========================================== Sync Date ============================================================
function doCreateLastSyncDate() {
    stmt.text = 'CREATE TABLE IF NOT EXISTS lastSyncDate ( ' +
	'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
	'lastSyncDateTime VARCHAR)';
    stmt.execute();
}
function doCreateBackgroundImage() {
    stmt.text = 'CREATE TABLE IF NOT EXISTS backImage(id INTEGER PRIMARY KEY AUTOINCREMENT,path VARCHAR)';
    stmt.execute();
}
function doUpdateBackgroundImage(url) {
    stmt.text = "select id from backImage";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        stmt.text = "UPDATE backImage SET path = '" + url + "' WHERE id>0";
        stmt.execute();
    }
    else {
        stmt.text = 'INSERT INTO backImage VALUES (NULL,\'' + url + '\')';
        stmt.execute();
    }
}
function getBackgroundImage() {
    stmt.text = "SELECT path FROM backImage WHERE id>0";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data[0].path;
    }
    else {
        return "assets/images/back.jpg";
    }
}
function updateLastSyncDate() {
    var currentDate = new Date();
    stmt.text = "select lastSyncDateTime from lastSyncDate";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        stmt.text = "UPDATE lastSyncDate SET lastSyncDateTime='" + currentDate + "' WHERE id='1'";
        stmt.execute();
    }
    else {
        stmt.text = 'INSERT INTO lastSyncDate VALUES (NULL,\'' + currentDate + '\')';
        stmt.execute();
    }
}

function findLastSyncDateAndNotify() {
    stmt.text = "select lastSyncDateTime from lastSyncDate";
    stmt.execute();
    result = stmt.getResult();

    if (result.data != null) {
        var date1 = new Date(result.data[0].lastSyncDateTime);
        var date2 = new Date();

        datepart: 'y', 'm', 'w', 'd', 'h', 'n', 's'
        Date.dateDiff = function (datepart, fromdate, todate) {
            datepart = datepart.toLowerCase();
            var diff = todate - fromdate;
            var divideBy = {
                w: 604800000,
                d: 86400000,
                h: 3600000,
                n: 60000,
                s: 1000
            };
            return Math.floor(diff / divideBy[datepart]);
        }
        var diffBetweenDates = Date.dateDiff('d', date1, date2);
        if (diffBetweenDates > 30) {
            alert("Please Synchronize the data");
        }
        return diffBetweenDates;
    }
    else {
        return 0;
    }
}

//========================================== End Sync Date ========================================================

//========================================== CALENDER =============================================================
function doSave(id, userId, title, startDate, endDate, reminderStatus, reminderTextFromPopUp, reminderTime, taskStatus) {
    var serverId = 0;
    var createdFlag = 1;
    var deleteFlag = 0;
    var updateFlag = 0;
    var dateToTimeStamp = startDate / 1000;

    stmt.text = 'INSERT INTO calender VALUES (\'' + id + '\',\'' + serverId + '\',\'' + userId + '\',\'' + title + '\',\'' + startDate + '\',\'' + endDate + '\',\'' + dateToTimeStamp + '\',\'' + reminderStatus + '\', \'' + reminderTextFromPopUp + '\',\'' + reminderTime + '\', \'' + taskStatus + '\',\'' + createdFlag + '\',\'' + deleteFlag + '\',\'' + updateFlag + '\')';

    stmt.execute();
    jsonEventFromDb.push({
        id: id,
        start: startDate,
        end: endDate,
        title: title
    });
    doFindReminderFromDb();
}

function doShowEventsOnLoad() {
    doFindCurrentLoginUserId();
    stmt.text = "SELECT id,title,start,end,deleteFlag FROM calender where userid='" + globalUserId + "' ";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        for (var c = 0; c < result.data.length; c++) {
            if (result.data[c].deleteFlag == 0) {
                var date = result.data[c].start;
                jsonEventFromDb.push({
                    id: result.data[c].id,
                    start: result.data[c].start,
                    end: result.data[c].end,
                    title: result.data[c].title
                });
            }
        }
    }
    doFindReminderFromDb();
}

function doFindCurrentLoginUserId() {
    globalUserId = "";
    globalStudentStandard = "";
    globalStudentName = "";
    stmt.text = "SELECT * FROM tempUserDetails";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        for (var c = 0; c < result.data.length; c++) {
            globalUserId = result.data[c].userId;
            globalStudentStandard = result.data[c].userStandard;
            globalStudentName = result.data[c].userName;
        }
    }
}

function doCallForTaskStatus(event_id) {
    stmt.text = "SELECT taskDone FROM calender where id='" + event_id + "'";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data[0].taskDone
    }
}

function doUpdateEventInDataBase(current_event_id, title, startDate, endDate, taskStatus) {
    var event_id = "'" + current_event_id + "'";
    var updateFlag = 1;
    stmt.text = "UPDATE calender SET title='" + title + "', start='" + startDate + "', end='" + endDate + "',taskDone='" + taskStatus + "' WHERE id=" + event_id;
    stmt.execute();
    doFindReminderFromDb();
    for (var i in jsonEventFromDb) {
        if (jsonEventFromDb[i].id == current_event_id) {
            jsonEventFromDb[i].start = startDate;
            jsonEventFromDb[i].end = endDate;
            jsonEventFromDb[i].title = title;
            return false;
        }
    }
}

function doUpdateEventInDataBaseWithOutTaskDone(current_event_id, title, startDate, endDate) {
    var event_id = "'" + current_event_id + "'";
    var updateFlag = 1;
    stmt.text = "UPDATE calender SET title='" + title + "', start='" + startDate + "', end='" + endDate + "',updateFlag='" + updateFlag + "' WHERE id=" + event_id;
    stmt.execute();
    doFindReminderFromDb();
    for (var i in jsonEventFromDb) {
        if (jsonEventFromDb[i].id == current_event_id) {
            jsonEventFromDb[i].start = startDate;
            jsonEventFromDb[i].end = endDate;
            jsonEventFromDb[i].title = title;
            return false;
        }
    }
}

function doDeleteEventInDataBase(current_event_id) {
    var event_id = "'" + current_event_id + "'";
    var deleteFlag = 1;
    stmt.text = "UPDATE calender SET deleteFlag='" + deleteFlag + "' WHERE id=" + event_id;
    stmt.execute();

    jQuery.each(jsonEventFromDb, function (i, val) {
        if (val.id == current_event_id) {
            jsonEventFromDb.splice(i, 1);
            return false;
        }
    });
    doFindReminderFromDb();
}

function doFindReminderFromDb() {
    $('.eventsToDisplay').remove();
    var currentTime = new Date();
    var mm = " ";

    var month = currentTime.getMonth() + 1;

    if (month == 1) {
        mm = "Jan";
    }
    else if (month == 2) {
        mm = "Feb";
    }
    else if (month == 3) {
        mm = "Mar";
    }
    else if (month == 4) {
        mm = "Apr";
    }
    else if (month == 5) {
        mm = "May";
    }
    else if (month == 6) {
        mm = "June";
    }
    else if (month == 7) {
        mm = "July";
    }
    else if (month == 8) {
        mm = "Aug";
    }
    else if (month == 9) {
        mm = "Sept";
    }
    else if (month == 10) {
        mm = "Oct";
    }
    else if (month == 11) {
        mm = "Nov";
    }
    else if (month == 12) {
        mm = "Dec";
    }
    var day = currentTime.getDate();
    var year = currentTime.getFullYear();
    var currentHour = currentTime.getHours();
    var currentMin = currentTime.getMinutes();
    var eventPresent = 0;
    stmt.text = "SELECT * from calender Where userid='" + globalUserId + "' AND deleteFlag='0'";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        $('.notificationTitle').remove();
        $('.eventsToDisplay').remove();
        $('.notification-text').remove();
        $('.notification').append("<h5 class='notificationTitle'>Today" + "'" + "s Notifications:- </h5>");
        for (var c = 0; c < result.data.length; c++) {

            var eventRemainderStartDate = result.data[c].start;
            var eventNotificationTitle = result.data[c].title;

            var splitWithGMT = eventRemainderStartDate.split("GMT+0530");

            var splitDateTime = splitWithGMT[0].split(" ");
            if (day == '1' || day == '2' || day == '3' || day == '4' || day == '5' || day == '6' || day == '7' || day == '8' || day == '9') {
                day = '0' + day;

            }
            if (mm == splitDateTime[1] && day == splitDateTime[2] && year == splitDateTime[3]) {

                eventHouresMinFromDb = splitDateTime[4].split(":");
                if (currentHour == eventHouresMinFromDb[0]) {
                    if (currentMin <= eventHouresMinFromDb[1]) {
                        $('.notification').append('<div class="notification-text" style="background-color:#428bca;color:#fff;"><span class="eventsToDisplay">' + eventNotificationTitle + ' ' + 'at' + ' ' + splitDateTime[4] + '</span></div>');
                        eventPresent = 1;
                    }
                }
                if (currentHour < eventHouresMinFromDb[0]) {
                    $('.notification').append('<div class="notification-text" style="background-color:#428bca;color:#fff;"><span class="eventsToDisplay">' + eventNotificationTitle + ' ' + 'at' + ' ' + splitDateTime[4] + '</span></div>');
                    eventPresent = 1;
                }
            }
        }
        if (eventPresent == 1) {
            $('.notification').removeClass('hideNotification');
        }
    }
    else {
        $('.notification').addClass('hideNotification');
    }
}

function findMaxIdFromDbForCalender() {
    stmt.text = "SELECT * FROM calender WHERE id = (SELECT MAX(id) FROM calender)";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data[0].id;
    }
    else {
        return 0;
    }
}

function doCheckForTaskDone(id) {
    stmt.text = "SELECT taskDone FROM calender WHERE id ='" + id + "'";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data[0].taskDone;
    }
    else {
        return 0;
    }
}

function callDataCalendar() {
    stmt.text = "SELECT * FROM calender WHERE createFlag='1' or deleteFlag='1' or updateFlag='1' ";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data;
    }
    else {
        return 0;
    }
}

function updateDataInLocalDB(serverId, id, deleteFlag) {
    if (deleteFlag == 0) {
        stmt.text = "UPDATE calender SET serverId='" + serverId + "', createFlag='0', deleteFlag='0', updateFlag='0' WHERE id=" + id;
        stmt.execute();
    }
    else {
        stmt.text = "delete from calender where id=" + id;
        stmt.execute();
    }
}
//=============================================== END CALENDER =====================================================

//=============================================== ONLINE TEST ==================================================
function doCreateTempDataForOnlineTest() {
    stmt.text = 'CREATE TABLE IF NOT EXISTS tempdata ( ' +
                       'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                       'userid INTEGER,' +
                       'QuestionNo VARCHAR,' +
                       'QuestionText VARCHAR,' +
                       'CorrectAns VARCHAR,' +
					   'CorrectAnsText VARCHAR,' +
					   'GivenAns VARCHAR,' +
                       'GivenAnsText VARCHAR)';
    stmt.execute();
    doCheckForDbIsBlank();
    doCreateReviewForOnlineTest();
}

function doCreateReviewForOnlineTest() {
    stmt.text = 'CREATE TABLE IF NOT EXISTS review ( ' +
                       'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
					   'userid INTEGER,' +
					   'serverId INTEGER,' +
					   'Chapter VARCHAR,' +
					   'Subject VARCHAR,' +
					   'Standard VARCHAR,' +
                       'QuestionNo VARCHAR,' +
                       'QuestionText VARCHAR,' +
                       'CorrectAns VARCHAR,' +
					   'CorrectAnsText VARCHAR,' +
					   'GivenAns VARCHAR,' +
					   'GivenAnsText VARCHAR,' +
					   'Score VARCHAR,' +
					   'createFlag BIT,' +
					   'updateFlag BIT,' +
                       'deleteFlag BIT)';
    stmt.execute();
}

function doCreateOverallPerformance() {
    stmt.text = 'CREATE TABLE IF NOT EXISTS overallPerformance ( ' +
                       'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                       'userid INTEGER,' +
                       'Chapter VARCHAR,' +
                       'Subject VARCHAR,' +
                       'Standard VARCHAR,' +
					   'Attempts INTEGER,' +
					   'HighestScore VARCHAR,' +
                       'DateTestGiven VARCHAR)';
    stmt.execute();
    doCheckForDbIsBlank();
    doCreateReviewForOnlineTest();
}

function doCheckForLastTest(globalUserId, subjectName, globalStudentStandard, chapterNo) {
    stmt.text = 'SELECT * FROM review';
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        for (var c = 0; c < result.data.length; c++) {
            if (subjectName == result.data[c].Subject && globalStudentStandard == result.data[c].Standard && chapterNo == result.data[c].Chapter) {
                stmt.text = "delete from review Where userid=" + "'" + globalUserId + "'" + " AND Subject=" + "'" + subjectName + "'" + " AND Standard=" + "'" + globalStudentStandard + "'" + " AND Chapter=" + "'" + chapterNo + "'" + "";
                stmt.execute();
            }
        }
    }
}

function doAddReviewData(globalUserId, chapterNo, globalStudentStandard, subjectName, QuestionNo, QuestionText, correctAnswer, correctAnswerText, givenAns, givenAnswerText, testMark) {
   
    var serverId = 0;
    var createFlag = 1;
    var deleteFlag = 0;
    var updateFlag = 0;

    QuestionText = QuestionText.replace("'", "''");
    correctAnswer = correctAnswer.replace("'", "''");
    givenAns = givenAns.replace("'", "''");

    stmt.text = 'INSERT INTO review VALUES (NULL,\'' + globalUserId + '\', \'' + serverId + '\',\'' + chapterNo + '\',\'' + subjectName + '\',\'' + globalStudentStandard + '\',\'' + QuestionNo + '\',\'' + QuestionText + '\',\'' + correctAnswer + '\',\'' + correctAnswerText + '\',\'' + givenAns + '\',\'' + givenAnswerText + '\',\'' + testMark + '\',\'' + createFlag + '\',\'' + updateFlag + '\',\'' + deleteFlag + '\')';
    stmt.execute();

   
}

function doAddOverAllPerformance(globalUserId, chapterNo, globalStudentStandard, subjectName, testMark) {
    var date = new Date();
    var currDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    stmt.text = "SELECT * FROM overallPerformance Where userid=" + "'" + globalUserId + "'" + " AND Subject=" + "'" + subjectName + "'" + " AND Standard=" + "'" + globalStudentStandard + "'" + " AND Chapter=" + "'" + chapterNo + "'" + "";
    stmt.execute();
    result = stmt.getResult();
    if (result.data == null) {
        var attempt = 1;
        stmt.text = 'INSERT INTO overallPerformance VALUES (NULL,\'' + globalUserId + '\',\'' + chapterNo + '\',\'' + subjectName + '\',\'' + globalStudentStandard + '\',\'' + attempt + '\',\'' + testMark + '\',\'' + currDate + '\')';
        stmt.execute();
    }
    else {
        var temp = 1;
        var attempt = parseInt(result.data[0].Attempts) + 1 ;
        //air.Introspector.Console.log(result.data);
        //alert(attempt + "------" + testMark + ">" + result.data[0].HighestScore);
        if (testMark > result.data[0].HighestScore) {
            stmt.text = "UPDATE overallPerformance SET Attempts='" + attempt + "', HighestScore = '" + testMark + "', DateTestGiven='" + currDate + "' WHERE id = " + result.data[0].id;
            stmt.execute();
        }
        else {
            stmt.text = "UPDATE overallPerformance SET Attempts='" + attempt + "', DateTestGiven='" + currDate + "' WHERE id = " + result.data[0].id;
            stmt.execute();
        }
    }
}

function doCheckForDbIsBlank() {
    stmt.text = 'SELECT * FROM tempdata';
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        doDeleteTempDataFromDb();
    }
}

function doAddTempData(QuestionNo, QuestionText, CorrectAns, correctAnswerText, GivenAns, givenAnsText) {
    QuestionText = QuestionText.replace("'", "''");
    CorrectAns = CorrectAns.replace("'", "''");
    GivenAns = GivenAns.replace("'", "''");

    stmt.text = 'INSERT INTO tempdata VALUES (NULL,NULL,\'' + QuestionNo + '\',\'' + QuestionText + '\',\'' + CorrectAns + '\',\'' + correctAnswerText + '\',\'' + GivenAns + '\',\'' + givenAnsText + '\')';
    stmt.execute();
}

function doShowReviewTestSummary(globalUserId, chapterNo, subjectName, globalStudentStandard) {
    stmt.text = "SELECT * FROM review Where userid=" + "'" + globalUserId + "'" + " AND Subject=" + "'" + subjectName + "'" + " AND Standard=" + "'" + globalStudentStandard + "'" + " AND Chapter=" + "'" + chapterNo + "'" + "";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        var lastEntry = result.data.length;
        if (lastEntry < 10) {
            alert("Previous Test Not Completed!!!!");
        }
        else {
            jQ10('.gridview-wrap').hide();
            jQ3('#main-div').removeClass('main-divDisplay');
            jQ3('#loaderImage').fadeOut('slow');
            jQ3('.question-wrap').append('<h2 style="text-align: center; margin-top:-20px;">Test Review</h2>');
            jQ3('.question-wrap').append('<h1 class="totalMarks">You scored ' + result.data[9].Score + '0%</h1>');
            jQ3('.question-wrap').append('<h2 style="margin-Top:10%;font-family:Times New Roman">Test Summary:- </h2>');
            for (var c = 0; c < result.data.length; c++) {

                if (result.data[c].CorrectAns == result.data[c].GivenAns) {
                    jQ3('.question-wrap').append('<span style="float:left;display:block;">' + result.data[c].QuestionNo + "]" + '</span> <h3 style="float:left;width:91%; margin:0 0 18px 12px;text-align:justify;">' + ' ' + result.data[c].QuestionText + '</h3>  <h4 class="correctAns" style="display:inline-block;margin: -10px 0 0;font-family:Times New Roman;">' + "Correct Answer: " + '' + result.data[c].CorrectAnsText + '  ' + '<img src="assets/images/correct.png"></img>' + '</h4><br></br><h4 class="givenAns" style="display:inline-block;font-family:Times New Roman;margin-top:10px;">' +
					"Given Answer: " +
					'' +
					result.data[c].GivenAnsText +
					'   ' +
					'<img src="assets/images/correct.png" style="margin-left:12px;" >' +
					'</h4> ');
                }
                else {
                    jQ3('.question-wrap').append('<span style="float:left;display:block;">' + result.data[c].QuestionNo + "]" + '</span>  <h3 style="float:left;width:91%; margin:0 0 18px 12px;text-align:justify;">' + '  ' + result.data[c].QuestionText + '</h3>  <h4 class="correctAns" style="display:inline-block;margin: -10px 0 0;font-family:Times New Roman;">' + "Correct Answer: " + result.data[c].CorrectAnsText + '  ' + '<img src="assets/images/correct.png" style="display:inline-block; margin-left:12px;padding-top:0px;"></img>' + '</h4><br></br><h4 class="givenAns" style="display:inline-block; font-family:Times New Roman;margin-top:10px;">' +
					"Given Answer: " +
					'' +
					result.data[c].GivenAnsText +
					'  ' +
					'<img src="assets/images/wrong.png" style="margin-left:12px;"></img>' +
					'</h4>');
                }
            }
        }
    }
    else {
        alert("No Test Given!!!!");
    }
}

function doCheckForReTest(globalUserId, chapterNo, subjectName, globalStudentStandard) {

    stmt.text = "SELECT * FROM review Where userid=" + "'" + globalUserId + "'" + " AND Subject=" + "'" + subjectName + "'" + " AND Standard=" + "'" + globalStudentStandard + "'" + " AND Chapter=" + "'" + chapterNo + "'" + "";

    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return 1;
    }
    else {
        return 0;
    }

}

function doShowTestSummary() {
    stmt.text = 'SELECT * FROM tempdata';
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        jQ3('.question-wrap').append('<h2 style="margin-Top:10%;font-family:Times New Roman;">Test Summary:- </h2>');
        for (var c = 0; c < result.data.length; c++) {

            if (result.data[c].CorrectAnsText == result.data[c].GivenAnsText) {
                //jQ3('.question-wrap').append('<span style="float:left;display:block;">' + result.data[c].QuestionNo + "]" + '</span> <h3 style="float:left;width:91%; margin:0 0 18px 12px;text-align:justify;">' + ' ' + result.data[c].QuestionText + '</h3>  <h4 class="correctAns" style="display:inline-block;margin: -10px 0 0;font-family:Times New Roman;">' + "Correct Answer: " + '' + result.data[c].CorrectAnsText + '  ' + '<img src="assets/images/correct.png"></img>' + '</h4><br></br><h4 class="givenAns" style="display:inline-block;font-family:Times New Roman;margin-top:10px;">' +
                jQ3('.question-wrap').append('<span style="float:left;display:block;">' + result.data[c].QuestionNo + "]" + '</span> <h3 style="float:left;width:91%; margin:0 0 18px 12px;text-align:justify;">' + ' ' + result.data[c].QuestionText + '</h3></h4><br></br><h4 class="givenAns" style="display:inline-block;font-family:Times New Roman;margin-top:10px;">' +
            "Given Answer: " +
            '' +
            result.data[c].GivenAnsText +
            '   ' +
            '<img src="assets/images/correct.png" style="margin-left:12px;"  >' +
            '</h4> ');
            }
            else {
                // jQ3('.question-wrap').append('<span style="float:left;display:block;">' + result.data[c].QuestionNo + "]" + '</span>  <h3 style="float:left;width:91%; margin:0 0 18px 12px;text-align:justify;">' + '  ' + result.data[c].QuestionText + '</h3>  <h4 class="correctAns" style="display:inline-block;margin: -10px 0 0;font-family:Times New Roman;">' + "Correct Answer: " + result.data[c].CorrectAnsText + '  ' + '<img src="assets/images/correct.png" style="display:inline-block; margin-left:12px;padding-top:0px;"></img>' +
                jQ3('.question-wrap').append('<span style="float:left;display:block;">' + result.data[c].QuestionNo + "]" + '</span>  <h3 style="float:left;width:91%; margin:0 0 18px 12px;text-align:justify;">' + '  ' + result.data[c].QuestionText + '</h3>' +
				 '</h4><br></br><h4 class="givenAns" style="display:inline-block; font-family:Times New Roman;margin-top:10px;">' +
				"Given Answer: " +
				'' +
				result.data[c].GivenAnsText +
				'  ' +
				'<img src="assets/images/wrong.png" style="margin-left:12px;"></img>' +
				'</h4> ');
            }
        }
    }
    doDeleteTempDataFromDb();
}


function doDeleteTempDataFromDb() {
    stmt.text = "delete from tempdata; delete from sqlite_sequence where name='tempdata';";
    stmt.execute();
}


function callDataReview() {
    stmt.text = "SELECT * FROM review WHERE createFlag='1' or deleteFlag='1' or updateFlag='1' ";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data;
    }
    else {
        return 0;
    }
}

function updateReviewDataInLocalDB(serverId, id, deleteFlag) {
    if (deleteFlag == 0) {
        stmt.text = "UPDATE review SET serverId='" + serverId + "', createFlag='0', deleteFlag='0', updateFlag='0' WHERE id=" + id;
        stmt.execute();
    }
    else {
        stmt.text = "delete from review where id=" + id;
        stmt.execute();
    }
}

//=============================================== END ONLINE TEST ==================================================

//============================================== QUERY LOGS ====================================================
function doCreateQueryLogs() {
    stmt.text = 'CREATE TABLE IF NOT EXISTS querylogs ( ' +
                       'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
					   'serverId INTEGER,' +
                       'userid INTEGER,' +
                       'Subject VARCHAR,' +
                       'Title VARCHAR,' +
                       'Chapter VARCHAR,' +
                       'Section VARCHAR,' +
                       'Description VARCHAR,' +
                       'DateTime VARCHAR,' +
					   'Answer VARCHAR,' +
					   'createFlag BIT,' +
					   'deleteFlag BIT,' +
                       'updateFlag BIT)';
    stmt.execute();
}

function doInsertQueryLogs(userId, subject, title, chapter, section, description) {
    var currentdate = new Date();
    var serverId = 0;
    var createFlag = 1;
    var deleteFlag = 0;
    var updateFlag = 0;
    subject = subject.replace("'", "''");
    title = title.replace("'", "''");
    chapter = chapter.replace("'", "''");
    section = section.replace("'", "''");
    description = description.replace("'", "''");

    var datetime = currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear();
    stmt.text = 'INSERT INTO querylogs VALUES (NULL,\'' + serverId + '\',\'' + userId + '\',\'' + subject + '\',\'' + title + '\',\'' + chapter + '\',\'' + section + '\',\'' + description + '\',\'' + datetime + '\',NULL,\'' + createFlag + '\',\'' + deleteFlag + '\',\'' + updateFlag + '\')';
    stmt.execute();
}

function doEditQueryLogs(id, userId, subject, title, chapter, section, description) {
    stmt.text = "UPDATE querylogs SET userid='" + userId + "', Subject='" + subject + "',Title='" + title + "',Chapter='" + chapter + "',Section='" + section + "',Description='" + description + "' WHERE id=" + id;
    stmt.execute();
}

function doShowQueryLogs() {
    jQ10('.rowQueryLogFromDb').remove();
    stmt.text = "SELECT * FROM querylogs Where userid='" + globalUserId + "'";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        for (var c = 0; c < result.data.length; c++) {
            if (result.data[c].Answer == null) {
                var currentDate = result.data[c].DateTime;
                var status = 'Pending';
                jQ10('.statustable').append('<tr class="rowQueryLogFromDb" rowId=' + result.data[c].id + '> <td id="singleRowQueryLogFromDb"> ' + (c + 1) + ' </td><td id="singleRowQueryLogFromDb"> ' + result.data[c].Subject + ' </td>  <td id="singleRowQueryLogFromDb"> ' + result.data[c].Chapter + ' </td> <td id="singleRowQueryLogFromDb">' + result.data[c].Title + '</td> <td id="singleRowQueryLogFromDb">' + result.data[c].DateTime + '</td> <td id="singleRowQueryLogFromDb"><span style="background:red;padding:5px 17px; color:white">' + status + '</span></td><td id="singleRowQueryLogFromDb"><a  class="deleteRow" href="#"  id=' + result.data[c].id + '  onclick="doDeleteQueryById(jQ10(this));">Delete</a> | <a  class="deleteRow" href="#"  id=' + result.data[c].id + '  onclick="doEditQueryById(jQ10(this));"> Edit</a></td></tr>');
            }
            else {
                var id = result.data[c].id;
                var status = 'Answered';
                jQ10('.statustable').append('<tr class="rowQueryLogFromDb"> <td id="singleRowQueryLogFromDb"> ' + (c + 1) + ' </td><td id="singleRowQueryLogFromDb"> ' + result.data[c].Subject + ' </td>  <td id="singleRowQueryLogFromDb"> ' + result.data[c].Chapter + ' </td> <td id="singleRowQueryLogFromDb">' + result.data[c].Title + '</td> <td id="singleRowQueryLogFromDb">' + result.data[c].DateTime + '</td> <td id="singleRowQueryLogFromDb"> <span style="background:green;padding:5px 10px;"><a href="#" style="text-decoration:none;color:white;" id=' + id + ' onclick="showAnswerFromDb(' + id + ');">' + status + '</a></span> </td><td id="singleRowQueryLogFromDb"><a  class="deleteRow" href="#"  id=' + result.data[c].id + '  onclick="doDeleteQueryById(jQ10(this));">Delete</a> | <a  class="deleteRow" href="#"  id=' + result.data[c].id + '  onclick="doEditQueryById(jQ10(this));"> Edit</a></td></tr>');
            }
        }
    }
}

function doDeleteQueryById(obj) {
    jQ10('.answerFromDb').hide();
    var queryId = obj.attr('id');
    stmt.text = "DELETE from querylogs WHERE id=" + queryId + "";
    stmt.execute();
    var rowId = obj.parent().parent();
    rowId.remove();
}

function doEditQueryById(obj) {
    var queryId = obj.attr('id');
    stmt.text = "SELECT * from querylogs WHERE id=" + queryId + "";
    stmt.execute();
    result = stmt.getResult();
    // air.Introspector.Console.log(result[0]);


    if (result.data != null) {
        for (var c = 0; c < result.data.length; c++) {

            jQ10(".hiddenField").val(result.data[c].id);

            jQ10('.subject').val(result.data[c].Subject);
            jQ10('.title').val(result.data[c].Title);
            jQ10('.chapter').val(result.data[c].Chapter);
            jQ10('.section').val(result.data[c].Section);
            jQ10('.description').val(result.data[c].Description);
        }
    }
    jQ10(".submitBlogs").attr('value', 'Edit');
    jQ10('.statustable').hide();
    jQ10('#main-div').show();
    jQ10('.addButton').hide();
    jQ10('.back').show();
    jQ10('.dislay-table').hide();
    jQ10('.answerFromDb').hide();
}


function showAnswerFromDb(id) {
    stmt.text = "SELECT * FROM querylogs where id=" + "'" + id + "'" + "";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        jQ10('.answer').remove();
        for (var c = 0; c < result.data.length; c++) {
            jQ10('.answerFromDb').show();
            jQ10('.showanswer').html(' ');
            jQ10('.answerFromDb').append("<div class='showanswer'><div class='question'><h3 style='color:#DB7146;margin-left:3%;'>Question</h3><div style='font-size:15px; margin-left:10%; text-align:justify;'>" + result.data[c].Description + "</div></div><div class='answer'><h3 style='color:#DB7146;margin-left:3%;'>Answer</h3><div style='font-size:15px;width:80%; margin-left:10%; text-align:justify;'>" + result.data[c].Answer + "</div></div></div>");
        }
    }
}

function callDataQueryLog() {
    stmt.text = "SELECT * FROM querylogs WHERE createFlag='1' or deleteFlag='1' or updateFlag='1' ";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data;
    }
    else {
        return 0;
    }
}

function updateQueryLogDataInLocalDB(serverId, id, deleteFlag) {
    if (deleteFlag == 0) {
        var currentdate = new Date();
        stmt.text = "UPDATE querylogs SET serverId='" + serverId + "', createFlag='0', deleteFlag='0', updateFlag='0' WHERE id=" + id;
        stmt.execute();
    }
    else {
        stmt.text = "delete from querylogs where id=" + id;
        stmt.execute();
    }
}
//============================================== END QUERY LOGS ====================================================

//============================================== EBOOK ====================================================
function doCreateNotes() {
    stmt.text = 'CREATE TABLE IF NOT EXISTS notes ( ' +
                       'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                       'userid INTEGER,' +
					   'Subject VARCHAR,' +
                       'ChapterName VARCHAR,' +
					   'ChapterNo VARCHAR,' +
                       'Note VARCHAR)';
    stmt.execute();
    doCreateEBooks();
}

function doCreateEBooks() {
    stmt.text = 'CREATE TABLE IF NOT EXISTS eBooks ( ' +
                       'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
					   'ServerId VARCHAR,' +
                       'HtmlText VARCHAR,' +
					   'Standard VARCHAR,' +
                       'Subject VARCHAR,' +
                       'Chapter VARCHAR)';
    stmt.execute();
}

function doInsertNotes(globalUserId, Subject, ChapterName, ChapterNo, Note) {
    stmt.text = "SELECT * FROM notes where ChapterNo='" + ChapterNo + "' and Subject='" + Subject + "'";
    stmt.execute();
    result = stmt.getResult();
    data_temp = result.data;
    //alert("globalUserId:"+globalUserId+" Subject:"+Subject+" ChapterName:"+ChapterName+" ChapterNo:"+ChapterNo+" Note:"+Note);
    if (result.data == null) {

        stmt.text = 'INSERT INTO notes VALUES (NULL,\'' + globalUserId + '\',\'' + Subject + '\',\'' + ChapterName + '\',\'' + ChapterNo + '\',\'' + Note + '\')';
        stmt.execute();
    }
    else {
        //alert(data_temp[0].Note);
        Note = data_temp[0].Note + "<br><br>" + Note;
        stmt.text = "UPDATE notes SET Note='" + Note + "' where ChapterNo='" + ChapterNo + "' and Subject='" + Subject + "'";
        stmt.execute();
    }
}

function getTheNotesFromDb(chapterNo) {
    stmt.text = "SELECT * FROM notes where ChapterNo='" + chapterNo + "'";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data;
    }
}

function doInsertEbooks(dataFromServer) {
    stmt.text = 'SELECT * FROM eBooks';
    stmt.execute();
    result = stmt.getResult();
    if (result.data == null) {
        for (var i = 0; i < dataFromServer.length; i++) {
            stmt.text = 'INSERT INTO eBooks VALUES (NULL,\'' + dataFromServer[i].id + '\',\'' + dataFromServer[i].HtmlText + '\',\'' + dataFromServer[i].Standard + '\',\'' + dataFromServer[i].Subject + '\',\'' + dataFromServer[i].Chapter + '\')';
            stmt.execute();
        }
    }
    else {

        for (var i = 0; i < dataFromServer.length; i++) {
            // air.Introspector.Console.log(dataFromServer[i].id);
            stmt.text = 'SELECT * FROM eBooks where ServerId=' + dataFromServer[i].id;
            stmt.execute();
            result = stmt.getResult();
            if (result.data == null) {
                stmt.text = 'INSERT INTO eBooks VALUES (NULL,\'' + dataFromServer[i].id + '\',\'' + dataFromServer[i].HtmlText + '\',\'' + dataFromServer[i].Standard + '\',\'' + dataFromServer[i].Subject + '\',\'' + dataFromServer[i].Chapter + '\')';
                stmt.execute();
            }
            else {

                if (dataFromServer[i].Updated == "1") {
                    // air.Introspector.Console.log(dataFromServer[i].id + "---" + dataFromServer[i].HtmlText);
                    stmt.text = "UPDATE eBooks SET HtmlText ='" + dataFromServer[i].HtmlText + "'  WHERE Standard ='" + dataFromServer[i].Standard + "' and Chapter='" + dataFromServer[i].Chapter + "' and Subject ='" + dataFromServer[i].Subject + "'";
                    stmt.execute();
                }
            }
        }
    }
}

function doShowDropDownSubjectOption(globalStudentStandard) {
    stmt.text = "SELECT DISTINCT Subject FROM eBooks where Standard ='" + globalStudentStandard + "'";
    //stmt.text = 'SELECT DISTINCT * FROM eBooks';
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data;
    }
}

function doShowChapterAfterSubClick(globalStudentStandard) {
    stmt.text = "SELECT * FROM eBooks where Standard ='" + globalStudentStandard + "'";
    //stmt.text = 'SELECT DISTINCT * FROM eBooks';
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data;
    }
}

function doShowNotesFroParticularSub() {
    stmt.text = 'select * from notes group by ChapterNo';
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data
    }
}
function getAllNotesOfPerticularSubject(clickedSubject) {
    stmt.text = "select * from notes where Subject='" + clickedSubject + "' order by ChapterNo";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data;
    }
}
function getNumberOfNotesForPerticularSubject(clickedSubject) {
    stmt.text = "select * from notes where Subject='" + clickedSubject + "'";
    stmt.execute();
    result = stmt.getResult();
    return result.data.length;
}
function showIframeWithParticularChapter(id) {
    stmt.text = 'SELECT * FROM eBooks where id=' + id + '';
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        showIframe(result.data[0].HtmlText);
    }
}

function doShowDropDownNotesSubjectOption() {
    stmt.text = 'SELECT DISTINCT Subject FROM notes';
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data
    }
}

function updateNotes(id, updatedNotes) {
    stmt.text = "UPDATE notes SET Note = '" + updatedNotes + "' WHERE id='" + id + "'";
    stmt.execute();
}

function deleteNote(id) {
    stmt.text = "delete from notes where id=" + id;
    stmt.execute();
}
//============================================== END EBOOK ====================================================

//================================================HIGHLIGHT====================================================
function doCreateHighLight() {
    stmt.text = 'CREATE TABLE IF NOT EXISTS highlight ( ' + 'Id INTEGER PRIMARY KEY AUTOINCREMENT, ' + 'UserId INTEGER,' + 'Highlight VARCHAR)';
    stmt.execute();
}

function doInsertHighLight(highlightData) {
    stmt.text = 'INSERT INTO highlight VALUES (NULL,NULL,\'' + highlightData + '\')';
    stmt.execute();
}

//==============================================ENDHIGHLIGHT======================================================

//===============================================STUDENT LOGIN====================================================
function doCreateStudentLogin() {
    stmt.text = 'CREATE TABLE IF NOT EXISTS studentLogin ( ' +
	'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
	'studentId INTEGER,' +
	'studentName VARCHAR,' +
	'studentPassword VARCHAR,' +
	'studentStandard VARCHAR,' +
	'profileImage VARCHAR,' +
	'flag VARCHAR)';
    stmt.execute();
    tempLoginUserDetails();
}

function tempLoginUserDetails() {
    stmt.text = 'CREATE TABLE IF NOT EXISTS tempUserDetails ( ' +
	'userId INTEGER,' +
	'userName VARCHAR,' +
	'userPassword VARCHAR,' +
	'userStandard VARCHAR)';
    stmt.execute();
}

function doInsertStudentLoginDetails(studentLogin) {
    var flag = 0;
    var studentLoginDetailsFromWebService = [];

    stmt.text = 'SELECT * FROM StudentLogin';
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        for (var c = 0; c < result.data.length; c++) {

            if (studentLogin.studentName == result.data[c].studentName) {
                flag = 1;
            }
            if (result.data[c].flag == '0') {
                stmt.text = "UPDATE studentLogin SET flag = '1' WHERE flag='0'";
                stmt.execute();
            }
        }
    }
    if (flag != 1) {
        studentLoginDetailsFromWebService = [];
        studentLoginDetailsFromWebService = studentLogin;
        stmt.text = 'INSERT INTO studentLogin VALUES (NULL,\'' + studentLoginDetailsFromWebService.Id + '\',\'' + studentLoginDetailsFromWebService.studentName + '\',\'' + studentLoginDetailsFromWebService.studentPassword + '\',\'' + studentLoginDetailsFromWebService.studentStandard + '\',NULL,\'' + '1' + '\')';
        stmt.execute();

        doInsertStudentTempLoginUserDetails(studentLoginDetailsFromWebService.Id, studentLoginDetailsFromWebService.studentName, studentLoginDetailsFromWebService.studentPassword, studentLoginDetailsFromWebService.studentStandard);
    }
    else {
        jQ3('.studentPassword').val("");
        jQ3('.studentId').val("");
        alert('Already a user');
    }
}

function doShowUsers() {
    var studentLoginDetailsFromWebService = [];
    stmt.text = 'SELECT * FROM StudentLogin';
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        stmt.text = "UPDATE studentLogin SET flag = '1' WHERE flag='0'";
        stmt.execute();
    }
}

function doCheckStudentLoginIsNull() {

    stmt.text = 'SELECT * FROM studentLogin';
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        for (var c = 0; c < result.data.length; c++) {
            if (result.data[c].flag == 1) {
                window.location.assign("Users.html");
            }
        }
    }
}

function doCheckForUsers() {
    var forStudentTempUserDetails = [];
    stmt.text = 'SELECT * FROM studentLogin';
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        for (var c = 0; c < result.data.length; c++) {
            forStudentTempUserDetails = [];
            forStudentTempUserDetails = result.data[c];
            //jQ3('.input-file-row-1').children('.upload-file-container').append("<input type='button' name='StudentLogin' value=" + forStudentTempUserDetails.studentName + " class='StudentLogin userLogin' style='margin-left: -3px; margin-top:30px;' onclick='doInsertStudentTempLoginUserDetails(\"" + forStudentTempUserDetails.studentId + "\",\"" + forStudentTempUserDetails.studentName + "\",\"" + forStudentTempUserDetails.studentPassword + "\",\"" + forStudentTempUserDetails.studentStandard + "\");'/>");
            if (forStudentTempUserDetails.profileImage) {
                jQ3('.user-wrap').children('.rightUsers').append("<div class='input-file-row-1'><div class='upload-file-container'><img id='preview_image' class='" + forStudentTempUserDetails.studentName + "' src='" + forStudentTempUserDetails.profileImage + "' /><div class='upload-file-container-text'><div class='one_opacity_0'><input id='btnBrowse' onClick='doBrowse(\"" + forStudentTempUserDetails.studentName + "\");' class='btnBrowse' type='button' value='Browse...' /></div><span>Add Photo </span><input type='button' name='StudentLogin' value=" + forStudentTempUserDetails.studentName + " class='StudentLogin userLogin' style='margin-left: -3px; margin-top:30px;' onclick='doInsertStudentTempLoginUserDetails(\"" + forStudentTempUserDetails.studentId + "\",\"" + forStudentTempUserDetails.studentName + "\",\"" + forStudentTempUserDetails.studentPassword + "\",\"" + forStudentTempUserDetails.studentStandard + "\");'/></div></div></div>");
            }
            else {
                jQ3('.user-wrap').children('.rightUsers').append("<div class='input-file-row-1'><div class='upload-file-container'><img id='preview_image' class='" + forStudentTempUserDetails.studentName + "' /><div class='upload-file-container-text'><div class='one_opacity_0'><input id='btnBrowse' onClick='doBrowse(\"" + forStudentTempUserDetails.studentName + "\");' class='btnBrowse' type='button' value='Browse...' /></div><span>Add Photo </span><input type='button' name='StudentLogin' value=" + forStudentTempUserDetails.studentName + " class='StudentLogin userLogin' style='margin-left: -3px; margin-top:30px;' onclick='doInsertStudentTempLoginUserDetails(\"" + forStudentTempUserDetails.studentId + "\",\"" + forStudentTempUserDetails.studentName + "\",\"" + forStudentTempUserDetails.studentPassword + "\",\"" + forStudentTempUserDetails.studentStandard + "\");'/></div></div></div>");
            }
        }
    }
}

function docheckForUserForAccessToken() {
    stmt.text = 'SELECT * FROM studentLogin';
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data[0];
    }
    else {
        return 0;
    }
}

function doUpdateProfilePicture(user, url) {
    stmt.text = "UPDATE studentLogin SET profileImage = '" + url + "' WHERE studentName='" + user + "'";
    stmt.execute();
}

function doInsertStudentTempLoginUserDetails(id, userName, userPassword, userStandard) {
    doDeleteTempLoginUserDetails();
    stmt.text = 'INSERT INTO tempUserDetails VALUES (\'' + id + '\',\'' + userName + '\',\'' + userPassword + '\',\'' + userStandard + '\')';
    stmt.execute();

    window.location.assign("DesktopApp.html");
}

function doUpdateStudentUserDetails() {
    stmt.text = "UPDATE studentLogin SET flag = '0' WHERE flag='1'";
    stmt.execute();
}

function doDeleteTempLoginUserDetails() {
    stmt.text = "delete from tempUserDetails";
    stmt.execute();
}
//===============================================END STUDENT LOGIN====================================================

//=============================================Fact Of Matter=========================================================
function doCreateFactOfMatter() {
    stmt.text = 'CREATE TABLE IF NOT EXISTS FactOfMatter ( ' +
                       'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
					   'ServerId VARCHAR,' +
					   'Subject VARCHAR,' +
					   'Fact VARCHAR,' +
                       'Date VARCHAR)';
    stmt.execute();
}

function doCheckForFactOfMatter() {
    stmt.text = 'SELECT * FROM FactOfMatter';
    stmt.execute();
    result = stmt.getResult();
    if (result.data == null) {
        return true;
    }
    else {
        return false;
    }
}

function doInsertFactOfMatter(dataFromServer) {
    stmt.text = 'SELECT * FROM FactOfMatter';
    stmt.execute();
    result = stmt.getResult();
    if (result.data == null) {
        for (var i = 0; i < dataFromServer.length; i++) {
            stmt.text = 'INSERT INTO FactOfMatter VALUES (NULL,\'' + dataFromServer[i].id + '\',\'' + dataFromServer[i].Subject + '\',\'' + dataFromServer[i].Fact + '\',\'' + dataFromServer[i].Date + '\')';
            stmt.execute();
        }
        return true;
    }
    else {
        for (var i = 0; i < dataFromServer.length; i++) {
            stmt.text = 'SELECT * FROM FactOfMatter where ServerId=' + dataFromServer[i].id;
            stmt.execute();
            result = stmt.getResult();
            if (result.data == null) {
                stmt.text = 'INSERT INTO FactOfMatter VALUES (NULL,\'' + dataFromServer[i].id + '\',\'' + dataFromServer[i].Subject + '\',\'' + dataFromServer[i].Fact + '\',\'' + dataFromServer[i].Date + '\')';
                stmt.execute();
            }
            else {
                if (dataFromServer[i].Updated == "1") {
                    stmt.text = "UPDATE FactOfMatter SET Fact ='" + dataFromServer[i].Fact + "', Subject ='" + dataFromServer[i].Subject + "' where ServerId=" + dataFromServer[i].id;
                    stmt.execute();
                }
            }
        }
        return true;
    }
}

function doGetFactOfMatter() {
    //var currDate = new Date();
    // var compareDate = currDate.getFullYear() + "-" + currDate.getMonth() + "-" + currDate.getDate() + "T00:00:00"

    // stmt.text = 'select * from FactOfMatter where Date in( select max(Date) from FactOfMatter where Date in ( select Date from FactOfMatter where Date <= '+"'"+compareDate+"'"+' ))';

    stmt.text = "select * from FactOfMatter where  strftime('%Y-%m-%d',Date) = date('now')";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data;
    }
    else {
        stmt.text = "select * from (select * from FactOfMatter where  strftime('%Y-%m-%d',Date) < date('now')) ORDER BY Date desc LIMIT 1";
        stmt.execute();
        result = stmt.getResult();
        if (result.data != null) {
            stmt.text = "select * from FactOfMatter where Date = '" + result.data[0].Date + "'";
            stmt.execute();
            result = stmt.getResult();
            return result.data;
        }
    }
}

//=============================================End Fact Of Matter=====================================================

//=============================================Thought of the Day=====================================================
function doCreateFactOfThoughtoftheDay() {
    stmt.text = 'CREATE TABLE IF NOT EXISTS ThoughtoftheDay ( ' +
                       'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
					   'ServerId VARCHAR,' +
					   'Thought VARCHAR,' +
                       'Date VARCHAR)';
    stmt.execute();
}

function doCheckForThoughtOfTheDay() {
    stmt.text = 'SELECT * FROM ThoughtoftheDay';
    stmt.execute();
    result = stmt.getResult();
    if (result.data == null) {
        return true;
    }
    else {
        return false;
    }
}

function doInsertThoughtOfTheDay(dataFromServer) {
    stmt.text = 'SELECT * FROM ThoughtoftheDay';
    stmt.execute();
    result = stmt.getResult();
    if (result.data == null) {
        for (var i = 0; i < dataFromServer.length; i++) {
            //alert('Test');
            var thought = dataFromServer[i].Thought.replace("'", "''");
            stmt.text = 'INSERT INTO ThoughtoftheDay VALUES (NULL,\'' + dataFromServer[i].id + '\',\'' + thought + '\',\'' + dataFromServer[i].Date + '\')';
            stmt.execute();
        }
    }
    else {
        for (var i = 0; i < dataFromServer.length; i++) {
            stmt.text = 'SELECT * FROM ThoughtoftheDay where ServerId=' + dataFromServer[i].id;
            stmt.execute();
            result = stmt.getResult();
            if (result.data == null) {
                var thought = dataFromServer[i].Thought.replace("'", "''");
                stmt.text = 'INSERT INTO ThoughtoftheDay VALUES (NULL,\'' + dataFromServer[i].id + '\',\'' + thought + '\',\'' + dataFromServer[i].Date + '\')';
                stmt.execute();
            }
            else {
                if (dataFromServer[i].Updated == "1") {
                    var thought = dataFromServer[i].Thought.replace("'", "''");
                    stmt.text = 'UPDATE ThoughtoftheDay SET Thought ="' + thought + '"  WHERE ServerId=' + dataFromServer[i].id;
                    stmt.execute();
                }
            }
        }
    }
}

function doGetThoughtOfTheDay() {
    // var currDate = new Date();
    // var compareDate = currDate.getFullYear() + "-" + currDate.getMonth() + "-" + currDate.getDate() + "T00:00:00"

    //stmt.text = 'select * from thoughtoftheday where Date in( select max(Date) from thoughtoftheday where Date in ( select Date from thoughtoftheday where Date <= '+"'"+compareDate+"'"+' ))';
    stmt.text = "select * from thoughtoftheday where  strftime('%Y-%m-%d',Date) = date('now')";
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data;
    }
    else {
        stmt.text = "select * from (select * from thoughtoftheday where  strftime('%Y-%m-%d',Date) < date('now')) ORDER BY Date desc LIMIT 1";
        stmt.execute();
        result = stmt.getResult();
        if (result.data != null) {
            stmt.text = "select * from thoughtoftheday where Date = '" + result.data[0].Date + "'";
            stmt.execute();
            result = stmt.getResult();
            return result.data;
        }
    }
}
//============================================= End Thought of the Day ==================================================

//================================================ Animation links =====================================================
function doCreateVideo() {
    stmt.text = 'CREATE TABLE IF NOT EXISTS Video ( ' +
                       'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                       'Subject VARCHAR,' +
                       'Chapter VARCHAR,' +
                       'Standard VARCHAR,' +
					   'FileName VARCHAR,' +
                       'NameToDisplay VARCHAR)';
    stmt.execute();
}

function doInsertAnimationData(animationDataServer) {
    stmt.text = 'SELECT * FROM Video';
    stmt.execute();
    result = stmt.getResult();
    if (result.data == null) {
        for (var i = 0; i < animationDataServer.length; i++) {
            //alert('Test');
            stmt.text = 'INSERT INTO Video VALUES (NULL,\'' + animationDataServer[i].Subject + '\',\'' + animationDataServer[i].Chapter + '\',\'' + animationDataServer[i].Standard + '\',\'' + animationDataServer[i].FileName + '\',\'' + animationDataServer[i].NameToDisplay + '\')';
            stmt.execute();
        }
    }
    else {
        for (var i = 0; i < animationDataServer.length; i++) {
            stmt.text = 'SELECT * FROM Video where FileName="' + animationDataServer[i].FileName + '"';
            stmt.execute();
            result = stmt.getResult();
            if (result.data == null) {
                stmt.text = 'INSERT INTO Video VALUES (NULL,\'' + animationDataServer[i].Subject + '\',\'' + animationDataServer[i].Chapter + '\',\'' + animationDataServer[i].Standard + '\',\'' + animationDataServer[i].FileName + '\',\'' + animationDataServer[i].NameToDisplay + '\')';
                stmt.execute();
            }
            //else {
            //    if (dataFromServer[i].Updated == "1") {
            //        stmt.text = 'UPDATE Video SET Thought ="' + dataFromServer[i].Thought + '"  WHERE ServerId=' + dataFromServer[i].id;
            //        stmt.execute();
            //    }
            //}
        }
    }
}

function doGetAnimationLinks(sub, chapNo) {
    stmt.text = 'SELECT * FROM Video where Subject="' + sub + '" AND Chapter = "' + chapNo + '"';
    stmt.execute();
    result = stmt.getResult();
    if (result.data != null) {
        return result.data;
    }
    else {
        return 0;
    }
}
//================================================End Animation links ================================================
//=============================================Start Access Token=====================================================
//function doCreateAccessToken(){
//	 stmt.text = 'CREATE TABLE IF NOT EXISTS AccessToken ( ' +
//                       'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
//                       'AccessToken VARCHAR,'+
//					   'RefreshToken VARCHAR,'+
//					   'Date VARCHAR)';
//    stmt.execute();	
//}

//function doInsertAccessToken(AccessToken,refreshToken,date){
//	 stmt.text = 'INSERT INTO AccessToken VALUES (NULL,\'' + AccessToken + '\',\'' + refreshToken + '\',\'' + date + '\')';
//     stmt.execute();
//	 return 1;
//}

//function doCheckForAccessToken(){
//	stmt.text = 'SELECT * FROM AccessToken';
//    stmt.execute();
//	 result = stmt.getResult();
//    if (result.data != null) {
//        return result.data[0];
//    }
//	else{
//		return 0;
//	}
//}

//function doGetTheAccessToken(){
//	stmt.text = 'SELECT * FROM AccessToken';
//    stmt.execute();
//	 result = stmt.getResult();
//    if (result.data != null) {
//        return result.data[0].AccessToken;
//    }
//	else{
//		return 0;
//	}
//}

//function doDeleteAccessToken(){
//	stmt.text = "delete from AccessToken";
//    stmt.execute();
//	return 1;
//}
//=============================================End Access Token=====================================================
function doStmtResult(event) {
    var elem = null;
    var result = null;
    switch (state) {
        case CREATE_SCHEMA:
            stmt.text = 'SELECT title,start FROM calender where id=1';
            state = SELECT_DATA;
            stmt.execute();
            doShowEventsOnLoad();
            break;

        case SELECT_DATA:

            if (result.data != null) {
                for (var c = 0; c < result.data.length; c++) {
                    elem = document.createElement('div');
                    elem.innerText = result.data[c].title;
                    document.body.appendChild(elem);
                }
            }
            state = NONE;
            break;

        default:
            state = NONE;
            break;
    }
}

function doStmtError(event) {
    alert('There has been a problem executing a statement:\n' + event.error.message);
}

function doUnload() {
    db.close();
}
function hasNotes(clikedSubToNote) {
    var tempResult = '';
    stmt.text = "SELECT * FROM notes WHERE Subject='" + clikedSubToNote + "'";
    stmt.execute();
    tempResult = stmt.getResult();
    if (result.data != null)
        return true;
    else
        return false;
}

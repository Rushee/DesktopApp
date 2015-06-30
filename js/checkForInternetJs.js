//If internet is ON Sync
var flagForFirstTimeLogin = "0";
function synchronizeData() {
    //Calender DataSync
		var singleRowFromCalendar = callDataCalendar();
		var i = 0;
		var CalendarCount = 0;
		for (var x in CalendarCount) {
			CalendarCount = CalendarCount + 1;
		}
		callUntilAllCalenderDataSync();
		
		function callUntilAllCalenderDataSync() {
		    if (singleRowFromCalendar != 0) {
		        
		        var startdateTemp = new Date((singleRowFromCalendar[i].start));
		        //alert(startdateTemp);
				var enddateTemp = new Date((singleRowFromCalendar[i].end));
				singleRowFromCalendar[i].start = startdateTemp.getFullYear() + "/" + ("0" + (startdateTemp.getMonth() + 1)).slice(-2) + "/" + ("0" + startdateTemp.getDate()).slice(-2) + " " + startdateTemp.getHours() + ":" + startdateTemp.getMinutes() + ":" + startdateTemp.getMilliseconds();
				singleRowFromCalendar[i].end = enddateTemp.getFullYear() + "/" + ("0" + (enddateTemp.getMonth() + 1)).slice(-2) + "/" + ("0" + enddateTemp.getDate()).slice(-2) + " " + enddateTemp.getHours() + ":" + enddateTemp.getMinutes() + ":" + enddateTemp.getMilliseconds();
				jQ3.ajax({
					type: 'post',	
					url: SyncCalenderLocalDB,
					dataType: 'json',
					contentType: 'application/json',
					data: JSON.stringify(singleRowFromCalendar[i]),
					success: function (data) {
					    
						if (CalendarCount > (i + 1)) {
							updateDataInLocalDB(data, singleRowFromCalendar[i].id, singleRowFromCalendar[i].deleteFlag);
							i = i + 1;
							callUntilAllCalenderDataSync();
						}
						if (CalendarCount == (i + 1)) {
							updateDataInLocalDB(data, singleRowFromCalendar[i].id, singleRowFromCalendar[i].deleteFlag);
							updateLastSyncDate();
							queryLogDataSync();
						}
					},
					error: function(data){
						alert('Internet not connected!!!');
					}
				});
			}
			else {
				queryLogDataSync();
			}
		}
		
		//Query Logs DataSync
		function queryLogDataSync() {
		    air.Introspector.Console.log("Query");
			var singleRowFromQueryLog = callDataQueryLog();
			var j = 0;
			var QueryLogsCount = 0;
			for (var x in singleRowFromQueryLog) {
				QueryLogsCount = QueryLogsCount + 1;
			}
			callUntilAllQueryLogDataSync();
			
			function callUntilAllQueryLogDataSync(){
				if (singleRowFromQueryLog != 0) {
					singleRowFromQueryLog[j].DateTime = singleRowFromQueryLog[j].DateTime + " " + "12:12:12";
					jQ3.ajax({
						type: 'post',
						url: SyncQueryLogsLocalDB,
						dataType: 'json',
						contentType: 'application/json',
						data: JSON.stringify(singleRowFromQueryLog[j]),
						success: function(data){
							if (QueryLogsCount > (j + 1)) {
								updateQueryLogDataInLocalDB(data, singleRowFromQueryLog[j].id, singleRowFromQueryLog[j].deleteFlag);
								j = j + 1;
								callUntilAllQueryLogDataSync();
							}
							if (QueryLogsCount == (j + 1)) {
								updateQueryLogDataInLocalDB(data, singleRowFromQueryLog[j].id, singleRowFromQueryLog[j].deleteFlag);
								updateLastSyncDate();
								alert('Query Logs data synchronize');
								reviewDataSync();
							}
						},
						error: function(data){
						//alert('q Internet not connected!!!');
						}
					});
				}
				else {
					reviewDataSync();
				}
			}
		}
		
		//Review DataSync
		function reviewDataSync() {
			air.Introspector.Console.log("Review");
			var singleRowFromReview = callDataReview();
			var k = 0;
			var reviewCount = 0;
			for (var x in reviewCount) {
				reviewCount = reviewCount + 1;
			}
			callUntilAllReviewDataSync();
			
			function callUntilAllReviewDataSync(){
				if (singleRowFromReview != 0) {
					jQ3.ajax({
						type: 'post',
						url: SyncReviewLocalDB,
						dataType: 'json',
						contentType: 'application/json',
						data: JSON.stringify(singleRowFromReview[k]),
						success: function(data){
							if (reviewCount > (k + 1)) {
								updateReviewDataInLocalDB(data, singleRowFromReview[k].id, singleRowFromReview[k].deleteFlag);
								k = k + 1;
								callUntilAllReviewDataSync();
							}
							if (reviewCount == (k + 1)) {
								updateReviewDataInLocalDB(data, singleRowFromReview[k].id, singleRowFromReview[k].deleteFlag);
								updateLastSyncDate();
							    eBookLocalSync();
								//factOfMatterLocalSync();
							    //alert('Review data synchronize');
							}
						},
						error: function(data){
						// alert('r Internet not connected!!!');
						}
					});
				}
				else {
					//alert("eBook");
				    eBookLocalSync();
				    //factOfMatterLocalSync();
				}
			}
		}
		
		//Pdf from server to local
		function eBookLocalSync() {
		air.Introspector.Console.log("ebook1");
			jQ3.ajax({
				type: 'get',
				url: htmlGet,
				dataType: 'json',
				contentType: 'application/json',
				success: function (data) {
				    //air.Introspector.Console.log("ebook1 In");
					doInsertEbooks(data);
					thoughtOfTheDayLocalSync();
				},
				error: function(data){
				  alert('ebook Internet not connected!!!');
				}
			});
		}
		
		function thoughtOfTheDayLocalSync() {
			jQ3.ajax({
				type: 'get',
				url: thoughtOfTheDay,
				dataType: 'json',
				contentType: 'application/json',
				success: function (data) {
				   air.Introspector.Console.log("thoughtOfTheDayLocalSync");
				    doInsertThoughtOfTheDay(data);
				    animationLink();
				    //factOfMatterLocalSync();
				},
				error: function(data){
				// alert('Internet not connected!!!');
				}
			});
		}

		function animationLink() {
		    air.Introspector.Console.log("ANIMATION");
		    if (flagForFirstTimeLogin == "1") {
		        var animationData = { "Standard": studentLoginData.studentStandard };
		    }
		    else {
		        var animationData = { "Standard": globalStudentStandard };
		    }

		    jQ3.ajax({
		        type: 'post',
		        url: animationLocalDb,
		        dataType: 'json',
		        data: JSON.stringify(animationData),
		        contentType: 'application/json',
		        success: function (data) {
		            doInsertAnimationData(data);
		            factOfMatterLocalSync();
		        },
		        error: function (data) {
		             alert('Internet not connected!!!');
		        }
		    });
		}
		
		function factOfMatterLocalSync() {
		    air.Introspector.Console.log("factOfMatter");
		   
			jQ3.ajax({
				type: 'get',
				url: factOfMatter,
				dataType: 'json',
				contentType: 'application/json',
				success: function (data) {
				   // air.Introspector.Console.log(data);
				    var check = doInsertFactOfMatter(data);
				    if (check) {
				        if (flagForFirstTimeLogin == "1") {
				            //air.Introspector.Console.log("First time GOIN");
				            doInsertStudentLoginDetails(studentLoginData);
				        }
				        else {
				            checkForInternetForFirstLogin("0");
				        }
				    }
				    jQ3(".logloader").hide();
				},
				error: function(data){
				// alert(' f Internet not connected!!!');
				}
			});
		}	
	//}
}

//Check for Internet
var monitor = null;
//function checkForInternet() {
//    var request = new air.URLRequest('https://www.google.com');

//    monitor = new air.URLMonitor(request);
//    monitor.addEventListener(air.StatusEvent.STATUS, doStatus);
//    monitor.start();
//}
function doStatus(e) {
    if (monitor.available) {
        synchronizeData();
    }
    else {
        //alert('false');
    }
}

function checkForInternetForFirstLogin(flag) {
   
    var request = new air.URLRequest('https://www.google.com');
    flagForFirstTimeLogin = flag;
    monitor = new air.URLMonitor(request);
    monitor.addEventListener(air.StatusEvent.STATUS, doStatus);
    monitor.start();
}


//window.setInterval(function () {
  // checkForInternetForFirstLogin("0");
//}, 10000);
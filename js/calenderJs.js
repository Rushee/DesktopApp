var year = new Date().getFullYear();
var month = new Date().getMonth();
var day = new Date().getDate();
var dateFromSmallCalender = "";
var smallCalenderFlag = 0;

var eventData = {
    events: jsonEventFromDb,
};

$(document).ready(function () {

    $('.notification').addClass('hideNotification');
    doLoad();
    $('.backToFullCalender').addClass('backToFullCalenderDisplay');
    refreshCal();
    function refreshCal() {
        var $calendar = $('#calendar');
        var taskStatus = ' ';

        $calendar.weekCalendar({
            timeslotsPerHour: 6,
            timeslotHeigh: 30,
            allowCalEventOverlap: false,
            overlapEventsSeparate: false,
            data: eventData,
            switchDisplay: { '1 day': 1, '3 days': 3, 'Work week': 5, 'Full week': 7 },
            businessHours: { start: 0, end: 24, limitDisplay: true },
            timeslotsPerHour: 4,
            startOnFirstDayOfWeek: function (calendar) {
                return $(calendar).weekCalendar('option', 'daysToShow') >= 5;
            },
            firstDayOfWeek: function (calendar) {
                if ($(calendar).weekCalendar('option', 'daysToShow') != 5) {
                    return 0;
                }
                else {
                    //workweek
                    return 1;
                }
            }, // 0 = Sunday, 1 = Monday, 2 = Tuesday, ... , 6 = Saturday
            height: function ($calendar) {
                return $(window).height() - $('h1').outerHeight(true);
            },
            eventRender: function (calEvent, $event) {
                if (calEvent.id != null) {
                    var checkForTaskDone = doCheckForTaskDone(calEvent.id);
                    if (checkForTaskDone == 'True') {
                        $event.css("backgroundColor", "#3AAB02");
                        $event.find(".wc-time").css({
                            "backgroundColor": "Green",
                            "border": "1px solid #888"
                        });
                    }

                    else if (calEvent.end.getTime() < new Date().getTime()) {
                        $event.css("backgroundColor", "#aaa");
                        $event.find(".wc-time").css({
                            "backgroundColor": "#999",
                            "border": "1px solid #888"
                        });
                    }
                }
            },
            draggable: function (calEvent, $event) {
                return calEvent.readOnly != true;
            },

            resizable: function (calEvent, $event) {
                return calEvent.readOnly != true;
            },
            eventNew: function (calEvent, $event) {

                $('#event_edit_container').find('#markCompleted').remove();

                var $dialogContent = $("#event_edit_container");
                resetForm($dialogContent);
                var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
                var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
                var titleField = $dialogContent.find("input[name='title']");
                var bodyField = $dialogContent.find("textarea[name='body']");

                $dialogContent.dialog({
                    modal: true,
                    title: "New Calendar Event",
                    close: function () {
                        $dialogContent.dialog("destroy");
                        $dialogContent.hide();
                        $('#calendar').weekCalendar("removeUnsavedEvents");
                    },
                    buttons: {
                        Save: function () {
                            var id = findMaxIdFromDbForCalender();
                            calEvent.id = id + 1;

                            calEvent.start = new Date(startField.val());
                            calEvent.end = new Date(endField.val());
                            calEvent.title = titleField.val();
                            calEvent.body = bodyField.val();
                            var reminderTextFromPopUp = " ";
                            reminderTextFromPopUp = $('.reminderText').val();

                            var reminderTime = $('.reminderTime').val()

                            $calendar.weekCalendar("removeUnsavedEvents");
                            $calendar.weekCalendar("updateEvent", calEvent);

                            if ($('.taskStatus').is(':checked')) {
                                taskStatus = 'True';
                            }
                            else {
                                taskStatus = 'False';
                            }

                            if ($('.reminder').is(':checked')) {
                                reminderStatus = 'True';
                            }
                            else {
                                reminderStatus = 'False';
                            }

                            if ($(this).click) {
                                doSave(calEvent.id, globalUserId, calEvent.title, calEvent.start, calEvent.end, reminderStatus, reminderTextFromPopUp, reminderTime, taskStatus);
                                refreshCal();
                            }
                            // refreshcall();
                            $dialogContent.dialog("close");
                        },
                        Cancel: function () {
                            $dialogContent.dialog("close");
                        }
                    }
                }).show();

                $dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start));
                setupStartAndEndTimeFields(startField, endField, calEvent, $calendar.weekCalendar("getTimeslotTimes", calEvent.start));
            },
            eventDrop: function (calEvent, $event) {
                doUpdateEventInDataBaseWithOutTaskDone(calEvent.id, calEvent.title, calEvent.start, calEvent.end);
                $calendar.weekCalendar("updateEvent", calEvent);
                refreshCal();
            },
            eventResize: function (calEvent, $event) {
                doUpdateEventInDataBaseWithOutTaskDone(calEvent.id, calEvent.title, calEvent.start, calEvent.end);
                $calendar.weekCalendar("updateEvent", calEvent);
                refreshCal();
            },
            eventClick: function (calEvent, $event) {
                $('#event_edit_container').find('#markCompleted').remove();
                $('#event_edit_container').find("ul").append("<li class='popUpLi' id='markCompleted' > <label for='body' class='ui-label'>Mark Completed: </label><input type='checkbox' class='taskStatus' />");

                var taskStatusFromDb = doCallForTaskStatus(calEvent.id);

                if (taskStatusFromDb == 'True') {
                    $('.taskStatus').attr('checked', 'checked');
                }
                else {
                    $('.taskStatus').removeAttr('checked');
                }

                var $dialogContent = $("#event_edit_container");
                resetForm($dialogContent);
                var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
                var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
                var titleField = $dialogContent.find("input[name='title']").val(calEvent.title);
                var bodyField = $dialogContent.find("textarea[name='body']");
                bodyField.val(calEvent.body);

                $dialogContent.dialog({
                    modal: true,
                    title: "Update Calendar Event",
                    close: function () {
                        $dialogContent.dialog("destroy");
                        $dialogContent.hide();
                        $('#calendar').weekCalendar("removeUnsavedEvents");
                    },
                    buttons: {
                        Update: function () {
                            calEvent.start = new Date(startField.val());
                            calEvent.end = new Date(endField.val());
                            calEvent.title = titleField.val();
                            calEvent.body = bodyField.val();

                            $calendar.weekCalendar("updateEvent", calEvent);
                            if ($('.taskStatus').is(':checked')) {
                                taskStatus = 'True';
                            }
                            else {
                                taskStatus = 'False';
                            }

                            if ($(this).click) {
                                doUpdateEventInDataBase(calEvent.id, calEvent.title, calEvent.start, calEvent.end, taskStatus)
                                refreshCal();
                            }
                            // $("#calendar").weekCalendar("refresh");
                            $dialogContent.dialog("close");
                            $dialogContent.dialog("close");
                        },
                        "Delete": function () {
                            if ($(this).click) {
                                doDeleteEventInDataBase(calEvent.id);
                                refreshCal();
                            }
                            $calendar.weekCalendar("removeEvent", calEvent.id);
                            $dialogContent.dialog("close");
                        },
                        Cancel: function () {
                            $dialogContent.dialog("close");
                        }
                    }
                }).show();

                var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
                var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
                $dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start));
                setupStartAndEndTimeFields(startField, endField, calEvent, $calendar.weekCalendar("getTimeslotTimes", calEvent.start));
                $(window).resize().resize(); //fixes a bug in modal overlay size ??
            },
            eventMouseover: function (calEvent, $event) {
            },
            eventMouseout: function (calEvent, $event) {
            },
            noEvents: function () {

            },
        });
    }
    function resetForm($dialogContent) {
        $dialogContent.find("input").val("");
        $dialogContent.find("textarea").val("");
    }

    function setupStartAndEndTimeFields($startTimeField, $endTimeField, calEvent, timeslotTimes) {
        $startTimeField.empty();
        $endTimeField.empty();
        for (var i = 0; i < timeslotTimes.length; i++) {
            var startTime = timeslotTimes[i].start;
            var endTime = timeslotTimes[i].end;
            var startSelected = "";
            if (startTime.getTime() === calEvent.start.getTime()) {
                startSelected = "selected=\"selected\"";
            }
            var endSelected = "";
            if (endTime.getTime() === calEvent.end.getTime()) {
                endSelected = "selected=\"selected\"";
            }
            $startTimeField.append("<option value=\"" + startTime + "\" " + startSelected + ">" + timeslotTimes[i].startFormatted + "</option>");
            $endTimeField.append("<option value=\"" + endTime + "\" " + endSelected + ">" + timeslotTimes[i].endFormatted + "</option>");

        }
        $endTimeOptions = $endTimeField.find("option");
        $startTimeField.trigger("change");
    }

    var $endTimeField = $("select[name='end']");
    var $endTimeOptions = $endTimeField.find("option");

    //reduces the end time options to be only after the start time options.
    $("select[name='start']").change(function () {
        var startTime = $(this).find(":selected").val();
        var currentEndTime = $endTimeField.find("option:selected").val();
        $endTimeField.html(
              $endTimeOptions.filter(function () {
                  return startTime < $(this).val();
              })
              );

        var endTimeSelected = false;
        $endTimeField.find("option").each(function () {
            if ($(this).val() === currentEndTime) {
                $(this).attr("selected", "selected");
                endTimeSelected = true;
                return false;
            }
        });

        if (!endTimeSelected) {
            //automatically select an end date 2 slots away.
            $endTimeField.find("option:eq(1)").attr("selected", "selected");
        }

    });
    //-------------------------------------- SMALL CALENDER --------------------------------------------
	var  arrDate = new Date(); 
    $('#calTwo').jCal({
        day: new Date(),
        days: 1,
        showMonths: 1,
        drawBack: function () {
      $('#calTwo'+ ' [id*=' + ( arrDate.getMonth() + 1 ) + '_' + arrDate.getDate() + '_' + arrDate.getFullYear() + ']').addClass('todayDay');  
        },
        monthSelect: true,
        sDate: new Date(),
        dCheck: function (day) {
            if (day.getDay() != 7)
                return 'day';
            else
                return 'invday';
        },
        callback: function (day, days) {
            //---------------------------------NEW CALENDER---------------------------------------
            refresh1DayCal();
            function refresh1DayCal() {
                var $calendar = $('#calendar');
                var taskStatus = ' ';

                $calendar.weekCalendar({
                    date: new Date(day.getFullYear(), (day.getMonth()), day.getDate()),
                    daysToShow: 1,
                    timeslotsPerHour: 6,
                    timeslotHeigh: 30,
                    allowCalEventOverlap: false,
                    overlapEventsSeparate: false,
                    data: eventData,
                    switchDisplay: {
                        '1 Day': 1
                    },
                    businessHours: {
                        start: 0,
                        end: 24,
                        limitDisplay: true
                    },

                    timeslotsPerHour: 4,
                    setDaysToShow: function () {
                        var self = this;
                        var hour = self._getCurrentScrollHour();
                        self.options.daysToShow = 1;
                        $(self.element).html('');
                        self._renderCalendar();
                        self._loadCalEvents();
                        self._resizeCalendar();
                        self._scrollToHour(hour, false);

                        if (this.options.resizeEvent) {
                            $(window).unbind(this.options.resizeEvent);
                            $(window).bind(this.options.resizeEvent, function () {
                                self._resizeCalendar();
                            });
                        }
                    },
                    startOnFirstDayOfWeek: function (calendar) {
                        return $(calendar).weekCalendar('option', 'daysToShow') >= 5;
                    },
                    firstDayOfWeek: function (calendar) {
                        if ($(calendar).weekCalendar('option', 'daysToShow') != 5) {
                            return 0;
                        }
                        else {
                            //workweek
                            return 1;
                        }
                    }, // 0 = Sunday, 1 = Monday, 2 = Tuesday, ... , 6 = Saturday
                    height: function ($calendar) {
                        return $(window).height() - $('h1').outerHeight(true);
                    },
                    eventRender: function (calEvent, $event) {
                        if (calEvent.id != null) {
                            var checkForTaskDone = doCheckForTaskDone(calEvent.id);
                            if (checkForTaskDone == 'True') {
                                $event.css("backgroundColor", "#87F05D");
                                $event.find(".wc-time").css({
                                    "backgroundColor": "Green",
                                    "border": "1px solid #888"
                                });
                            }

                            else if (calEvent.end.getTime() < new Date().getTime()) {
                                $event.css("backgroundColor", "#aaa");
                                $event.find(".wc-time").css({
                                    "backgroundColor": "#999",
                                    "border": "1px solid #888"
                                });
                            }
                        }
                    },
                    draggable: function (calEvent, $event) {
                        return calEvent.readOnly != true;
                    },

                    resizable: function (calEvent, $event) {
                        return calEvent.readOnly != true;
                    },
                    eventNew: function (calEvent, $event) {

                        $('#event_edit_container').find('#markCompleted').remove();

                        var $dialogContent = $("#event_edit_container");
                        resetForm($dialogContent);
                        var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
                        var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
                        var titleField = $dialogContent.find("input[name='title']");
                        var bodyField = $dialogContent.find("textarea[name='body']");


                        $dialogContent.dialog({
                            modal: true,
                            title: "New Calendar Event",
                            close: function () {
                                $dialogContent.dialog("destroy");
                                $dialogContent.hide();
                                $('#calendar').weekCalendar("removeUnsavedEvents");
                            },
                            buttons: {
                                save: function () {
                                    var id = findMaxIdFromDbForCalender();
                                    calEvent.id = id + 1;

                                    calEvent.start = new Date(startField.val());
                                    calEvent.end = new Date(endField.val());
                                    calEvent.title = titleField.val();
                                    calEvent.body = bodyField.val();
                                    var reminderTextFromPopUp = " ";
                                    reminderTextFromPopUp = $('.reminderText').val();

                                    var reminderTime = $('.reminderTime').val()

                                    $calendar.weekCalendar("removeUnsavedEvents");
                                    $calendar.weekCalendar("updateEvent", calEvent);

                                    if ($('.taskStatus').is(':checked')) {
                                        taskStatus = 'True';
                                    }
                                    else {
                                        taskStatus = 'False';
                                    }

                                    if ($('.reminder').is(':checked')) {
                                        reminderStatus = 'True';
                                    }
                                    else {
                                        reminderStatus = 'False';
                                    }
                                    if ($(this).click) {
                                        doSave(calEvent.id, globalUserId, calEvent.title, calEvent.start, calEvent.end, reminderStatus, reminderTextFromPopUp, reminderTime, taskStatus);
                                        refresh1DayCal();
                                        $dialogContent.dialog("close");
                                    }


                                    // refreshcall();

                                },
                                cancel: function () {
                                    $dialogContent.dialog("close");
                                }
                            }
                        }).show();

                        $dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start));
                        setupStartAndEndTimeFields(startField, endField, calEvent, $calendar.weekCalendar("getTimeslotTimes", calEvent.start));
                    },
                    eventDrop: function (calEvent, $event) {
                        doUpdateEventInDataBaseWithOutTaskDone(calEvent.id, calEvent.title, calEvent.start, calEvent.end);
                        $calendar.weekCalendar("updateEvent", calEvent);
                        refresh1DayCal()
                    },
                    eventResize: function (calEvent, $event) {
                        doUpdateEventInDataBaseWithOutTaskDone(calEvent.id, calEvent.title, calEvent.start, calEvent.end);
                        $calendar.weekCalendar("updateEvent", calEvent);
                        refresh1DayCal()
                    },
                    eventClick: function (calEvent, $event) {
                        $('#event_edit_container').find('#markCompleted').remove();
                        $('#event_edit_container').find("ul").append("<li class='popUpLi' id='markCompleted' > <label for='body' class='ui-label'>Mark Completed: </label><input type='checkbox' class='taskStatus' />");


                        var taskStatusFromDb = doCallForTaskStatus(calEvent.id);

                        if (taskStatusFromDb == 'True') {
                            $('.taskStatus').attr('checked', 'checked');
                        }
                        else {
                            $('.taskStatus').removeAttr('checked');
                        }

                        var $dialogContent = $("#event_edit_container");
                        resetForm($dialogContent);
                        var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
                        var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
                        var titleField = $dialogContent.find("input[name='title']").val(calEvent.title);
                        var bodyField = $dialogContent.find("textarea[name='body']");
                        bodyField.val(calEvent.body);

                        $dialogContent.dialog({
                            modal: true,
                            title: "Update Calendar Event",
                            close: function () {
                                $dialogContent.dialog("destroy");
                                $dialogContent.hide();
                                $('#calendar').weekCalendar("removeUnsavedEvents");
                            },
                            buttons: {
                                Update: function () {

                                    calEvent.start = new Date(startField.val());
                                    calEvent.end = new Date(endField.val());
                                    calEvent.title = titleField.val();
                                    calEvent.body = bodyField.val();

                                    $calendar.weekCalendar("updateEvent", calEvent);
                                    if ($('.taskStatus').is(':checked')) {
                                        taskStatus = 'True';
                                    }
                                    else {
                                        taskStatus = 'False';
                                    }

                                    if ($(this).click) {
                                        doUpdateEventInDataBase(calEvent.id, calEvent.title, calEvent.start, calEvent.end, taskStatus)
                                        refresh1DayCal();
                                        $dialogContent.dialog("close");
                                    }



                                },
                                "delete": function () {
                                    if ($(this).click) {
                                        doDeleteEventInDataBase(calEvent.id);
                                        refresh1DayCal();
                                        $dialogContent.dialog("close");
                                    }
                                    $calendar.weekCalendar("removeEvent", calEvent.id);

                                },
                                cancel: function () {
                                    $dialogContent.dialog("close");
                                }
                            }
                        }).show();

                        var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
                        var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
                        $dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start));
                        setupStartAndEndTimeFields(startField, endField, calEvent, $calendar.weekCalendar("getTimeslotTimes", calEvent.start));
                        $(window).resize().resize(); //fixes a bug in modal overlay size ??
                    },
                    eventMouseover: function (calEvent, $event) {
                    },
                    eventMouseout: function (calEvent, $event) {
                    },
                    noEvents: function () {

                    },

                });
                $("#calendar").weekCalendar("gotoWeek", day);
                //-------------------------------DISPLAY BACK TO FULL CALENDER----------------------------------

                $('.backToFullCalender').removeClass('backToFullCalenderDisplay');
                dateFromSmallCalender = day;

                //-------------------------------END DISPLAY BACK TO FULL CALENDER----------------------------------
            }
        }
        //--------------------------------- END NEW CALENDER---------------------------------------
    });
    //--------------------------------------- END SMALL CALENDER---------------------------------

    //------------------------------- HIDE BACK TO FULL CALENDER----------------------------------

    $(".backToFullCalender").live("click", function () {
        $('.day').removeClass('selectedDay');
        $('.backToFullCalender').addClass('backToFullCalenderDisplay');
		$('#calendar').weekCalendar('setDaysToShow', 7);
        refreshCal();
        $("#calendar").weekCalendar("gotoWeek", dateFromSmallCalender);
    });

    //-------------------------------END HIDE BACK TO FULL CALENDER----------------------------------

});
var student_dashboard_builder = {

    display_dashboard: function () {
        $('#dashboard').empty();
        //var s = '<div id="left_container" style="display:inline-block;text-align:left;margin:0px;width:35%;vertical-align:top;"></div>';
        //s += '<div id="right_container" style="display:inline-block;text-align:right;margin:0px;width:65%;vertical-align:top;"></div>';
        //$('#dashboard').append(s);
        //$('#left_container').append(admin_dashboard_builder.build_users_panel());
        //admin_dashboard_builder.build_export_panel($('#left_container'));

        $('#dashboard').append(student_dashboard_builder.build_assignments_panel());
        // student_dashboard_builder.build_activities_panel($('#dashboard'));

        //admin_dashboard_builder.update_users_panel();
        student_dashboard_builder.update_assignments_panel();
    },
    
//     build_class_panel: function (parent) {
//         var s = '<div id="class_panel" class="white_panel" style="display:block;text-align:left;width:calc(100% - 40px);margin-left:0px;margin-right:0px;">';
//         s+= '<h3 style="display:inline-block;margin-right:10px;">Class Section:</h3>';
//         s+= '<select id="current_class">';
//             for (var i=0;i<window.class_data.length;i++) {
//                 s+= '<option value="'+window.class_data[i].class_id+'">'+window.class_data[i].name+'</option>';
//             }
//         s+= '</select>';
//         s+= '</div>';
//         parent.append(s);
//         $('#current_class').change( function(e) {
//             admin_dashboard_builder.update_users_panel();
//             admin_dashboard_builder.update_assignments_panel();
//         });
//     },
    
    // build_users_panel: function () {
//         var s = '<div id="users_panel" class="white_panel" style="display:inline-block;text-align:left;margin:0px;margin-bottom:10px;vertical-align:top;width:calc(100% - 45px);">User Panel</div>';
//         return s;
//     },
//     
//     build_export_panel: function (parent) {
//         var s = '<div id="export_panel" class="white_panel" style="display:inline-block;text-align:left;margin:0px;margin-bottom:10px;vertical-align:top;width:calc(100% - 45px);">Export Panel</div>';
//         parent.append(s);
//         $('#export_button').click( function(e) {
//             e.preventDefault();
//             $.post("admin/prepare_and_download_course_data_report.php", function(response) {
//                 if (response == "report_success") {
//                     // Do nothing; file should have been downloaded.
//                 } else {
//                     window.location.replace("../common/auth_response.php?result="+response)
//                 }
//             });
//         });
//     },
//     
    build_assignments_panel: function () {
        var s = '<div id="assignments_panel" class="white_panel" style="display:block;margin:10px auto;text-align:left;margin:0px;margin-bottom:10px;vertical-align-top;">Assignments Panel</div>';
        return s;
    },

//     
//     update_users_panel: function () {
//         var c = $('#current_class option:selected').val();
//         $('#users_panel').empty();
//         var filtered_users = window.user_data.filter(e => e.class_id == c);
//         var s = '<h3>Enrolled Users: '+filtered_users.length+'</h3>';
//         s += '<table id="user_table" style="margin-top:10px;table-layout:fixed;word-wrap:break-word;width:100%;min-height:0vw;font-size:clamp(11px, 1.3vw, 16px);"><thead>';
//         //s += '<tr><th style="word-wrap:break-word;"><b>Username</b></td>';
//         s += '<th style="word-wrap:break-word;"><b>First Name</b></th>';
//         s += '<th style="word-wrap:break-word;"><b>Last Name</b></th>';
//         s += '<th style="word-wrap:break-word;"><b>Rating</b></th>';
//         s += '</tr></thead><tbody>';
//         for (var i=0;i<filtered_users.length;i++) {
//             //s += '<tr><td style="word-wrap:break-word;">'+filtered_users[i].username+'</td>';
//             s += '<td style="word-wrap:break-word;">'+filtered_users[i].first+'</td>';
//             s += '<td style="word-wrap:break-word;">'+filtered_users[i].last+'</td>';
//             s += '<td style="word-wrap:break-word;">'+filtered_users[i].access+'</td>'
//             s += '</tr>';
//         }
//         s+= '</tbody></table>';
//         $('#users_panel').append(s);
//     },
//     
    update_assignments_panel: function () {
        $('#assignments_panel').empty();
        var visible_assignments = 0;
        var s = '<h3 style="margin-bottom:15px;">Assignments:</h3>';
        //s += '<a id="add_assignment" class="lite_button" href="">Add Assignment</a>';
		s += '<table id="assignments_table" style="margin-top:10px;table-layout:fixed;word-wrap:break-word;width:100%;min-height:0vw;font-size:clamp(11px, 1.3vw, 16px);"><thead>';
		s += '<tr>';
		s += '<th style="width:40%;"><b>Title</b></td>';
		s += '<th style="width:20%;"><b>Available</b></td>';
		s += '<th style="width:20%;"><b>Due</b></td>';
		s += '<th style="width:20%;"><b>Status</b></td>';
		s += '</tr></thead><tbody>';
		for (var i=0;i<window.student_assignment_data.length;i++) {
			var assignment_status = "";
			var available_date = new Date(window.student_assignment_data[i].available.replace(' ','T')+"Z");
			var due_date = window.student_assignment_data[i].due.replace(' ','T');
			if (!due_date.includes('Z')) due_date += 'Z';
			due_date = new Date(due_date);
			var now = new Date();
			// first, determine if the assignment is available and thus whether it should be displayed in the list.
			if (now >= available_date) {
				visible_assignments++;
				// then, determine what status to mark down for the assignment based on due date and grading status
				if (now <= due_date && window.student_assignment_data[i].extended == null) assignment_status = '<span style="color:var(--palette-green);font-weight:900;">Open</span>';
				else if (now <= due_date && window.student_assignment_data[i].extended != null) assignment_status = '<span style="color:var(--palette-green);font-weight:900;">Open - Extended</span>';
				else if (now > due_date && window.student_assignment_data[i].graded == 0) assignment_status = '<span style="color:black;font-weight:900;">Past Due</span>';
				else if (now > due_date && window.student_assignment_data[i].graded == 1) assignment_status = '<span style="color:var(--palette-blue);font-weight:900;">Graded</span>';
				
				var available_date_display = student_dashboard_builder.get_formatted_date(available_date,true).replace(' ','<br/>');
				var due_date_display = student_dashboard_builder.get_formatted_date(due_date,true).replace(' ','<br/>');
				s += '<tr>';
				s += '<td style="word-wrap:break-word;"><a id="'+window.student_assignment_data[i].assignment_id+'" class="lite_button assignment_button" href="">'+window.student_assignment_data[i].name+'</a></td>';
				s += '<td style="word-wrap:break-word;">'+available_date_display+'</td>';
				s += '<td style="word-wrap:break-word;">'+due_date_display+'</td>';
				s += '<td style="word-wrap:break-word;">'+assignment_status+'</td>';
				s += '</tr>';
			}			
			
		}
		s += '</tbody></table>';
		if (visible_assignments == 0) {
			s = '<h3 style="margin-bottom:15px;">Assignments:</h3>';
			s += 'No assignments are currently available for this class section.';
		}
		$('#assignments_panel').append(s);
        
        $('.assignment_button').click( function(e) {
            e.preventDefault();
            $('body').append('<form id="view_form" action="student_assignment_view.php" method="post"><input type="hidden" name="id" value="'+$(this).attr('id')+'"><input type="hidden" name="load_userid" value="true"></form>');
            $('#view_form').submit();
        });
    },
    
    get_formatted_date: function (date,display_time) {
        var year = date.getFullYear();

        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;

        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        
        var time = date.toLocaleTimeString('en-US',{hour: "2-digit", minute: "2-digit"});
        if (display_time) {
            return month + '/' + day + '/' + year + ' ' + time;
        } else {
            return month + '/' + day + '/' + year;
        }
    }
    
    
}
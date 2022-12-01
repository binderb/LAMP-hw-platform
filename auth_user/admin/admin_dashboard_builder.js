var admin_dashboard_builder = {

    display_dashboard: function () {
        $('#dashboard').empty();
        admin_dashboard_builder.build_class_panel($('#dashboard'));
        var s = '<div id="left_container" style="display:inline-block;text-align:left;margin:0px;width:35%;vertical-align:top;"></div>';
        s += '<div id="right_container" style="display:inline-block;text-align:right;margin:0px;width:65%;vertical-align:top;"></div>';
        $('#dashboard').append(s);
        $('#left_container').append(admin_dashboard_builder.build_users_panel());
        admin_dashboard_builder.build_export_panel($('#left_container'));
        $('#right_container').append(admin_dashboard_builder.build_assignments_panel());
        // $('#right_container').append(admin_dashboard_builder.build_activities_panel());
        admin_dashboard_builder.update_users_panel();
        admin_dashboard_builder.update_assignments_panel();
        // admin_dashboard_builder.update_activities_panel();
    },
    
    build_class_panel: function (parent) {
        var s = '<div id="class_panel" class="white_panel" style="display:block;text-align:left;width:calc(100% - 40px);margin-left:0px;margin-right:0px;">';
        s+= '<h3 style="display:inline-block;margin-right:10px;">Class Section:</h3>';
        s+= '<select id="current_class">';
            for (var i=0;i<window.class_data.length;i++) {
                s+= '<option value="'+window.class_data[i].class_id+'">'+window.class_data[i].name+'</option>';
            }
        s+= '</select>';
        s+= '</div>';
        parent.append(s);
        $('#current_class').change( function(e) {
            admin_dashboard_builder.update_users_panel();
            admin_dashboard_builder.update_assignments_panel();
            $.ajax({
            	url: 'admin/set_dashboard_class.php',
            	method: 'POST',
            	data: {'value' : $('#current_class').val()},
            	success: function (response) {
            		//console.log('Updated selected class to '+response);
            	}
            });
        });
    },
    
    build_users_panel: function () {
        var s = '<div id="users_panel" class="white_panel" style="display:inline-block;text-align:left;margin:0px;margin-bottom:10px;vertical-align:top;width:calc(100% - 45px);">User Panel</div>';
        return s;
    },
    
    build_export_panel: function (parent) {
        var s = '<div id="export_panel" class="white_panel" style="display:inline-block;text-align:left;margin:0px;margin-bottom:10px;vertical-align:top;width:calc(100% - 45px);">Export Panel</div>';
        parent.append(s);
        $('#export_button').click( function(e) {
            e.preventDefault();
            $.post("admin/prepare_and_download_course_data_report.php", function(response) {
                if (response == "report_success") {
                    // Do nothing; file should have been downloaded.
                } else {
                    window.location.replace("../common/auth_response.php?result="+response)
                }
            });
        });
    },
    
    build_assignments_panel: function () {
        var s = '<div id="assignments_panel" class="white_panel" style="display:inline-block;text-align:left;margin:0px;margin-bottom:10px;vertical-align-top;width:calc(100% - 45px);">Assignments Panel</div>';
        return s;
    },
    
    update_users_panel: function () {
        var c = $('#current_class option:selected').val();
        $('#users_panel').empty();
        var filtered_users = window.user_data.filter(e => e.class_id == c);
        var s = '<h3>Enrolled Users: '+filtered_users.length+'</h3>';
        s += '<table id="user_table" style="margin-top:10px;table-layout:fixed;word-wrap:break-word;width:100%;min-height:0vw;font-size:clamp(11px, 1.3vw, 16px);"><thead>';
        //s += '<tr><th style="word-wrap:break-word;"><b>Username</b></td>';
        s += '<th style="word-wrap:break-word;"><b>First Name</b></th>';
        s += '<th style="word-wrap:break-word;"><b>Last Name</b></th>';
        s += '<th style="word-wrap:break-word;"><b>Rating</b></th>';
        s += '</tr></thead><tbody>';
        for (var i=0;i<filtered_users.length;i++) {
            //s += '<tr><td style="word-wrap:break-word;">'+filtered_users[i].username+'</td>';
            s += '<td style="word-wrap:break-word;">'+filtered_users[i].first+'</td>';
            s += '<td style="word-wrap:break-word;">'+filtered_users[i].last+'</td>';
            s += '<td style="word-wrap:break-word;">'+filtered_users[i].access+'</td>'
            s += '</tr>';
        }
        s+= '</tbody></table>';
        $('#users_panel').append(s);
    },
    
    update_assignments_panel: function () {
        var c = $('#current_class option:selected').val();
        $('#assignments_panel').empty();
        var filtered_assignments = window.assignment_data.filter(e => e.class_id == c);
        var s = '<h3 style="margin-bottom:15px;">Assignments: '+filtered_assignments.length+'</h3>';
        s += '<a id="add_assignment" class="lite_button" href="">Add Assignment</a>';
        s += '<table id="assignments_table" style="margin-top:10px;table-layout:fixed;word-wrap:break-word;width:100%;min-height:0vw;font-size:clamp(11px, 1.3vw, 16px);"><thead>';
        s += '<tr>';
        s += '<th style="width:20%;"><b>Title</b></td>';
        s += '<th style="width:20%;"><b>Available</b></td>';
        s += '<th style="width:20%;"><b>Due</b></td>';
        s += '<th style="width:40%;"><b>Options</b></td>';
        s += '</tr></thead><tbody>';
        for (var i=0;i<filtered_assignments.length;i++) {
            var available_from = admin_dashboard_builder.get_formatted_date(new Date(filtered_assignments[i].available.replace(' ', 'T')+'Z'),true).replace(' ','<br/>');
            var due_date = admin_dashboard_builder.get_formatted_date(new Date(filtered_assignments[i].due.replace(' ', 'T')+'Z'),true).replace(' ','<br/>');
            s += '<tr>';
            s += '<td style="word-wrap:break-word;"><b>'+filtered_assignments[i].name+'</b></td>';
            s += '<td style="word-wrap:break-word;">'+available_from+'</td>';
            s += '<td>'+due_date+'</td>';
            s += '<td style="text-align:center;">';
            s += '<a id="'+filtered_assignments[i].assignment_id+'" class="class_button lite_button" style="margin:5px;" href="">Class</a>';
            s += '<a id="'+filtered_assignments[i].assignment_id+'" class="edit_button lite_button" style="margin:5px;" href="">Edit</a>';
            s += '<a id="'+filtered_assignments[i].assignment_id+'" class="copy_button lite_button" style="margin:5px;" href="">Copy</a>';
            s += '<a id="'+filtered_assignments[i].assignment_id+'" class="delete_button red_button" style="margin:5px;" href="">Delete</a>';
            s += '</td></tr>';
        }
        s += '</tbody></table>';
        $('#assignments_panel').append(s);
        $('#add_assignment').click( function(e) {
            e.preventDefault();
            $('body').append('<form id="editor_form" action="admin_assignment_editor.php" method="post"><input type="hidden" name="id" value="-1"><input type="hidden" name="class" value="'+$('#current_class').val()+'"></form>');
            $('#editor_form').submit();
        });
        $('.class_button').click( function(e) {
            e.preventDefault();
            $('body').append('<form id="editor_form" action="admin_assignment_class_view.php" method="post"><input type="hidden" name="id" value="'+$(this).attr('id')+'"></form>');
            $('#editor_form').submit();
        });
        $('.edit_button').click( function(e) {
            e.preventDefault();
            $('body').append('<form id="editor_form" action="admin_assignment_editor.php" method="post"><input type="hidden" name="id" value="'+$(this).attr('id')+'"></form>');
            $('#editor_form').submit();
        });
        $('.copy_button').click( function(e) {
            e.preventDefault();
            var this_assignment = window.assignment_data.filter(e => e.assignment_id == $(this).attr('id'))[0];
            $('body').append('<div class="modal"></div>');
            $('.modal').append('<div id="copy_modal" class="modal_content"></div>');
            var s = '<h3>Copying Assignment</h3>';
            s += '<table id="modal_container" style="table-layout:fixed;text-align:left; margin-top:10px;padding:5px;width:100%;">';
            s += '<thead><tr><th style="width:30%;"></th><th></th></tr></thead>';
            s += '<tbody>';
            s += '<tr><td><b>Copying:</b></td><td>'+this_assignment.name+'</td></tr>';
            s += '<tr><td><b>From:</b></td><td>'+window.class_data.filter(e => e.class_id == this_assignment.class_id)[0].name+'</td></tr>';
            s += '<tr>';
                s += '<td><b>Destination:</b></td>';
                s += '<td><select id="destination_class">';
                for (var i=0;i<window.class_data.length;i++) {
                    s += '<option value="'+window.class_data[i].class_id+'">'+window.class_data[i].name+'</option>';
                }
                s+= '</select></td>';
            s += '</tr><tr>';
                s += '<td><b>New Title:</b></td>';
                s += '<td><input type="text" name="new_title" value="'+this_assignment.name+'"></td>';
            s += '</tr></tbody></table>';
            s += '<a id="cancel_copy" class="lite_button" style="margin:5px;" href="">Cancel</a>';
            s += '<a id="confirm_copy" class="lite_button" style="margin:5px;" href="">Confirm</a>';
            
            $('#copy_modal').append(s);
            $('#cancel_copy').click( function(e) {
            	e.preventDefault();
            	$('.modal').remove();
            });
            $('#confirm_copy').click( function(e) {
            	e.preventDefault();
            	var destination_id = $('#destination_class').val();
            	var assignment_name = $('input[name="new_title"]').val();
            	var timestamp = new Date();
            	timestamp = timestamp.toISOString();
            	$('.modal').remove();
				$("#responseblock").css("display","inline-block");
            	$("#responseblock").css("margin-bottom","20px");
            	$("#responseblock").css("background-color","var(--palette-green)");
            	$("#responseblock").css("padding","15px");
            	$("#responseblock").html("<b>Copying Assignment...</b>");
            	$.ajax({
					url: "admin/assignment_copy.php",
					method: 'POST',
					data: {
						"assignment_id"     : this_assignment.assignment_id,
						"assignment_name"   : assignment_name,
						"destination_id"    : destination_id,
						"created_timestamp" : timestamp,
						"class_id"          : $('#current_class').val()
					}, 
					success: function(response) {
						if (response == "copy_success") {
							$("#responseblock").html("<b>Assignment copied successfully.</b>");
							$.ajax({
								url: "admin/load_assignment_data.php",
								method: 'POST',
								success: function(response) {
									window.assignment_data = JSON.parse(response);
									$('#current_class').val(destination_id).change();
								}
							});
						} else {
							$("#responseblock").css("background-color","var(--palette-red-alert)");
							$("#responseblock").html("<b>Error copying assignment:</b><br/>"+response);
						}
					}
				});
            });
            
        });
        $('.delete_button').click( function(e) {
            e.preventDefault();
            var this_assignment = window.assignment_data.filter(e => e.assignment_id == $(this).attr('id'))[0];
            $('body').append('<div class="modal"></div>');
            $('.modal').append('<div id="delete_modal" class="modal_content"></div>');
            var s = '<h3 style="margin-bottom:10px;">Deleting: '+this_assignment.name+'</h3>';
            s += '<h3 style="margin-bottom:10px;">Are you sure?</h3>';
            s += 'Deleting this assignment will permanently erase all student responses, scores, and written feedback associated with the assignment. The questions themselves will be preserved in the question bank.<br/><br/>';
            s += '<a id="cancel_delete" class="lite_button" style="margin:5px;" href="">Cancel</a>';
            s += '<a id="confirm_delete" class="red_button" style="margin:5px;" href="">Confirm</a>';
            $('#delete_modal').append(s);
            $('#cancel_delete').click( function(e) {
            	e.preventDefault();
            	$('.modal').remove();
            });
            $('#confirm_delete').click( function(e) {
            	e.preventDefault();
            	$('.modal').remove();
            	$("#responseblock").css("display","inline-block");
				$("#responseblock").css("margin-bottom","20px");
				$("#responseblock").css("background-color","var(--palette-green)");
				$("#responseblock").css("padding","15px");
				$("#responseblock").html("<b>Deleting Assignment...</b>");
				$.ajax({
					url: "admin/assignment_delete.php",
					method: 'POST',
					data: {"assignment_id" : this_assignment.assignment_id}, 
					success: function(response) {
						if (response == "delete_success") {
							$.ajax({
								url: "admin/load_assignment_data.php",
								method: 'POST',
								success: function(response) {
									window.assignment_data = JSON.parse(response);
									admin_dashboard_builder.update_assignments_panel();
								}
							});
							$("#responseblock").html("<b>Assignment deleted successfully.</b>");
						} else {
							$("#responseblock").css("background-color","var(--palette-red-alert)");
							$("#responseblock").html("<b>Error copying assignment:</b><br/>"+response);
						}
					}
				});
            });
            
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
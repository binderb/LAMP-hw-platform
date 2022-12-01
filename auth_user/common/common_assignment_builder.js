var common_assignment_builder = {

    display_preview: function () {
        
        $('#container').empty();
        
        // build navigation controls
        $('#container').append('<h3 style="display:block;margin-bottom:10px;">Previewing: '+window.assignment_data.name+'</div>');
        var s = '<div id="controls" style="margin-bottom:20px;">';
        s += '<a id="back" class="lite_button" style="min-width:100px;margin:5px;" href="">&larr; Back</a>';
        s += '</div>';
        s += '<div id="left_container" style="display:inline-block;text-align:left;margin:0px;width:25%;vertical-align:top;"></div>';
        s += '<div id="right_container" style="display:inline-block;text-align:right;margin:0px;width:75%;vertical-align:top;"></div>';
        $('#container').append(s);
        common_assignment_builder.build_status_panel($('#left_container'),true);
        common_assignment_builder.build_content_panel($('#right_container'));
        
        $('#back').click( function(e) {
            e.preventDefault();
            $('body').append('<form id="editor_form" action="admin_assignment_editor.php" method="post"><input type="hidden" name="id" value="'+window.loaded_assignment_id+'"></form>');
            $('#editor_form').submit();
        });
        $('#save').click( function(e) {
            e.preventDefault();
            
        });
        
        
        return;
        
        
        
        $('#right_container').append(admin_dashboard_builder.build_assignments_panel());
        admin_dashboard_builder.update_users_panel();
        admin_dashboard_builder.update_assignments_panel();
    },
    
    build_content_panel: function (parent) {
        for (var i=0;i<window.question_data.length;i++) {
            common_assignment_builder.build_question(parent,window.question_data[i],true);
        }
    },
    
    build_status_panel: function (parent, is_preview) {
        
        var s = '<div class="white_panel" style="display:inline-block;text-align:left;margin:0px;margin-bottom:10px;vertical-align:top;width:calc(100% - 45px);">';
        s += '<h3 style="margin-bottom:20px;">Assignment Info:</h3>';
        if (is_preview) {
            s += '<p>Viewing assignment in Preview Mode. Controls are disabled.</p>';
        } else {
        }
        parent.append(s);

    },
    
    build_layout_panel: function (parent) {
        var s = '<div id="layout_panel" class="white_panel" style="display:inline-block;text-align:left;margin:0px;margin-bottom:10px;vertical-align:top;width:calc(100% - 45px);">';
        s += '<h3 style="margin-bottom:20px;">Layout:</h3>';
        parent.append(s);
        if (window.loaded_assignment_id == -1) {
            admin_editor_builder.build_question_box($('#layout_panel'),1,false);
        } else {
            for (var i=0;i<window.question_data.length;i++) {
                admin_editor_builder.build_question_box($('#layout_panel'),window.question_data[i],true);
            }
        }
        s = '<a id="add_question" class="square_button" href="">+</a>';
        parent.append(s);
        
        $( function() {
            $(".datepicker").datetimepicker();
        });
        if (window.assignment_data !== null) {
            var available = admin_editor_builder.get_formatted_date(new Date(window.assignment_data.available.replace(' ','T')),true,true);
            var due = admin_editor_builder.get_formatted_date(new Date(window.assignment_data.due.replace(' ','T')),true,true);
            $('#assignment_title').val(window.assignment_data.name);
            $('#available_from').val(available);
            $('#due_date').val(due);
        }
    },
    
    build_question: function (parent, question_data) {
        var question_contents = JSON.parse(question_data.question_data);
        var q = '<div id="question_'+question_data.question_index+'" class="white_panel" style="text-align:left;display:block;">';
        q += '<table style="width:100%">';
        q += '<tbody><tr style="vertical-align:middle;"><td style="text-align:left;vertical-align:middle;">';
        q += '<h3 id="question_number" style="margin:0px;padding:0px;">Question '+question_data.question_index+':</h3>';
        q += '</td>';
        q += '<td style="text-align:right;vertical-align:middle;>';
        q += (question_data.question_points == "1") ? '<p id="question_points">('+question_data.question_points+' point)</p>' : '<p id="question_points">('+question_data.question_points+' points)</p>';
        q += '</td></tr></tbody></table>';
        q += '<p>'+question_contents.prompt+'</p>';
        if (question_contents.type == "essay") {
            q += '<textarea class="user_response" style="min-height:100px;"></textarea>';
        } else if (question_contents.type == "structure") {
            q += '<div id="structure_'+question_data.question_index+'">';
            q += '</div>';
        }
        q += '</div>';
        parent.append(q);
    },
    
    get_formatted_date: function (date,display_time,tfh) {
        var year = date.getFullYear();

        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;

        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        
        var time = date.toLocaleTimeString('en-US',{hour: "2-digit", minute: "2-digit"});
        if (tfh) {
            time = date.toLocaleTimeString('en-US',{hour: "2-digit", minute: "2-digit", hour12: false});
        }
        if (display_time) {
            return month + '/' + day + '/' + year + ' ' + time;
        } else {
            return month + '/' + day + '/' + year;
        }
    }
    
    
}
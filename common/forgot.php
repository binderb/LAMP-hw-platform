<!DOCTYPE html>
<html>
<head>
	<title>Forgot</title>
	<?php include("headers.php"); ?>
	<?php include('../auth_user/admin/load_class_data.php'); ?>
</head>
<body>
    <img class="title_badge" style="margin-top:20px;" src="" width="150" height="150" />
    <h1 id="title">Homework Home</h1>
    <div id="responseblock" style="display:none;"></div>
    <div id="container">
	<form id="send_reset_form" class="login_block">
		<h3 style="margin-bottom:15px;">Password Reset</h3>
		Please enter your school email and class section below.<br/>A link will be sent there, and you can reset your password by following it.
		<div id="fields">
			<p>School Email:</p> <input type="text" name="email"><br/>
			<p>Class Section:</p> <select id="class_select" name="class">
				<option value="-1">-- Choose --</option>
			</select>
		</div>
		<a id="back" class="lite_button" href="./login.php" style="margin:5px;">&larr; Back</a>
		<a id="reset_submit" class="lite_button_green" href="" style="margin:5px;">Submit</a>
	</form>
	</div>
    <?php include("small_footer.php"); ?>
    <script type="text/javascript">
    	$(document).ready( function () {
    		for (var i=0;i<window.class_data.length;i++) {
    			if (window.class_data[i].archived == "0") $('#class_select').append('<option value="'+window.class_data[i].class_id+'">'+window.class_data[i].name+'</option>');
    		}
    	});
		$('#reset_submit').click(function(e) {
			e.preventDefault();
			$('#send_reset_form').submit();
		});
		$("#send_reset_form").submit(function(e) {
			e.preventDefault();
			$("#responseblock").css("display","inline-block");
            $("#responseblock").css("background-color","#60b369");
            $("#responseblock").css("padding","15px");
            $("#responseblock").html("<b>Working...</b>");
            $.post("send_reset.php", $("#send_reset_form").serialize(), function(data) {
                if (data == "email_not_registered") {
                    $("#responseblock").css("background-color","#f3645a");
                    $("#responseblock").html("<b>Error:</b><br/>Provided email does not match any profiles on record.");
                } else {
                    window.location = './auth_response.php?result='+data;   
                }
            });
		});
	</script>
</body>
</html>
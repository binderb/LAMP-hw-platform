<!DOCTYPE html>
<html>
<head>
	<title>New User</title>
	<?php include("headers.php"); ?>
	<?php include('../auth_user/admin/load_class_data.php'); ?>
</head>
<body>
    <img class="title_badge" style="margin-top:20px;" src="" width="150" height="150" />
    <h1 id="title">Homework Home</h1>
    <div id="responseblock" style="display:none;"></div>
    <div id="resources">
	<form id="create_user_form" class="login_block">
		<h3 style="margin-bottom:15px;">New User Profile:</h3>
		<div id="fields">
			<p>School Email:</p> <input type="text" name="email">
			<p>Username:</p> <input type="text" name="uname"><br/>
			<p>First name:</p> <input type="text" name="fname"><br/>
			<p>Last name:</p> <input type="text" name="lname"><br/>
			<p>Password:</p> <input type="password" name="pswd"><br/>
			<p>Class Section:</p> <select id="class_select" name="class">
				<option value="-1">-- Choose --</option>
			</select>
		</div>
		<a id="back" class="lite_button" href="./login.php" style="margin:5px;">&larr; Back</a>
		<a id="profile_submit" class="lite_button_green" href="" style="margin:5px;">Submit</a>
	</form>
	</div>
    <?php include("small_footer.php"); ?>
    <script type="text/javascript">
    	$(document).ready( function () {
    		for (var i=0;i<window.class_data.length;i++) {
    			if (window.class_data[i].active == "1") $('#class_select').append('<option value="'+window.class_data[i].class_id+'">'+window.class_data[i].name+'</option>');
    		}
    	});
		$('#profile_submit').click(function(e) {
			e.preventDefault();
			$('#create_user_form').submit();
		});
		$("#create_user_form").submit(function(e) {
			e.preventDefault();
			var errors = "";
			if (!$("input[name=email]").val().endsWith("<?php echo $_ENV["SCHOOL_EMAIL_SUFFIX"];?>")) errors += "<br/>\u2014 Please use your school email address.";
			if ($("input[name=uname]").val() == "") errors += "<br/>\u2014 Please provide a username.";
			if ($("input[name=fname]").val() == "") errors += "<br/>\u2014 Please provide your first name when signing up.";
			if ($("input[name=lname]").val() == "") errors += "<br/>\u2014 Please provide your last name when signing up.";
			if ($("input[name=pswd]").val() == "" || $("input[name=pswd]").val().length < 8) errors += "<br/>\u2014 Please provide a password with at least 8 characters.";
			if ($("#class_select").val() == "-1") errors += "<br/>\u2014 Please choose a class section.";
			$("#responseblock").css("display","inline-block");
			if (errors != "") {
				$("#responseblock").css("background-color","#f3645a");
				$("#responseblock").css("padding","15px");
				$("#responseblock").html("<b>Invalid Entry:</b><br/>"+errors);
			} else {
				$("#responseblock").css("background-color","#60b369");
				$("#responseblock").css("padding","15px");
				$("#responseblock").html("<b>Working...</b>");
				$.ajax({
					url: 'add_user.php', 
					method: 'POST',
					data: $("#create_user_form").serialize(), 
					success: function(response) {
						// console.log(response);
						if (response == "username_exists") {
							$("#responseblock").css("background-color","#f3645a");
							$("#responseblock").html("<b>Error:</b><br/>A profile with this username already exists. Please choose a different username, even if you've used it before for another semester.");
						} else if (response == "email_exists") {
							$("#responseblock").css("background-color","#f3645a");
							$("#responseblock").html("<b>Error:</b><br/>A profile in this class section with the same email address already exists. If you've forgotten your password, you can reset it from the login page.");
						} else {
							window.location.replace('./auth_response.php?result='+response);
						}
					}
				});
			}
		});
	</script>
</body>
</html>
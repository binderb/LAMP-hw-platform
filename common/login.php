<!DOCTYPE html>
<html>
<head>
	<title>Login</title>
	<?php include("headers.php"); ?>
</head>
<body>
    <img class="title_badge" style="margin-top:20px;" src="" width="150" height="150" />
    <h1 id="title">Homework Home</h1>
    <div id="responseblock" style="display:none;"></div>
    <div id="container">
	<form id="login_form" class="login_block">
		<table><tbody>
			<tr>
				<td style="font-weight:900;text-align:left;">Username:</td> 
				<td><input type="text" name="uname"></td>
			</tr>
			<tr>
				<td style="font-weight:900;text-align:left;">Password:</td>
				<td><input type="password" name="pswd"></td>
			</tr>
		</tbody></table>
		<span style="text-align:right;display:block;margin-bottom:20px;"><a class="inline_link" href="./forgot.php">Forgot your password?</a></span>
		<input type="submit" class="std_button" value="Submit"><br/><br/>
		First time here, or new semester?<br/>
		<a class="inline_link" href="./new_user.php">Create a new profile</a>
	</form>
	</div>
    <?php include("small_footer.php"); ?>
    <script type="text/javascript">
    $("#login_form").submit(function(e) {
        e.preventDefault();
        var errors = "";
        if ($("input[name=uname]").val() == "") errors += "<br/>\u2014 Please provide a username.";
        if ($("input[name=pswd]").val() == "") errors += "<br/>\u2014 Please provide a password.";
        $("#responseblock").css("display","inline-block");
        if (errors != "") {
            $("#responseblock").css("background-color","#f3645a");
            $("#responseblock").css("padding","15px");
            $("#responseblock").html("<b>Invalid Entry:</b><br/>"+errors);
        } else {
            $("#responseblock").css("background-color","#60b369");
            $("#responseblock").css("padding","15px");
            $("#responseblock").html("<b>Logging In...</b>");
            $.post("login_user.php", $("#login_form").serialize(), function(data) {
                if (data == "username_not_found") {
                    $("#responseblock").css("background-color","var(--palette-red-alert)");
                    $("#responseblock").html("<b>Error:</b><br/>The provided username is not associated with any existing account.");
                } else if (data == "wrong_password") {
                    $("#responseblock").css("background-color","var(--palette-red-alert)");
                    $("#responseblock").html("<b>Error:</b><br/>Incorrect password.");
                } else if (data == "login_success_admin") {
                    window.location.replace('../auth_user/dashboard_admin.php');
                } else if (data == "login_success_student") {
                    window.location.replace('../auth_user/dashboard_student.php');
                } else {
                    window.location.replace('./auth_response.php?result='+data);
                }
            });
        }
    });
</script>
</body>
</html>
<?php
    session_start();

    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();
    
    if (!isset($_SESSION["access"]) || $_SESSION["access"] != "student") {
        header('Location: ' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=invalid_access');
        exit();
    }
?>
<!DOCTYPE html>
<html>
<head>
    <?php include("../common/headers.php"); ?>
	<title>Assignment View</title>
    <?php include("common/load_assignment_variables.php"); ?>
</head>
<body>
    <?php include('../common/logged_in_bar.php'); ?>
    <h1 id="title" style="margin-bottom:10px;"></h1>
    <div id="responseblock" style="display:none;background-color:var(--palette-green);padding:15px;color:white;font-weight:900;margin-bottom:20px;"></div>
    <div id="container" style="margin-left:2vw;margin-right:2vw;"></div>
    <?php include('../common/small_footer.php'); ?>
    <script type="text/javascript" src="student/student_view_builder.js"></script>
    <script type="text/javascript">
        $(document).ready( function() {
        	$('#title').text(window.assignment_data.name);
            student_view_builder.display_view();
        });
    </script>
</body>

</html>
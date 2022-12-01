<?php
    session_start();

    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();
    
    if (!isset($_SESSION["access"]) || ($_SESSION["access"] != "student" && $_SESSION["access"] != "dev")) {
        header('Location: ' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=invalid_access');
        exit();
    }
?>
<!DOCTYPE html>
<html>
<head>
    <title>Student Dashboard</title>
	<?php include("../common/headers.php"); ?>
	<script type="text/javascript">window.student_assignment_data = <?php include('student/load_student_assignment_data.php'); ?>;</script>
</head>
<body>
    <?php
        include('../common/logged_in_bar.php');
    ?>
    <h1 id="title" style="margin-bottom:20px;">
    <?php 
        echo 'Dashboard for ' . $_SESSION["firstname"] . ' ' . $_SESSION["lastname"]; 
    ?>
    </h1>
    <div id="responseblock" style="display:none;"></div>
    <div id="dashboard" style="margin-left:2vw;margin-right:2vw;">
        <script type="text/javascript" src="student/student_dashboard_builder.js"></script>
    </div>
    <?php include('common/small_footer.php'); ?>
    <script type="text/javascript">
        $(document).ready(function() {
        	if (window.student_assignment_data != 'connection_error' && window.student_assignment_data != 'invalid_access') {
            	student_dashboard_builder.display_dashboard();
            } else {
            	window.location.replace("./common/common/auth_response.php?result="+window.student_assignment_data);
            }
        });
    </script>
</body>
</html>
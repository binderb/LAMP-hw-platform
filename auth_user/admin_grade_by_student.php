<?php
    session_start();

    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();
    
    if (!isset($_SESSION["access"]) || $_SESSION["access"] != "admin") {
        header('Location: ' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=invalid_access');
        exit();
    }
?>
<!DOCTYPE html>
<html>
<head>
    <?php include("../common/headers.php"); ?>
	<title>Grading</title>
    <?php include("common/load_assignment_variables.php"); ?>
    <?php include("admin/load_classwide_variables.php"); ?>
</head>
<body>
    <?php include('../common/logged_in_bar.php'); ?>
    <h1 id="title" style="margin-bottom:10px;">Grade By Student</h1>
    <div id="responseblock" style="display:none;margin-bottom:20px;padding:15px;color:white;font-weight:900;background-color:var(-palette-green);"></div>
    <div id="container" style="margin-left:2vw;margin-right:2vw;"></div>
    <?php include('../common/small_footer.php'); ?>
    <script type="text/javascript" src="admin/admin_grading_builder.js"></script>
    <script type="text/javascript">
        $(document).ready( function() {
            admin_grading_builder.display_grade_by_student();
        });
    </script>
</body>

</html>

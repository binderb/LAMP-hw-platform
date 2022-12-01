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
	<title>Admin Dashboard</title>
	<?php include("../common/headers.php"); ?>
	<?php include('admin/load_user_data.php'); ?>
	<?php include('admin/load_class_data.php'); ?>
	<script type="text/javascript">window.assignment_data = <?php include('admin/load_assignment_data.php'); ?>;</script>
</head>
<body>
    <?php include('../common/logged_in_bar.php'); ?>
    <h1 id="title" style="margin-bottom:20px;">
    <?php 
        echo 'Admin Dashboard for ' . $_SESSION["firstname"] . ' ' . $_SESSION["lastname"]; 
    ?>
    </h1>
    <div id="responseblock" style="display:none;"></div>
    <div id="dashboard" style="margin-left:2vw;margin-right:2vw;">
        <script type="text/javascript" src="admin/admin_dashboard_builder.js"></script>
    </div>
    <?php include('../common/small_footer.php'); ?>
    <script type="text/javascript">
        $(document).ready(function() {
            admin_dashboard_builder.display_dashboard();
            $('#current_class').val(<?php echo (isset($_SESSION["selected_class"])) ? $_SESSION["selected_class"] : 0; ?>).change();
        });
    </script>
</body>
</html>
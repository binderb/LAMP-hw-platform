<?php
	session_start();
	
	$assignment_id = isset($_POST["assignment_id"]) ? $_POST["assignment_id"] : "";
    $graded = isset($_POST["graded"]) ? $_POST["graded"] : "";
    
    if ($assignment_id == "" || $graded == "") {
        echo "invalid_access";
        exit();
    }
	
	use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();

    // Attempt MySQL server connection.
    $conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
    $conn->set_charset("utf8");
    
    // Update the appropriate assignment row
    $update_graded = "UPDATE assignment_table SET graded = ? WHERE assignment_id = ?";
    if ($stmt = $conn->prepare($update_graded)) {
    	$stmt->bind_param("ii",$graded, $assignment_id);
        $stmt->execute();
    } else {
        echo "connection_error";
        exit();
    }
    $stmt->close();
    $conn->close();
    
    echo "update_success";

?>
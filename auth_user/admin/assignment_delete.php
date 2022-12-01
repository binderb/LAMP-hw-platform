<?php
    
    session_start();
    
    $assignment_id = isset($_POST["assignment_id"]) ? $_POST["assignment_id"] : "";
    
    if ($assignment_id == "") {
    	echo "Values:";
    	echo "<br/>";
    	echo $assignment_id;
    	echo "<br/>";
        echo "Error: Invalid Access.";
        exit();
    }
    
    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();

    // Attempt MySQL server connection.
    $conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
    $conn->set_charset("utf8");
    
    // Delete the appropriate assignment row
    $delete_assignment_row = "DELETE FROM assignment_table WHERE assignment_id = ?";
    if ($stmt = $conn->prepare($delete_assignment_row)) {
    	$stmt->bind_param("i",$assignment_id);
        $stmt->execute();
    } else {
        echo "There was an error connecting to the database when deleting the assignment.";
        exit();
    }
    $stmt->close();
    
    $conn->close();
    
    echo "delete_success";

?>
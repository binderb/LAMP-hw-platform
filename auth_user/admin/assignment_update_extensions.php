<?php
    session_start();
    if (!isset($_SESSION["access"]) || $_SESSION["access"] != "admin") {
        echo "Error: Invalid access.";
        exit();
    }
    
    $extension_data = isset($_POST["extension_data"]) ? $_POST["extension_data"] : "";
    $assignment_id = isset($_POST["assignment_id"]) ? $_POST["assignment_id"] : "";
    if ($extension_data == "" || $assignment_id == "") {
        echo "Error: Invalid access.";
        exit();
    }
    
    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();

    // Attempt MySQL server connection.
    $conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
    $conn->set_charset("utf8");
    
    // Update assignment_manifest with the newly-collected extension data.
    $update_extensions = "UPDATE assignment_table SET extensions = ? WHERE assignment_id = ?";
    if ($stmt = $conn->prepare($update_extensions)) {
        $stmt->bind_param("si",$extension_data,$assignment_id);
        $stmt->execute();
    } else {
        echo "Error: Could not connect to the database.";
        exit();
    }
    $stmt->close();
    
    // Close connection
    $conn->close();
    echo "update_success";
    
?>
<?php
    
    session_start();
    
    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();

    // Attempt MySQL server connection.
    $conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
    $conn->set_charset("utf8");
    
    // Get all data in question table
    $fetch_data = "SELECT * FROM question_table";
    if ($stmt = $conn->prepare($fetch_data)) {
        $stmt->execute();
        $result = $stmt->get_result();
        $question_data = array();
        while ($row = $result->fetch_assoc())  $question_data[] = $row;
    } else {
        echo "connection_error";
    }
    $stmt->close();
    $conn->close();
    
    echo json_encode($question_data);

?>
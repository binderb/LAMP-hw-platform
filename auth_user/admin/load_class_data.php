<?php
    
    session_start();
    
    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();

    // Attempt MySQL server connection.
    $conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
    $conn->set_charset("utf8");
    
    // Get all data in class_table
    $fetch_data = "SELECT * FROM class_table";
    if ($stmt = $conn->prepare($fetch_data)) {
        $stmt->execute();
        $result = $stmt->get_result();
        $class_data = array();
        while ($row = $result->fetch_assoc())  $class_data[] = $row;
    } else {
        echo "connection_error";
    }
    $stmt->close();
    $conn->close();
    
    echo '<script type="text/javascript">window.class_data = ' . json_encode($class_data) . ';</script>';

?>
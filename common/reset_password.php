<?php
    session_start();
    
    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();

    // Attempt MySQL server connection.
	$conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
	$conn->set_charset("utf8");

    $user_id = isset($_SESSION["password_reset_id"]) ? $_SESSION["password_reset_id"] : "";
    $session_email = isset($_SESSION["password_reset_email"]) ? $_SESSION["password_reset_email"] : "";
    $provided_email = isset($_POST["email"]) ? $_POST["email"] : "";
    $new_password = isset($_POST["pswd"]) ? $_POST["pswd"] : "";
    
    if ($session_email == "" || $provided_email == "" || $user_id == "" || $new_password == "") {
        echo "invalid_access_nologin";
        exit();
    } elseif ($session_email != $provided_email) {
        echo "email_match_fail";
        exit();
    }
    
    if ($new_password != "") {
        $new_password = password_hash($new_password,PASSWORD_DEFAULT);
    } else {
        echo "invalid_access_nologin";
        exit();
    }
    
    $reset_password = "UPDATE user_table SET pswd = ? WHERE user_id = ?";
    if ($stmt = $conn->prepare($reset_password)) {
        $stmt->bind_param("si",$new_password,$user_id);
        $stmt->execute();
        echo "password_reset_success";
        session_destroy();
    } else {
        echo "connection_error";
        exit();
    }
    
    // Close connection
    $conn->close();

?>
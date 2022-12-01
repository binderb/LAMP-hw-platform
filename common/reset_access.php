<?php
    session_start();
    
    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();

    // Attempt MySQL server connection.
	$conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
	$conn->set_charset("utf8");

    $link_key = $_GET["key"];
    
    // Get the user associated with the provided key, if any
    $key_check = "SELECT a.user_id,a.email,b.key_timestamp FROM user_table a JOIN password_reset_keys b ON a.user_id = b.user_id WHERE b.key_string = ?";
    if ($stmt = $conn->prepare($key_check)) {
        $stmt->bind_param("s",$link_key);
        $stmt->execute();
        $stmt->store_result();
        $stmt->bind_result($user_id,$email,$key_timestamp);
        if ($stmt->num_rows == 1) {
            $stmt->fetch();
            // The key is in the database and matches an existing user, so present the reset panel if the key hasn't expired
            if (time() - $key_timestamp <= 86400) { //86400 = 24 hours
                // Allow password reset
                $_SESSION["password_reset_id"] = $user_id;
                $_SESSION["password_reset_email"] = $email;
                header('Location: ' . $_ENV["APP_ROOT"] . '/common/reset_form.php');
            } else {
                // Key expired
                header('Location: ' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=reset_key_expired');
            }
            // Delete the supplied reset key from the activation_keys database
            $delete_key = "DELETE FROM password_reset_keys WHERE key_string = ?";
            if ($stmt = $conn->prepare($delete_key)) {
                $stmt->bind_param("s",$link_key);
                $stmt->execute();
            } else {
                header('Location: ' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=connection_error');
            }
        } elseif ($stmt->num_rows == 0) {
            header('Location: ' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=reset_key_not_found');
        }
    } else {
        header('Location: ' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=connection_error');
    }

?>
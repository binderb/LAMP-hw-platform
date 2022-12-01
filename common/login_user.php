<?php
    session_start();
    
    $provided_username = isset($_POST["uname"]) ? $_POST["uname"] : "";
    $provided_pswd = isset($_POST["pswd"]) ? $_POST["pswd"] : "";
    
    if ($provided_username == "" || $provided_pswd == "") {
        echo "invalid_access_nologin";
        exit();
    }

    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();

    // Attempt MySQL server connection.
    $conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
    
    // Query the users database for an entry with a matching username, and pull user data
    $get_profile_data = "SELECT user_id,pswd,access,first,last,class_id,active FROM user_table WHERE username = ?";
    if ($stmt = $conn->prepare($get_profile_data)) {
        $stmt->bind_param("s",$provided_username);
        $stmt->execute();
        $stmt->store_result();
        $stmt->bind_result($userID,$stored_pswd,$stored_access,$stored_first,$stored_last,$stored_class_id,$stored_active);
        if ($stmt->num_rows() == 0) {
            echo "username_not_found";
            exit();
        } else {
            $stmt->fetch();
            if ($stored_active == 0) {
                $_SESSION["resend_activation_id"] = $userID;
                echo "user_not_activated";
                exit();
            }
        }
    } else {
        echo "connection_error";
        exit();
    }
    
    // Verify the provided password against the stored hash
    if (password_verify($provided_pswd,$stored_pswd)) {
        // User is authenticated, so log them in
        $_SESSION["username"] = $provided_username;
        $_SESSION["firstname"] = $stored_first;
        $_SESSION["lastname"] = $stored_last;
        $_SESSION["class_id"] = $stored_class_id;
        $_SESSION["user_id"] = $userID;
        if ($stored_access == "admin") {
            $_SESSION["access"] = "admin";
            echo "login_success_admin";
        } else if ($stored_access == "student" || $stored_access == "dev") {
            $_SESSION["access"] = $stored_access;
            echo "login_success_student";
        }
        // This is for specialized use in other parts of the developer's site
        $_SESSION["suite_token"] = true;
    } else {
        echo "wrong_password";
    }

    // Close connection
    mysqli_close($conn);

?>
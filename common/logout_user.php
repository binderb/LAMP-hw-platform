<?php
    session_start();
    session_unset();
    session_destroy();
    header('Location: ' . $_ENV["APP_ROOT"] . '/common/login.php');
?>
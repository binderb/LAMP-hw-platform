<!DOCTYPE html>
<html>
<head>
	<title>Homework Home</title>
	<?php include("headers.php"); ?>
</head>
<body>
    <img class="title_badge" src="" width="150" height="150" style="margin-top:40px;"/>
    <?php
        $message_type = $_GET["result"];
        if ($message_type == 'creation_success') {
            include('../server/responses/create_success_message.html');
        } elseif ($message_type == "activation_success") {
            include('../server/responses/activation_success_message.html');
        } elseif ($message_type == "invalid_access") {
            include('../server/responses/invalid_access_message.html');
        } elseif ($message_type == "invalid_access_nologin") {
            include('../server/responses/invalid_access_nologin_message.html');
        } elseif ($message_type == "connection_error") {
            include('../server/responses/connection_error_message.html');
        } elseif ($message_type == "no_response") {
            include('../server/responses/no_response_message.html');
        } elseif ($message_type == "user_exists") {
            include('../server/responses/user_exists_message.html');
        } elseif ($message_type == "key_not_found") {
            include('../server/responses/key_not_found_message.html');
        } elseif ($message_type == "key_expired") {
            include('../server/responses/key_expired_message.html');
        } elseif ($message_type == "resend_activation_success") {
            include('../server/responses/resend_activation_success_message.html');
        } elseif ($message_type == "already_active") {
            include('../server/responses/already_active_message.html');
        } elseif ($message_type == "send_reset_success") {
            include('../server/responses/send_reset_success_message.html');
        } elseif ($message_type == "reset_key_expired") {
            include('../server/responses/reset_key_expired_message.html');
        } elseif ($message_type == "reset_key_not_found") {
            include('../server/responses/reset_key_not_found_message.html');
        } elseif ($message_type == "password_reset_success") {
            include('../server/responses/password_reset_success_message.html');
        } elseif ($message_type == "user_not_activated") {
            include('../server/responses/user_not_activated_message.html');
        } elseif ($message_type == "assignment_not_found") {
            include('../server/responses/assignment_not_found_message.html');
        }
        include('../common/small_footer.php');
    ?>
</body>
</html>
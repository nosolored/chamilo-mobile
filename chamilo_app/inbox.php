<?php
/* For licensing terms, see /license.txt */
/* Require libs and classes */
require_once __DIR__ . '/../../main/inc/global.inc.php';
require_once 'webservices/WSApp.class.php';
require_once 'webservices/AppWebService.class.php';

$username = isset($_GET['username']) ? Security::remove_XSS($_GET['username']) : null;
$apiKey = isset($_GET['api_key']) ? Security::remove_XSS($_GET['api_key']) : null;
$message_id = isset($_GET['message_id']) ? Security::remove_XSS($_GET['message_id']) : null;
$user_id = isset($_GET['user_id']) ? Security::remove_XSS($_GET['user_id']) : null;

if (AppWebService::isValidApiKey($username, $apiKey)) {
	/* LOGIN */
	$chamiloUser = api_get_user_info($user_id);
	$_user['user_id'] = $chamiloUser['user_id'];
	$_user['status'] = (isset($chamiloUser['status']) ? $chamiloUser['status'] : 5);
	$_user['uidReset'] = true;
	Session::write('_user', $_user);
	$uidReset = true;
	$logging_in = true;
	Event::event_login($_user['user_id']);
	/* Fin login */
	
	Login::init_user($user_id, true);
	global $_configuration;
    $ruta = $_configuration['root_web'];
	header('Location:'.$ruta.'main/messages/view_message.php?id='.$message_id);
} else {
	error_log("Not valid apiKey");
}

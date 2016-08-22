<?php
require_once __DIR__ . '/../../main/inc/global.inc.php';
require_once 'webservices/WSApp.class.php';
require_once 'webservices/AppWebService.class.php';

$username = isset($_GET['username']) ? Security::remove_XSS($_GET['username']) : null;
$apiKey = isset($_GET['api_key']) ? Security::remove_XSS($_GET['api_key']) : null;
$path = isset($_GET['path']) ? Security::remove_XSS($_GET['path']) : null;
$user_id = isset($_GET['user_id']) ? Security::remove_XSS($_GET['user_id']) : null;
$c_id = isset($_GET['c_id']) ? Security::remove_XSS($_GET['c_id']) : null;

if (AppWebService::isValidApiKey($username, $apiKey)) {
	//$courseInfo = CourseManager::get_course_information_by_id($c_id);
	$courseInfo = api_get_course_info_by_id($c_id);	
	$course_code = $courseInfo['code'];
	
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
	Login::init_course($course_code, true);
	
	global $_configuration;
    $ruta = $_configuration['root_web'];
	
	header('Location:'.$ruta.'main/forum/download.php?file='.$path);
} else {
	error_log("Not valid apiKey");
}

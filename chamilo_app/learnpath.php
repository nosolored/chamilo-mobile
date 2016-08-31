<?php
require_once __DIR__ . '/../../main/inc/global.inc.php';
require_once 'webservices/WSApp.class.php';
require_once 'webservices/AppWebService.class.php';

use ChamiloSession as Session;

//require_once __DIR__ . '/../../main/document/document.inc.php';

$username = isset($_GET['username']) ? Security::remove_XSS($_GET['username']) : null;
$apiKey = isset($_GET['api_key']) ? Security::remove_XSS($_GET['api_key']) : null;
$url = isset($_GET['url']) ? Security::remove_XSS($_GET['url']) : null;

$url = str_replace('&amp;','&',$url);

if (AppWebService::isValidApiKey($username, $apiKey)) {

	//$courseInfo = CourseManager::get_course_information_by_id($c_id);
	$courseInfo = api_get_course_info_by_id($c_id);	
	$user_id = UserManager::get_user_id_from_username($username);
	
	/* LOGIN */
	$chamiloUser = api_get_user_info($user_id);
	$_user['user_id'] = $chamiloUser['user_id'];
	$_user['status'] = (isset($chamiloUser['status']) ? $chamiloUser['status'] : 5);
	$_user['uidReset'] = true;
	Session::write('_user', $_user);
	$uidReset = true;
	$logging_in = true;
	//Event::event_login($_user['user_id']);
	Login::init_user($user_id, true);
	
	global $_configuration;
    $ruta = $_configuration['root_web'];
	$url_final = $ruta.'main/newscorm/lp_controller.php?'.$url;
	header('Location:'.$url_final);
} else {
	error_log("Not valid apiKey");
}
       

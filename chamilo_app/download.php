<?php
require_once __DIR__ . '/../../main/inc/global.inc.php';
require_once 'webservices/WSApp.class.php';
require_once 'webservices/AppWebService.class.php';

require_once __DIR__ . '/../../main/document/document.inc.php';

$username = isset($_GET['username']) ? Security::remove_XSS($_GET['username']) : null;
$apiKey = isset($_GET['api_key']) ? Security::remove_XSS($_GET['api_key']) : null;
$c_id = isset($_GET['c_id']) ? Security::remove_XSS($_GET['c_id']) : null;
$document_id = isset($_GET['id']) ? Security::remove_XSS($_GET['id']) : null;

if (AppWebService::isValidApiKey($username, $apiKey)) {

	$courseInfo = CourseManager::get_course_information_by_id($c_id);

	$course_dir = $courseInfo['directory'].'/document';
	$sys_course_path = api_get_path(SYS_COURSE_PATH);
	$base_work_dir = $sys_course_path.$course_dir;

	$document_data = DocumentManager::get_document_data_by_id(
		$document_id,
		$courseInfo['code'],
		false,
		$sessionId
	);

	// Check whether the document is in the database
	if (empty($document_data)) {
		api_not_allowed();
	}
	// Launch event
	event_download($document_data['url']);

	$full_file_name = $base_work_dir.$document_data['path'];

	if (Security::check_abs_path($full_file_name, $base_work_dir.'/')) {
		DocumentManager::file_send_for_download($full_file_name, true);
	}
	exit;

} else {
	error_log("Not valid apiKey");
}
       

<?php
/* For licensing terms, see /license.txt */
/**
 * Controller for REST request
 * @author Angel Fernando Quiroz Campos <angel.quiroz@beeznest.com>
 * @author Nosolored <info@nosolored.com>
 * @package chamilo.webservices
 */
/* Require libs and classes */
require_once __DIR__ . '/../../main/inc/global.inc.php';
require_once 'webservices/WSApp.class.php';
require_once 'webservices/AppWebService.class.php';
require_once 'app.lib.php';

use ChamiloSession as Session;
/* Manage actions */
$json = array();

$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : 'nothing';
$username = isset($_POST['username']) ? Security::remove_XSS($_POST['username']) : null;
$apiKey = isset($_POST['api_key']) ? Security::remove_XSS($_POST['api_key']) : null;
$user_id = isset($_POST['user_id']) ? Security::remove_XSS($_POST['user_id']) : null;
$c_id = isset($_POST['c_id']) ? Security::remove_XSS($_POST['c_id']) : null;
$list = isset($_POST['list']) ? Security::remove_XSS($_POST['list']) : null;
$path = isset($_POST['path']) ? Security::remove_XSS($_POST['path']) : null;
$forum_id = isset($_POST['f_id']) ? Security::remove_XSS($_POST['f_id']) : null;
$thread_id = isset($_POST['t_id']) ? Security::remove_XSS($_POST['t_id']) : null;
$title = isset($_POST['title']) ? Security::remove_XSS($_POST['title']) : null;
$text = isset($_POST['text']) ? Security::remove_XSS($_POST['text']) : null;
$notice = isset($_POST['notice']) ? Security::remove_XSS($_POST['notice']) : null;

switch ($action) {
    case 'loginNewMessages':
        $password = isset($_POST['password']) ? Security::remove_XSS($_POST['password']) : null;

        if (AppWebService::isValidUser($username, $password)) {
            $webService = new AppWebService();

            $userInfo = $webService->getUserInfoApiKey($username);
			
			$user_id = UserManager::get_user_id_from_username($username);
			$chamiloUser = api_get_user_info($user_id);
			$_user['user_id'] = $chamiloUser['user_id'];
			$_user['status'] = (isset($chamiloUser['status']) ? $chamiloUser['status'] : 5);
			$_user['uidReset'] = true;
			Session::write('_user', $_user);
			$uidReset = true;
			$logging_in = true;
			Event::event_login($_user['user_id']);
			Login::init_user($user_id, true);
			
            $json = array(
                'status' => true,
                'userInfo' => $userInfo
            );
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
    case 'countNewMessages':
        if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);

            $lastId = isset($_POST['last']) ? $_POST['last'] : 0;

            $count = $webService->countNewMessages($username, $lastId);

            $json = array(
                'status' => true,
                'count' => $count
            );
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
	case 'getAllMessages':
        if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);

            $messages = $webService->getAllMessages($username);

            $json = array(
                'status' => true,
                'messages' => $messages
            );
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
	case 'getNewMessages':
        if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);

            $lastId = isset($_POST['last']) ? $_POST['last'] : 0;

            $messages = $webService->getNewMessages($username, $lastId);
			$remove_messages = $webService->getRemoveMessages($list, $username);

            $json = array(
                'status' => true,
                'messages' => $messages,
				'remove_messages' => $remove_messages
            );
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
	case 'getUsersMessage':
        if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);

            $user_search = isset($_POST['user_search']) ? $_POST['user_search'] : '';
			if($user_search == ''){
				$users = '';
			}else{
            	$users = $webService->getUsersMessage($user_id, $user_search);
			}
			
            $json = array(
                'status' => true,
                'users' => $users
            );
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
	
	case 'formNewMessage':
        if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);
			
			$to_userid = isset($_POST['to_userid']) ? $_POST['to_userid'] : '';
			$result = $webService->sendNewEmail($to_userid, $title, $text, $user_id);
			
            $json = array(
                'status' => $result
            );
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
		
		
	case 'formReplyMessage':
        if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);
			
			$message_id = isset($_POST['message_id']) ? $_POST['message_id'] : '0';
			$check_quote = isset($_POST['check_quote']) ? $_POST['check_quote'] : '0';
			
			$result = $webService->sendReplyEmail($message_id, $title, $text, $check_quote, $user_id);
			
            $json = array(
                'status' => $result
            );
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
		
	case 'getCoursesList':
		if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);
            $courses = $webService->getCoursesList($user_id);
	     $json = array(
                'status' => true,
                'courses' => $courses,
				'sessions' => $sessions
            );
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
		
	case 'getProfile':
        if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);

            $profile = $webService->getProfile($user_id);

            $json = array(
                'status' => true,
                'profile' => $profile
            );
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
	
	case 'getInfoCourse':
		if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);

            $webService->registerAccessCourse($c_id, $user_id);

            $json = array(
                'status' => true
            );
        } else {
            $json = array(
                'status' => false
            );
        }
        break;	
	
	case 'getDescription':
		if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);

            $descriptions = $webService->getDescription($c_id, $username);

            $json = array(
                'status' => true,
                'descriptions' => $descriptions
            );
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
		
	case 'getNotebook':
		if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);

            $notebooks = $webService->getNotebook($c_id, $username);
			$json = array(
                'status' => true,
                'notebooks' => $notebooks
            );
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
		
	case 'getDocuments':
		if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);

            $documents = $webService->getDocuments($c_id, $path, $user_id);

            $json = array(
                'status' => true,
				//'path' => $path,
                'documents' => $documents
            );
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
		
	case 'getAnnouncementsList':
		if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);

            $announcements = $webService->getAnnouncements($c_id, $user_id);
			if($announcements!==false){
				$json = array(
					'status' => true,
					'announcements' => $announcements
				);
			}else{
				$json = array(
					'status' => false
				);
			}
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
		
	case 'getAgenda':
		if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);

            $events = $webService->getCourseEvents($c_id, $user_id);
			if($events!==false){
				$json = array(
					'status' => true,
					'events' => $events
				);
			}else{
				$json = array(
					'status' => false
				);
			}
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
		
	case 'getForumsList':
		if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);

            $forums = $webService->getForums($c_id, $user_id);
			if($forums!==false){
				$json = array(
					'status' => true,
					'forums' => $forums
				);
			}else{
				$json = array(
					'status' => false
				);
			}
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
	
	case 'getThreadsList':
		if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);

            $threads = $webService->getThreads($c_id, $forum_id);
			if($threads!==false){
				$json = array(
					'status' => true,
					'data' => $threads
				);
			}else{
				$json = array(
					'status' => false
				);
			}
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
		
	case 'getPostsList':
		if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);

            $posts = $webService->getPosts($c_id, $forum_id, $thread_id);
			if($posts!==false){
				$json = array(
					'status' => true,
					'data' => $posts
				);
			}else{
				$json = array(
					'status' => false
				);
			}
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
	
	case 'formNewThread':
		if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);
            
			$posts = $webService->createThread($c_id, $forum_id, $title, $text, $notice, $user_id);
			if($posts!==false){
				$json = array(
					'status' => true
				);
			}else{
				$json = array(
					'status' => false
				);
			}
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
		
	case 'formNewPost':
		if (AppWebService::isValidApiKey($username, $apiKey)) {
            $webService = new AppWebService();
            $webService->setApiKey($apiKey);

            $posts = $webService->createPost($c_id, $forum_id, $thread_id, $title, $text, $notice, $user_id);
			if($posts!==false){
				$json = array(
					'status' => true
				);
			}else{
				$json = array(
					'status' => false
				);
			}
        } else {
            $json = array(
                'status' => false
            );
        }
        break;
		
    default:
}

/* View */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
echo json_encode($json);

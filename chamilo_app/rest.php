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
$json = [];

$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : null;
$username = isset($_REQUEST['username']) ? Security::remove_XSS($_REQUEST['username']) : null;
$apiKey = isset($_REQUEST['api_key']) ? Security::remove_XSS($_REQUEST['api_key']) : null;

$userId = isset($_POST['user_id']) ? (int) $_POST['user_id'] : null;
$courseId = isset($_POST['c_id']) ? (int) $_POST['c_id'] : null;
$sessionId = isset($_POST['s_id']) ? (int) $_POST['s_id'] : 0;
$list = isset($_POST['list']) ? Security::remove_XSS($_POST['list']) : null;
$path = isset($_POST['path']) ? Security::remove_XSS($_POST['path']) : null;
$forumId = isset($_POST['f_id']) ? Security::remove_XSS($_POST['f_id']) : null;
$threadId = isset($_POST['t_id']) ? Security::remove_XSS($_POST['t_id']) : null;
$parentId = isset($_POST['parent_id']) ? Security::remove_XSS($_POST['parent_id']) : null;
$title = isset($_POST['title']) ? Security::remove_XSS($_POST['title']) : null;
$text = isset($_POST['text']) ? Security::remove_XSS($_POST['text']) : null;
$notice = isset($_POST['notice']) ? Security::remove_XSS($_POST['notice']) : null;
$messageId = isset($_POST['messageId']) ? Security::remove_XSS($_POST['messageId']) : null;

try {
    /** @var Rest $restApi */
    $restApi = $apiKey ? AppWebService::validate($username, $apiKey) : null;

    if ($restApi) {
        $restApi->setCourse($courseId);
        $restApi->setSession($sessionId);
    }

    switch ($action) {
        case 'loginNewMessages':
            AppWebService::init();
            $password = isset($_POST['password']) ? $_POST['password'] : null;
            $isValid = AppWebService::isValidUser($username, $password);
            if (!$isValid) {
                $json = [
                    'status' => false
                ];
                exit;
            }
            $apiKey = AppWebService::findUserApiKey($username, AppWebService::SERVICE_NAME);
            $userInfo = api_get_user_info_from_username($username);
            $userInfo['apiKey'] = $apiKey;
            $json = [
                'status' => true,
                'userInfo' => $userInfo,
                'gcmSenderId' => api_get_setting('messaging_gdc_project_number'),
            ];
            break;

        case 'gcm_id':
            $gcmId = isset($_POST['registration_id']) ? Security::remove_XSS($_POST['registration_id']) : null;
            $restApi->setGcmId($gcmId);
            $json = ['status' => true];
            break;

        case 'check_conditions':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $checkCondition= $webService->checkCondition($userId);
                if ($checkCondition) {
                    $json = [
                        'status' => true,
                        'check_condition' => true,
                    ];
                } else {
                    $json = [
                        'status' => true,
                        'check_condition' => false,
                    ];
                }
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;
        case 'getConditions':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $getCondition= $webService->getCondition($userId);
                if (!empty($getCondition)) {
                    $json = [
                        'status' => true,
                        'language_id' => $getCondition['language_id'],
                        'date' => $getCondition['date'],
                        'content' => $getCondition['content'],
                        'type' => $getCondition['type'],
                        'changes' => $getCondition['changes'],
                        'version' => $getCondition['version'],
                        'id' => $getCondition['id'],
                    ];
                } else {
                    $json = [
                        'status' => false,
                        'text_condition' => '',
                    ];
                }
            } else {
                $json = ['status' => false];
            }
            break;

        case 'setAcceptCondition':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $legalAcceptType = isset($_POST['legal_accept_type']) ? $_POST['legal_accept_type'] : null;
                $setCondition = $webService->setConditions($userId, $legalAcceptType);
                if (!empty($setCondition)) {
                    $json = [
                        'status' => true,
                    ];
                } else {
                    $json = [
                        'status' => false,
                    ];
                }
            } else {
                $json = ['status' => false];
            }
            break;

        case 'getCatalog':
            $code = isset($_POST['code']) ? Security::remove_XSS($_POST['code']) : 'ALL';
            $info = $restApi->getCatalog($code);
            $json = [
                'status' => true,
                'code' => $info['code'],
                'user_id' => $info['user_id'],
                'courses' => $info['courses_in_category'],
                'sessions' => $info['sessions_in_category'],
                'user_coursecodes' => $info['user_coursecodes'],
                'catalog_show_courses_sessions' => $info['catalogShowCoursesSessions'],
                'categories_select' => $info['categories_select'],
            ];
            break;

        case 'subscribeCourse':
            $code = isset($_POST['code']) ? Security::remove_XSS($_POST['code']) : null;
            $result = $restApi->subscribeCourse($code);
            $json = [
                'status' => true,
                'id' => $result['id'],
                'message' => $result['message'],
                'password' => $result['password'],
            ];
            break;

        case 'subscribeCoursePassword':
            $code = isset($_POST['code']) ? Security::remove_XSS($_POST['code']) : null;
            $password = isset($_POST['password']) ? Security::remove_XSS($_POST['password']) : null;
            $result = $restApi->subscribeCourse($code, $password);
            $json = [
                'status' => true,
                'id' => $result['id'],
                'message' => $result['message'],
            ];
            break;

        case 'countNewMessages':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $lastId = isset($_POST['last']) ? $_POST['last'] : 0;
                $count = $webService->countNewMessages($username, $lastId);
                $json = [
                    'status' => true,
                    'count' => $count,
                ];
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'getAllMessages':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $messages = $webService->getAllMessages($username);
                $json = [
                    'status' => true,
                    'messages' => $messages,
                ];
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'setReadMessage':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $message = $webService->setReadMessage($messageId);
                $json = ['status' => true];
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'getNumMessages':
             if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $num = $webService->getNumMessages($userId);
                $studentsToBrowseCourse = api_get_setting('allow_students_to_browse_courses');
                $json = [
                    'status' => true,
                    'num_messages' => $num,
                    'catalog' => $studentsToBrowseCourse,
                ];
            } else {
                $json = [
                    'status' => false,
                    'num_messages' => 0,
                ];
            }
            break;

        case 'getNewMessages':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $lastId = isset($_POST['last']) ? $_POST['last'] : 0;
                $messages = $webService->getNewMessages($username, $lastId);
                $removeMessages = $webService->getRemoveMessages($list, $username);
                $json = [
                    'status' => true,
                    'messages' => $messages,
                    'remove_messages' => $removeMessages,
                ];
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'getOutMessages':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $lastId = isset($_POST['last']) ? $_POST['last'] : 0;
                $messages = $webService->getOutMessages($username, $lastId);
                $removeMessages = $webService->getRemoveOutMessages($list, $username);
                $json = [
                    'status' => true,
                    'messages' => $messages,
                    'remove_messages' => $removeMessages,
                ];
            } else {
                $json = [
                        'status' => false
                ];
            }
            break;
             
        case 'getAllOutMessages':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $messages = $webService->getAllOutMessages($username);
                $json = [
                    'status' => true,
                    'messages' => $messages,
                ];
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'getUsersMessage':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $user_search = isset($_POST['user_search']) ? $_POST['user_search'] : '';
                if ($user_search == '') {
                    $users = '';
                } else {
                    $users = $webService->getUsersMessage($userId, $user_search);
                }
                $json = [
                    'status' => true,
                    'users' => $users,
                ];
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'formNewMessage':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $toUserid = isset($_POST['to_userid']) ? $_POST['to_userid'] : '';
                $result = $webService->sendNewEmail($toUserid, $title, $text, $userId);
                $json = ['status' => $result];
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'formReplyMessage':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $messageId = isset($_POST['message_id']) ? (int) $_POST['message_id'] : '0';
                $checkQuote = isset($_POST['check_quote']) ? (int) $_POST['check_quote'] : '0';
                $result = $webService->sendReplyEmail($messageId, $title, $text, $checkQuote, $userId);
                $json = ['status' => $result];
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'getCoursesList':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $courses = $webService->getCoursesList($userId);
                $sessions = $webService->getSessionsList($userId);
                $json = [
                    'status' => true,
                    'user_id' => $userId,
                    'courses' => $courses,
                    'sessions' => $sessions,
                ];
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'getProfile':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $profile = $webService->getProfile($userId);
                $json = [
                    'status' => true,
                    'profile' => $profile,
                ];
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'getInfoCourse':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $info = $webService->registerAccessCourse($courseId, $userId, $sessionId);
                $json = [
                    'status' => true,
                    'info' => $info
                ];
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;    

        case 'getDescription':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $descriptions = $webService->getDescription($courseId, $username, $sessionId);
                $json = [
                    'status' => true,
                    'descriptions' => $descriptions,
                ];
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'getLearnpath':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $learnpaths = $webService->getLearnpaths($courseId, $userId, $sessionId);
                $json = [
                    'status' => true,
                    'learnpaths' => $learnpaths,
                ];
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'getLink':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $links = $webService->getLink($courseId, $username, $sessionId);
                $json = [
                    'status' => true,
                    'links' => $links
                ];
            } else {
                $json = [
                        'status' => false
                ];
            }
            break;

        case 'getNotebook':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $notebooks = $webService->getNotebook($courseId, $username, $sessionId);
                $json = [
                    'status' => true,
                    'notebooks' => $notebooks,
                ];
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;
            
        case 'formNewNotebook':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $notebook = $webService->createNotebook($courseId, $title, $text, $userId, $sessionId);
                if ($notebook !== false) {
                    $json = [
                        'status' => true
                    ];
                } else {
                    $json = [
                        'status' => false
                    ];
                }
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'getDocuments':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $documents = $webService->getDocuments($courseId, $path, $username, $sessionId);
                $json = [
                    'status' => true,
                    'documents' => $documents,
                ];
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'getAnnouncementsList':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $announcements = $webService->getAnnouncements($courseId, $userId, $sessionId);
                if ($announcements !== false) {
                    $json = [
                        'status' => true,
                        'announcements' => $announcements,
                    ];
                } else {
                    $json = [
                        'status' => false
                    ];
                }
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'getAgenda':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $events = $webService->getCourseEvents($courseId, $userId, $sessionId);
                if ($events !== false) {
                    $json = [
                        'status' => true,
                        'events' => $events,
                    ];
                } else {
                    $json = [
                        'status' => false
                    ];
                }
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'getForumsList':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $forums = $webService->getForums($courseId, $userId, $sessionId);
                if ($forums !== false) {
                    $json = [
                        'status' => true,
                        'forums' => $forums,
                    ];
                } else {
                    $json = [
                        'status' => false
                    ];
                }
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'getThreadsList':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $threads = $webService->getThreads($courseId, $forumId, $userId);
                if ($threads !== false) {
                    $json = [
                        'status' => true,
                        'data' => $threads
                    ];
                } else {
                    $json = [
                        'status' => false
                    ];
                }
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'getPostsList':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $posts = $webService->getPosts($courseId, $forumId, $threadId);
                if ($posts !== false) {
                    $json = [
                        'status' => true,
                        'data' => $posts,
                    ];
                } else {
                    $json = [
                        'status' => false
                    ];
                }
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'formNewThread':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $posts = $webService->createThread($courseId, $forumId, $title, $text, $notice, $userId, $sessionId);
                if ($posts !== false) {
                    $json = ['status' => true];
                } else {
                    $json = [
                        'status' => false
                    ];
                }
            } else {
                $json = [
                    'status' => false
                ];
            }
            break;

        case 'formNewPost':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $posts = $webService->createPost(
                    $courseId,
                    $forumId,
                    $threadId,
                    $title,
                    $text,
                    $notice,
                    $userId,
                    $parentId
                );
                if ($posts !== false) {
                    $json = [
                        'status' => true,
                        'statusFile' => false,
                        'post_id' => $posts,
                    ];
                } else {
                    $json = ['status' => false];
                }
            } else {
                $json = ['status' => false];
            }
            break;

        case 'getRanking':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $ranking = $webService->getRanking($courseId, $sessionId);
                $json = [
                    'status' => true,
                    'ranking' => $ranking,
                ];
            } else {
                $json = ['status' => false];
            }
            break;

        case 'getDetailsRanking':
            if (AppWebService::isValidApiKey($username, $apiKey)) {
                $webService = new AppWebService();
                $webService->setApiKey($apiKey);
                $details_ranking = $webService->getDetailsRanking($courseId, $userId, $sessionId);
                $json = [
                    'status' => true,
                    'info' => $details_ranking,
                ];
            } else {
                $json = ['status' => false];
            }
            break;

        default:
    }
} catch (Exception $exeption) {
    /*
    $restResponse->setErrorMessage(
        $exeption->getMessage()
    );
    */
    error_log($exeption->getMessage());
    $json = ['status' => false];
}

/* View */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
echo json_encode($json);

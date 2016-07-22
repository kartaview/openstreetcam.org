<?php

/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */

	require_once __DIR__.'/vendor/autoload.php';
	
	require __DIR__.'/app/OsvApp.php';	
	require __DIR__.'/app/config/constants.php';
	
	use Silex\Application;
	use Silex\Provider\FormServiceProvider;
	use Silex\Provider\TwigServiceProvider;
	use Silex\Provider\UrlGeneratorServiceProvider;
	use Silex\Provider\ValidatorServiceProvider;
	use Silex\Provider\ServiceControllerServiceProvider;
	use Silex\Provider\TranslationServiceProvider;
	use Silex\Provider\SwiftmailerServiceProvider;
	use Doctrine\DBAL\Schema\Table;
	use OAuth\OAuth1\Token\StdOAuth1Token;
	use Gigablah\Silex\OAuth\Security\User\Provider\OAuthInMemoryUserProvider;
	use Gigablah\Silex\OAuth\Security\Authentication\Token\OAuthToken;
	use Symfony\Component\HttpFoundation\RequestMatcher;
	use Symfony\Component\DependencyInjection\Definition;
	use Symfony\Component\Security\Core\Authorization\AccessDecisionManager;
	use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;
	use Symfony\Component\Security\Core\Authorization\Voter\AuthenticatedVoter;

	$app = new Silex\Application();
	OsvApp::setApp($app);
	$enviroment = getenv('APPLICATION_ENV') ? getenv('APPLICATION_ENV') : 'development';
	define('APPLICATION_ENV', 	$enviroment);
	$app->register(new DerAlex\Silex\YamlConfigServiceProvider(__DIR__ . '/app/config/settings.yml'));
	$app['debug'] = $app['config'][$enviroment]['debug'];
	
	if ($app['debug']) {
		$app['timeStart'] = microtime(true);
	}
	
	$app['config.NBService'] = $app['config'][$enviroment]['NBService'];
	$app['config.MRService'] = $app['config'][$enviroment]['MRService'];
	$app['minify'] = $app['config'][$enviroment]['minify'];
	$app['FFmpegHome'] = isset($app['config'][$enviroment]['FFmpegHome']) ? $app['config'][$enviroment]['FFmpegHome']: '' ;
	$app['VideosHome'] = isset($app['config'][$enviroment]['VideosHome']) ? $app['config'][$enviroment]['VideosHome']: '' ;
	
	$app->register(new ValidatorServiceProvider());
	$app->register(new Silex\Provider\UrlGeneratorServiceProvider());
	$app->register(new FormServiceProvider());
	$app->register(new TranslationServiceProvider());
	$app->register(new TwigServiceProvider(), array(
		'twig.path' => array(__DIR__.'/app/views'),
		'twig.options' => array('cache' => __DIR__.'/cache/twig'),
	));
	$app['twig'] = $app->share($app->extend('twig', function($twig, $app) {
		$twig->addFunction(new \Twig_SimpleFunction('asset', function ($asset) use ($app) {
			return sprintf('%s/%s', trim($app['request']->getBasePath()), ltrim($asset, '/'));
		}));
		$twig->addFunction(new \Twig_SimpleFunction('is_granted', function ($right, $object) use ($app) {
			return $app['security.authorization_checker']->isGranted($right, $object);
		}));
		return $twig;
	}));

	$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
		'db.options' =>$app['config'][$enviroment]['database'],
	));
	
	//doctrine db providers
	require __DIR__.'/app/controllers/dbProviders/UserProvider.php';
	require __DIR__.'/app/controllers/dbProviders/UploadProvider.php';
	require __DIR__.'/app/controllers/dbProviders/OSVSequenceProvider.php';
	require __DIR__.'/app/controllers/dbProviders/OSVPhotoProvider.php';
	require __DIR__.'/app/controllers/dbProviders/OSVVideoProvider.php';
	require __DIR__.'/app/controllers/dbProviders/OSVListProvider.php';
	require __DIR__.'/app/controllers/dbProviders/UserTokensProvider.php';
	require __DIR__.'/app/controllers/dbProviders/OSVFileaccessProvider.php';
	require __DIR__.'/app/controllers/dbProviders/OSVGeometryProvider.php';

	//controller providers
	require __DIR__.'/app/controllers/providers/OSVSequence.php';
	require __DIR__.'/app/controllers/providers/OSVPhoto.php';
	require __DIR__.'/app/controllers/providers/OSVVideo.php';
	require __DIR__.'/app/controllers/providers/OSVList.php';
	require __DIR__.'/app/controllers/providers/OSVMap.php';
	require __DIR__.'/app/controllers/providers/OSVDetails.php';
	require __DIR__.'/app/controllers/providers/OSVEcho.php';
	require __DIR__.'/app/controllers/providers/OSVUser.php';

	//controllers
	require __DIR__.'/app/controllers/OSVResponseController.php';
	require __DIR__.'/app/controllers/OSVSequenceController.php';
	require __DIR__.'/app/controllers/OSVPhotoController.php';
	require __DIR__.'/app/controllers/OSVVideoController.php';
	require __DIR__.'/app/controllers/OSVListController.php';
	require __DIR__.'/app/controllers/OSVMapController.php';
	require __DIR__.'/app/controllers/OSVDetailsController.php';
	require __DIR__.'/app/controllers/OSVEchoController.php';
	require __DIR__.'/app/controllers/OSVUserController.php';
	require __DIR__.'/app/controllers/OSVFileAuthController.php';
	require __DIR__.'/app/controllers/OpenGraphController.php';
	require __DIR__.'/app/controllers/OSVAppController.php';

	//security
	require __DIR__.'/app/security/ApiKeyAuthenticator.php';
	require __DIR__.'/app/security/ApiKeyUserProvider.php';
	require __DIR__.'/app/security/ApiKeyAuthenticationServiceProvider.php';
	require __DIR__.'/app/security/ApiKeyUserServiceProvider.php';
	require __DIR__.'/app/voters/SequenceVoter.php';

	//routes
	$app->get('/sequence', 'OSVSequenceController::index');
	$app->get('/photo', 'OSVPhotoController::index');
	$app->get('/video', 'OSVVideoController::index');
	$app->get('/fileauth', 'OSVFileAuthController::index');
	$app->get('/originauth', 'OSVFileAuthController::originAuth');
	$app->get('/opengraph', "OpenGraphController::index");

	$app->post('/tracks', "OSVMapController::index");
	$app->post('/nearby-tracks', "OSVMapController::near");
	$app->post('/my-list', "OSVListController::myList");
	$app->post('/details', "OSVDetailsController::index");
	$app->post('/version', "OSVAppController::index");
	$app->get('/download-app', "OSVAppController::downloadApp");

	$app->mount('/'.API_VERSION.'/echo', new OSVEcho());
	$app->mount('/'.API_VERSION.'/sequence', new OSVSequence());
	$app->mount('/'.API_VERSION.'/photo', new OSVPhoto());
	$app->mount('/'.API_VERSION.'/video', new OSVVideo());
	$app->mount('/'.API_VERSION.'/user', new OSVUser());
	$app->mount('/'.API_VERSION.'/list', new OSVList());
	$app->mount('/'.API_VERSION.'/tracks', new OSVMap());
	
	$app->get('/{page}/{args}', function ()  use ($app) {
		$request = $app['request'];
		$osvUsers = new UserProvider();
		$app['restore'] = 0;
		$app['collect_email'] = 0;
		if(!is_null($app['user'])) {
			if($app['user']->getStatus() != 'active' ) {
				$app['user']->restore(OsvApp::getApp());
				$app['restore'] = 1;
			}
			if(is_null($app['user']->getEmail()) && 
					$app['user']->collectEmail($app, $app['user']->getExternalUserId(), $app['user']->getType())){
				$app['collect_email'] = 1;
			}
		}
		$response = $app['twig']->render(
			'index.html.twig',
			array(
				'page_title' => "OpenStreetView",
				'login_paths' => $app['oauth.login_paths'],
				'logout_path' => $app['url_generator']->generate('logout', array(
					'_csrf_token' => $app['oauth.csrf_token']('logout')
				)),
				'user_ip' => $osvUsers->getUserPosition($app)
			)
		);
		return $response;
	})->assert('page', 'map|list|my-list|mytracks|details|aboutus|leaderboard|home|terms|profile')->assert('args', '.*');

	$app->get('/', function ()  use ($app) {
		$request = $app['request'];
		$osvUsers = new UserProvider();
		$app['restore'] = 0;
		$app['collect_email'] = 0;
		if(!is_null($app['user'])) {
			if($app['user']->getStatus() != 'active' ) {
				$app['user']->restore(OsvApp::getApp());
				$app['restore'] = 1;
			}
			if(is_null($app['user']->getEmail()) && 
					$app['user']->collectEmail($app, $app['user']->getExternalUserId(), $app['user']->getType())){
				$app['collect_email'] = 1;
			}
		}
		$response = $app['twig']->render(
			'index.html.twig',
			array(
				'page_title' => "OpenStreetView",
				'login_paths' => $app['oauth.login_paths'],
				'logout_path' => $app['url_generator']->generate('logout', array(
					'_csrf_token' => $app['oauth.csrf_token']('logout')
				)),
				'user_ip' => $osvUsers->getUserPosition($app)
			)
		);
		return $response;
	})->bind('home');

	$app['oauth.externalUser'] = new UserProvider();

	// Provides CSRF token generation
	$app->register(new Silex\Provider\FormServiceProvider());

	// Provides session storage
	$app->register(new Silex\Provider\SessionServiceProvider(), array(
		'session.storage.save_path' => __DIR__.'/tmp'
	));

	$app->register(new Gigablah\Silex\OAuth\OAuthServiceProvider(), array(
		'oauth.services' => array(
			'OpenStreetMap' => array(
					'key' => OSM_API_KEY,
					'secret' => OSM_API_SECRET,
					'user_endpoint' => 'http://api.openstreetmap.org/api/0.6/user/details',
				)
			)
		)
	);

	$app->register(new Silex\Provider\SecurityServiceProvider(), array(
		'security.firewalls' => array(
			'default' => array(
				'stateless' => false,
				'pattern' => '^/',
				'anonymous' => true,
				'oauth' => array(
					'require_previous_session' => false,
					'login_path' => '/auth/{service}',
					'callback_path' => '/auth/{service}/callback',
					'check_path' => '/auth/{service}/check',
					'failure_path' => '/auth/failure',
					'failure_forward' => true,
					'success_path' => '/auth/success',
					'client_auth_path' => '/auth/{service}/client_auth'
					//'with_csrf' => true
				),
				'apikey'    => true,
				'logout' => array(
					'logout_path' => '/logout',
				//	'with_csrf' => true,

				),
				
				// OAuthInMemoryUserProvider returns a StubUser and is intended only for testing.
				// Replace this with your own UserProvider and User class.
				'users' => new Gigablah\Silex\OAuth\Security\User\Provider\OAuthInMemoryUserProvider()
			)
		),
		'security.access_rules' => array(
			array('^/auth', 'ROLE_USER'),
		)
	));
	$app->register(new ApiKeyAuthenticationServiceProvider(), array(
	    'security.apikey.param' => 'access_token',
	    'security.apikey.url_match' => array(
			'/1.0/sequence/',
			'/1.0/sequence/photo-list/',
			'/1.0/sequence/remove/',
			'/1.0/sequence/finished-uploading/',
			'/1.0/sequence/update-info/',
			'/1.0/sequence/edit/',
			'/1.0/sequence/restore/',
			'/1.0/photo/',
			'/1.0/photo/remove/',
			'/1.0/photo/restore/',
			'/1.0/photo/rotate/',
			 '/my-list',
			array('/details', 'POST', true),
			array('/export/{sequenceId}/', 'GET'),
			'/1.0/sequence/export/remove/',
			'/1.0/video',
			 '/1.0/video/remove/',
			'/1.0/video/split/',
			'/1.0/user/remove/',
	    )
	));
	$app->register(new ApiKeyUserServiceProvider());
	$app['sequence_voter'] = $app->share(function($app) {
    	return new SequenceVoter();
	});

	$app['osv.security.voters'] = $app->share(function($app) {
	    $voters[] = $app['sequence_voter'];
	    return $voters;
	});

	$app['security.access_manager'] = $app->share(function($app) {
	    return new AccessDecisionManager($app['osv.security.voters'], 'affirmative');
	});

	$app['security.authorization_checker'] = $app->share(function($app) {
		$tokenStorage = isset($app['security.token_storage'])?$app['security.token_storage']:$app['security'];
	    return new AuthorizationChecker($tokenStorage, $app['security.authentication_manager'], $app['security.access_manager'], false);
	});

	$app->before(function (Symfony\Component\HttpFoundation\Request $request) use ($app) {
		if (isset($app['security.token_storage'])) {
			$token = $app['security.token_storage']->getToken();
		} else {
			$token = $app['security']->getToken();
		}
		$app['user'] = null;
		$app['isSuperUser'] = 0;
		if ($token && !$app['security.trust_resolver']->isAnonymous($token)) {
			$app['user'] = $token->getUser();
			$user = new UserProvider();
			if(!$user->exists($app, $app['user']->getExternalUserId(), 'osm', $app['user']->getUsername())){
				$user->add($app);
				$token->getUser()->setId($user->getId());
			}
			$app['user'] = $user;
		}
		if ($request->request->has('externalUserId')) {
			$user = new UserProvider();
			$user->exists($app, $request->request->get('externalUserId'), 'osm');
			$app['user'] = $user;
		}
	});

	$app->get('/auth/failure', function() use ($app) {
        $error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		$response = new OSVResponseController(OsvApp::getApp(), null, $error);
		return $response->jsonResponse;
	});
	$app->get('/auth/success', function() {
		if (OsvApp::getResource('security.token_storage')) {
			$token = OsvApp::getResource('security.token_storage')->getToken();
		} else {
			$token = OsvApp::getResource('security')->getToken();
		}
		if ($token && !OsvApp::getResource('security.trust_resolver')->isAnonymous($token)) {
			$subUser = $token->getUser();
			$user = new UserProvider();
			if(!$user->exists(OsvApp::getApp(), $subUser->getExternalUserId(), 'osm', $subUser->getUsername())){
				$user->add(OsvApp::getApp());
			}
			$userTokens = new UserTokensProvider();
			$userTokens->setUsername($user->getUsername());
			$userTokens->setToken($token->getAccessToken()->getRequestToken());
			$userTokens->add();
			$response = new OSVResponseController(OsvApp::getApp(), array('access_token' => $token->getAccessToken()->getRequestToken()));
			return $response->jsonResponse;
		}
		$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		$response = new OSVResponseController(OsvApp::getApp(), null, $error);
		return $response->jsonResponse;
	});
	$app->match('/logout', function () {})->bind('logout');
	$app->run();
?>
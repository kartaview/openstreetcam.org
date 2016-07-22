<?php
	
/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */

use Silex\Application,
    Silex\ServiceProviderInterface;

class ApiKeyUserServiceProvider implements ServiceProviderInterface
{
    public function register(Application $app)
    {
        $app['security.user_provider.apikey'] = $app->protect(function () use ($app) {
            return new ApiKeyUserProvider();
        });
        return true;
    }
    public function boot(Application $app)
    {
    }
}
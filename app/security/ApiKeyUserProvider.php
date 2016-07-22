<?php
	
/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */

use Gigablah\Silex\OAuth\Security\User\StubUser;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\User\User;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;

class ApiKeyUserProvider implements UserProviderInterface
{
    public function getUsernameForApiKey($apiKey)
    {
        $userTokens = new UserTokensProvider();
        $userTokens->get($apiKey);

        return $userTokens->username;
    }

    public function loadUserByUsername($username)
    {
    	$user = new UserProvider();
    	$user->getByUsername(OsvApp::getApp(), $username);
    	$role = $user->getRole()?(array)$user->getRole():array('ROLE_USER');
    	return new StubUser($username, $user->getExternalUserId(), '', $username . '@example.org', $role, true, true, true, true, $user->getId());
    }

    public function refreshUser(UserInterface $user)
    {
        throw new UnsupportedUserException();
    }

    public function supportsClass($class)
    {
        return 'Symfony\Component\Security\Core\User\User' === $class;
    }
}
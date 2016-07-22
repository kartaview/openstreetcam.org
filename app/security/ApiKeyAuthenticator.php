<?php
	
/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */

use Symfony\Component\Security\Core\Authentication\SimplePreAuthenticatorInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Authentication\Token\PreAuthenticatedToken;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\Exception\UsernameNotFoundException;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;
use Symfony\Component\HttpFoundation\Request,Symfony\Component\HttpFoundation\JsonResponse;

class ApiKeyAuthenticator implements SimplePreAuthenticatorInterface, AuthenticationFailureHandlerInterface
{
    protected $userProvider;
    protected $paramName;
    protected $urlMatch;
    protected $httpUtils;

    public function __construct(ApiKeyUserProvider $userProvider, $paramName, $urlMatch, $httpUtils)
    {
        $this->paramName = $paramName;
        $this->userProvider = $userProvider;
        $this->urlMatch = $urlMatch;
        $this->httpUtils = $httpUtils;
    }
    public function createToken(Request $request, $providerKey)
    {
        $exists = false;
        $allowAnonymous = false;
        foreach ($this->urlMatch as $targetUrl) {
            $targetUrl = (array)$targetUrl;
            $method = isset($targetUrl[1])? $targetUrl[1]: 'POST';
            if ($this->httpUtils->checkRequestPath($request, $targetUrl[0]) && ($method == $request->getMethod())) {
                $exists = true;
                $allowAnonymous = isset($targetUrl[2])? $targetUrl[2]: false;
                break;
            }
        }
        if ($exists === false) {
            return;
        }
        if (!$request->request->has($this->paramName) && $allowAnonymous === true) {
            return;
        }
        if (!$request->request->has($this->paramName) && $allowAnonymous === false) {
            throw new BadCredentialsException('No API key found');
        }
        return new PreAuthenticatedToken(
            'anon.',
            $request->request->get($this->paramName),
            $providerKey
        );
    }
    public function authenticateToken(TokenInterface $token, UserProviderInterface $userProvider, $providerKey)
    {
        $apiKey = $token->getCredentials();
        $username = $this->userProvider->getUsernameForApiKey($apiKey);
        if (!$username) {
            throw new AuthenticationException(
                sprintf('API Key "%s" does not exist', $apiKey)
            );
        }
        $user = $this->userProvider->loadUserByUsername($username);
        
        return new PreAuthenticatedToken(
            $user,
            $apiKey,
            $providerKey,
            $user->getRoles()
        );
    }
    public function supportsToken(TokenInterface $token, $providerKey)
    {
        return $token instanceof PreAuthenticatedToken && $token->getProviderKey() === $providerKey;
    }
    public function onAuthenticationFailure(Request $request, AuthenticationException $Exception)
    {
        $frc = new OSVResponseController(OsvApp::getApp(), null, new AuthenticationException(
                AUTHENTICATION_REQUIRED, 401
            ));
        return $frc->jsonResponse;
    }
}

<?php
namespace Gigablah\Silex\OAuth\Security\Authentication;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\Security\Http\HttpUtils;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;


class OsvAuthenticationSuccessHandler implements AuthenticationSuccessHandlerInterface
{
    protected $httpUtils;
    protected $options;
    protected $providerKey;
    protected $httpKernel;
    protected $defaultOptions = array(
        'always_use_default_target_path' => false,
        'default_target_path' => '/',
        'login_path' => '/login',
        'success_path' => '/success',
        'target_path_parameter' => '_target_path',
        'use_referer' => false,
        'success_forward' => false
    );

    /**
     * Constructor.
     *
     * @param HttpUtils $httpUtils
     * @param array     $options   Options for processing a successful authentication attempt.
     */
    public function __construct(HttpKernelInterface $httpKernel, HttpUtils $httpUtils, array $options = array())
    {
    	$this->httpKernel = $httpKernel;
        $this->httpUtils = $httpUtils;
        $this->setOptions($options);
    }

    /**
     * {@inheritdoc}
     */
    public function onAuthenticationSuccess(Request $request, TokenInterface $token)
    {
    	if ($this->httpUtils->checkRequestPath($request, $this->options['client_auth_route'])) {
            $subRequest = $this->httpUtils->createRequest($request, $this->options['success_path']);
            return $this->httpKernel->handle($subRequest, HttpKernelInterface::SUB_REQUEST);
        }
        return $this->httpUtils->createRedirectResponse($request, $this->determineTargetUrl($request));
    }

    /**
     * Gets the options.
     *
     * @return array An array of options
     */
    public function getOptions()
    {
        return $this->options;
    }

    /**
     * Sets the options.
     *
     * @param array $options An array of options
     */
    public function setOptions(array $options)
    {
        $this->options = array_merge($this->defaultOptions, $options);
    }

    /**
     * Get the provider key.
     *
     * @return string
     */
    public function getProviderKey()
    {
        return $this->providerKey;
    }

    /**
     * Set the provider key.
     *
     * @param string $providerKey
     */
    public function setProviderKey($providerKey)
    {
        $this->providerKey = $providerKey;
    }

    /**
     * Builds the target URL according to the defined options.
     *
     * @param Request $request
     *
     * @return string
     */
    protected function determineTargetUrl(Request $request)
    {
        if ($this->options['always_use_default_target_path']) {
            return $this->options['default_target_path'];
        }

        if ($targetUrl = $request->get($this->options['target_path_parameter'], null, true)) {
            return $targetUrl;
        }

        if (null !== $this->providerKey && $targetUrl = $request->getSession()->get('_security.'.$this->providerKey.'.target_path')) {
            $request->getSession()->remove('_security.'.$this->providerKey.'.target_path');

            return $targetUrl;
        }

        if ($this->options['use_referer'] && ($targetUrl = $request->headers->get('Referer')) && $targetUrl !== $this->httpUtils->generateUri($request, $this->options['login_path'])) {
            return $targetUrl;
        }

        return $this->options['default_target_path'];
    }
}

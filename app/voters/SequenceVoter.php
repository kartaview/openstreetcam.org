<?php
	
/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */

use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;
use Symfony\Component\Security\Core\Authorization\AccessDecisionManagerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class SequenceVoter implements VoterInterface
{
    const EDIT = 'edit';
    const VIEW = 'view';
    const DELETE = 'delete';

    const ROLE_USER = 'ROLE_USER';
    const ROLE_SUPER_ADMIN = 'ROLE_SUPER_ADMIN';


    public function supportsAttribute($attribute)
    {
        if (!in_array($attribute, array(self::EDIT, self::VIEW, self::DELETE))) {
            return false;
        }

        return true;
    }

    public function supportsClass($class)
    {
        if (!$class instanceof OSVSequenceProvider) {
            return false;
        }
        return true;
    }


    public function vote(TokenInterface $token, $object, array $attributes)
    {
        return true;
        $user = $token->getUser();
        if ((!$user instanceof UserInterface) && ($user != 'anon.')) {
            return false;
        }
        foreach ($attributes as $attribute) {
            if (!$this->supportsAttribute($attribute)) {
                return false;
            }
        }
        if (!$this->supportsClass($object)) {
            return false;
        }
        if (($user instanceof UserInterface) && in_array(self::ROLE_SUPER_ADMIN, $user->getRoles())) {
            return true;
        }

        $sequence = $object;
        if (in_array(self::VIEW, $attributes)) {
            return $this->canView($user, $sequence);
        }
        if (in_array(self::EDIT, $attributes)) {
            return $this->canEdit($user, $sequence);
        }
        if (in_array(self::DELETE, $attributes)) {
            return $this->canDelete($user, $sequence);
        }
        

        return false;
    }

    private function checkIfProcessed(OSVSequenceProvider $sequence)
    {
        return $sequence->getImagesStatus() == 'PROCESSING_FINISHED';
    }

    private function checkIfOwner(OSVSequenceProvider $sequence, UserInterface $user)
    {
        return $user->getId() === $sequence->getUserId();
    }

    private function canView($user, $sequence)
    {
        if (($user instanceof UserInterface) && in_array(self::ROLE_USER, $user->getRoles())) {
            if ($this->checkIfOwner($sequence, $user)) {
                return true;
            }
        }
        return $this->checkIfProcessed($sequence);
    }

    private function canEdit($user, $sequence)
    {
        if (($user instanceof UserInterface) && in_array(self::ROLE_USER, $user->getRoles())) {
            return $this->checkIfOwner($sequence, $user);
        }
        return false;
    }

    private function canDelete($user, $sequence) 
    {
        return $this->canEdit($user, $sequence);
    }
}
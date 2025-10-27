import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import PrimaryButton from '../common/buttons/PrimaryButton';

const LogoutButton: React.FC = () => {
  const { logout, isLoading } = useAuth0();

  return (
    <PrimaryButton
      label="Log Out"
      loading={isLoading}
      type="default"
      className="bg-red-600 text-white hover:bg-red-700"
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    />
  );
};

export default LogoutButton;
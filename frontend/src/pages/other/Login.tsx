import React from 'react';
import { Layout } from 'antd';
import { useAuth0 } from '@auth0/auth0-react';
import PrimaryButton from '../../components/common/buttons/PrimaryButton';

const { Header } = Layout;

const Navbar: React.FC = () => {
  const { loginWithRedirect, isLoading } = useAuth0();

  return (
    <Layout>
      <Header className="flex justify-between items-center bg-white shadow-md px-6 py-2">
        <div className="text-2xl font-bold text-[#2f398f]">ThesisBoard</div>
        <PrimaryButton
        label="Login"
        loading={isLoading}
        onClick={() => loginWithRedirect()}
        className="px-6 py-2"
        />
      </Header>
    </Layout>
  );
};

export default Navbar;
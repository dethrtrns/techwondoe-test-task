import {
  Container,
  Loader,
  LoadingOverlay,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import React, {useEffect, useState} from 'react';
import UsersList from './UsersList';

interface User {
  _id: string;
  name: string;
  avatar: string;
  email: string;
  role: string;
  date: Date;
}

const CompanySettings = () => {
  const [usersData, setUsersData] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // console.log(usersData);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('api/get');
        if (response.ok) {
          const data = await response.json();
          setUsersData(data);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // function to update the users data from UsersList on add, edit or delete.
  const updateUserData = (updatedData: User[]) => {
    setUsersData(updatedData);
  };

  return (
    <Container p="lg">
      <Title order={1}>Company Settings</Title>
      <Tabs mt={25} color="gray" variant="outline" defaultValue="users">
        <Tabs.List>
          <Tabs.Tab value="general-xl">General</Tabs.Tab>
          <Tabs.Tab value="users">Users</Tabs.Tab>
          <Tabs.Tab value="plan">Plan</Tabs.Tab>
          <Tabs.Tab value="billing">Billing</Tabs.Tab>
          <Tabs.Tab value="integrations">Integrations</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="general" pt="xs">
          general tab content
        </Tabs.Panel>

        <Tabs.Panel className="shadow-xl rounded-t-none" value="users" pt="xs">
          <Container p={0} fluid>
            {loading ? (
              <LoadingOverlay
                loader={<Loader size="xl" variant="dots" />}
                visible={loading}
              ></LoadingOverlay>
            ) : error ? (
              <Text color="red">{error}</Text>
            ) : (
              <UsersList data={usersData} updateData={updateUserData} />
            )}
          </Container>
        </Tabs.Panel>

        <Tabs.Panel value="plan" pt="xs">
          Plan Settings tab content
        </Tabs.Panel>
        <Tabs.Panel value="billing" pt="xs">
          Billing Settings tab content
        </Tabs.Panel>
        <Tabs.Panel value="integrations" pt="xs">
          Integration Settings tab content
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default CompanySettings;

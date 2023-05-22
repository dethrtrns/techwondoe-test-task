import React from 'react';
import {
  Avatar,
  Badge,
  Table,
  Group,
  Text,
  ScrollArea,
  Flex,
  Button,
  Title,
  Pagination,
  ActionIcon,
  Modal,
  TextInput,
  Select,
  Notification,
} from '@mantine/core';
import {useForm, joiResolver} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import Joi from 'joi';

import {IconPencil, IconTrash} from '@tabler/icons-react';

interface User {
  _id: number;
  name: string;
  avatar: string;
  email: string;
  role: string;
  date: Date;
}

interface FormValues {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface UsersTableProps {
  data: User[];
}

const UsersList: React.FC<UsersTableProps> = ({data}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5; // Number of items to display per page
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [userIdToUpdate, setUserIdToUpdate] = React.useState<number | null>(
    null
  );
  const [userIdToDelete, setUserIdToDelete] = React.useState<number | null>(
    null
  );

  const defaultAvatarUrl = (name: string) =>
    `https://robohash.org/${name}.png?size=200x200`;

  // Define the schema for form validation
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string()
      .email({minDomainSegments: 2, tlds: {allow: ['com', 'net']}})
      .required(),
    role: Joi.string().valid('Admin', 'Sales Leader', 'Sales Rep').required(),
    avatar: Joi.string().uri().allow(''),
  });

  // Initialize useForm hook
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      role: '',
      avatar: '',
    },
    validate: joiResolver(schema),
  });

  //add user handler
  const submitFormHandler = async (values: FormValues) => {
    if (values.avatar === '') {
      values.avatar = defaultAvatarUrl(values.name);
    }

    // Submit the form
    try {
      const response = await fetch('api/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to add user');
      }

      // Close modal and clear error if submit was successful
      setOpen(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Update and Delete handlers
  const handleDeleteUser = async (_id: number) => {
    try {
      const response = await fetch(`api/delete?id=${_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Close modal and clear error if delete was successful
      setUserIdToDelete(null);
      setError(null);

      // Notify successful deletion
      notifications.show({
        title: 'Success!',
        message: 'User deleted successfully',
        color: 'green',
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateUser = async (_id: number, values: Partial<User>) => {
    try {
      const userToUpdate = data.find(user => user._id === _id);
      if (!userToUpdate) {
        throw new Error('User not found');
      }

      const updatedUserData = {
        ...userToUpdate,
        name: values.name || userToUpdate.name,
        role: values.role || userToUpdate.role,
      };

      // console.log(updatedUserData);

      const response = await fetch('api/update', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updatedUserData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      // Close modal and clear error if update was successful
      setUserIdToUpdate(null);
      setError(null);

      // Notify successful update
      notifications.show({
        title: 'Success!',
        message: 'User updated successfully',
        color: 'green',
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
    };

    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

    return (
      <div>
        <div>{formattedDate}</div>
        <div style={{fontSize: 'smaller', opacity: 0.7}}>
          {formattedTime.replace(' ', '')}
        </div>
      </div>
    );
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = data.slice(startIndex, endIndex);

  // console.log(currentPageData);
  const rows = currentPageData.map(item => (
    <tr key={item.name}>
      <td>
        <Group spacing="sm">
          <Avatar size={40} src={item.avatar} radius={40} />
          <div>
            <Text fz="sm" fw={500}>
              {item.name}
            </Text>
            <Text fz="xs" c="dimmed">
              {item.email}
            </Text>
          </div>
        </Group>
      </td>

      <td>
        {Math.random() > 0.5 ? (
          <Badge variant="dot" color="green">
            Active
          </Badge>
        ) : (
          <Badge variant="dot" color="gray">
            Invited
          </Badge>
        )}
      </td>
      <td>
        <Text fz="sm" fw={500}>
          {item.role}
        </Text>
      </td>
      <td>{formatDate(item.date.toString())}</td>
      <td>
        <Flex>
          <ActionIcon onClick={() => setUserIdToDelete(item._id)}>
            <IconTrash size="1.125rem" />
          </ActionIcon>
          <ActionIcon
            onClick={() => {
              const user = data.find(user => user._id === item._id);
              if (user) {
                form.setValues({name: user.name, role: user.role});
                setUserIdToUpdate(user._id);
              }
            }}
          >
            <IconPencil size="1.125rem" />
          </ActionIcon>
        </Flex>
      </td>
    </tr>
  ));

  return (
    <ScrollArea p={'xl'} className="rounded shadow-xl" pt={30}>
      <Flex justify={'space-between'}>
        <Group className="flex flex-col justify-between items-start">
          <Group>
            <Title order={4}>Users</Title>
            <Badge color="green"> {data.length} users</Badge>
          </Group>
          <Text>
            Manage your team members and their account permissions here.
          </Text>
        </Group>
        <Flex>
          <Button variant="outline">Download CSV</Button>
          <Button
            onClick={() => setOpen(true)}
            ml={9}
            variant="outline"
            color="blue"
          >
            Add user
          </Button>
        </Flex>
      </Flex>
      <Table miw={800} verticalSpacing="sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Role</th>
            <th>Last Login</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
      <Pagination
        p="md"
        position="apart"
        total={Math.ceil(data.length / itemsPerPage)}
        value={currentPage}
        onChange={setCurrentPage}
      />
      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title="Add New User"
        size="md"
      >
        <form onSubmit={form.onSubmit(submitFormHandler)}>
          <TextInput
            label="Name"
            placeholder="Enter Name"
            required
            error={form.errors.name}
            {...form.getInputProps('name')}
          />
          <TextInput
            label="Email"
            placeholder="Enter Email"
            required
            error={form.errors.email}
            {...form.getInputProps('email')}
          />
          <Select
            data={['Admin', 'Sales Leader', 'Sales Rep']}
            label="Role"
            placeholder="Select Role"
            required
            error={form.errors.role}
            {...form.getInputProps('role')}
          />
          <TextInput
            label="Avatar"
            placeholder="Enter Avatar URL"
            error={form.errors.avatar}
            {...form.getInputProps('avatar')}
          />
          <Flex p={15} justify="flex-end">
            <Button color="red" variant="light" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button ml={9} color="indigo" variant="outline" type="submit">
              Submit
            </Button>
          </Flex>
          {error && (
            <Notification mt={15} color="red">
              {error}
            </Notification>
          )}
        </form>
      </Modal>
      {userIdToDelete && (
        <Modal
          opened={true}
          onClose={() => setUserIdToDelete(null)}
          title="Delete user"
          size="md"
        >
          <Text>Are you sure you want to delete this user?</Text>
          <Flex p={15} justify="flex-end">
            <Button
              color="red"
              variant="light"
              onClick={() => setUserIdToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              ml={9}
              color="indigo"
              variant="outline"
              onClick={() => handleDeleteUser(userIdToDelete)}
            >
              Confirm
            </Button>
          </Flex>
          {error && (
            <Notification mt={15} color="red">
              {error}
            </Notification>
          )}
        </Modal>
      )}
      {userIdToUpdate && (
        <Modal
          opened={true}
          onClose={() => {
            setUserIdToUpdate(null);
            form.reset(); // Reset form when modal is closed
          }}
          title={`Update user: ${
            data.find(user => user._id === userIdToUpdate)?.email
          }`} // Use email as modal title
          size="md"
        >
          <form
            onSubmit={e => {
              e.preventDefault();
              handleUpdateUser(userIdToUpdate, form.values);
            }}
          >
            <TextInput
              label="Name"
              placeholder="Enter Name"
              required
              error={form.errors.name}
              {...form.getInputProps('name')}
            />
            <Select
              data={['Admin', 'Sales Leader', 'Sales Rep']}
              label="Role"
              placeholder="Select Role"
              required
              error={form.errors.role}
              {...form.getInputProps('role')}
            />
            <Flex p={15} justify="flex-end">
              <Button
                color="red"
                variant="light"
                onClick={() => setUserIdToUpdate(null)}
              >
                Cancel
              </Button>
              <Button ml={9} color="indigo" variant="outline" type="submit">
                Submit
              </Button>
            </Flex>
            {error && (
              <Notification mt={15} color="red">
                {error}
              </Notification>
            )}
          </form>
        </Modal>
      )}
    </ScrollArea>
  );
};

export default UsersList;

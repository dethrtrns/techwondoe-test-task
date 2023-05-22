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
  UnstyledButton,
} from '@mantine/core';
import {useForm, joiResolver} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {
  IconPencil,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconCloudDownload,
  IconUserPlus,
} from '@tabler/icons-react';
import Joi from 'joi';

interface User {
  _id: string;
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
  updateData: (updatedData: User[]) => void;
}

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

const UsersList: React.FC<UsersTableProps> = ({data, updateData}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5; // Number of items to display per page
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [userIdToUpdate, setUserIdToUpdate] = React.useState<string | null>(
    null
  );
  const [userIdToDelete, setUserIdToDelete] = React.useState<string | null>(
    null
  );
  const [sortKey, setSortKey] = React.useState<keyof User>('date');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>(SortOrder.DESC);

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
      // Get the created user from the response
      const {name, avatar, email, date, _id, role}: User =
        await response.json();

      // console.log({name, avatar, email, date, _id, role});

      // Update the data prop
      updateData([...data, {name, avatar, email, date, _id, role}]);
    } catch (err) {
      setError(err.message);
    }
  };
  // console.log(data);

  // Update and Delete handlers
  const handleDeleteUser = async (_id: string) => {
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

      // Remove the deleted user from the data prop
      const updatedData = data.filter(user => user._id !== _id);
      updateData(updatedData);

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

  const handleUpdateUser = async (_id: string, values: Partial<User>) => {
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

      // Find the updated user in the data prop and update it
      const updatedData = data.map(user => {
        if (user._id === _id) {
          return {...user, ...values};
        }
        return user;
      });
      updateData(updatedData);

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

  // Function to handle the download action
  const handleDownloadCSV = () => {
    // Convert data to CSV format
    const csvData = data.map(user => Object.values(user).join(',')).join('\n');

    // Create a blob with the CSV data
    const blob = new Blob([csvData], {type: 'text/csv'});

    // Create a download link element
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = 'users.csv';

    // Simulate a click on the download link
    downloadLink.click();
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
        <div style={{fontSize: 'smaller', opacity: 0.7}}>{formattedTime}</div>
      </div>
    );
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const sortedData = React.useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (aValue < bValue) return sortOrder === SortOrder.ASC ? -1 : 1;
      if (aValue > bValue) return sortOrder === SortOrder.ASC ? 1 : -1;
      return 0;
    });
    return sorted.slice(startIndex, endIndex);
  }, [data, sortKey, sortOrder, startIndex, endIndex]);

  const rows = sortedData.map(item => (
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

  const handleSort = (key: keyof User) => {
    if (sortKey === key) {
      setSortOrder(prevSortOrder =>
        prevSortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
      );
    } else {
      setSortKey(key);
      setSortOrder(SortOrder.DESC);
    }
  };

  return (
    <ScrollArea
      px="lg"
      className="shadow-outline rounded-3xl rounded-t-none shadow-xl"
      pt="xs"
    >
      <Flex justify="space-between">
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
          <Button
            leftIcon={<IconCloudDownload />}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
            variant="outline"
            onClick={handleDownloadCSV}
          >
            Download CSV
          </Button>
          <Button
            leftIcon={<IconUserPlus />}
            className="bg-blue-500 hover:bg-blue-300 text-white font-semibold border border-gray-400 rounded shadow"
            onClick={() => setOpen(true)}
            ml={9}
            variant="filled"
            color="blue"
          >
            Add user
          </Button>
        </Flex>
      </Flex>
      <Table miw={800} verticalSpacing="sm">
        <thead>
          <tr>
            <th>
              <UnstyledButton
                // display={'flex'}
                className="flex"
                w={'100%'}
                onClick={() => handleSort('name')}
              >
                Name
                <span className="ml-2 mt-0.5">
                  {sortOrder === SortOrder.DESC ? (
                    <IconArrowDown size="1rem" />
                  ) : (
                    <IconArrowUp size="1rem" />
                  )}
                </span>
              </UnstyledButton>
            </th>
            <th>
              <UnstyledButton display={'flex'} w={'100%'}>
                Status
                <span className="ml-2 mt-0.5">
                  {sortOrder === SortOrder.DESC ? (
                    <IconArrowDown size="1rem" />
                  ) : (
                    <IconArrowUp size="1rem" />
                  )}
                </span>
              </UnstyledButton>
            </th>
            <th>
              <UnstyledButton
                display={'flex'}
                w={'100%'}
                onClick={() => handleSort('role')}
              >
                Role
                <span className="ml-2 mt-0.5">
                  {sortOrder === SortOrder.DESC ? (
                    <IconArrowDown size="1rem" />
                  ) : (
                    <IconArrowUp size="1rem" />
                  )}
                </span>
              </UnstyledButton>
            </th>
            <th>
              <UnstyledButton
                display={'flex'}
                w={'100%'}
                onClick={() => handleSort('date')}
              >
                Last Login
                <span className="ml-2 mt-0.5">
                  {sortOrder === SortOrder.DESC ? (
                    <IconArrowDown size="1rem" />
                  ) : (
                    <IconArrowUp size="1rem" />
                  )}
                </span>
              </UnstyledButton>
            </th>
            <th></th>
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

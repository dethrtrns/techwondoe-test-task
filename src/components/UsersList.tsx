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
import Joi from 'joi';

import {IconPencil, IconTrash} from '@tabler/icons-react';

interface User {
  id: number;
  name: string;
  avatar: string;
  email: string;
  role: string;
  date: Date;
}

interface UsersTableProps {
  data: User[];
}

const UsersList: React.FC<UsersTableProps> = ({data}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5; // Number of items to display per page
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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

  const submitFormHandler = async (values: any) => {
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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = data.slice(startIndex, endIndex);

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
      <td>{Math.floor(Math.random() * 6 + 5)} days ago</td>
      <td>
        <Flex>
          <ActionIcon>
            <IconTrash size="1.125rem" />
          </ActionIcon>
          <ActionIcon>
            <IconPencil size="1.125rem" />
          </ActionIcon>
        </Flex>
      </td>
    </tr>
  ));

  return (
    <ScrollArea pt={30}>
      <Flex>
        <Group>
          <Group>
            <Title order={4}>Users</Title>
            <Badge color="green"> 48 users</Badge>
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
    </ScrollArea>
  );
};

export default UsersList;

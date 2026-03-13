"use client";

import {
  Anchor,
  Button,
  Divider,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "@/lib/zod-resolver";
import Link from "next/link";
import {
  registerUserSchema,
  type RegisterUserDTO,
} from "@my-project/shared-schema";
import { useRegister } from "../hooks/useRegister";

export function RegisterForm() {
  const { mutate: register, isPending } = useRegister();

  const form = useForm<RegisterUserDTO>({
    validate: zodResolver(registerUserSchema),
    initialValues: {
      username: "",
      email: "",
      password: "",
      firstName: undefined,
      lastName: undefined,
      displayName: undefined,
      phoneNumber: undefined,
    },
  });

  return (
    <Paper w={440} p="xl" radius="md" withBorder shadow="sm">
      <Stack gap="md">
        <Stack gap={4}>
          <Title order={2} ta="center">
            Create an account
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            Fill in the details below to get started
          </Text>
        </Stack>

        <form onSubmit={form.onSubmit((values) => register(values))} noValidate>
          <Stack gap="sm">
            <TextInput
              label="Username"
              placeholder="your_username"
              required
              data-testid="register-username"
              aria-label="Username"
              {...form.getInputProps("username")}
            />

            <TextInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
              data-testid="register-email"
              aria-label="Email address"
              {...form.getInputProps("email")}
            />

            <PasswordInput
              label="Password"
              placeholder="Min. 8 characters"
              required
              data-testid="register-password"
              aria-label="Password"
              description="Must include uppercase, lowercase, number, and special character (@$!%*?&)"
              {...form.getInputProps("password")}
            />

            <Divider label="Optional details" labelPosition="center" />

            <TextInput
              label="First name"
              placeholder="Jane"
              data-testid="register-firstName"
              aria-label="First name"
              {...form.getInputProps("firstName")}
            />

            <TextInput
              label="Last name"
              placeholder="Doe"
              data-testid="register-lastName"
              aria-label="Last name"
              {...form.getInputProps("lastName")}
            />

            <TextInput
              label="Display name"
              placeholder="Jane Doe"
              data-testid="register-displayName"
              aria-label="Display name"
              {...form.getInputProps("displayName")}
            />

            <TextInput
              label="Phone number"
              placeholder="0812345678"
              data-testid="register-phoneNumber"
              aria-label="Phone number"
              {...form.getInputProps("phoneNumber")}
            />

            <Button
              type="submit"
              fullWidth
              loading={isPending}
              mt="xs"
              data-testid="register-submit"
            >
              Create account
            </Button>
          </Stack>
        </form>

        <Text size="sm" ta="center">
          Already have an account?{" "}
          <Anchor component={Link} href="/login" size="sm">
            Sign in
          </Anchor>
        </Text>
      </Stack>
    </Paper>
  );
}

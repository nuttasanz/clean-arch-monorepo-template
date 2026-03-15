"use client";

import {
  Anchor,
  Alert,
  Button,
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
import { loginUserSchema, type LoginUserDTO } from "@repo/shared";
import { useLogin } from "../hooks/useLogin";
import axios from "axios";

export function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();

  const form = useForm<LoginUserDTO>({
    validate: zodResolver(loginUserSchema),
    initialValues: {
      username: "",
      password: "",
    },
  });

  const serverError =
    error !== null && axios.isAxiosError(error)
      ? ((error.response?.data as { message?: string })?.message ??
        "Login failed. Please try again.")
      : null;

  return (
    <Paper w={400} p="xl" radius="md" withBorder shadow="sm">
      <Stack gap="md">
        <Stack gap={4}>
          <Title order={2} ta="center">
            Welcome back
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            Sign in to your account
          </Text>
        </Stack>

        {serverError && (
          <Alert color="red" variant="light" role="alert">
            {serverError}
          </Alert>
        )}

        <form onSubmit={form.onSubmit((values) => login(values))} noValidate>
          <Stack gap="sm">
            <TextInput
              label="Username"
              placeholder="Your Username"
              required
              data-testid="login-username"
              aria-label="Username"
              {...form.getInputProps("username")}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              data-testid="login-password"
              aria-label="Password"
              {...form.getInputProps("password")}
            />

            <Button
              type="submit"
              fullWidth
              loading={isPending}
              mt="xs"
              data-testid="login-submit"
            >
              Sign in
            </Button>
          </Stack>
        </form>

        <Text size="sm" ta="center">
          Don&apos;t have an account?{" "}
          <Anchor component={Link} href="/register" size="sm">
            Register
          </Anchor>
        </Text>
      </Stack>
    </Paper>
  );
}

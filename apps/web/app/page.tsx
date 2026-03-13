import { Container, Stack, Text, Title } from "@mantine/core";

export default function HomePage() {
  return (
    <Container size="md" py="xl">
      <Stack gap="sm">
        <Title order={1}>Dashboard</Title>
        <Text c="dimmed">Welcome! You are logged in.</Text>
      </Stack>
    </Container>
  );
}

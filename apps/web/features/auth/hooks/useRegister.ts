'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { registerUser } from '../api/auth.repository';
import type { RegisterUserDTO } from '@repo/shared';

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterUserDTO) => registerUser(data),
    onSuccess: () => {
      notifications.show({
        color: 'green',
        title: 'Registration successful!',
        message: 'Your account has been created. Please log in.',
      });
      router.push('/login');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      notifications.show({
        color: 'red',
        title: 'Registration failed',
        message,
      });
    },
  });
}

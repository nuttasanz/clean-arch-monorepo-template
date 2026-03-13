import "reflect-metadata";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetProfileUseCase } from "./GetProfileUseCase";
import { IUserRepository } from "../../repositories/IUserRepository";
import { User } from "../../domain/User";
import { AppError } from "@shared/errors/AppError";

function createMockRepository(): IUserRepository {
  return {
    create: vi.fn(),
    findByEmail: vi.fn(),
    findByUsername: vi.fn(),
    findByUsernameWithPassword: vi.fn(),
    findById: vi.fn(),
  };
}

describe("GetProfileUseCase", () => {
  let useCase: GetProfileUseCase;
  let mockRepo: IUserRepository;

  beforeEach(() => {
    mockRepo = createMockRepository();

    // Manually instantiate with mock (bypass tsyringe)
    useCase = new GetProfileUseCase(mockRepo);
  });

  it("should return user when found", async () => {
    const mockUser = new User(
      {
        username: "testuser",
        email: "test@example.com",
        password: "hashed",
        firstName: "Test",
        lastName: "User",
      },
      "user-id-123",
    );

    vi.mocked(mockRepo.findById).mockResolvedValueOnce(mockUser);

    const result = await useCase.execute("user-id-123");

    expect(result.id).toBe("user-id-123");
    expect(result.username).toBe("testuser");
    expect(mockRepo.findById).toHaveBeenCalledWith("user-id-123");
  });

  it("should throw AppError with 404 when user not found", async () => {
    vi.mocked(mockRepo.findById).mockResolvedValueOnce(undefined);

    await expect(useCase.execute("nonexistent-id")).rejects.toThrow(AppError);

    try {
      vi.mocked(mockRepo.findById).mockResolvedValueOnce(undefined);
      await useCase.execute("nonexistent-id");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(404);
      expect((err as AppError).message).toBe("User not found");
    }
  });
});

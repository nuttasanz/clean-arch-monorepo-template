import "reflect-metadata";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateUserService } from "./CreateUserService";
import { IUserRepository } from "../repositories/IUserRepository";
import { User } from "../domain/User";
import { AppError } from "@shared/errors/AppError";
import { UserRole } from "../enum/user-role.enum";

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password_123"),
  },
}));

function createMockRepository(): IUserRepository {
  return {
    create: vi.fn().mockImplementation((user: User) =>
      Promise.resolve(
        new User(
          {
            ...user,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          "generated-uuid-123",
        ),
      ),
    ),
    findByEmail: vi.fn().mockResolvedValue(undefined),
    findByUsername: vi.fn().mockResolvedValue(undefined),
    findByUsernameWithPassword: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(undefined),
  };
}

describe("CreateUserService", () => {
  let service: CreateUserService;
  let mockRepo: IUserRepository;

  const validInput = {
    username: "testuser",
    email: "test@example.com",
    password: "P@ssw0rd123",
    firstName: "Test",
    lastName: "User",
  };

  beforeEach(() => {
    mockRepo = createMockRepository();
    service = new CreateUserService(mockRepo);
  });

  it("should create a user with hashed password", async () => {
    const user = await service.execute(validInput);

    expect(user.id).toBe("generated-uuid-123");
    expect(user.username).toBe("testuser");
    expect(user.email).toBe("test@example.com");
    expect(user.password).toBe("hashed_password_123");
    expect(mockRepo.create).toHaveBeenCalledOnce();
  });

  it("should default role to USER when not specified", async () => {
    const user = await service.execute(validInput);

    expect(user.role).toBe(UserRole.USER);
  });

  it("should allow specifying role as ADMIN", async () => {
    const user = await service.execute({
      ...validInput,
      role: UserRole.ADMIN,
    });

    expect(user.role).toBe(UserRole.ADMIN);
  });

  it("should throw AppError when username already exists", async () => {
    vi.mocked(mockRepo.findByUsername).mockResolvedValueOnce(
      new User({
        username: "testuser",
        email: "other@example.com",
        password: "hash",
      }),
    );

    await expect(service.execute(validInput)).rejects.toThrow(
      "Username already exists",
    );
  });

  it("should throw AppError when email already exists", async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValueOnce(
      new User({
        username: "otheruser",
        email: "test@example.com",
        password: "hash",
      }),
    );

    await expect(service.execute(validInput)).rejects.toThrow(
      "Email already exists",
    );
  });

  it("should check username before email", async () => {
    vi.mocked(mockRepo.findByUsername).mockResolvedValueOnce(
      new User({ username: "testuser", email: "x@x.com", password: "hash" }),
    );

    await expect(service.execute(validInput)).rejects.toThrow(
      "Username already exists",
    );

    // findByEmail should NOT be called if username check fails first
    expect(mockRepo.findByEmail).not.toHaveBeenCalled();
  });
});

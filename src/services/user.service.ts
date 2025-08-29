import { prisma } from "@/config/database";
import { User, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BCRYPT_SALT_ROUNDS } from "@/constants/constants";
import { RegisterDto, UserUpdateDto } from "@/types";

export class UserService {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByEmployeeId(employeeId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { employeeId },
    });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { phoneNumber },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async create(userData: RegisterDto): Promise<User> {
    const hashedPassword = await this.hashPassword(userData.password);

    return prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    return prisma.user.findMany(params);
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where });
  }

  async updateById(id: string, data: Partial<User>): Promise<User | null> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateProfile(id: string, data: UserUpdateDto): Promise<User | null> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async addRefreshToken(userId: string, refreshToken: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokens: {
          push: refreshToken,
        },
        lastLogin: new Date(),
      },
    });
  }

  async removeRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updatedTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );

    return prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokens: updatedTokens,
      },
    });
  }

  async clearAllRefreshTokens(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokens: [],
      },
    });
  }

  async deactivate(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  // Transform user for JSON response (exclude password and refreshTokens)
  transformUser(user: User): Omit<User, "password" | "refreshTokens"> {
    const { password, refreshTokens, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
  }
}

export default new UserService();

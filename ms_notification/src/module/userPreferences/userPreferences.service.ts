import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserPreferences } from 'src/core/schema/userPreferences.schema';
import { UserPreferencesCreateDto } from './dto/userPreferences.create.dto';
import { UserPreferencesUpdateDto } from './dto/userPreferences.update.dto';
import { iUserPreferences } from 'src/core/interface/interface';

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectModel('UserPreferences')
    private readonly userPreferencesModel: Model<UserPreferences>,
  ) {}

  async find(user_id: string): Promise<iUserPreferences | null> {
    return await this.userPreferencesModel
      .findOne({ user_id })
      .select({
        _id: 1,
        user_id: 1,
        email: 1,
        phone_number: 1,
        channel_preferences: 1,
      })
      .lean();
  }

  async findAllPaginated(
    options: {
      page?: number;
      limit?: number;
      sort?: 'asc' | 'desc';
    } = {},
  ): Promise<{ data: iUserPreferences[]; total: number; hasMore: boolean }> {
    const { page = 1, limit = 10, sort = 'desc' } = options;
    const skip = (page - 1) * limit;

    const total = await this.userPreferencesModel.countDocuments({});

    const data = await this.userPreferencesModel
      .find()
      .select({
        _id: 1,
        user_id: 1,
        email: 1,
        phone_number: 1,
        channel_preferences: 1,
      })
      .sort({ createdAt: sort === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      data,
      total,
      hasMore: skip + data.length < total,
    };
  }

  async create(data: UserPreferencesCreateDto): Promise<UserPreferences> {
    return await this.userPreferencesModel.create(data);
  }

  async update(
    data: UserPreferencesUpdateDto,
  ): Promise<UserPreferences | null> {
    const { user_id, ...updateData } = data;

    return this.userPreferencesModel
      .findOneAndUpdate(
        { user_id },
        { $set: updateData },
        {
          new: true,
          runValidators: true,
        },
      )
      .select({
        _id: 1,
        user_id: 1,
        email: 1,
        phone_number: 1,
        channel_preferences: 1,
      });
  }

  async delete(user_id: string): Promise<iUserPreferences | null> {
    return this.userPreferencesModel.findOneAndDelete({ user_id }).select({
      _id: 1,
      user_id: 1,
      email: 1,
      phone_number: 1,
      channel_preferences: 1,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Template } from 'src/core/schema/template.schema';
import { TemplateCreateDto } from './dto/template.create.dto';
import { TemplateUpdateDto } from './dto/template.update.dto';
import { iTemplate } from 'src/core/interface/interface';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel('Template') private readonly templateModel: Model<Template>,
  ) {}

  async find(category: string): Promise<iTemplate | null> {
    return await this.templateModel.findOne({ category: category }).select({
      _id: 1,
      category: 1,
      title: 1,
      content: 1,
      payload: 1,
    });
  }

  async findAllPaginated(
    options: {
      page?: number;
      limit?: number;
      sort?: 'asc' | 'desc';
    } = {},
  ): Promise<{ data: iTemplate[]; total: number; hasMore: boolean }> {
    const { page = 1, limit = 10, sort = 'desc' } = options;
    const skip = (page - 1) * limit;

    const total = await this.templateModel.countDocuments({});

    const data = await this.templateModel
      .find()
      .select({
        _id: 1,
        category: 1,
        title: 1,
        content: 1,
        payload: 1,
      })
      .sort({ createdAt: sort === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return { data, total, hasMore: skip + data.length < total };
  }

  async create(data: TemplateCreateDto): Promise<Template> {
    return await this.templateModel.create(data);
  }

  async delete(category: string): Promise<iTemplate | null> {
    return await this.templateModel.findOneAndDelete({ category }).select({
      _id: 1,
      category: 1,
      title: 1,
      content: 1,
      payload: 1,
    });
  }

  async update(data: TemplateUpdateDto): Promise<Template | null> {
    const { category, ...updateData } = data;
    return await this.templateModel
      .findOneAndUpdate(
        { category },
        { $set: updateData },
        {
          new: true,
          runValidators: true,
        },
      )
      .select({
        _id: 1,
        category: 1,
        title: 1,
        content: 1,
        payload: 1,
      });
  }
}

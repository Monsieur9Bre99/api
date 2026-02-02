import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserPreferencesSchema } from '../../core/schema/userPreferences.schema';
import { UserPreferencesController } from './userPreferences.controller';
import { UserPreferencesService } from './userPreferences.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserPreferences', schema: UserPreferencesSchema },
    ]),
  ],
  controllers: [UserPreferencesController],
  providers: [UserPreferencesService],
  exports: [UserPreferencesService],
})
export class UserPreferencesModule {}

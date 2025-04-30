import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import databaseConfig from './config/database.config';
import { ResidentRegisterModule } from './modules/resident-register/resident-register.module';
import * as mongoose from 'mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        // Set global options
        connectionFactory: (connection: mongoose.Connection) => {
          // Note: toJSON transform operates when converting documents to JSON
          mongoose.set('toJSON', {
            virtuals: true,
            transform: (doc: any, ret: any) => {
              // Convert Mongoose ObjectId to string for proper comparison
              if (ret._id) {
                ret._id = ret._id.toString();
              }
              return ret;
            },
          });
          return connection;
        },
      }),
    }),
    ResidentRegisterModule,
  ],
})
export class AppModule {
  constructor() {
    // Enable mongoose debug mode to log all queries in development only
    //  mongoose.set('debug', process.env.NODE_ENV !== 'production');
  }
}

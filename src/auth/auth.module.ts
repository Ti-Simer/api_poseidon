import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Permissions } from 'src/permissions/entities/permission.entity';
import { InitialPermissionsController } from './auth.InitialPermissionsController';
import { Roles } from 'src/roles/entities/roles.entity';
import { RouteEvent } from 'src/route-events/entities/route-event.entity';
import { RouteEventsModule } from 'src/route-events/route-events.module';
import { RouteEventsService } from 'src/route-events/route-events.service';
import { SpecificGravityCorrection } from 'src/specific-gravity-correction/entities/specific-gravity-correction.entity';
import { SpecificGravityCorrectionService } from 'src/specific-gravity-correction/specific-gravity-correction.service';
import { DensityCorrectionService } from 'src/density-correction/density-correction.service';
import { DensityCorrection } from 'src/density-correction/entities/density-correction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario, 
      Permissions, 
      Roles,
      RouteEvent,
      SpecificGravityCorrection,
      DensityCorrection
    ]),
    RouteEventsModule,    
  ],
  controllers: [
    InitialPermissionsController
  ],
  providers: [AuthService, RouteEventsService, SpecificGravityCorrectionService, DensityCorrectionService],
})
export class AuthModule {}

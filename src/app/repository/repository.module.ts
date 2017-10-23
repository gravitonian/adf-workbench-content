import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RepositoryRoutingModule } from './repository-routing.module';
import { RepositoryPageComponent } from './repository-page/repository-page.component';
import { RepositoryListPageComponent } from './repository-list-page/repository-list-page.component';
import { RepositoryDetailsPageComponent } from './repository-details-page/repository-details-page.component';
import { RepositoryDetailsFormPageComponent } from './repository-details-form-page/repository-details-form-page.component';

import { AppCommonModule } from '../app-common/app-common.module';
import { DocumentListModule } from 'ng2-alfresco-documentlist';
import { UploadModule } from 'ng2-alfresco-upload';
import { ViewerModule } from 'ng2-alfresco-viewer';
import { CardViewUpdateService } from 'ng2-alfresco-core';
import { ActivitiFormModule } from 'ng2-activiti-form';

@NgModule({
  imports: [
    CommonModule,
    RepositoryRoutingModule,

    /* Common App imports (Angular Core and Material, ADF Core */
    AppCommonModule,

    /* ADF libs specific to this module */
    DocumentListModule,
    UploadModule,
    ViewerModule,
    ActivitiFormModule
  ],
  declarations: [RepositoryPageComponent, RepositoryListPageComponent, RepositoryDetailsPageComponent, RepositoryDetailsFormPageComponent],
  providers: [CardViewUpdateService] /* Need to set it up as a provider here as there is a bug in CoreModule, it does not import... */
})
export class RepositoryModule { }

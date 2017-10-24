import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyFilesRoutingModule } from './my-files-routing.module';
import { MyFilesPageComponent } from './my-files-page/my-files-page.component';
import { MyFilesListPageComponent } from './my-files-list-page/my-files-list-page.component';

import { AppCommonModule } from '../app-common/app-common.module';
import { DocumentListModule } from 'ng2-alfresco-documentlist';
import { UploadModule } from 'ng2-alfresco-upload';
import { ViewerModule } from 'ng2-alfresco-viewer';

@NgModule({
  imports: [
    CommonModule,
    MyFilesRoutingModule,

    /* Common App imports (Angular Core and Material, ADF Core */
    AppCommonModule,

    /* ADF libs specific to this module */
    DocumentListModule,
    UploadModule,
    ViewerModule
  ],
  declarations: [MyFilesPageComponent, MyFilesListPageComponent]
})
export class MyFilesModule { }

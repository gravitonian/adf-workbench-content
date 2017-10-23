import { Component, OnInit, ViewChild } from '@angular/core';

import { DocumentListComponent } from 'ng2-alfresco-documentlist';
import { MinimalNodeEntity, MinimalNodeEntryEntity } from 'alfresco-js-api';
import { NotificationService, AlfrescoContentService,
  FolderCreatedEvent, CreateFolderDialogComponent } from 'ng2-alfresco-core';

import { MdDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-repository-list-page',
  templateUrl: './repository-list-page.component.html',
  styleUrls: ['./repository-list-page.component.css']
})
export class RepositoryListPageComponent implements OnInit {
  currentFolderId = '-root-'; // By default display /Company Home

  @ViewChild(DocumentListComponent)
  documentList: DocumentListComponent;

  constructor(private notificationService: NotificationService,
              private contentService: AlfrescoContentService,
              private dialog: MdDialog,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    // Check if we should display some other folder than root
    const currentFolderIdObservable = this.activatedRoute
      .queryParamMap
      .map(params => params.get('current_folder_id'));
    currentFolderIdObservable.subscribe((id: string) => {
      if (id) {
        this.currentFolderId = id;
        this.documentList.loadFolderByNodeId(this.currentFolderId);
      }
    });
  }

  onDragAndDropUploadSuccess($event: Event) {
    console.log('Drag and Drop upload successful!');

    // Refresh the page so you can see the new files
    this.documentList.reload();
  }

  getNodesForPermissionCheck(): MinimalNodeEntity[] {
    if (this.documentList.folderNode) {
      return [{entry: this.documentList.folderNode}];
    } else {
      return [];
    }
  }

  onContentActionPermissionError(event: any) {
    this.notificationService.openSnackMessage(
      `You don't have the '${event.permission}' permission to do a '${event.action}' operation on the ${event.type}`,
      4000);
  }

  onContentActionSuccess(nodeId) {
    console.log('Successfully executed content action for node: ' + nodeId);
  }

  onContentActionError(error) {
    console.log('There was an error executing content action: ' + error);
  }

  onFolderCreated(event: FolderCreatedEvent) {
    if (event && event.parentId === this.documentList.currentFolderId) {
      this.documentList.reload();
    }
  }

  onCreateFolder($event: Event) {
    const dialogRef = this.dialog.open(CreateFolderDialogComponent);
    dialogRef.afterClosed().subscribe(folderName => {
      if (folderName) {
        this.contentService.createFolder('', folderName, this.documentList.currentFolderId).subscribe(
          node => console.log(node),
          err => console.log(err)
        );
      }
    });
  }

  onButtonUploadSuccess($event: Event) {
    console.log('Upload button successful!');

    this.documentList.reload();
  }

  onFolderDetails(event: any) {
    const entry: MinimalNodeEntryEntity = event.value.entry;
    console.log('RepositoryListPageComponent: Navigating to details page for folder: ' + entry.name);
    this.router.navigate(['/repository', entry.id]);
  }

  onFolderDetailsForm(event: any) {
    const entry: MinimalNodeEntryEntity = event.value.entry;
    console.log('RepositoryListPageComponent: Navigating to details page (form) for folder: ' + entry.name);
    this.router.navigate(['/repository/form', entry.id]);
  }

  onDocumentDetails(event: any) {
    const entry: MinimalNodeEntryEntity = event.value.entry;
    console.log('RepositoryListPageComponent: Navigating to details page for document: ' + entry.name);
    this.router.navigate(['/repository', entry.id]);
  }

  onDocumentDetailsForm(event: any) {
    const entry: MinimalNodeEntryEntity = event.value.entry;
    console.log('RepositoryListPageComponent: Navigating to details page (form) for document: ' + entry.name);
    this.router.navigate(['/repository/form', entry.id]);
  }
}

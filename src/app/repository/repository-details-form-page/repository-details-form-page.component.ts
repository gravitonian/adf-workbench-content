import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NodesApiService, AlfrescoContentService, NotificationService } from 'ng2-alfresco-core';
import { FormService, FormModel, FormValues } from 'ng2-activiti-form';
import { MinimalNodeEntryEntity, NodeBody } from 'alfresco-js-api';

import { AlfrescoNodeForm } from './alfresco-node-form';
import { RepositoryContentModel } from '../repository-content.model';
import { RepositoryFormFieldModel } from '../repository-formfield.model';

@Component({
  selector: 'app-repository-details-form-page',
  templateUrl: './repository-details-form-page.component.html',
  styleUrls: ['./repository-details-form-page.component.css']
})
export class RepositoryDetailsFormPageComponent implements OnInit {
  nodeId: string;
  nodeName: string;
  isFile: boolean;
  parentFolder: MinimalNodeEntryEntity;

  form: FormModel;
  originalFormData: FormValues = {};

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private nodeService: NodesApiService,
              private contentService: AlfrescoContentService,
              private formService: FormService,
              protected notificationService: NotificationService) {
  }

  ngOnInit() {
    this.nodeId = this.activatedRoute.snapshot.params['node-id'];
    this.nodeService.getNode(this.nodeId).subscribe((entry: MinimalNodeEntryEntity) => {
      const node: MinimalNodeEntryEntity = entry;
      this.nodeName = node.name;
      this.isFile = node.isFile;

      this.nodeService.getNode(node.parentId).subscribe((parentNode: MinimalNodeEntryEntity) => {
        this.parentFolder = parentNode;
      });

      this.setupFormData(node);
    });
  }

  private setupFormData(node: MinimalNodeEntryEntity) {
    console.log('setupFormData: ', node.id);

    // Content file specific props
    let size = 'N/A';
    let mimetype = 'N/A';
    if (this.isFile) {
      size = '' + node.content.sizeInBytes;
      mimetype = node.content.mimeTypeName;
    }

    // Aspect properties
    let title = '';
    let desc = '';
    if (node.aspectNames.indexOf(RepositoryContentModel.TITLED_ASPECT_QNAME) > -1) {
      title = node.properties[RepositoryContentModel.TITLE_PROP_QNAME];
      desc =  node.properties[RepositoryContentModel.DESC_PROP_QNAME];
    }

    // Author can be available if extracted during ingestion of content
    let author = '';
    if (node.properties && node.properties[RepositoryContentModel.AUTHOR_PROP_QNAME]) {
      author = node.properties[RepositoryContentModel.AUTHOR_PROP_QNAME];
    }

    this.originalFormData = {
      'id': node.id,
      'type': node.nodeType,
      'secondarytypes': node.aspectNames,
      'creator': node.createdByUser.displayName,
      'created': node.createdAt,
      'modifier': node.modifiedByUser.displayName,
      'modified': node.modifiedAt,
      'sizebytes': size,
      'mimetype': mimetype,
      'title': title,
      'description': desc,
      'author': author
    };

    // Read and parse the form that we will use to display the node
    const formDefinitionJSON: any = AlfrescoNodeForm.getDefinition();
    const readOnly = false;
    this.form = this.formService.parseForm(formDefinitionJSON, this.originalFormData, readOnly);
  }

  onGoBack($event: Event) {
    this.navigateBack2DocList();
  }

  onDownload($event: Event) {
    const url = this.contentService.getContentUrl(this.nodeId, true);
    const fileName = this.nodeName;
    this.download(url, fileName);
  }

  onDelete($event: Event) {
    this.nodeService.deleteNode(this.nodeId).subscribe(() => {
      this.navigateBack2DocList();
    });
  }

  /**
   * Updates the node with identifier 'nodeId'.
   * For example, you can rename a file or folder:
   * {
   *  "name": "My new name"
   * }
   *
   * You can also set or update one or more properties:
   * {
   *  "properties":
   *     {
   *      "cm:title": "Folder title"
   *     }
   * }
   *
   * If you want to add or remove aspects, then you must use **GET /nodes/{nodeId}** first to get the complete
   * set of *aspectNames*.
   * Currently there is no optimistic locking for updates, so they are applied in "last one wins" order.
   */
  onSave(form: FormModel) {
    const titleChanged = this.form.values[RepositoryFormFieldModel.TITLE_FIELD_NAME] &&
      (this.form.values[RepositoryFormFieldModel.TITLE_FIELD_NAME] !==
        this.originalFormData[RepositoryFormFieldModel.TITLE_FIELD_NAME]);
    const descriptionChanged = this.form.values[RepositoryFormFieldModel.DESC_FIELD_NAME] &&
      (this.form.values[RepositoryFormFieldModel.DESC_FIELD_NAME] !==
        this.originalFormData[RepositoryFormFieldModel.DESC_FIELD_NAME]);
    if (titleChanged || descriptionChanged) {
      // We got some non-readonly metadata that has been updated

      console.log('Updating [cm:title = ' + this.form.values[RepositoryFormFieldModel.TITLE_FIELD_NAME] + ']');
      console.log('Updating [cm:description = ' + this.form.values[RepositoryFormFieldModel.DESC_FIELD_NAME] + ']');

      // Set up the properties that should be updated
      const nodeBody = <NodeBody> {};
      nodeBody[RepositoryContentModel.NODE_BODY_PROPERTIES_KEY] = {};
      nodeBody[RepositoryContentModel.NODE_BODY_PROPERTIES_KEY][RepositoryContentModel.TITLE_PROP_QNAME] = this.form.values['title'];
      nodeBody[RepositoryContentModel.NODE_BODY_PROPERTIES_KEY][RepositoryContentModel.DESC_PROP_QNAME] = this.form.values['description'];

      // Make the call to Alfresco Repo and update props
      this.nodeService.updateNode(this.nodeId, nodeBody).subscribe(
        () => {
          this.notificationService.openSnackMessage(
            `Updated properties for '${this.nodeName}' successfully`,
            4000);
        }
      );
    } else {
      this.notificationService.openSnackMessage(
        `Node '${this.nodeName}' was NOT saved, nothing has been changed!`,
        4000);
    }
  }

  private navigateBack2DocList() {
    this.router.navigate(['../../'],
      {
        queryParams: { current_folder_id: this.parentFolder.id },
        relativeTo: this.activatedRoute
      });
  }

  private download(url: string, fileName: string) {
    if (url && fileName) {
      const link = document.createElement('a');

      link.style.display = 'none';
      link.download = fileName;
      link.href = url;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { FirebaseStorageService } from 'src/app/services/firebaseStorage.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss'
})
export class CompanyComponent implements OnInit{
  loading: boolean  = false;
  user : any={};
  uptForm: FormGroup;
  id: string = '';
  email: string = '';
  company:string = '';
  profile: string = '';
  selectedFile: File | null = null; 

  @ViewChild('fileUpload') fileUpload!: FileUpload;
  
  constructor(
    private userService: UserService,
    private messageService:MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private firebaseStorageService: FirebaseStorageService
      
  ) {
    this.uptForm = this.fb.group({
              name: ['', [Validators.required]],
              lastName: ['',[Validators.required]],
              phone:['', [Validators.required]],
              email:['', [Validators.required, Validators.email]],
              company: ['', [Validators.required]],
              role:['', [Validators.required]],
              address: ['', [Validators.required]]
            });
   }
  ngOnInit(): void { 
    this.getUserByEmail();
  }

  getUserByEmail(){
    this.loading = true;
    this.userService.getUserByEmail().subscribe({
      next: (response) => {
        this.uptForm.patchValue({
          name: response[0].name,
          lastName: response[0].lastName,
          phone: response[0].phone,
          email: response[0].email,
          company: response[0].company,
          role: response[0].role,
          address: response[0].address
          
        });
        this.uptForm.get('email')?.disable();
        this.uptForm.get('role')?.disable();
        this.id = response[0]._id;
        this.email = response[0].email;
        this.company = response[0].company;
        this.profile = response[0].profile;
        this.loading = false;
         
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  }
  updateCompany(id:string){
    if (this.uptForm.valid) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to edit the profile?',
        header: 'Edit Confirmation',
        icon: 'pi pi-exclamation-circle',
        accept: () => {
          this.uploadFile((url) => {
            const userData = { ...this.uptForm.value, profile: url };
            this.userService.updateUser(id, userData).subscribe({
              next: () => {
                this.showToast('success', 'The user updated successfully');
                location.reload();
              },
              error: (error: any) => {
                this.showToast('error', 'An error occurred: ' + error);
              }
            });
          });
        }
      });
    } else {
      this.showToast('warn', 'The form is invalid');
    }
  }

  onFileSelected(event: any) {
    const file = event.files[0]; 
    if (file) {
      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profile = e.target.result; 
      };
      reader.readAsDataURL(file);
    }  }

  uploadFile(callback: (url: string) => void) {
    if (this.selectedFile) {
      const folder = 'brands/img';
      this.firebaseStorageService.uploadFile(this.selectedFile, folder).subscribe({
        next: (url: string) => {
          callback(url); 
        },
        error: (error) => {
          this.showToast('error', 'Failed to upload the file: ' + error);
        }
      });
    } else {
      callback(this.profile); 
    }
  }
  showToast(severity: 'success' | 'info' | 'warn' | 'error', detail: string): void {
    this.messageService.add({
      severity: severity,
      summary: severity === 'warn' ? 'Advertencia' : severity === 'error' ? 'Error' : 'Información',
      detail: detail,
      life: 3000,
    });
  }
}

import { ChangeDetectorRef, Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { BrandService } from 'src/app/services/brand.service';
import { FirebaseStorageService } from 'src/app/services/firebaseStorage.service';

@Component({
    selector: 'app-brand',
    templateUrl: './brand.component.html',
    styleUrl: './brand.component.scss',
    standalone: false
})
export class BrandComponent implements OnInit {
  brands: any[] = [];
  sortOrder!: number;
  sortField!: string;
  sortOptions!: SelectItem[];
  visible: boolean = false;
  createUptForm: FormGroup;
  visibleUpt: boolean = false;
  id:string = "";
  loading: boolean = false;
  filteredBrands: any[] = [];
  searchTerm: string = '';
  selectedFile: File | null = null; 
  logo: string = '';
  @ViewChild('fileUpload') fileUpload!: FileUpload;

  constructor(private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private brandService: BrandService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private firebaseStorageService: FirebaseStorageService

  ) {
    this.createUptForm = this.fb.group({
          name: ['', [Validators.required]],
          description: ['',[Validators.required,]],
        });
  }

  ngOnInit() {
    this.getBrands();
    this.sortOptions = [
      { label: 'Name (A - Z)', value: 'name' },
      { label: 'Name (Z - A)', value: '!name' },
  ];
  }
  getBrands(){
    this.loading = true;
    this.brandService.getBrands().subscribe({
      next: (data) => {
        this.brands = data;
        this.filteredBrands = data;
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  }

  getBrandById(id: String){
    this.brandService.getBrandById(id).subscribe({
      next: (response:any) => {
        this.createUptForm.patchValue({
          name: response.name,
          description: response.description,
          
        });
        this.id = response._id;
        this.logo = response.logo || '';
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  }
  onFileSelected(event: any) {
    const file = event.files[0]; 
    if (file) {
      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logo = e.target.result; 
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
      callback(this.logo); 
    }
  }
  updateBrand(id: string) {
    if (this.createUptForm.valid) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to edit this brand?',
        header: 'Edit Confirmation',
        icon: 'pi pi-exclamation-circle',
        accept: () => {
          this.uploadFile((url) => {
            const brandData = { ...this.createUptForm.value, logo: url };
            this.brandService.updateBrand(id, brandData).subscribe({
              next: () => {
                this.showToast('success', 'The brand updated successfully');
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

  deleteBrand(id: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this brand?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.brandService.deleteBrand(id).subscribe({
          next: () => {
            this.showToast('success', 'Brand deleted successfully');
            this.getBrands();
          },
          error: (error: any) => {
            this.showToast('error', 'An error occurred: ' + error);
          }
        });
      }
    });
  }
    
  createBrand() {
    if (this.createUptForm.valid) {
      this.uploadFile((url) => {
        const brandData = { ...this.createUptForm.value, logo: url };
        this.brandService.createBrand(brandData).subscribe({
          next: () => {
            this.showToast('success', 'New brand added successfully');
            location.reload();
          },
          error: (error) => {
            this.showToast('error', 'An error occurred: ' + error);
          }
        });
      });
    } else {
      this.showToast('warn', 'The form is invalid');
    }
  }

  

  showDialogCreate(){
    this.visible = true;
    this.createUptForm.reset();
    this.fileUpload.clear();
  }
  showDialogUpdate(id:String){
    this.getBrandById(id);
    this.visibleUpt = true;
  }
  onSortChange(event: any) {
    const value = event.value;

    if (value.startsWith('!')) {
      this.sortOrder = -1;
      this.sortField = value.substring(1);
    } else {
      this.sortOrder = 1;
      this.sortField = value;
    }

    this.sortBrands();
  }

  sortBrands() {
    this.brands.sort((a, b) => {
      const fieldA = a[this.sortField].toLowerCase();
      const fieldB = b[this.sortField].toLowerCase();

      if (fieldA < fieldB) return this.sortOrder === 1 ? -1 : 1;
      if (fieldA > fieldB) return this.sortOrder === 1 ? 1 : -1;
      return 0;
    });
  }
  showToast(severity: 'success' | 'info' | 'warn' | 'error', detail: string): void {
    this.messageService.add({
      severity: severity,
      summary: severity === 'warn' ? 'Advertencia' : severity === 'error' ? 'Error' : 'Información',
      detail: detail,
      life: 3000,
    });
  }
  filterBrands(): void {
    if (!this.searchTerm) {
      this.filteredBrands = this.brands;
    } else {
      const lowerSearch = this.searchTerm.toLowerCase();
      this.filteredBrands = this.brands.filter(brand =>
        brand.name.toLowerCase().includes(lowerSearch)
      );
    }
  }
  
}


import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { CategoryService } from 'src/app/services/category.service';

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrl: './category.component.scss',
    standalone: false
})
export class CategoryComponent implements OnInit {
  categories: any[] = [];
  sortOrder!: number;
  sortField!: string;
  sortOptions!: SelectItem[];
  visible: boolean = false;
  createUptForm: FormGroup;
  visibleUpt: boolean = false;
  id:string = "";
  loading: boolean = false;
  filteredCategories: any[] = [];
  searchTerm: string = '';

  constructor(private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    

  ) {
    this.createUptForm = this.fb.group({
          name: ['', [Validators.required]],
          description: ['',[Validators.required,]],
        });
  }

  ngOnInit() {
    this.getCategories();
    this.sortOptions = [
      { label: 'Name (A - Z)', value: 'name' },
      { label: 'Name (Z - A)', value: '!name' },
  ];
  }
  getCategories(){
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (data:any) => {
        this.categories = data;
        console.log(this.categories)
        this.filteredCategories = data;
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  }

  getCategoryById(id: String){
    this.categoryService.getCategoryById(id).subscribe({
      next: (response:any) => {
        this.createUptForm.patchValue({
          name: response.name,
          description: response.description
        });
        this.id = response._id;
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  }

  updateCategory(id:String){
    if(this.createUptForm.valid){
      this.confirmationService.confirm({
        message: 'Are you sure you want to edit this category?',
        header: 'Edit Confirmation',
        icon: 'pi pi-exclamation-circle',
        accept: () => {
          this.categoryService.updateCategory(id,this.createUptForm.value).subscribe({
            next: (response:any) => {
              this.showToast('success','The category updated successfully');
              this.getCategories();
              this.createUptForm.reset();
              this.visibleUpt = false;
            },
            error: (error:any) => {
              this.showToast('error','An error occurred'+ error);
            }
          });
        }
      });
    }else{
      this.showToast('warn','The form is invalid');
    }
  }
  deleteCategory(id:String){
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this category?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.categoryService.deleteCategory(id).subscribe({
          next: (response:any) => {
            this.showToast('success','Category deleted successfully');
            this.getCategories();
          },
          error: (error:any) => {
            this.showToast('error','An error occurred'+ error);
          }
        });
      }
    });
  }
  createCategory(){
    if(this.createUptForm.valid){
      this.categoryService.createCategory(this.createUptForm.value).subscribe({
        next: (response:any) => {
          this.showToast('success','New category added successfully');
          this.getCategories();
          this.createUptForm.reset();
          this.visible = false;
        },
        error: (error:any) => {
          this.showToast('error','An error occurred'+ error);
        }
      });
    }else{
      this.showToast('warn','The form is invalid');
    }
  }

  showDialogCreate(){
    this.visible = true;
  }
  showDialogUpdate(id:String){
    this.getCategoryById(id);
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

    this.sortCategories();
  }

  sortCategories() {
    this.categories.sort((a, b) => {
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
  filterCategories(): void {
    if (!this.searchTerm) {
      this.filteredCategories = this.categories;
    } else {
      const lowerSearch = this.searchTerm.toLowerCase();
      this.filteredCategories = this.categories.filter(category =>
        category.name.toLowerCase().includes(lowerSearch)
      );
    }
  }
}


import { ChangeDetectorRef, Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { BrandService } from 'src/app/services/brand.service';
import { CategoryService } from 'src/app/services/category.service';
import { FirebaseStorageService } from 'src/app/services/firebaseStorage.service';
import { ProductService } from 'src/app/services/product.service';
import { SupplierService } from 'src/app/services/supplier.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit {
  categories:any[]=[];
  dataProduct:any;
  brands:any[]=[];
  brandsArray:any[]=[];
  suppliers:any[]=[];
  suppliersArray:any[]=[];
  products: any[] = [];
  sortOrder!: number;
  sortField!: string;
  sortStatus!: SelectItem[];
  sortCategory!: SelectItem[];
  sortBrand!: SelectItem[];
  sortSupplier!: SelectItem[];
  visible: boolean = false;
  createUptForm: FormGroup;
  visibleUpt: boolean = false;
  id:string = "";
  stock: number = 0;
  total: any[] = [];
  status:string="";
  loading: boolean = false;
  filteredProducts: any[] = [];
  searchTerm: string = '';
  selectedFile: File | null = null; 
  img: string = '';
  selectedStatus: string='';
  selectedCategory: string='';
  selectedBrand: string='';
  selectedSupplier: string='';
  attributesArray: [] = [];
  visibleView: boolean = false;
  categoriesArray: any[] = [];
  @ViewChild('fileUpload') fileUpload!: FileUpload;

  constructor(private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private productService: ProductService,
    private brandService: BrandService,
    private categoryService: CategoryService,
    private supplierService: SupplierService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private firebaseStorageService: FirebaseStorageService) {
    this.createUptForm = this.fb.group({
          name: [{value:''}, [Validators.required]],
          description: [{value:''},[Validators.required]],
          categoryId:[{value:''}, [Validators.required]],
          brandId:[{value:''}, [Validators.required]],
          supplierId: [{value:''}, [Validators.required]],
          purchasePrice:[null, [Validators.required]],
          salePrice:[null, [Validators.required]],
          discount:[{value:0}],
          tax:[{value:0}],
          stock:[{value:0}, [Validators.required]],
          measuring:[{value:''}, [Validators.required]],
          attributes: this.fb.array([])
        });
  }

  ngOnInit() {
    this.getProducts();
    this.getBrands();
    this.getCategories();
    this.getSuppliers();
    this.sortStatus = [
      { label: 'INSTOCK', value: 'INSTOCK' },
      { label: 'LOWSTOCK', value: 'LOWSTOCK' },
      { label: 'OUTSTOCK', value: 'OUTSTOCK' }
    ];
  }
  getBrands(){
    this.loading = true;
    this.brandService.getBrands().subscribe({
      next: (data) => {
        this.brands = data;
        this.brandsArray = this.brands.map((brand: any) => ({
          label: brand.name,
          value: brand._id
        }));
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  }
  getCategories(){
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.categoriesArray = this.categories.map((category: any) => ({
          label: category.name,
          value: category._id
        }));
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  }
  getSuppliers(){
    this.loading = true;
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.suppliers = data.filter(supplier => supplier.status === 'active');
        this.suppliersArray = this.suppliers.map((supplier: any) => ({
          label: supplier.name,
          value: supplier._id
        }));
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  }
  getProducts(){
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (data:any) => {
        this.products = data;
        this.filteredProducts = data;
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        this.showToast('error','An error occurred'+ error);
      }
    });
  }

  getProductById(id: String): Promise<void>{
    return new Promise((resolve, reject) => {
      this.productService.getProductById(id).subscribe({
        next: (response: any) => {
          this.dataProduct = response;
          const attributesArray = this.attributes;
          attributesArray.clear();
          response.attributes.forEach((attribute: {key: any; value: any; }) => {
            attributesArray.push(this.fb.group({
              key: [attribute.key],
              value: [attribute.value],
            }));           
          });
          this.createUptForm.patchValue({
            name: response.name,
            description: response.description,
            categoryId: response.category._id,
            brandId: response.brand._id,
            supplierId: response.supplier._id,
            purchasePrice: response.purchasePrice,
            salePrice: response.salePrice,
            discount: response.discount,
            tax: response.tax,
            stock: response.stock,
            measuring: response.measuring,
          });
          this.id = response._id;
          this.status = response.status;
          this.img = response.image;
          resolve(response); 
        },
        error: (error) => {
          this.showToast('error', 'An error occurred: ' + error);
          reject(error); 
         
        }
      });
    });
  }
 
  updateProduct(id: string) {
    this.setStatus();
    if (this.createUptForm.valid) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to edit this product?',
        header: 'Edit Confirmation',
        icon: 'pi pi-exclamation-circle',
        accept: () => {
          this.uploadFile((url) => {
            const productData = {...this.createUptForm.value, status:this.status, img: url};
            this.productService.updateProduct(id, productData).subscribe({
              next: () => {
                this.showToast('success', 'Product updated successfully');
                location.reload();
              },
              error: (error) => {
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

  deleteProduct(id: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this product?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.deleteProduct(id).subscribe({
          next: () => {
            this.showToast('success', 'Product deleted successfully');
            this.getProducts();
          },
          error: (error: any) => {
            this.showToast('error', 'An error occurred: ' + error);
          }
        });
      }
    });
  }
  createProduct() {
    this.setStatus();
    if (this.createUptForm.valid) {
      this.uploadFile((url) => {
        const productData = {...this.createUptForm.value, status:this.status, img: url};
        this.productService.createProduct(productData).subscribe({
          next: () => {
            this.showToast('success', 'New product added successfully');
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
  removeStock(id: string) {
    this.getProductById(id) 
    .then((response : any) => {
      this.stock = response.stock;
      this.stock --;
      this.productService.updateProduct(id, {stock:this.stock}).subscribe({
        next: () => {
          this.getProducts();
        },
        error: (error: any) => {
          this.showToast('error', 'An error occurred: ' + error);
        }
      });
    })
    .catch((error) => {
      console.error('Error al obtener el producto:', error);
    });
  }

  addStock(id: string) {
    this.getProductById(id) 
    .then((response : any) => {
      this.stock = response.stock;
      this.stock ++;
      this.productService.updateProduct(id, {stock:this.stock}).subscribe({
        next: () => {
          this.getProducts();
        },
        error: (error: any) => {
          this.showToast('error', 'An error occurred: ' + error);
        }
      });
    })
    .catch((error) => {
      console.error('Error al obtener el producto:', error);
    });
  }
  get attributes(): FormArray {
    return this.createUptForm.get('attributes') as FormArray;
  }

  addAttribute(): void {
    const attributeGroup = this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required],
    });
    this.attributes.push(attributeGroup);
  }

  removeAttribute(index: number): void {
    this.attributes.removeAt(index);
  }

  onFileSelected(event: any) {
    const file = event.files[0]; 
    if (file) {
      this.selectedFile = file;    
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.img = e.target.result; 
      };
      reader.readAsDataURL(file);
    }  
  }

  uploadFile(callback: (url: string) => void) {
    if (this.selectedFile) {
      const folder = 'products/img';
      this.firebaseStorageService.uploadFile(this.selectedFile, folder).subscribe({
        next: (url: string) => {
          this.showToast('success', 'The file was uploaded successfully');
          callback(url); 
        },
        error: (error) => {
          this.showToast('error', 'Failed to upload the file: ' + error);
        }
      });
    } else {
      callback(this.img); 
    }
  }

  showDialogCreate(){
    this.visible = true;
    this.createUptForm.reset();
  }
  showDialogView(id:String){
    this.visibleView = true;
    this.getProductById(id)
  }
  showDialogUpdate(id:String){
    this.getProductById(id);
    this.visibleUpt = true;
  }

  setStatus(){
    if(this.createUptForm.get('stock')?.value <= 5)
      this.status = 'OUTSTOCK';
    else if(this.createUptForm.get('stock')?.value <= 20)
      this.status = 'LOWSTOCK';
    else
      this.status = 'INSTOCK';
  }
  onSortChange(event: any) {
    let filtered = [...this.products];
    if (this.selectedStatus) {
      filtered = filtered.filter(product => product.status === this.selectedStatus);
    }
    if (this.selectedCategory) {
      filtered = filtered.filter(product => product.category._id === this.selectedCategory);
    }
    if (this.selectedBrand) {
      filtered = filtered.filter(product => product.brand._id === this.selectedBrand);
    }
    if (this.selectedSupplier) {
      filtered = filtered.filter(product => product.supplier._id === this.selectedSupplier);
    }
    this.filteredProducts = filtered;
  }
  clearFilters() {
    this.selectedStatus = "";
    this.selectedCategory = "";
    this.selectedBrand = "";
    this.selectedSupplier = "";
    this.filteredProducts = [...this.products]; 
    this.searchTerm = ''; 
  }
  sortProduct() {
    this.products.sort((a, b) => {
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
  filterProducts(): void {
    if (!this.searchTerm) {
      this.filteredProducts = this.products;
    } else {
      const lowerSearch = this.searchTerm.toLowerCase();
      this.filteredProducts = this.products.filter(products =>
        products.name.toLowerCase().includes(lowerSearch)
      );
    }
  }
}

